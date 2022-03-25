import {
  AfterViewInit,
  ChangeDetectorRef,
  Component,
  HostListener,
  NgZone,
  OnDestroy,
  OnInit,
} from '@angular/core';
import { ImageFile } from '@udonarium/core/file-storage/image-file';
import { ObjectNode } from '@udonarium/core/synchronize-object/object-node';
import { ObjectStore } from '@udonarium/core/synchronize-object/object-store';
import { EventSystem } from '@udonarium/core/system';
import { GameCharacter } from '@udonarium/game-character';
import { PresetSound, SoundEffect } from '@udonarium/sound-effect';
import { GameCharacterSheetComponent } from 'component/game-character-sheet/game-character-sheet.component';
import { PlayerPaletteComponent } from 'component/player-palette/player-palette.component';
import { InnerNoteComponent } from 'component/inner-note/inner-note.component';
import { MovableOption } from 'directive/movable.directive';
import { RotableOption } from 'directive/rotable.directive';
import { ContextMenuSeparator, ContextMenuService } from 'service/context-menu.service';
import { PanelOption, PanelService } from 'service/panel.service';
import { PointerDeviceService } from 'service/pointer-device.service';
import { StringUtil } from '@udonarium/core/system/util/string-util';
import { ImageStorage } from '@udonarium/core/file-storage/image-storage';
import { GameObjectInventoryService } from 'service/game-object-inventory.service';
import { ModalService } from 'service/modal.service';
import { PlayerService } from 'service/player.service';
import { EffectService } from 'service/effect.service';
import { StandSettingComponent } from 'component/stand-setting/stand-setting.component';
import { DataElement } from '@udonarium/data-element';
import { GameCharacterService } from 'service/game-character.service';


@Component({
  selector: 'game-character-template',
  template: `<div></div>`
})
export class GameCharacterComponentTemplate implements OnInit, OnDestroy, AfterViewInit {
  gameCharacter: GameCharacter
  is3D: boolean

  get name(): string { return this.gameCharacter.name; }
  get size(): number { return this.adjustMinBounds(this.gameCharacter.size); }
  get altitude(): number { return this.gameCharacter.altitude; }
  set altitude(altitude: number) { this.gameCharacter.altitude = altitude; }
  get imageFile(): ImageFile { return this.gameCharacter.imageFile; }
  get rotate(): number { return this.gameCharacter.rotate; }
  set rotate(rotate: number) { this.gameCharacter.rotate = rotate; }
  get roll(): number { return this.gameCharacter.roll; }
  set roll(roll: number) { this.gameCharacter.roll = roll; }
  get isDropShadow(): boolean { return this.gameCharacter.isDropShadow; }
  set isDropShadow(isDropShadow: boolean) { this.gameCharacter.isDropShadow = isDropShadow; }
  get isAltitudeIndicate(): boolean { return this.gameCharacter.isAltitudeIndicate; }
  set isAltitudeIndicate(isAltitudeIndicate: boolean) { this.gameCharacter.isAltitudeIndicate = isAltitudeIndicate; }
  get isInverse(): boolean { return this.gameCharacter.isInverse; }
  set isInverse(isInverse: boolean) { this.gameCharacter.isInverse = isInverse; }
  get isHollow(): boolean { return this.gameCharacter.isHollow; }
  set isHollow(isHollow: boolean) { this.gameCharacter.isHollow = isHollow; }
  get isBlackPaint(): boolean { return this.gameCharacter.isBlackPaint; }
  set isBlackPaint(isBlackPaint: boolean) { this.gameCharacter.isBlackPaint = isBlackPaint; }
  get aura(): number { return this.gameCharacter.aura; }
  set aura(aura: number) { this.gameCharacter.aura = aura; }
  get identifier(): string { return this.gameCharacter.identifier; }
  get isNotRide(): boolean { return this.gameCharacter.isNotRide; }
  set isNotRide(isNotRide: boolean) { this.gameCharacter.isNotRide = isNotRide; }
  get isUseIconToOverviewImage(): boolean { return this.gameCharacter.isUseIconToOverviewImage; }
  set isUseIconToOverviewImage(isUseIconToOverviewImage: boolean) { this.gameCharacter.isUseIconToOverviewImage = isUseIconToOverviewImage; }
  get isTranslate(): boolean { return this.pointerDeviceService.isTranslate};

  get faceIcon(): ImageFile { return this.gameCharacter.faceIcon; }

  get dialogFaceIcon(): ImageFile {
    if (!this.dialog || !this.dialog.faceIconIdentifier) return null;
    return ImageStorage.instance.get(<string>this.dialog.faceIconIdentifier);
  }

  get shadowImageFile(): ImageFile { return this.gameCharacter.shadowImageFile; }

  get elevation(): number {
    return +((this.gameCharacter.posZ + (this.altitude * this.gridSize)) / this.gridSize).toFixed(1);
  }

  get canEffect():boolean {
    return this.effectService.canEffect;
  }

  get statusBar1():number|null {
    if (!this.playerService.isShowStatusBar || !this.gameCharacter.isInventoryIndicate) return null;
    if (!this.gameObjectInventoryService.statusBar_1) return null;
    let dataElm = this.gameCharacterService.findDataElm(this.gameCharacter.identifier ,this.gameObjectInventoryService.statusBar_1)
    if (!dataElm || !dataElm.isNumberResource || !dataElm.value ) return null;
    let result = Number(dataElm.currentValue) / Number(dataElm.value);
    if (isNaN(result) || result > 1 ) return 1;
    return result;
  }
  get statusBar2():number|null {
    if (!this.playerService.isShowStatusBar || !this.gameCharacter.isInventoryIndicate) return null;
    if (!this.gameObjectInventoryService.statusBar_2) return null;
    let dataElm = this.gameCharacterService.findDataElm(this.gameCharacter.identifier ,this.gameObjectInventoryService.statusBar_2)
    if (!dataElm || !dataElm.isNumberResource || !dataElm.value ) return null;
    let result = Number(dataElm.currentValue) / Number(dataElm.value);
    if (isNaN(result) || result > 1 ) return 1;
    return result;
  }
  get statusBar3():number|null {
    if (!this.playerService.isShowStatusBar || !this.gameCharacter.isInventoryIndicate) return null;
    if (!this.gameObjectInventoryService.statusBar_3) return null;
    let dataElm = this.gameCharacterService.findDataElm(this.gameCharacter.identifier ,this.gameObjectInventoryService.statusBar_3)
    if (!dataElm || !dataElm.isNumberResource || !dataElm.value ) return null;
    let result = Number(dataElm.currentValue) / Number(dataElm.value);
    if (isNaN(result) || result > 1 ) return 1;
    return result;
  }
  get statusColor1():string {
    return this.gameObjectInventoryService.statusColor_1;
  }
  get statusColor2():string {
    return this.gameObjectInventoryService.statusColor_2;
  }
  get statusColor3():string {
    return this.gameObjectInventoryService.statusColor_3;
  }



  stopRotate:boolean = false;
  gridSize: number = 50;
  math = Math;
  stringUtil = StringUtil;
  viewRotateX = 50;
  viewRotateZ = 10;
  heightWidthRatio = 1.5;



  set dialog(dialog) {
    if (!this.gameCharacter) return;
    clearTimeout(this.dialogTimeOutId);
    clearInterval(this.chatIntervalId);
    let text = StringUtil.cr(dialog.text);
    const isEmote = StringUtil.isEmote(text);
    if (!isEmote) text = text.replace(/[。、]{3}/g, '…').replace(/[。、]{2}/g, '‥').replace(/(。|[\r\n]{2,})/g, "$1                            ").trimEnd(); //改行や。のあと時間を置くためのダーティハック
    let speechDelay = 1000 / text.length > 36 ? 1000 / text.length : 36;
    if (speechDelay > 200) speechDelay = 200;
    if (!isEmote) this.gameCharacter.text = text.slice(0, 1);
    this.dialogTimeOutId = setTimeout(() => {
      this._dialog = null;
      this.gameCharacter.text = '';
      this.gameCharacter.isEmote = false;
      this.changeDetector.markForCheck();
    }, text.length * speechDelay + 6000);
    this._dialog = dialog;
    this.gameCharacter.isEmote = isEmote;
    let count = 1;
    if (isEmote) {
      this.gameCharacter.text = text;
      this.changeDetector.markForCheck();
    }  else {
      this.chatIntervalId = setInterval(() => {
        count++;
        this.gameCharacter.text = text.slice(0, count);
        this.changeDetector.markForCheck();
        if (count >= text.length) {
          clearInterval(this.chatIntervalId);
        }
      }, speechDelay);
    }
  }

  get dialogText(): string {
    if (!this.gameCharacter || !this.gameCharacter.text) return '';
    const ary = this.gameCharacter.text.replace(/。/g, "。\n\n").split(/[\r\n]{2,}/g).filter(str => str.trim());
    return ary.length > 0 ? ary.reverse()[0].trim() : '';
  }

  get dialogChatBubbleMinWidth(): number {
    const max = (this.gameCharacter.size + 1.8) * this.gridSize;
    const existIcon = this.isUseFaceIcon && this.dialogFaceIcon && this.dialogFaceIcon.url;
    const dynamic = this.dialogText.length * 11 + 52 + (existIcon ? 32 : 0);
    return max < dynamic ? max : dynamic;
  }

  get dialog() {
    return this._dialog;
  }

  protected _dialog = null;
  protected dialogTimeOutId = null;
  protected chatIntervalId = null;

  get chatBubbleXDeg():number {
    let ret = 90 - this.viewRotateX;
    if (ret < 0) ret = 360 + ret;
    ret = ret % 360;
    if (ret > 180) ret = -(180 - (ret - 180));
    if (ret > 90) ret = 90;
    if (ret < -90) ret = -90;
    return ret / 1.5;
  }


  get characterImageHeight(): number {
    if (!this.imageFile) return 0;
    let ratio = (this.imageFile.aspect > this.heightWidthRatio) ? this.heightWidthRatio : this.imageFile.aspect;
    return ratio * this.gridSize * this.size;
  }

  get chatBubbleAltitude(): number {
    let cos =  Math.cos(this.roll * Math.PI / 180);
    let sin = Math.abs(Math.sin(this.roll * Math.PI / 180));
    if (cos < 0.5) cos = 0.5;
    if (sin < 0.5) sin = 0.5;
    const altitude1 = (this.characterImageHeight + (this.name ? 36 : 0)) * cos + 4;
    const altitude2 = (this.gridSize * this.size / 2) * sin + 4 + this.gridSize * this.size / 2;
    return altitude1 > altitude2 ? altitude1 : altitude2;
  }

  // 元の高さからマイナスする値
  get nameplateOffset(): number {
    if (!this.imageFile) return this.gridSize * this.size * this.heightWidthRatio;
    return this.gridSize * this.size * this.heightWidthRatio - this.characterImageHeight;
  }

  get nameTagRotate(): number {
    let x = (this.viewRotateX % 360) - 90;
    let z = (this.viewRotateZ + this.rotate) % 360;
    let roll = this.roll % 360;
    z = (z > 0 ? z : 360 + z);
    roll = (roll > 0 ? roll : 360 + roll);
    return (x > 0 ? x : 360 + x) * (90 < z && z < 270 ? 1 : -1) * (90 <= roll && roll <= 270 ? -1 : 1);
  }

  get isListen(): boolean {
    return (this.dialog && this.dialog.text && !this.dialog.dialogTest && this.dialog.text.trim().length > 0);
  }

  get isWhisper(): boolean {
    return this.dialog && this.dialog.secret;
  }

  get isEmote(): boolean {
    return this.gameCharacter.isEmote;
    return this.dialog && StringUtil.isEmote(this.dialog.text);
  }

  get isUseFaceIcon(): ImageFile {
    return this.dialog && this.dialog.faceIconIdentifier;
  }

  get dialogColor(): string {
    return (this.dialog && this.dialog.color && this.dialog.color != this.playerService.CHAT_WHITETEXT_COLOR) ? this.dialog.color : this.playerService.CHAT_BLACKTEXT_COLOR;
  }

  movableOption: MovableOption = {};
  rotableOption: RotableOption = {};

  constructor(
    protected contextMenuService: ContextMenuService,
    protected gameCharacterService: GameCharacterService,
    protected gameObjectInventoryService: GameObjectInventoryService,
    protected panelService: PanelService,
    protected playerService: PlayerService,
    protected effectService: EffectService,
    protected changeDetector: ChangeDetectorRef,
    protected pointerDeviceService: PointerDeviceService,
    protected ngZone: NgZone,
    protected modalService: ModalService
  ) { }

  ngOnInit() {
    EventSystem.register(this)
      .on('UPDATE_BAR', -1000, event => {
        this.changeDetector.markForCheck();
      })
      .on('UPDATE_GAME_OBJECT', -1000, event => {
        let object = ObjectStore.instance.get(event.data.identifier);
        if (!this.gameCharacter || !object) return;
        if (this.gameCharacter === object || (object instanceof ObjectNode && this.gameCharacter.contains(object))) {
          this.changeDetector.markForCheck();
        }
      })
      .on('IMAGE_SYNC', -1000, event => {
        this.changeDetector.markForCheck();
      })
      .on<object>('TABLE_VIEW_ROTATE', -1000, event => {
        this.ngZone.run(() => {
          this.viewRotateX = event.data['x'];
          this.viewRotateZ = event.data['z'];
          this.changeDetector.markForCheck();
        });
      })
      .on('POPUP_CHAT_BALLOON', -1000, event => {
        if (this.gameCharacter && this.gameCharacter.identifier == event.data.characterIdentifier) {
          this.ngZone.run(() => {
            this.dialog = event.data;
            this.changeDetector.markForCheck();
          });
        }
      })
      .on('FAREWELL_CHAT_BALLOON', -1000, event => {
        if (this.gameCharacter && this.gameCharacter.identifier == event.data.characterIdentifier) {
          this.ngZone.run(() => {
            this._dialog = null;
            this.gameCharacter.text = '';
            this.gameCharacter.isEmote = false;
            this.changeDetector.markForCheck();
          });
          clearTimeout(this.dialogTimeOutId);
          clearInterval(this.chatIntervalId);
        }
      })
      ;

    this.movableOption = {
      tabletopObject: this.gameCharacter,
      transformCssOffset: 'translateZ(1.0px)',
      colideLayers: ['terrain', 'text-note', 'character']
    };
    this.rotableOption = {
      tabletopObject: this.gameCharacter
    };
  }

  ngAfterViewInit() {

  }

  ngOnDestroy() {
    clearTimeout(this.dialogTimeOutId);
    clearInterval(this.chatIntervalId);
    if (this.gameCharacter) {
      this.gameCharacter.text = '';
      this.gameCharacter.isEmote = false;
    }
    EventSystem.unregister(this);
  }

  @HostListener('dragstart', ['$event'])
  onDragstart(e: any) {
    console.log('Dragstart Cancel !!!!');
    e.stopPropagation();
    e.preventDefault();
  }

  onMove() {
    SoundEffect.play(PresetSound.piecePick);
  }

  onMoved() {
    // とりあえず移動したら💭消す
    if (this.gameCharacter && this.gameCharacter.text) {
      EventSystem.call('FAREWELL_CHAT_BALLOON', { characterIdentifier: this.gameCharacter.identifier });
    }
    SoundEffect.play(PresetSound.piecePut);
  }

  onImageLoad() {
    EventSystem.trigger('UPDATE_GAME_OBJECT', this.gameCharacter);
  }

  protected adjustMinBounds(value: number, min: number = 0): number {
    return value < min ? min : value;
  }

  protected showDetail(gameObject: GameCharacter) {
    let coordinate = this.pointerDeviceService.pointers[0];
    let title = 'キャラクターシート';
    if (gameObject.name.length) title += ' - ' + gameObject.name;
    let option: PanelOption = { title: title, left: coordinate.x - 400, top: coordinate.y - 300, width: 800, height: 600 };
    let component = this.panelService.open<GameCharacterSheetComponent>(GameCharacterSheetComponent, option);
    component.tabletopObject = gameObject;
  }

  protected showInnerNote() {
      let coordinate = this.pointerDeviceService.pointers[0];
    let title = 'メモ';
    if (this.gameCharacter.name.length) title += ' - ' + this.gameCharacter.name;
    let option: PanelOption = { title: title ,left: coordinate.x - 330, top: coordinate.y - 330, width: 330, height: 330 };
    let panel = this.panelService.open<InnerNoteComponent>(InnerNoteComponent, option);
    panel.character = this.gameCharacter;
  }

  protected showChatPalette(gameObject: GameCharacter) {
    let palette = this.playerService.myPalette;
    this.playerService.addList(gameObject.identifier);
    if (!palette) {
      let option: PanelOption = { left: 200, top: 100 , width: 620, height: 350 };
      palette = this.panelService.open<PlayerPaletteComponent>(PlayerPaletteComponent
, option);
    }
  }

  protected showStandSetting(gameObject: GameCharacter) {
    let coordinate = this.pointerDeviceService.pointers[0];
    let option: PanelOption = { left: coordinate.x - 400, top: coordinate.y - 175, width: 730, height: 572 };
    let component = this.panelService.open<StandSettingComponent>(StandSettingComponent, option);
    component.character = gameObject;
  }

  changeImage(index: number) {
    if (this.gameCharacter.currntImageIndex != index) {
      this.gameCharacter.currntImageIndex = index;
      SoundEffect.play(PresetSound.surprise);
      EventSystem.call('FAREWELL_STAND_IMAGE', { characterIdentifier: this.gameCharacter.identifier });
      EventSystem.trigger('UPDATE_INVENTORY', null);
    }
  }

  nextImage() {
    if (this.gameCharacter.imageFiles.length <= 1) return;
    if (this.gameCharacter.currntImageIndex + 1 >= this.gameCharacter.imageFiles.length) {
      this.changeImage(0);
    } else {
      this.changeImage(this.gameCharacter.currntImageIndex + 1);
    }
  }
}
