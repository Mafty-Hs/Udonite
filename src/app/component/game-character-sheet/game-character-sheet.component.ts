import { AfterViewInit, Component, ElementRef, Input, OnDestroy, OnInit, ViewChild } from '@angular/core';

import { EventSystem } from '@udonarium/core/system';
import { DataElement } from '@udonarium/data-element';
import { PresetSound, SoundEffect } from '@udonarium/sound-effect';
import { TabletopObject } from '@udonarium/tabletop-object';
import { FileSelecterComponent } from 'component/file-selecter/file-selecter.component';
import { ModalService } from 'service/modal.service';
import { RoomService } from 'service/room.service';
import { PanelOption, PanelService } from 'service/panel.service';
import { SaveDataService } from 'service/save-data.service';

import { UUID } from '@udonarium/core/system/util/uuid';
import { CardStack } from '@udonarium/card-stack';
import { Card } from '@udonarium/card';
import { DiceSymbol } from '@udonarium/dice-symbol';
import { GameCharacter } from '@udonarium/game-character';
import { PointerDeviceService } from 'service/pointer-device.service';
import { PlayerService } from 'service/player.service';

@Component({
  selector: 'game-character-sheet',
  templateUrl: './game-character-sheet.component.html',
  styleUrls: ['./game-character-sheet.component.css'],
})
export class GameCharacterSheetComponent implements OnInit, OnDestroy, AfterViewInit {

  @Input() tabletopObject: TabletopObject = null;
  mode:string = "";
  isEdit:boolean = false;

  get aliasName():string {
    return this.tabletopObject.aliasName;
  }

  setMode(mode :string) {
    this.mode = mode;
    this.isEdit = false;
  }

  toggleEdit() {
    this.isEdit = !this.isEdit
  }

  get is2d():boolean {
    return this.roomService.roomData.is2d;
  }

  constructor(
    private saveDataService: SaveDataService,
    private panelService: PanelService,
    public roomService: RoomService,
    public playerService: PlayerService,
    private modalService: ModalService,
    private pointerDeviceService: PointerDeviceService,
  ) { }

  openModal(name: string = '') {
    let currentImageIdentifires: string[] = [];
    const elements = this.tabletopObject.imageDataElement.getElementsByName(name);
    if (elements && elements.length > 0) currentImageIdentifires = elements.map(element => element.value + '');
    this.modalService.open<string>(FileSelecterComponent, { isAllowedEmpty: false, currentImageIdentifires: currentImageIdentifires }).then(value => {
      if (!this.tabletopObject || !this.tabletopObject.imageDataElement || !value) return;
      let element = this.tabletopObject.imageDataElement.getFirstElementByName(name);
      if (element) {
        element.value = value;
      } else {
        return;
      }
    });
    EventSystem.trigger('UPDATE_GAME_OBJECT', this.tabletopObject);
  }

  clone() {
    let cloneObject = this.tabletopObject.clone();
    cloneObject.location.x += 50;
    cloneObject.location.y += 50;
    if (this.tabletopObject.parent) this.tabletopObject.parent.appendChild(cloneObject);
    cloneObject.update();
    switch (this.tabletopObject.aliasName) {
      case 'terrain':
        SoundEffect.play(PresetSound.blockPut);
        (cloneObject as any).isLocked = false;
        break;
      case 'card':
      case 'card-stack':
        (cloneObject as any).owner = '';
        (cloneObject as any).toTopmost();
      case 'table-mask':
        (cloneObject as any).isLock = false;
        SoundEffect.play(PresetSound.cardPut);
        break;
      case 'text-note':
        (cloneObject as any).toTopmost();
        SoundEffect.play(PresetSound.cardPut);
        break;
      case 'dice-symbol':
        SoundEffect.play(PresetSound.dicePut);
      default:
        SoundEffect.play(PresetSound.piecePut);
        break;
    }
  }

  addDataElement() {
    if (this.tabletopObject.detailDataElement) {
      let title = DataElement.create('見出し', '', {});
      let tag = DataElement.create('タグ', '', {});
      title.appendChild(tag);
      this.tabletopObject.detailDataElement.appendChild(title);
    }
  }


  isSaveing: boolean = false;
  progresPercent: number = 0;


  get tableTopObjectName(): string {
    let element = this.tabletopObject.commonDataElement.getFirstElementByName('name') || this.tabletopObject.commonDataElement.getFirstElementByName('title');
    return element ? <string>element.value : '';
  }

  async saveToXML() {
    if (!this.tabletopObject || this.isSaveing) return;
    this.isSaveing = true;
    this.progresPercent = 0;

    //let element = this.tabletopObject.commonDataElement.getFirstElementByName('name') || this.tabletopObject.commonDataElement.getFirstElementByName('title');
    //let objectName: string = element ? <string>element.value : '';
    let objectName = this.tableTopObjectName;

    await this.saveDataService.saveGameObjectAsync(this.tabletopObject, 'fly_xml_' + objectName, percent => {
      this.progresPercent = percent;
    });

    setTimeout(() => {
      this.isSaveing = false;
      this.progresPercent = 0;
    }, 500);
  }

  setLocation(locationName: string) {
    EventSystem.call('FAREWELL_STAND_IMAGE', { characterIdentifier: this.tabletopObject.identifier });
    if (locationName == 'graveyard') {
      SoundEffect.play(PresetSound.sweep);
    } else {
      SoundEffect.play(PresetSound.piecePut);
    }
    this.tabletopObject.setLocation(locationName);
  }

  ngOnInit() {
    EventSystem.register(this)
      .on('DELETE_GAME_OBJECT', -1000, event => {
        if (this.tabletopObject && this.tabletopObject.identifier === event.data.identifier) {
          this.panelService.close();
        }
      });
  }

  ngAfterViewInit() {
  }

  ngOnDestroy() {
    EventSystem.unregister(this);
  }

  toggleEditMode() {
  }

}
