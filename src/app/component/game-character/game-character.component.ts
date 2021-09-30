import { animate, keyframes, style, transition, trigger } from '@angular/animations';
import {
  AfterViewInit,
  ChangeDetectionStrategy,
  ChangeDetectorRef,
  Component,
  HostListener,
  Input,
  NgZone,
  OnDestroy,
  OnInit,
  ViewChild, ElementRef
} from '@angular/core';
import { ImageFile } from '@udonarium/core/file-storage/image-file';
import { ObjectNode } from '@udonarium/core/synchronize-object/object-node';
import { ObjectStore } from '@udonarium/core/synchronize-object/object-store';
import { EventSystem, Network } from '@udonarium/core/system';
import { GameCharacter } from '@udonarium/game-character';
import { PresetSound, SoundEffect } from '@udonarium/sound-effect';
import { ChatPaletteComponent } from 'component/chat-palette/chat-palette.component';
import { GameCharacterSheetComponent } from 'component/game-character-sheet/game-character-sheet.component';
import { MovableOption } from 'directive/movable.directive';
import { RotableOption } from 'directive/rotable.directive';
import { ContextMenuSeparator, ContextMenuService } from 'service/context-menu.service';
import { PanelOption, PanelService } from 'service/panel.service';
import { PointerDeviceService } from 'service/pointer-device.service';
import { PeerCursor } from '@udonarium/peer-cursor';
import { StringUtil } from '@udonarium/core/system/util/string-util';
import { ImageStorage } from '@udonarium/core/file-storage/image-storage';
import { ModalService } from 'service/modal.service';
import { EffectService } from 'service/effect.service';
import { OpenUrlComponent } from 'component/open-url/open-url.component';
import { StandSettingComponent } from 'component/stand-setting/stand-setting.component';
import * as THREE from 'three';
import { Subscription } from 'rxjs'

@Component({
  selector: 'game-character',
  templateUrl: './game-character.component.html',
  styleUrls: ['./game-character.component.css'],
  changeDetection: ChangeDetectionStrategy.OnPush,
  animations: [
    trigger('switchImage', [
      transition(':increment, :decrement', [
        animate('400ms ease', keyframes([
          style({ transform: 'scale3d(0.8, 0.8, 0.8) rotateY(0deg)' }),
          style({ transform: 'scale3d(1.2, 1.2, 1.2) rotateY(180deg)' }),
          style({ transform: 'scale3d(1.0, 1.0, 1.0) rotateY(360deg)' })
        ]))
      ])
    ]),
    trigger('switchImageShadow', [
      transition(':increment, :decrement', [
        animate('400ms ease', keyframes([
          style({ transform: 'scale3d(0.8, 0.8, 0.8)' }),
          style({ transform: 'scale3d(0, 1.2, 1.2)' }),
          style({ transform: 'scale3d(1.0, 1.0, 1.0)' })
        ]))
      ])
    ]),
    trigger('switchImagePedestal', [
      transition(':increment, :decrement', [
        animate('400ms ease', keyframes([
          style({ transform: 'scale3d(0, 0, 0)' }),
          style({ transform: 'scale3d(1.2, 1.2, 1.2)' }),
          style({ transform: 'scale3d(1.0, 1.0, 1.0)' })
        ]))
      ])
    ]),
    trigger('bounceInOut', [
      transition('void => *', [
        animate('600ms ease', keyframes([
          style({ transform: 'scale3d(0, 0, 0)', offset: 0 }),
          style({ transform: 'scale3d(1.5, 1.5, 1.5)', offset: 0.5 }),
          style({ transform: 'scale3d(0.75, 0.75, 0.75)', offset: 0.75 }),
          style({ transform: 'scale3d(1.125, 1.125, 1.125)', offset: 0.875 }),
          style({ transform: 'scale3d(1.0, 1.0, 1.0)', offset: 1.0 })
        ]))
      ]),
      transition('* => void', [
        animate(100, style({ transform: 'scale3d(0, 0, 0)' }))
      ])
    ]),
    trigger('fadeAndScaleInOut', [
      transition('void => *, true => false', [
        animate('200ms ease-in-out', keyframes([
          style({ transform: 'scale3d(0, 0, 0)', opacity: 0  }),
          style({ transform: 'scale3d(1.0, 1.0, 1.0)', opacity: 0.8 }),
        ]))
      ]),
      transition('* => void, true => false', [
        animate('100ms ease-in-out', style({ transform: 'scale3d(0, 0, 0)', opacity: 0 }))
      ])
    ])
  ]
})
export class GameCharacterComponent implements OnInit, OnDestroy, AfterViewInit {
  @Input() gameCharacter: GameCharacter = null;
  @Input() is3D: boolean = false;

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

  gridSize: number = 50;
  math = Math;
  stringUtil = StringUtil;
  viewRotateX = 50;
  viewRotateZ = 10;
  heightWidthRatio = 1.5;

  canvas:HTMLCanvasElement;
  private effect$: Subscription;
  private renderer;
  private camera = new THREE.PerspectiveCamera( 30.0, 1, 1, 1000);
  private scene = new THREE.Scene();
  private clock = new THREE.Clock();
  context : effekseer.EffekseerContext = null;
  effects;
  private hasEffect = null;

  toggleEffect(canEffect: boolean){
    if(canEffect) {
      this.createMyEffect()
    }
    else {
      cancelAnimationFrame(this.myLoop);
      document.body.removeChild(this.canvas);
      this.canvas.remove();
    }
  }
  private myLoop; 
  mainLoop = () => {
    this.myLoop = requestAnimationFrame(this.mainLoop.bind(this));
    this.animate();
  };

  createMyEffect() {
    this.canvas = document.createElement('canvas');
    this.canvas.style.zIndex = "20";
    this.canvas.style.position = "absolute";
    this.canvas.style.display = "none";
    this.camera.position.set(20, 20, 20);
    this.camera.lookAt(new THREE.Vector3(0, 0, 0));
 
    document.body.appendChild(this.canvas);

  }

  newContext() {
    this.context = this.effectService.createContext(this.renderer);
    this.ngZone.runOutsideAngular(() => {
      this.mainLoop();
    });
  }

  setCanvasSize(mywidth: number , myheight: number){ 
    this.canvas.style.width = String(mywidth);
    this.canvas.style.height = String(mywidth);
    this.renderer.setSize(mywidth, myheight);
    this.camera.aspect = mywidth / myheight;
    this.camera.updateProjectionMatrix();
  }

  setEffect(effectName: string) {
    if (!this.characterImage?.nativeElement) return;

    let rect = this.characterImage.nativeElement.getBoundingClientRect();
    if (!this.effectService.isValid(rect)) return;

    let newWidth,newHeight,top,left: number;
    [newWidth,newHeight,top,left] = this.effectService.calcSize(rect,effectName); 
    this.canvas.style.left = left + 'px';
    this.canvas.style.top = top + 'px';
    if (this.hasEffect) {
      clearTimeout(this.hasEffect);
      this.setCanvasSize(newWidth ,newHeight);
    }
    else {
      this.renderer = new THREE.WebGLRenderer({canvas: this.canvas , alpha: true});
      this.newContext();
      this.setCanvasSize(newWidth ,newHeight);
    }
    this.canvas.style.display = "block";
    this.effects = this.effectService.addEffect(this.context,effectName)
    //this.canvas.style.backgroundColor = '#FFF';
    setTimeout(() => {
      this.playEffect(effectName);
    }, 500);
  }

  playEffect(effectName:string) {
    this.context.play(this.effects, 0, 0, 0);
    this.hasEffect = setTimeout(() => {
      this.stopEffect();
    }, this.effectService.effectInfo[effectName].time);
  }

  stopEffect() {
    this.hasEffect = null;
    cancelAnimationFrame(this.myLoop);
    this.canvas.style.display = "none"
    this.renderer = null;
  }

  animate() {
         this.context.update(this.clock.getDelta() * 60.0);
         this.renderer.render(this.scene, this.camera);
         this.context.setProjectionMatrix(Float32Array.from(this.camera.projectionMatrix.elements));
         this.context.setCameraMatrix(Float32Array.from(this.camera.matrixWorldInverse.elements));
         this.context.draw();
         this.renderer.resetState();
  }

  set dialog(dialog) {
    if (!this.gameCharacter) return;
    clearTimeout(this.dialogTimeOutId);
    clearInterval(this.chatIntervalId);
    let text = StringUtil.cr(dialog.text);
    const isEmote = StringUtil.isEmote(text);
    if (!isEmote) text = text.replace(/[。、]{3}/g, '…').replace(/[。、]{2}/g, '‥').replace(/(。|[\r\n]{2,})/g, "$1                            ").trimEnd(); //改行や。のあと時間を置くためのダーティハック
    let speechDelay = 1000 / text.length > 36 ? 1000 / text.length : 36;
    if (speechDelay > 200) speechDelay = 200;
    if (!isEmote) this.gameCharacter.text = text.slice(0, 1); // Emoteでない場合は最初の一文字は出しておく
    this.dialogTimeOutId = setTimeout(() => {
      this._dialog = null;
      this.gameCharacter.text = '';
      this.gameCharacter.isEmote = false; 
      this.changeDetector.markForCheck();
    //}, text.length * speechDelay + 6000 > 12000 ? text.length * speechDelay + 6000 : 12000);
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

  private _dialog = null;
  private dialogTimeOutId = null;
  private chatIntervalId = null;

  get chatBubbleXDeg():number {
    //console.log(this.viewRotateX)
    let ret = 90 - this.viewRotateX;
    if (ret < 0) ret = 360 + ret;
    ret = ret % 360;
    if (ret > 180) ret = -(180 - (ret - 180));
    //console.log(ret)
    // 補正
    if (ret > 90) ret = 90;
    if (ret < -90) ret = -90;
    return ret / 1.5;
  }

  @ViewChild('characterImage') characterImage: ElementRef;
  @ViewChild('chatBubble') chatBubble: ElementRef;
  
  get characterImageHeight(): number {
    if (!this.characterImage) return 0;
    let ratio = this.characterImage.nativeElement.naturalHeight / this.characterImage.nativeElement.naturalWidth;
    if (ratio > this.heightWidthRatio) ratio = this.heightWidthRatio;
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
    if (!this.characterImage) return this.gridSize * this.size * this.heightWidthRatio;
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
    return (this.dialog && this.dialog.color) ? this.dialog.color : PeerCursor.CHAT_DEFAULT_COLOR;
  }

  movableOption: MovableOption = {};
  rotableOption: RotableOption = {};

  constructor(
    private contextMenuService: ContextMenuService,
    private panelService: PanelService,
    private effectService: EffectService,
    private changeDetector: ChangeDetectorRef,
    private pointerDeviceService: PointerDeviceService,
    private ngZone: NgZone,
    private modalService: ModalService
  ) { }
  
  ngOnInit() {
    EventSystem.register(this)
      .on('UPDATE_GAME_OBJECT', -1000, event => {
        let object = ObjectStore.instance.get(event.data.identifier);
        if (!this.gameCharacter || !object) return;
        if (this.gameCharacter === object || (object instanceof ObjectNode && this.gameCharacter.contains(object))) {
          this.changeDetector.markForCheck();
        }
      })
      .on('CHARACTER_EFFECT', event => {
        let effectName = event.data[0];
        let character = event.data[1];
        if(this.effectService.canEffect && this.effectService.effectName.includes(effectName) && character.includes(this.identifier)) {
          this.setEffect(effectName);
        }
      })
      .on('SYNCHRONIZE_FILE_LIST', event => {
        this.changeDetector.markForCheck();
      })
      .on('UPDATE_FILE_RESOURE', -1000, event => {
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

    this.effect$ = this.effectService.canEffect$.subscribe((bool: boolean) => { 
      this.toggleEffect(bool);
    });
  }

  ngAfterViewInit() {
    if (this.effectService.canEffect) this.createMyEffect()
  }

  ngOnDestroy() {
    this.effect$.unsubscribe();
    document.body.removeChild(this.canvas);
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

  @HostListener('contextmenu', ['$event'])
  onContextMenu(e: Event) {
    e.stopPropagation();
    e.preventDefault();

    if (!this.pointerDeviceService.isAllowedToOpenContextMenu) return;

    let position = this.pointerDeviceService.pointers[0];
    this.contextMenuService.open(position, [
      (this.gameCharacter.imageFiles.length <= 1 ? null : {
        name: '画像切り替え',
        action: null,
        subActions: this.gameCharacter.imageFiles.map((image, i) => {
          return { 
            name: `${this.gameCharacter.currntImageIndex == i ? '◉' : '○'}`, 
            action: () => { this.changeImage(i); }, 
            default: this.gameCharacter.currntImageIndex == i,
            icon: image
          };
        }),
      }),
      (this.gameCharacter.imageFiles.length <= 1 ? null : ContextMenuSeparator),
      (this.isUseIconToOverviewImage
        ? {
          name: '☑ オーバービューに顔ICを使用', action: () => {
            this.isUseIconToOverviewImage = false;
            EventSystem.trigger('UPDATE_INVENTORY', null);
          }
        } : {
          name: '☐ オーバービューに顔ICを使用', action: () => {
            this.isUseIconToOverviewImage = true;
            EventSystem.trigger('UPDATE_INVENTORY', null);
          }
        }),
      (this.gameCharacter.isShowChatBubble
        ? {
          name: '☑ 💭の表示', action: () => {
            this.gameCharacter.isShowChatBubble = false;
            EventSystem.trigger('UPDATE_INVENTORY', null);
          }
        } : {
          name: '☐ 💭の表示', action: () => {
            this.gameCharacter.isShowChatBubble = true;
            EventSystem.trigger('UPDATE_INVENTORY', null);
          }
        }),
      (this.isDropShadow
        ? {
          name: '☑ 影の表示', action: () => {
            this.isDropShadow = false;
            EventSystem.trigger('UPDATE_INVENTORY', null);
          }
        } : {
          name: '☐ 影の表示', action: () => {
            this.isDropShadow = true;
            EventSystem.trigger('UPDATE_INVENTORY', null);
          }
        }),
      { name: '画像効果', action: null, subActions: [
        (this.isInverse
          ? {
            name: '☑ 反転', action: () => {
              this.isInverse = false;
              EventSystem.trigger('UPDATE_INVENTORY', null);
            }
          } : {
            name: '☐ 反転', action: () => {
              this.isInverse = true;
              EventSystem.trigger('UPDATE_INVENTORY', null);
            }
          }),
        (this.isHollow
          ? {
            name: '☑ ぼかし', action: () => {
              this.isHollow = false;
              EventSystem.trigger('UPDATE_INVENTORY', null);
            }
          } : {
            name: '☐ ぼかし', action: () => {
              this.isHollow = true;
              EventSystem.trigger('UPDATE_INVENTORY', null);
            }
          }),
        (this.isBlackPaint
          ? {
            name: '☑ 黒塗り', action: () => {
              this.isBlackPaint = false;
              EventSystem.trigger('UPDATE_INVENTORY', null);
            }
          } : {
            name: '☐ 黒塗り', action: () => {
              this.isBlackPaint = true;
              EventSystem.trigger('UPDATE_INVENTORY', null);
            }
          }),
          { name: 'オーラ', action: null, subActions: [{ name: `${this.aura == -1 ? '◉' : '○'} なし`, action: () => { this.aura = -1; EventSystem.trigger('UPDATE_INVENTORY', null) } }, ContextMenuSeparator].concat(['ブラック', 'ブルー', 'グリーン', 'シアン', 'レッド', 'マゼンタ', 'イエロー', 'ホワイト'].map((color, i) => {  
            return { name: `${this.aura == i ? '◉' : '○'} ${color}`, action: () => { this.aura = i; EventSystem.trigger('UPDATE_INVENTORY', null) } };
          })) },
          ContextMenuSeparator,
          {
            name: 'リセット', action: () => {
              this.isInverse = false;
              this.isHollow = false;
              this.isBlackPaint = false;
              this.aura = -1;
              EventSystem.trigger('UPDATE_INVENTORY', null);
            },
            disabled: !this.isInverse && !this.isHollow && !this.isBlackPaint && this.aura == -1
          }
      ]},
      ContextMenuSeparator,
      (!this.isNotRide
        ? {
          name: '☑ 他のキャラクターに乗る', action: () => {
            this.isNotRide = true;
            EventSystem.trigger('UPDATE_INVENTORY', null);
          }
        } : {
          name: '☐ 他のキャラクターに乗る', action: () => {
            this.isNotRide = false;
            EventSystem.trigger('UPDATE_INVENTORY', null);
          }
        }),
      (this.isAltitudeIndicate
        ? {
          name: '☑ 高度の表示', action: () => {
            this.isAltitudeIndicate = false;
            EventSystem.trigger('UPDATE_INVENTORY', null);
          }
        } : {
          name: '☐ 高度の表示', action: () => {
            this.isAltitudeIndicate = true;
            EventSystem.trigger('UPDATE_INVENTORY', null);
          }
        }),
      {
        name: '高度を0にする', action: () => {
          if (this.altitude != 0) {
            this.altitude = 0;
            SoundEffect.play(PresetSound.sweep);
          }
        },
        altitudeHande: this.gameCharacter
      },
      ContextMenuSeparator,
      { name: '詳細を表示', action: () => { this.showDetail(this.gameCharacter); } },
      { name: 'チャットパレットを表示', action: () => { this.showChatPalette(this.gameCharacter) } },
      { name: 'スタンド設定', action: () => { this.showStandSetting(this.gameCharacter) } },
      ContextMenuSeparator,
      {
        name: '参照URLを開く', action: null,
        subActions: this.gameCharacter.getUrls().map((urlElement) => {
          const url = urlElement.value.toString();
          return {
            name: urlElement.name ? urlElement.name : url,
            action: () => {
              if (StringUtil.sameOrigin(url)) {
                window.open(url.trim(), '_blank', 'noopener');
              } else {
                this.modalService.open(OpenUrlComponent, { url: url, title: this.gameCharacter.name, subTitle: urlElement.name });
              } 
            },
            disabled: !StringUtil.validUrl(url),
            error: !StringUtil.validUrl(url) ? 'URLが不正です' : null,
            isOuterLink: StringUtil.validUrl(url) && !StringUtil.sameOrigin(url)
          };
        }),
        disabled: this.gameCharacter.getUrls().length <= 0
      },
      ContextMenuSeparator,
      (this.gameCharacter.isInventoryIndicate
        ? {
          name: '☑ テーブルインベントリに表示', action: () => {
            this.gameCharacter.isInventoryIndicate = false;
            EventSystem.trigger('UPDATE_INVENTORY', null);
          }
        } : {
          name: '☐ テーブルインベントリに表示', action: () => {
            this.gameCharacter.isInventoryIndicate = true;
            EventSystem.trigger('UPDATE_INVENTORY', null);
          }
        }),
      { name: 'テーブルから移動', action: null, subActions: [
        {
          name: '共有インベントリ', action: () => {
            EventSystem.call('FAREWELL_STAND_IMAGE', { characterIdentifier: this.gameCharacter.identifier });
            this.gameCharacter.setLocation('common');
            SoundEffect.play(PresetSound.piecePut);
          }
        },
        {
          name: '個人インベントリ', action: () => {
            EventSystem.call('FAREWELL_STAND_IMAGE', { characterIdentifier: this.gameCharacter.identifier });
            this.gameCharacter.setLocation(Network.peerId);
            SoundEffect.play(PresetSound.piecePut);
          }
        },
        {
          name: '墓場', action: () => {
            EventSystem.call('FAREWELL_STAND_IMAGE', { characterIdentifier: this.gameCharacter.identifier });
            this.gameCharacter.setLocation('graveyard');
            SoundEffect.play(PresetSound.sweep);
          }
        },
      ]},
      ContextMenuSeparator,
      {
        name: 'コピーを作る', action: () => {
          let cloneObject = this.gameCharacter.clone();
          cloneObject.location.x += this.gridSize;
          cloneObject.location.y += this.gridSize;
          cloneObject.update();
          SoundEffect.play(PresetSound.piecePut);
        }
      },
      {
        name: 'コピーを作る(自動採番)', action: () => {
          let cloneObject = this.gameCharacter.cloneNumber();
          cloneObject.location.x += this.gridSize;
          cloneObject.location.y += this.gridSize;
          cloneObject.update();
          SoundEffect.play(PresetSound.piecePut);
        }
      },
    ], this.name);
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

  private adjustMinBounds(value: number, min: number = 0): number {
    return value < min ? min : value;
  }

  private showDetail(gameObject: GameCharacter) {
    let coordinate = this.pointerDeviceService.pointers[0];
    let title = 'キャラクターシート';
    if (gameObject.name.length) title += ' - ' + gameObject.name;
    let option: PanelOption = { title: title, left: coordinate.x - 400, top: coordinate.y - 300, width: 800, height: 600 };
    let component = this.panelService.open<GameCharacterSheetComponent>(GameCharacterSheetComponent, option);
    component.tabletopObject = gameObject;
  }

  private showChatPalette(gameObject: GameCharacter) {
    let coordinate = this.pointerDeviceService.pointers[0];
    let option: PanelOption = { left: coordinate.x - 250, top: coordinate.y - 175, width: 620, height: 350 };
    let component = this.panelService.open<ChatPaletteComponent>(ChatPaletteComponent, option);
    component.character = gameObject;
  }

  private showStandSetting(gameObject: GameCharacter) {
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
