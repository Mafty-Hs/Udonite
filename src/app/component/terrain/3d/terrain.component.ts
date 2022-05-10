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
import { StringUtil } from '@udonarium/core/system/util/string-util';
import { PresetSound, SoundEffect } from '@udonarium/sound-effect';
import { SlopeDirection, Terrain, TerrainViewState } from '@udonarium/terrain';
import { OpenUrlComponent } from 'component/open-url/open-url.component';
import { ContextMenuSeparator, ContextMenuService } from 'service/context-menu.service';
import { TerrainComponentTemplate } from 'component/terrain/terrain.template';

@Component({
  selector: 'terrain',
  templateUrl: './terrain.component.html',
  styleUrls: ['../terrain.component.css'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class TerrainComponent extends TerrainComponentTemplate implements OnInit, OnDestroy, AfterViewInit {
  @Input() terrain: Terrain = null;
  @Input() is3D: boolean = false;

  ngOnInit():void {
    super.ngOnInit()
  }

  ngAfterViewInit():void {
    super.ngAfterViewInit();
  }

  ngOnDestroy():void {
    super.ngOnDestroy();
  }

  @HostListener('contextmenu', ['$event'])
  onContextMenu(e: Event) {
    e.stopPropagation();
    e.preventDefault();

    if (!this.pointerDeviceService.isAllowedToOpenContextMenu) return;

    let menuPosition = this.pointerDeviceService.pointers[0];
    let objectPosition = this.coordinateService.calcTabletopLocalCoordinate();
    this.contextMenuService.open(menuPosition, [
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
      ContextMenuSeparator,
      (this.isLocked
        ? {
          name: '☑ 固定', action: () => {
            this.isLocked = false;
            SoundEffect.play(PresetSound.unlock);
          }
        } : {
          name: '☐ 固定', action: () => {
            this.isLocked = true;
            SoundEffect.play(PresetSound.lock);
          }
        }),
      ContextMenuSeparator,
      { name: '傾斜', action: null, subActions: [
        {
          name: `${ this.slopeDirection == SlopeDirection.NONE ? '◉' : '○' } なし`, action: () => {
            this.slopeDirection = SlopeDirection.NONE;
          }
        },
        ContextMenuSeparator,
        {
          name: `${ this.slopeDirection == SlopeDirection.TOP ? '◉' : '○' } 上（北）`, action: () => {
            this.slopeDirection = SlopeDirection.TOP;
          }
        },
        {
          name: `${ this.slopeDirection == SlopeDirection.BOTTOM ? '◉' : '○' } 下（南）`, action: () => {
            this.slopeDirection = SlopeDirection.BOTTOM;
          }
        },
        {
          name: `${ this.slopeDirection == SlopeDirection.LEFT ? '◉' : '○' } 左（西）`, action: () => {
            this.slopeDirection = SlopeDirection.LEFT;
          }
        },
        {
          name: `${ this.slopeDirection == SlopeDirection.RIGHT ? '◉' : '○' } 右（東）`, action: () => {
            this.slopeDirection = SlopeDirection.RIGHT;
          }
        }
      ]},
      { name: '壁の表示', action: null, subActions: [
        {
          name: `${ this.hasWall && this.isSurfaceShading ? '◉' : '○' } 通常`, action: () => {
            this.mode = TerrainViewState.ALL;
            this.isSurfaceShading = true;
          }
        },
        {
          name: `${ this.hasWall && !this.isSurfaceShading ? '◉' : '○' } 陰影なし`, action: () => {
            this.mode = TerrainViewState.ALL;
            this.isSurfaceShading = false;
          }
        },
        {
          name: `${ !this.hasWall ? '◉' : '○' } 非表示`, action: () => {
            this.mode = TerrainViewState.FLOOR;
            if (this.depth * this.width === 0) {
              this.terrain.width = this.width <= 0 ? 1 : this.width;
              this.terrain.depth = this.depth <= 0 ? 1 : this.depth;
            }
          }
        },
      ]},
      ContextMenuSeparator,
      (this.isDropShadow
        ? {
          name: '☑ 影を落とす', action: () => {
            this.isDropShadow = false;
          }
        } : {
          name: '☐ 影を落とす', action: () => {
            this.isDropShadow = true;
          }
        }),
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
          if (this.terrain.altitude != 0) {
            this.terrain.altitude = 0;
            SoundEffect.play(PresetSound.sweep);
          }
        },
        altitudeHande: this.terrain
      },
      ContextMenuSeparator,
      { name: '地形設定を編集', action: () => { this.showDetail(this.terrain); } },
      (this.terrain.getUrls().length <= 0 ? null : {
        name: '参照URLを開く', action: null,
        subActions: this.terrain.getUrls().map((urlElement) => {
          const url = urlElement.value.toString();
          return {
            name: urlElement.name ? urlElement.name : url,
            action: () => {
              if (StringUtil.sameOrigin(url)) {
                window.open(url.trim(), '_blank', 'noopener');
              } else {
                this.modalService.open(OpenUrlComponent, { url: url, title: this.terrain.name, subTitle: urlElement.name });
              }
            },
            disabled: !StringUtil.validUrl(url),
            error: !StringUtil.validUrl(url) ? 'URLが不正です' : null,
            isOuterLink: StringUtil.validUrl(url) && !StringUtil.sameOrigin(url)
          };
        })
      }),
      (this.terrain.getUrls().length <= 0 ? null : ContextMenuSeparator),
      {
        name: 'コピーを作る', action: () => {
          let cloneObject = this.terrain.clone();
          cloneObject.location.x += this.gridSize;
          cloneObject.location.y += this.gridSize;
          cloneObject.isLocked = false;
          if (this.terrain.parent) this.terrain.parent.appendChild(cloneObject);
          SoundEffect.play(PresetSound.blockPut);
        }
      },
      {
        name: '削除する', action: () => {
          this.terrain.destroy();
          SoundEffect.play(PresetSound.sweep);
        }
      },
      ContextMenuSeparator,
      { name: 'メッセージを送信', action: () => {this.showPopup(objectPosition.x, objectPosition.y, objectPosition.z) }},
      { name: 'オブジェクト作成', action: null, subActions: this.tabletopActionService.makeDefaultContextMenuActions(objectPosition) }
    ], this.name);
  }

}
