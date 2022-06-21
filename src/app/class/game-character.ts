import { ChatPalette, SubPalette } from './chat-palette';
import { SyncObject, SyncVar } from './core/synchronize-object/decorator';
import { DataElement } from './data-element';
import { TabletopObject } from './tabletop-object';
import { UUID } from '@udonarium/core/system/util/uuid';

import { StandList } from './stand-list';
import { StringUtil } from './core/system/util/string-util';

@SyncObject('character')
export class GameCharacter extends TabletopObject {
  constructor(identifier: string = UUID.generateUuid()) {
    super(identifier);
    this.isAltitudeIndicate = true;
  }

  @SyncVar() rotate: number = 0;
  @SyncVar() roll: number = 0;
  @SyncVar() isDropShadow: boolean = true;
  @SyncVar() isShowChatBubble: boolean = true;
  @SyncVar() initiativeNumber: number = 0;
  get initiative():number {
    if (Number.isNaN(this.initiativeNumber)) this.initiativeNumber = 0;
    return this.initiativeNumber;
  }
  set initiative(initiative:number) {
    this.initiativeNumber = initiative;
  }

  _text = '';
  set text(text :string) { this._text = text};
  get text():string { return StringUtil.escapeHtmlAndRuby(this._text,false)};

  isEmote = false;

  set name(value:string) { this.setCommonValue('name', value); }
  get name(): string { return this.getCommonValue('name', ''); }
  get size(): number { return this.getCommonValue('size', 1); }

  private get innerNote():InnerNote {
    let note = this.children.find(child => child.getAttribute('name') == 'inner-note');
    if (!note) {
      note = this.appendChild(InnerNote.create('inner-note', '', { type: 'note', value: '' }, 'innernote_' + this.identifier));
    }
    return note as InnerNote;
  }

  get isTransparent(): boolean { return !this.hasOwner || this.isMine || this.canTransparent}

  get subPalette(): SubPalette {
    for (let child of this.children) {
      if (child instanceof SubPalette) return child;
    }
    let subPalette = new SubPalette();
    subPalette.initialize();
    this.appendChild(subPalette);
    return subPalette;
  }

  get note():string {
    return this.innerNote.value + '';
  }
  set note(note :string) {
    this.innerNote.value = note;
  }

  get chatPalette(): ChatPalette {
    for (let child of this.children) {
      if (child instanceof ChatPalette) return child;
    }
    return null;
  }

  private _showNote:boolean = false;
  get showNote():boolean {
    return this._showNote;
  }
  set showNote(showNote :boolean) {
    this._showNote = showNote;
  }

  cloneNumber() :this {
    let cloneObject = super.clone();

    let objectname:string;
    let reg = new RegExp('(.*)_([0-9]*)');
    let res = cloneObject.name.match(reg);

    if(res != null && res.length == 3) {
      let cloneNumber:number = parseInt(res[2]) + 1;
      objectname = res[1] + "_" + cloneNumber;
    } else {
      objectname = cloneObject.name + "_2";
    }

    cloneObject.name = objectname;
    cloneObject.update();

    return cloneObject;

  }

  get standList(): StandList {
    for (let child of this.children) {
      if (child instanceof StandList) return child;
    }
    let standList = new StandList('StandList_' + this.identifier);
    standList.initialize();
    this.appendChild(standList);
    return standList;
  }

  static create(name: string, imageIdentifier: string): GameCharacter {
    let gameCharacter: GameCharacter = new GameCharacter();
    let size :number = 1;
    gameCharacter.createDataElements();
    gameCharacter.initialize();
    gameCharacter.createCommonGameDataElement(name, size, imageIdentifier);
    return gameCharacter;
  }

  createCommonGameDataElement(name: string, size: number, imageIdentifier: string) {
    this.createDataElements();

    let nameElement: DataElement = DataElement.create('name', name, {}, 'name_' + this.identifier);
    let sizeElement: DataElement = DataElement.create('size', size, {}, 'size_' + this.identifier);
    let altitudeElement: DataElement = DataElement.create('altitude', 0, {}, 'altitude_' + this.identifier);

    if (this.imageDataElement.getFirstElementByName('imageIdentifier')) {
      this.imageDataElement.getFirstElementByName('imageIdentifier').value = imageIdentifier;
    }

    let resourceElement: DataElement = DataElement.create('リソース', '', {}, 'リソース' + this.identifier);
    let hpElement: DataElement = DataElement.create('HP', 200, { 'type': 'numberResource', 'currentValue': '200' }, 'HP_' + this.identifier);
    let mpElement: DataElement = DataElement.create('MP', 100, { 'type': 'numberResource', 'currentValue': '100' }, 'MP_' + this.identifier);

    this.commonDataElement.appendChild(nameElement);
    this.commonDataElement.appendChild(sizeElement);
    this.commonDataElement.appendChild(altitudeElement);

    this.detailDataElement.appendChild(resourceElement);
    resourceElement.appendChild(hpElement);
    resourceElement.appendChild(mpElement);

    let palette: ChatPalette = new ChatPalette('ChatPalette_' + this.identifier);
    palette.initialize();
    this.appendChild(palette);

    let standList = new StandList('StandList_' + this.identifier);
    standList.initialize();
    this.appendChild(standList);
  }
  createTestGameDataElement() {
        let testElement: DataElement = DataElement.create('情報', '', {}, '情報' + this.identifier);
        this.detailDataElement.appendChild(testElement);
        testElement.appendChild(DataElement.create('説明', 'ここに説明を書く\nあいうえお', { 'type': 'note' }, '説明' + this.identifier));
        testElement.appendChild(DataElement.create('メモ', '任意の文字列\n１\n２\n３\n４\n５', { 'type': 'note' }, 'メモ' + this.identifier));
        testElement.appendChild(DataElement.create('参照URL', 'https://www.example.com', { 'type': 'url' }, '参照URL' + this.identifier));

        testElement = DataElement.create('能力', '', {}, '能力' + this.identifier);
        this.detailDataElement.appendChild(testElement);
        testElement.appendChild(DataElement.create('器用度', 24, { 'type': 'abilityScore', 'currentValue': 'div6' }, '器用度' + this.identifier));
        testElement.appendChild(DataElement.create('敏捷度', 24, { 'type': 'abilityScore', 'currentValue': 'div6' }, '敏捷度' + this.identifier));
        testElement.appendChild(DataElement.create('筋力', 24, { 'type': 'abilityScore', 'currentValue': 'div6' }, '筋力' + this.identifier));
        testElement.appendChild(DataElement.create('生命力', 24, { 'type': 'abilityScore', 'currentValue': 'div6' }, '生命力' + this.identifier));
        testElement.appendChild(DataElement.create('知力', 24, { 'type': 'abilityScore', 'currentValue': 'div6' }, '知力' + this.identifier));
        testElement.appendChild(DataElement.create('精神力', 24, { 'type': 'abilityScore', 'currentValue': 'div6' }, '精神力' + this.identifier));

        testElement = DataElement.create('戦闘特技', '', {}, '戦闘特技' + this.identifier);
        this.detailDataElement.appendChild(testElement);
        testElement.appendChild(DataElement.create('Lv1', '全力攻撃', {}, 'Lv1' + this.identifier));
        testElement.appendChild(DataElement.create('Lv3', '武器習熟/ソード', {}, 'Lv3' + this.identifier));
        testElement.appendChild(DataElement.create('Lv5', '武器習熟/ソードⅡ', {}, 'Lv5' + this.identifier));
        testElement.appendChild(DataElement.create('Lv7', '頑強', {}, 'Lv7' + this.identifier));
        testElement.appendChild(DataElement.create('Lv9', '薙ぎ払い', {}, 'Lv9' + this.identifier));
        testElement.appendChild(DataElement.create('自動', '治癒適正', {}, '自動' + this.identifier));

        this.chatPalette.setPalette(`チャットパレット入力例：
    2d6+1 ダイスロール
    １ｄ２０＋{敏捷}＋｛格闘｝　{name}の格闘！
    //敏捷=10+{敏捷A}
    //敏捷A=10
    //格闘＝１`);
  }
}

class InnerNote extends DataElement {

}
