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
import { imageStyle } from '@udonarium/tabletop-object';
import { PresetSound, SoundEffect } from '@udonarium/sound-effect';
import { ContextMenuSeparator, ContextMenuAction } from 'service/context-menu.service';
import { StringUtil } from '@udonarium/core/system/util/string-util';

import { GameCharacterComponentTemplate } from '../game-character.template';
import { OpenUrlComponent } from 'component/open-url/open-url.component';

@Component({
  selector: 'game-character',
  templateUrl: './game-character.component.html',
  styleUrls: ['../game-character.common.css','./game-character.component.css','./game-character.chat-bubble.css'],
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

  stopRotate:boolean = false;
  gridSize: number = 50;
  math = Math;
  stringUtil = StringUtil;
  viewRotateX = 50;
  viewRotateZ = 10;
  heightWidthRatio = 1.5;

  get nameTagRotate(): number {
    let x = (this.viewRotateX % 360) - 90;
    let z = (this.viewRotateZ + this.rotate) % 360;
    let roll = this.roll % 360;
    z = (z > 0 ? z : 360 + z);
    roll = (roll > 0 ? roll : 360 + roll);
    return (x > 0 ? x : 360 + x) * (90 < z && z < 270 ? 1 : -1) * (90 <= roll && roll <= 270 ? -1 : 1);
  }

  get shadowStyle():object {
    let styleObject: imageStyle = {};
    styleObject.filter = 'brightness(0) blur(1px)';
    styleObject.transition = 'transform 132ms 0s ease';
    if (this.aura != -1) {
      styleObject.filter += ' drop-shadow(0 -4px 4px ' + this.gameCharacter.auraColor[this.aura] + ')';
      styleObject.transition += ', filter 0.2s ease-in-out'
    }
    styleObject.transformOrigin = '50% ' + (this.size * this.gridSize) + 'px' ;
    styleObject.transform = 'scaleX(' + (this.isInverse ? '-1' : '1') + ') scale(1.0,' + (1.0 / this.heightWidthRatio) + ') translateY( -' + (99 / this.heightWidthRatio) + '%) rotateZ(' + this.roll + 'deg)';
    styleObject.opacity = this.isHollow ? '0.4' : '0.7';
    return styleObject;
  }


  ngOnInit() {
    super.ngOnInit();
    EventSystem.register(this)
    .on('CHARACTER_EFFECT', event => {
      let effectName = event.data[0];
      let character = event.data[1];
      if(this.characterImage?.nativeElement && this.effectService.effectName.includes(effectName) && character.includes(this.identifier)) {
        this.standImageService.show(this.gameCharacter,null,null,false,effectName)
        let rect = this.characterImage.nativeElement.getBoundingClientRect();
        this.effectService.play(rect ,effectName, true)
      }
    });
  }

  ngAfterViewInit() {
    super.ngAfterViewInit();
  }

  ngOnDestroy() {
    super.ngOnDestroy();
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
        })
      }),
      (this.gameCharacter.imageFiles.length <= 1 ? null : ContextMenuSeparator),
      { name: '表示設定', action: null, subActions:[
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
      ]},
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
      { name: '動作設定', action: null, subActions:[
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
      ] },
      {
        name: '高度を0にする', action: () => {
          if (this.altitude != 0) {
            this.gameCharacter.altitude = 0;
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
