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
import { EventSystem } from '@udonarium/core/system';
import { GameCharacter } from '@udonarium/game-character';
import { PresetSound, SoundEffect } from '@udonarium/sound-effect';
import { ContextMenuSeparator, ContextMenuAction } from 'service/context-menu.service';
import { StringUtil } from '@udonarium/core/system/util/string-util';
import { EffectService } from 'service/effect.service';
import { WebGLRenderer, PerspectiveCamera, Scene, Clock,Vector3 } from 'three';
import { Subscription } from 'rxjs'
import { GameCharacterComponentTemplate } from 'src/app/abstract/game-character.template';
import { OpenUrlComponent } from 'component/open-url/open-url.component';

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
export class GameCharacterComponent extends GameCharacterComponentTemplate implements OnInit, OnDestroy, AfterViewInit {
  @Input() gameCharacter: GameCharacter = null;
  @Input() is3D: boolean = false;
  @ViewChild('characterImage') characterImage: ElementRef;
  @ViewChild('chatBubble') chatBubble: ElementRef;

  get isTranslate(): boolean { return this.pointerDeviceService.isTranslate};

  get canEffect():boolean {
    return this.effectService.canEffect;
  }

  stopRotate:boolean = false;
  gridSize: number = 50;
  math = Math;
  stringUtil = StringUtil;
  viewRotateX = 50;
  viewRotateZ = 10;
  heightWidthRatio = 1.5;

  canvas:HTMLCanvasElement;
  private effect$: Subscription;
  private renderer;
  private camera = new PerspectiveCamera( 30.0, 1, 1, 1000);
  private scene = new Scene();
  private clock = new Clock();
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
    this.camera.lookAt(new Vector3(0, 0, 0));

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
      this.renderer = new WebGLRenderer({canvas: this.canvas , alpha: true});
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


  ngOnInit() {
    super.ngOnInit();
    EventSystem.register(this)
    .on('CHARACTER_EFFECT', event => {
      let effectName = event.data[0];
      let character = event.data[1];
      if(this.effectService.canEffect && this.effectService.effectName.includes(effectName) && character.includes(this.identifier)) {
        this.setEffect(effectName);
      }
    });
    this.effect$ = this.effectService.canEffect$.subscribe((bool: boolean) => {
      this.toggleEffect(bool);
    });
  }

  ngAfterViewInit() {
    super.ngAfterViewInit();
    if (this.effectService.canEffect) this.createMyEffect()
  }

  ngOnDestroy() {
    super.ngOnDestroy();
    this.effect$.unsubscribe();
    document.body.removeChild(this.canvas);
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
    let actions: ContextMenuAction[] = [
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
      (this.stopRotate
        ? {
          name: '☑ 回転を禁止', action: () => {
            this.stopRotate = false;
            SoundEffect.play(PresetSound.unlock);
          }
        } : {
          name: '☐ 回転を禁止', action: () => {
            this.stopRotate = true;
            SoundEffect.play(PresetSound.lock);
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
      ( this.gameCharacter.owner != this.playerService.myPlayer.playerId
        ? {
          name: this.gameCharacter.hasOwner ? '自分のコマにする' : 'データを秘匿する' , action: () => {
            this.gameCharacter.owner = this.playerService.myPlayer.playerId;
            EventSystem.trigger('UPDATE_INVENTORY', null);
          }, disabled: !this.gameCharacter.isTransparent
        } : {
          name: 'データを公開する', action: () => {
            this.gameCharacter.owner = "";
            EventSystem.trigger('UPDATE_INVENTORY', null);
          }, disabled: !this.gameCharacter.isTransparent
        }),
      { name: '詳細を表示', action: () => { this.showDetail(this.gameCharacter); }, disabled: !this.gameCharacter.isTransparent },
      { name: 'チャットパレットを追加', action: () => { this.showChatPalette(this.gameCharacter) }, disabled: !this.gameCharacter.isTransparent },
      { name: 'メモを表示', action: () => { this.showInnerNote()} , disabled: !this.gameCharacter.isTransparent},
      { name: '立ち絵設定', action: () => { this.showStandSetting(this.gameCharacter) } , disabled: !this.gameCharacter.isTransparent},
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
        disabled: this.gameCharacter.getUrls().length <= 0 || !this.gameCharacter.isTransparent
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
            this.gameCharacter.setLocation(this.playerService.myPlayer.playerId);
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
    ];

    this.contextMenuService.open(position,actions, this.name);
  }

}
