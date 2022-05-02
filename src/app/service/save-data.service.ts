import { Injectable, NgZone } from '@angular/core';
import { BillBoard } from '@udonarium/bill-board';
import { CounterList } from '@udonarium/counter-list';
import { ChatTabList } from '@udonarium/chat-tab-list';
import { FileArchiver } from '@udonarium/core/file-storage/file-archiver';
import { ImageFile} from '@udonarium/core/file-storage/image-file';
import { ImageStorage } from '@udonarium/core/file-storage/image-storage';
import { MimeType } from '@udonarium/core/file-storage/mime-type';
import { GameObject } from '@udonarium/core/synchronize-object/game-object';
import { PromiseQueue } from '@udonarium/core/system/util/promise-queue';
import { XmlUtil } from '@udonarium/core/system/util/xml-util';
import { DataSummarySetting } from '@udonarium/data-summary-setting';
import { DiceRollTableList } from '@udonarium/dice-roll-table-list';
import { Room } from '@udonarium/room';

import * as Beautify from 'vkbeautify';

import { ChatTab } from '@udonarium/chat-tab';
import { CutInList } from '@udonarium/cut-in-list';
import { RoomService } from './room.service';
import { AudioStorage } from '@udonarium/core/file-storage/audio-storage';
import { AudioUrls } from '@udonarium/core/file-storage/audio-context';

type UpdateCallback = (percent: number) => void;

@Injectable({
  providedIn: 'root'
})
export class SaveDataService {
  private static queue: PromiseQueue = new PromiseQueue('SaveDataServiceQueue');

  constructor(
    private roomService:RoomService,
    private ngZone: NgZone
  ) { }

  async saveRoomAsync(fileName: string = 'ルームデータ', updateCallback?: UpdateCallback): Promise<void> {
    return SaveDataService.queue.add(this._saveRoomAsync(fileName, updateCallback));
  }

  private async _saveRoomAsync(fileName: string = 'ルームデータ', updateCallback?: UpdateCallback): Promise<void> {
    let files: File[] = [];
    let roomXml = this.convertToXml(new Room());
    let chatXml = this.convertToXml(ChatTabList.instance);
    let counterXml = this.convertToXml(CounterList.instance);
    let diceRollTableXml = this.convertToXml(DiceRollTableList.instance);
    let cutInXml = this.convertToXml(CutInList.instance);
    let billBoardXml = this.convertToXml(BillBoard.instance);
    let summarySetting = this.convertToXml(DataSummarySetting.instance);
    files.push(new File([roomXml], 'data.xml', { type: 'text/plain' }));
    files.push(new File([chatXml], 'chat.xml', { type: 'text/plain' }));
    files.push(new File([counterXml], 'counter.xml', { type: 'text/plain' }));
    files.push(new File([billBoardXml], 'billboard.xml', { type: 'text/plain' }));
    files.push(new File([diceRollTableXml], 'rollTable.xml', { type: 'text/plain' }));
    files.push(new File([cutInXml], 'cutIn.xml', { type: 'text/plain' }));
    files.push(new File([summarySetting], 'summary.xml', { type: 'text/plain' }));
    if (this.roomService.adminAuth) {
      let audioJson = this.getAudioJson();
      if (audioJson) files.push(new File([audioJson], 'audio.json', { type: 'text/plain' }));
    }

    files = files.concat(await this.searchImageFiles(roomXml));
    files = files.concat(await this.searchImageFiles(chatXml));
    files = files.concat(await this.searchImageFiles(cutInXml));
    files = files.concat(await this.searchImageFiles(billBoardXml));

    //イメージ保存
    return this.saveAsync(files, this.appendTimestamp(fileName), updateCallback);
  }

  async saveGameObjectAsync(gameObject: GameObject, fileName: string = 'xml_data', updateCallback?: UpdateCallback): Promise<void> {
    return SaveDataService.queue.add(this._saveGameObjectAsync(gameObject, fileName, updateCallback));
  }

  private async _saveGameObjectAsync(gameObject: GameObject, fileName: string = 'xml_data', updateCallback?: UpdateCallback): Promise<void> {
    let files: File[] = [];
    let xml: string = this.convertToXml(gameObject);

    files.push(new File([xml], 'data.xml', { type: 'text/plain' }));
    files = files.concat(await this.searchImageFiles(xml));
    return this.saveAsync(files, this.appendTimestamp(fileName), updateCallback);
  }

  private saveAsync(files: File[], zipName: string, updateCallback?: UpdateCallback): Promise<void> {
    let progresPercent = -1;
    return FileArchiver.instance.saveAsync(files, zipName, meta => {
      let percent = meta.percent | 0;
      if (percent <= progresPercent) return;
      progresPercent = percent;
      this.ngZone.run(() => updateCallback(progresPercent));
    });
  }

  private convertToXml(gameObject: GameObject): string {
    let xmlDeclaration = '<?xml version="1.0" encoding="UTF-8"?>';
    return xmlDeclaration + '\n' + Beautify.xml(gameObject.toXml(), 2);
  }

  private async searchImageFiles(xml: string): Promise<File[]> {
    let xmlElement: Element = XmlUtil.xml2element(xml);
    let files: File[] = [];
    if (!xmlElement) return files;

    let images: { [identifier: string]: ImageFile } = {};
    let imageElements = xmlElement.ownerDocument.querySelectorAll('*[type="image"]');

    for (let i = 0; i < imageElements.length; i++) {
      let identifier = imageElements[i].innerHTML;
      images[identifier] = ImageStorage.instance.get(identifier);

      let shadowIdentifier = imageElements[i].getAttribute('currentValue');
      if (shadowIdentifier) images[shadowIdentifier] = ImageStorage.instance.get(shadowIdentifier);
    }

    imageElements = xmlElement.ownerDocument.querySelectorAll('*[imageIdentifier], *[backgroundImageIdentifier]');

    for (let i = 0; i < imageElements.length; i++) {
      let identifier = imageElements[i].getAttribute('imageIdentifier');
      if (identifier) images[identifier] = ImageStorage.instance.get(identifier);

      let backgroundImageIdentifier = imageElements[i].getAttribute('backgroundImageIdentifier');
      if (backgroundImageIdentifier) images[backgroundImageIdentifier] = ImageStorage.instance.get(backgroundImageIdentifier);
    }
    for (let identifier in images) {
      let image = images[identifier];
      let file :File;
      if (image && !image?.owner.includes('SYSTEM') && image?.type != 'URL') file = await this.downloadImage(image.url);
      if (file) {
        files.push(file);
      }
    }
    return files;
  }

  async downloadImage(url :string) :Promise<File|null> {
    let filename = url.match(".+/(.+?)([?#;].*)?$")[1];
    try {
      let response = await fetch(url, {
        method: 'GET',
        headers: {},
      });
      if (response.ok) {
        let blob = await response.blob()
        if (blob.size > 0) return new File([blob], filename);
      }
    }
    catch(error) {
      console.log(error);
    }
    return null
  }

  private appendTimestamp(fileName: string): string {
    let date = new Date();
    let year = date.getFullYear();
    let month = ('00' + (date.getMonth() + 1)).slice(-2);
    let day = ('00' + date.getDate()).slice(-2);
    let hours = ('00' + date.getHours()).slice(-2);
    let minutes = ('00' + date.getMinutes()).slice(-2);

    return fileName + `_${year}-${month}-${day}_${hours}${minutes}`;
  }

  private getAudioJson():string {
    let audios = AudioStorage.instance.audios.filter(audio => audio.type === 'URL').map(audio => {return audio.context})
    if (audios.length > 0) {
      let effects:AudioUrls[] = audios.map(audio => {
        return {message: audio.name , soundSource: audio.url , udoniteVolume: audio.volume }
      })
      let json = JSON.stringify(effects);
      return json;
    }
    return "";
  }

}


