import { ImageFile } from './core/file-storage/image-file';
import { ImageStorage } from './core/file-storage/image-storage';
import { SyncObject, SyncVar } from './core/synchronize-object/decorator';
import { ObjectNode } from './core/synchronize-object/object-node';
import { PeerCursor } from './peer-cursor';
import { StringUtil } from './core/system/util/string-util';
import { imageStyle } from './tabletop-object';

export interface ChatMessageContext {
  identifier?: string;
  tabIdentifier?: string;
  originFrom?: string;
  from?: string;
  to?: string;
  name?: string;
  text?: string;
  timestamp?: number;
  tag?: string;
  dicebot?: string;
  imageIdentifier?: string;
  color?: string;
  isInverseIcon?: number;
  isHollowIcon?: number;
  isBlackPaint?: number;
  aura?: number;
  characterIdentifier?: string;
  standIdentifier?: string;
  standName?: string;
  isUseStandImage?: boolean;
}

@SyncObject('chat')
export class ChatMessage extends ObjectNode implements ChatMessageContext {
  @SyncVar() originFrom: string;
  @SyncVar() from: string;
  @SyncVar() to: string;
  @SyncVar() name: string;
  @SyncVar() tag: string;
  @SyncVar() dicebot: string;
  @SyncVar() imageIdentifier: string;
  @SyncVar() color: string;
  @SyncVar() isInverseIcon: number;
  @SyncVar() isHollowIcon: number;
  @SyncVar() isBlackPaint: number;
  @SyncVar() aura: number = -1;
  @SyncVar() characterIdentifier: string;
  @SyncVar() standIdentifier: string;
  @SyncVar() standName: string;
  @SyncVar() isUseStandImage: boolean;
  @SyncVar() lastUpdate: number = 0

  get tabIdentifier(): string { return this.parent.identifier; }
  get text(): string { return <string>this.value; }
  set text(text: string) { this.value = (text == null) ? '' : text; }

  get timestamp(): number {
    let timestamp = this.getAttribute('timestamp');
    let num = timestamp ? +timestamp : 0;
    return Number.isNaN(num) ? 1 : num;
  }
  private _to: string;
  private _sendTo: string[] = [];
  get sendTo(): string[] {
    if (this._to !== this.to) {
      this._to = this.to;
      this._sendTo = this.to != null && 0 < this.to.trim().length ? this.to.trim().split(/\s+/) : [];
    }
    return this._sendTo;
  }

  get isEdited(): boolean {
    return this.lastUpdate > 0;
  }

  private _tag: string;
  private _tags: string[] = [];
  get tags(): string[] {
    if (this._tag !== this.tag) {
      this._tag = this.tag;
      this._tags = this.tag != null && 0 < this.tag.trim().length ? this.tag.trim().split(/\s+/) : [];
    }
    return this._tags;
  }

  get image(): ImageFile { return ImageStorage.instance.get(this.imageIdentifier); }
  get index(): number { return this.minorIndex + this.timestamp; }
  get isDirect(): boolean { return 0 < this.sendTo.length ? true : false; }
  get isSendFromSelf(): boolean { return this.from === this.getMyId || this.originFrom === this.getMyId; }
  get isRelatedToMe(): boolean { return (-1 < this.sendTo.indexOf(this.getMyId)) || this.isSendFromSelf ? true : false; }
  get isDisplayable(): boolean { return this.isDirect ? this.isRelatedToMe : true; }
  get isSystem(): boolean { return -1 < this.tags.indexOf('system') ? true : false; }
  get isDicebot(): boolean { return this.isSystem && this.from.indexOf('Dice') >= 0 && this.text.indexOf(': 計算結果 →') < 0 ? true : false; }
  get isCalculate(): boolean { return this.isSystem && this.from.indexOf('Dice') >= 0 && this.text.indexOf(': 計算結果 →') > -1 ? true : false; }
  get isSecret(): boolean { return -1 < this.tags.indexOf('secret') ? true : false; }
  get isEmptyDice(): boolean { return !this.isDicebot || -1 < this.tags.indexOf('empty'); }
  get isSpecialColor(): boolean { return this.isDirect || this.isSecret || this.isSystem || this.isDicebot || this.isCalculate; }
  get isEditable(): boolean { return !this.isSystem && !this.isDicebot }
  get isFaceIcon(): boolean { return !this.isSystem && (!this.characterIdentifier || this.tags.indexOf('noface') < 0); }

  get isSuccess(): boolean { return this.isDicebot && -1 < this.tags.indexOf('success'); }
  get isFailure(): boolean { return this.isDicebot && -1 < this.tags.indexOf('failure'); }
  get isCritical(): boolean { return this.isDicebot && -1 < this.tags.indexOf('critical'); }
  get isFumble(): boolean { return this.isDicebot && -1 < this.tags.indexOf('fumble'); }

  get escapeHtmlAndRuby():string {
    return StringUtil.escapeHtmlAndRuby(this.text,true);
  }

  auraColor :string[] = ["#000", "#33F", "#3F3", "#3FF", "#F00", "#F0F", "#FF3", "#FFF" ]
  get auraStyle():imageStyle {
    let auraStyle:imageStyle = {};
    auraStyle.filter = this.aura != -1 ? 'blur(1px) drop-shadow(0 -4px 4px ' + this.auraColor[this.aura] + ')' : undefined;
    if (this.isInverseIcon) {
      auraStyle.transform = 'rotateY(-180deg)';
    }
    return auraStyle;
  }
  get imgStyle():imageStyle {
    let imgStyle: imageStyle = {};
    let filter:string[] = [];
    if (this.isInverseIcon == 1) {
      imgStyle.transform = 'rotateY(-180deg)';
      imgStyle.transition = 'transform 132ms 0s ease';
    }
    if (this.isHollowIcon == 1) {
      imgStyle.opacity = "0.6"
      filter.push('blur(1px)');
    }
    if (this.isBlackPaint == 1) {
      filter.push('brightness(0)');
    }
    if (filter.length > 0) {
      imgStyle.filter = filter.join(' ')
    }
    return imgStyle;
  }


  private get getMyId():string {
    return (PeerCursor.myCursor.context) ? PeerCursor.myCursor.player.playerId : ""
  }
}
