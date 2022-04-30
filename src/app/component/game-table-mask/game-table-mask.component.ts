import {
  AfterViewInit,
  ChangeDetectionStrategy,
  ChangeDetectorRef,
  Component,
  ElementRef,
  HostListener,
  Input,
  NgZone,
  OnDestroy,
  OnInit,
} from '@angular/core';
import { ImageFile } from '@udonarium/core/file-storage/image-file';
import { ObjectNode } from '@udonarium/core/synchronize-object/object-node';
import { ObjectStore } from '@udonarium/core/synchronize-object/object-store';
import { EventSystem } from '@udonarium/core/system';
import { StringUtil } from '@udonarium/core/system/util/string-util';
import { GameTableMask } from '@udonarium/game-table-mask';
import { PresetSound, SoundEffect } from '@udonarium/sound-effect';
import { GameCharacterSheetComponent } from 'component/game-character-sheet/game-character-sheet.component';
import { OpenUrlComponent } from 'component/open-url/open-url.component';
import { PopupEditComponent } from 'component/popup-edit/popup-edit.component';
import { InputHandler } from 'directive/input-handler';
import { MovableOption } from 'directive/movable.directive';
import { ContextMenuSeparator, ContextMenuService } from 'service/context-menu.service';
import { ModalService } from 'service/modal.service';
import { CoordinateService } from 'service/coordinate.service';
import { PanelOption, PanelService } from 'service/panel.service';
import { PointerDeviceService } from 'service/pointer-device.service';
import { TabletopActionService } from 'service/tabletop-action.service';

@Component({
  selector: 'game-table-mask',
  templateUrl: './game-table-mask.component.html',
  styleUrls: ['./game-table-mask.component.css'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class GameTableMaskComponent implements OnInit, OnDestroy, AfterViewInit {
  @Input() gameTableMask: GameTableMask = null;
  @Input() is3D: boolean = false;
  @Input() isFlat: boolean = false;

  get name(): string { return this.gameTableMask.name; }
  get isLock(): boolean { return this.gameTableMask.isLock; }
  set isLock(isLock: boolean) { this.gameTableMask.isLock = isLock; }
  get blendType(): number { return this.gameTableMask.blendType; }
  set blendType(blendType: number) { this.gameTableMask.blendType = blendType; }
  get text(): string { return this.gameTableMask.text; }
  set text(text: string) { this.gameTableMask.text = text; }
  width: number = 1;
  height: number = 1;
  opacity: number = 1;
  imageFile: ImageFile = ImageFile.Empty;
  fontSize: number = 14;
  color: string = "";
  bgcolor: string = "";
  altitude: number = 0;

  get isAltitudeIndicate(): boolean { return this.gameTableMask.isAltitudeIndicate; }
  set isAltitudeIndicate(isAltitudeIndicate: boolean) { this.gameTableMask.isAltitudeIndicate = isAltitudeIndicate; }

  get gameTableMaskAltitude(): number {
    return +this.altitude.toFixed(1);
  }

  gridSize: number = 50;
  math = Math;
  viewRotateZ = 10;

  rubiedText: string = "";

  movableOption: MovableOption = {};

  private input: InputHandler = null;

  updateObject() {
    this.width = this.adjustMinBounds(this.gameTableMask.width);
    this.height = this.adjustMinBounds(this.gameTableMask.height);
    this.opacity = this.gameTableMask.opacity;
    this.imageFile = this.gameTableMask.imageFile;
    this.fontSize = this.gameTableMask.fontsize;
    this.rubiedText = StringUtil.escapeHtmlAndRuby(this.text);
    this.color = this.gameTableMask.color;
    this.bgcolor = this.gameTableMask.bgcolor;
    this.altitude = this.isFlat ? 0 : this.gameTableMask.altitude;
  }

  constructor(
    private ngZone: NgZone,
    private tabletopActionService: TabletopActionService,
    private contextMenuService: ContextMenuService,
    private elementRef: ElementRef<HTMLElement>,
    private panelService: PanelService,
    private changeDetector: ChangeDetectorRef,
    private pointerDeviceService: PointerDeviceService,
    private modalService: ModalService,
    private coordinateService: CoordinateService
  ) { }

  ngOnInit() {
    this.updateObject();
    EventSystem.register(this)
      .on('UPDATE_GAME_OBJECT', -1000, event => {
        let object = ObjectStore.instance.get(event.data.identifier);
        if (!this.gameTableMask || !object) return;
        if (this.gameTableMask === object || (object instanceof ObjectNode && this.gameTableMask.contains(object))) {
          this.updateObject();
          this.changeDetector.markForCheck();
        }
      })
      .on('IMAGE_SYNC', -1000, event => {
        this.changeDetector.markForCheck();
      })
      .on<object>('TABLE_VIEW_ROTATE', -1000, event => {
        this.ngZone.run(() => {
          this.viewRotateZ = event.data['z'];
          this.changeDetector.markForCheck();
        });
      });
    this.movableOption = {
      tabletopObject: this.gameTableMask,
      transformCssOffset: 'translateZ(0.15px)',
      colideLayers: ['terrain']
    };
  }

  ngAfterViewInit() {
    this.ngZone.runOutsideAngular(() => {
      this.input = new InputHandler(this.elementRef.nativeElement);
    });
    this.input.onStart = this.onInputStart.bind(this);
  }

  ngOnDestroy() {
    this.input.destroy();
    EventSystem.unregister(this);
  }

  @HostListener('dragstart', ['$event'])
  onDragstart(e) {
    e.stopPropagation();
    e.preventDefault();
  }

  onInputStart(e: any) {
    this.input.cancel();

    // TODO:もっと良い方法考える
    if (this.isLock) {
      EventSystem.trigger('DRAG_LOCKED_OBJECT', {});
    }
  }

  @HostListener('contextmenu', ['$event'])
  onContextMenu(e: Event) {
    e.stopPropagation();
    e.preventDefault();

    if (!this.pointerDeviceService.isAllowedToOpenContextMenu) return;
    let menuPosition = this.pointerDeviceService.pointers[0];
    let objectPosition = this.coordinateService.calcTabletopLocalCoordinate();
    let menuContent = this.isFlat ?
    [
      (this.isLock
        ? {
          name: '☑ 固定', action: () => {
            this.isLock = false;
            SoundEffect.play(PresetSound.unlock);
          }
        }
        : {
          name: '☐ 固定', action: () => {
            this.isLock = true;
            SoundEffect.play(PresetSound.lock);
          }
        }
      ),
      {
        name: '画像と色',
        subActions: [
          { name: `${this.blendType == 0 ? '◉' : '○'} 画像のみ`,  action: () => { this.blendType = 0; SoundEffect.play(PresetSound.cardDraw) } },
          { name: `${this.blendType == 1 ? '◉' : '○'} 背景色と重ねる`,  action: () => { this.blendType = 1; SoundEffect.play(PresetSound.cardDraw) } },
          { name: `${this.blendType == 2 ? '◉' : '○'} 背景色と混ぜる`,  action: () => { this.blendType = 2; SoundEffect.play(PresetSound.cardDraw) } },
          ContextMenuSeparator,
          { name: '色の初期化', action: () => { this.gameTableMask.color = '#555555'; this.gameTableMask.bgcolor = '#0a0a0a'; SoundEffect.play(PresetSound.cardDraw) } }
        ]
      },
      ContextMenuSeparator,
      { name: 'マップマスクを編集', action: () => { this.showDetail(this.gameTableMask); } },
      (this.gameTableMask.getUrls().length <= 0 ? null : {
        name: '参照URLを開く', action: null,
        subActions: this.gameTableMask.getUrls().map((urlElement) => {
          const url = urlElement.value.toString();
          return {
            name: urlElement.name ? urlElement.name : url,
            action: () => {
              if (StringUtil.sameOrigin(url)) {
                window.open(url.trim(), '_blank', 'noopener');
              } else {
                this.modalService.open(OpenUrlComponent, { url: url, title: this.gameTableMask.name, subTitle: urlElement.name });
              }
            },
            disabled: !StringUtil.validUrl(url),
            error: !StringUtil.validUrl(url) ? 'URLが不正です' : null,
            isOuterLink: StringUtil.validUrl(url) && !StringUtil.sameOrigin(url)
          };
        })
      }),
      (this.gameTableMask.getUrls().length <= 0 ? null : ContextMenuSeparator),
      {
        name: 'コピーを作る', action: () => {
          let cloneObject = this.gameTableMask.clone();
          console.log('コピー', cloneObject);
          cloneObject.location.x += this.gridSize;
          cloneObject.location.y += this.gridSize;
          cloneObject.isLock = false;
          if (this.gameTableMask.parent) this.gameTableMask.parent.appendChild(cloneObject);
          SoundEffect.play(PresetSound.cardPut);
        }
      },
      {
        name: '削除する', action: () => {
          this.gameTableMask.destroy();
          SoundEffect.play(PresetSound.sweep);
        }
      },
      ContextMenuSeparator,
      { name: 'メッセージを送信', action: () => {this.showPopup(objectPosition.x, objectPosition.y, objectPosition.z) }},
      { name: 'オブジェクト作成', action: null, subActions: this.tabletopActionService.makeDefaultContextMenuActions(objectPosition) }
    ]
    :
    [
      (this.isLock
        ? {
          name: '☑ 固定', action: () => {
            this.isLock = false;
            SoundEffect.play(PresetSound.unlock);
          }
        }
        : {
          name: '☐ 固定', action: () => {
            this.isLock = true;
            SoundEffect.play(PresetSound.lock);
          }
        }
      ),
      {
        name: '画像と色',
        subActions: [
          { name: `${this.blendType == 0 ? '◉' : '○'} 画像のみ`,  action: () => { this.blendType = 0; SoundEffect.play(PresetSound.cardDraw) } },
          { name: `${this.blendType == 1 ? '◉' : '○'} 背景色と重ねる`,  action: () => { this.blendType = 1; SoundEffect.play(PresetSound.cardDraw) } },
          { name: `${this.blendType == 2 ? '◉' : '○'} 背景色と混ぜる`,  action: () => { this.blendType = 2; SoundEffect.play(PresetSound.cardDraw) } },
          ContextMenuSeparator,
          { name: '色の初期化', action: () => { this.gameTableMask.color = '#555555'; this.gameTableMask.bgcolor = '#0a0a0a'; SoundEffect.play(PresetSound.cardDraw) } }
        ]
      },
      ContextMenuSeparator,
      (this.isAltitudeIndicate
        ? {
          name: '☑ 高度の表示', action: () => {
            this.isAltitudeIndicate = false;
          }
        } : {
          name: '☐ 高度の表示', action: () => {
            this.isAltitudeIndicate = true;
          }
        }),
      {
        name: '高度を0にする', action: () => {
          if (this.altitude != 0) {
            this.gameTableMask.altitude = 0;
            SoundEffect.play(PresetSound.sweep);
          }
        },
        altitudeHande: this.gameTableMask
      },
      ContextMenuSeparator,
      { name: 'マップマスクを編集', action: () => { this.showDetail(this.gameTableMask); } },
      (this.gameTableMask.getUrls().length <= 0 ? null : {
        name: '参照URLを開く', action: null,
        subActions: this.gameTableMask.getUrls().map((urlElement) => {
          const url = urlElement.value.toString();
          return {
            name: urlElement.name ? urlElement.name : url,
            action: () => {
              if (StringUtil.sameOrigin(url)) {
                window.open(url.trim(), '_blank', 'noopener');
              } else {
                this.modalService.open(OpenUrlComponent, { url: url, title: this.gameTableMask.name, subTitle: urlElement.name });
              }
            },
            disabled: !StringUtil.validUrl(url),
            error: !StringUtil.validUrl(url) ? 'URLが不正です' : null,
            isOuterLink: StringUtil.validUrl(url) && !StringUtil.sameOrigin(url)
          };
        })
      }),
      (this.gameTableMask.getUrls().length <= 0 ? null : ContextMenuSeparator),
      {
        name: 'コピーを作る', action: () => {
          let cloneObject = this.gameTableMask.clone();
          console.log('コピー', cloneObject);
          cloneObject.location.x += this.gridSize;
          cloneObject.location.y += this.gridSize;
          cloneObject.isLock = false;
          if (this.gameTableMask.parent) this.gameTableMask.parent.appendChild(cloneObject);
          SoundEffect.play(PresetSound.cardPut);
        }
      },
      {
        name: '削除する', action: () => {
          this.gameTableMask.destroy();
          SoundEffect.play(PresetSound.sweep);
        }
      },
      ContextMenuSeparator,
      { name: 'メッセージを送信', action: () => {this.showPopup(objectPosition.x, objectPosition.y, objectPosition.z) }},
      { name: 'オブジェクト作成', action: null, subActions: this.tabletopActionService.makeDefaultContextMenuActions(objectPosition) }
    ];


    this.contextMenuService.open(menuPosition, menuContent, this.name);
  }

  onMove() {
    SoundEffect.play(PresetSound.cardPick);
  }

  onMoved() {
    SoundEffect.play(PresetSound.cardPut);
  }

  private showPopup(x: number , y: number , z: number) {
    let modal = this.modalService.open(PopupEditComponent, { x: x ,y: y,z: z});

  }

  private adjustMinBounds(value: number, min: number = 0): number {
    return value < min ? min : value;
  }

  private showDetail(gameObject: GameTableMask) {
    let coordinate = this.pointerDeviceService.pointers[0];
    let title = 'マップマスク設定';
    if (gameObject.name.length) title += ' - ' + gameObject.name;
    let option: PanelOption = { title: title, left: coordinate.x - 200, top: coordinate.y - 150, width: 400, height: 560 };
    let component = this.panelService.open<GameCharacterSheetComponent>(GameCharacterSheetComponent, option);
    component.tabletopObject = gameObject;
  }
}
