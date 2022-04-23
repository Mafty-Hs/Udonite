import { AfterViewInit, ChangeDetectionStrategy, ChangeDetectorRef, Component, OnDestroy, OnInit } from '@angular/core';

import { GameObject } from '@udonarium/core/synchronize-object/game-object';
import { ObjectStore } from '@udonarium/core/synchronize-object/object-store';
import { EventSystem} from '@udonarium/core/system';
import { DataElement } from '@udonarium/data-element';
import { SortOrder } from '@udonarium/data-summary-setting';
import { GameCharacter } from '@udonarium/game-character';
import { PresetSound, SoundEffect } from '@udonarium/sound-effect';
import { TabletopObject } from '@udonarium/tabletop-object';
import { StringUtil } from '@udonarium/core/system/util/string-util';
import { OpenUrlComponent } from 'component/open-url/open-url.component';
import { GameCharacterSheetComponent } from 'component/game-character-sheet/game-character-sheet.component';
import { PlayerPaletteComponent } from 'component/player-palette/player-palette.component';
import { StandSettingComponent } from 'component/stand-setting/stand-setting.component';
import { ContextMenuAction, ContextMenuService, ContextMenuSeparator } from 'service/context-menu.service';
import { GameObjectInventoryService } from 'service/game-object-inventory.service';
import { PanelOption, PanelService } from 'service/panel.service';
import { PointerDeviceService } from 'service/pointer-device.service';
import { ModalService } from 'service/modal.service';
import { PlayerService } from 'service/player.service';

@Component({
  selector: 'game-object-inventory',
  templateUrl: './game-object-inventory.component.html',
  styleUrls: ['./game-object-inventory.component.css'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class GameObjectInventoryComponent implements OnInit, AfterViewInit, OnDestroy {
  inventoryTypes: string[] = ['table', 'common', 'graveyard'];

  selectTab: string = 'table';
  selectedIdentifier: string = '';
  multiMoveTargets: Set<string> = new Set();

  isEdit: boolean = false;
  isMultiMove: boolean = false;
  stringUtil = StringUtil;

  get sortTag(): string { return this.inventoryService.sortTag; }
  set sortTag(sortTag: string) { this.inventoryService.sortTag = sortTag; }
  get sortOrder(): SortOrder { return this.inventoryService.sortOrder; }
  set sortOrder(sortOrder: SortOrder) { this.inventoryService.sortOrder = sortOrder; }
  get dataTag(): string { return this.inventoryService.dataTag; }
  set dataTag(dataTag: string) { this.inventoryService.dataTag = dataTag; }
  get dataTags(): string[] { return this.inventoryService.dataTags; }

  get indicateAll(): boolean { return this.inventoryService.indicateAll; }
  set indicateAll(indicateAll: boolean) { this.inventoryService.indicateAll = indicateAll; }

  get sortOrderName(): string { return this.sortOrder === SortOrder.ASC ? '昇順' : '降順'; }

  get newLineString(): string { return this.inventoryService.newLineString; }

  get bar1(): string {
    return this.inventoryService.statusBar_1
  }
  set bar1(status :string) {
    this.inventoryService.statusBar_1 = status.trim();
  }
  get bar2(): string {
    return this.inventoryService.statusBar_2
  }
  set bar2(status :string) {
    this.inventoryService.statusBar_2 = status.trim();
  }
  get bar3(): string {
    return this.inventoryService.statusBar_3
  }
  set bar3(status :string) {
    this.inventoryService.statusBar_3 = status.trim();
  }
  get color1(): string {
    return this.inventoryService.statusColor_1;
  }
  set color1(color :string) {
    this.inventoryService.statusColor_1 = color;
  }
  get color2(): string {
    return this.inventoryService.statusColor_2;
  }
  set color2(color :string) {
    this.inventoryService.statusColor_2 = color;
  }
  get color3(): string {
    return this.inventoryService.statusColor_3;
  }
  set color3(color :string) {
    this.inventoryService.statusColor_3 = color;
  }


  constructor(
    private changeDetector: ChangeDetectorRef,
    private panelService: PanelService,
    private playerService: PlayerService,
    private modalService: ModalService,
    private inventoryService: GameObjectInventoryService,
    private contextMenuService: ContextMenuService,
    private pointerDeviceService: PointerDeviceService
  ) { }

  ngOnInit() {
    Promise.resolve().then(() => this.panelService.title = 'インベントリ');
    EventSystem.register(this)
      .on('SELECT_TABLETOP_OBJECT', -1000, event => {
        if (ObjectStore.instance.get(event.data.identifier) instanceof TabletopObject) {
          this.selectedIdentifier = event.data.identifier;
          this.changeDetector.markForCheck();
        }
      })
      .on('UPDATE_INVENTORY', event => {
        if (event.isSendFromSelf) this.changeDetector.markForCheck();
      });
    this.inventoryTypes = ['table', 'common', this.playerService.myPlayer.playerId, 'graveyard'];
  }

  ngAfterViewInit() {
  }

  ngOnDestroy() {
    EventSystem.unregister(this);
  }

  getTabTitle(inventoryType: string) {
    switch (inventoryType) {
      case 'table':
        return 'テーブル';
      case this.playerService.myPlayer.playerId:
        return '個人';
      case 'graveyard':
        return '墓場';
      default:
        return '共有';
    }
  }

  getInventory(inventoryType: string) {
    switch (inventoryType) {
      case 'table':
        return this.inventoryService.tableInventory;
      case this.playerService.myPlayer.playerId:
        return this.inventoryService.privateInventory;
      case 'graveyard':
        return this.inventoryService.graveyardInventory;
      default:
        return this.inventoryService.commonInventory;
    }
  }

  getGameObjects(inventoryType: string): TabletopObject[] {
    return this.getInventory(inventoryType).tabletopObjects.filter((tabletopObject) => { return inventoryType != 'table' || this.indicateAll || tabletopObject.isInventoryIndicate });
  }

  getInventoryTags(gameObject: GameCharacter): DataElement[] {
    return this.getInventory(gameObject.location.name).dataElementMap.get(gameObject.identifier);
  }

  onContextMenu(e: Event, gameObject: GameCharacter) {
    if (document.activeElement instanceof HTMLInputElement && document.activeElement.getAttribute('type') !== 'range') return;
    e.stopPropagation();
    e.preventDefault();

    if (!this.pointerDeviceService.isAllowedToOpenContextMenu) return;

    this.selectGameObject(gameObject);

    let position = this.pointerDeviceService.pointers[0];

    let actions: ContextMenuAction[] = [];
    if (gameObject.imageFiles.length > 1) {
      actions.push({
        name: '画像切り替え',
        action: null,
        subActions: gameObject.imageFiles.map((image, i) => {
          return {
            name: `${gameObject.currntImageIndex == i ? '◉' : '○'}`,
            action: () => {
              gameObject.currntImageIndex = i;
              SoundEffect.play(PresetSound.surprise);
              EventSystem.trigger('UPDATE_INVENTORY', null);
            },
            default: gameObject.currntImageIndex == i,
            icon: image
          };
        }),
      });
      actions.push(ContextMenuSeparator);
    }
    actions.push((gameObject.isUseIconToOverviewImage
      ? {
        name: '☑ オーバービューに顔ICを使用', action: () => {
          gameObject.isUseIconToOverviewImage = false;
          EventSystem.trigger('UPDATE_INVENTORY', null);
        }
      } : {
        name: '☐ オーバービューに顔ICを使用', action: () => {
          gameObject.isUseIconToOverviewImage = true;
          EventSystem.trigger('UPDATE_INVENTORY', null);
        }
      }));
    actions.push((gameObject.isShowChatBubble
      ? {
        name: '☑ 💭の表示', action: () => {
          gameObject.isShowChatBubble = false;
          EventSystem.trigger('UPDATE_INVENTORY', null);
        }
      } : {
        name: '☐ 💭の表示', action: () => {
          gameObject.isShowChatBubble = true;
          EventSystem.trigger('UPDATE_INVENTORY', null);
        }
      }));
    actions.push(
      (gameObject.isDropShadow
      ? {
        name: '☑ 影の表示', action: () => {
          gameObject.isDropShadow = false;
          EventSystem.trigger('UPDATE_INVENTORY', null);
        }
      } : {
        name: '☐ 影の表示', action: () => {
          gameObject.isDropShadow = true;
          EventSystem.trigger('UPDATE_INVENTORY', null);
        }
      })
    );
    actions.push({ name: '画像効果', action: null,
    subActions: [
      (gameObject.isInverse
        ? {
          name: '☑ 反転', action: () => {
            gameObject.isInverse = false;
            EventSystem.trigger('UPDATE_INVENTORY', null);
          }
        } : {
          name: '☐ 反転', action: () => {
            gameObject.isInverse = true;
            EventSystem.trigger('UPDATE_INVENTORY', null);
          }
        }),
      (gameObject.isHollow
        ? {
          name: '☑ ぼかし', action: () => {
            gameObject.isHollow = false;
            EventSystem.trigger('UPDATE_INVENTORY', null);
          }
        } : {
          name: '☐ ぼかし', action: () => {
            gameObject.isHollow = true;
            EventSystem.trigger('UPDATE_INVENTORY', null);
          }
        }),
      (gameObject.isBlackPaint
        ? {
          name: '☑ 黒塗り', action: () => {
            gameObject.isBlackPaint = false;
            EventSystem.trigger('UPDATE_INVENTORY', null);
          }
        } : {
          name: '☐ 黒塗り', action: () => {
            gameObject.isBlackPaint = true;
            EventSystem.trigger('UPDATE_INVENTORY', null);
          }
        }),
        { name: 'オーラ', action: null, subActions: [ { name: `${gameObject.aura == -1 ? '◉' : '○'} なし`, action: () => { gameObject.aura = -1; EventSystem.trigger('UPDATE_INVENTORY', null) } }, ContextMenuSeparator].concat(['ブラック', 'ブルー', 'グリーン', 'シアン', 'レッド', 'マゼンタ', 'イエロー', 'ホワイト'].map((color, i) => {
          return { name: `${gameObject.aura == i ? '◉' : '○'} ${color}`, action: () => { gameObject.aura = i; EventSystem.trigger('UPDATE_INVENTORY', null) } };
        })) },
        ContextMenuSeparator,
        {
          name: 'リセット', action: () => {
            gameObject.isInverse = false;
            gameObject.isHollow = false;
            gameObject.isBlackPaint = false;
            gameObject.aura = -1;
            EventSystem.trigger('UPDATE_INVENTORY', null);
          },
          disabled: !gameObject.isInverse && !gameObject.isHollow && !gameObject.isBlackPaint && gameObject.aura == -1
        }
    ]});
    actions.push(ContextMenuSeparator);
    actions.push((!gameObject.isNotRide
      ? {
        name: '☑ 他のキャラクターに乗る', action: () => {
          gameObject.isNotRide = true;
          EventSystem.trigger('UPDATE_INVENTORY', null);
        }
      } : {
        name: '☐ 他のキャラクターに乗る', action: () => {
          gameObject.isNotRide = false;
          EventSystem.trigger('UPDATE_INVENTORY', null);
        }
      }));
    actions.push(
      (gameObject.isAltitudeIndicate
      ? {
        name: '☑ 高度の表示', action: () => {
          gameObject.isAltitudeIndicate = false;
          EventSystem.trigger('UPDATE_INVENTORY', null);
        }
      } : {
        name: '☐ 高度の表示', action: () => {
          gameObject.isAltitudeIndicate = true;
          EventSystem.trigger('UPDATE_INVENTORY', null);
        }
      })
    );
    actions.push(
    {
      name: '高度を0にする', action: () => {
        if (gameObject.altitude != 0) {
          gameObject.altitude = 0;
          if (gameObject.location.name === 'table') SoundEffect.play(PresetSound.sweep);
        }
      },
      altitudeHande: gameObject
    });
    actions.push(ContextMenuSeparator);
    actions.push({ name: '詳細を表示', action: () => { this.showDetail(gameObject); } });
    if (gameObject.location.name !== 'graveyard') {
      actions.push({ name: 'チャットパレットを表示', action: () => { this.showChatPalette(gameObject) }, disabled: gameObject.location.name === 'graveyard' });
    }
    actions.push({ name: 'スタンド設定', action: () => { this.showStandSetting(gameObject) } });
    actions.push(ContextMenuSeparator);
    actions.push({
      name: '参照URLを開く', action: null,
      subActions: gameObject.getUrls().map((urlElement) => {
        const url = urlElement.value.toString();
        return {
          name: urlElement.name ? urlElement.name : url,
          action: () => {
            if (StringUtil.sameOrigin(url)) {
              window.open(url.trim(), '_blank', 'noopener');
            } else {
              this.modalService.open(OpenUrlComponent, { url: url, title: gameObject.name, subTitle: urlElement.name });
            }
          },
          disabled: !StringUtil.validUrl(url),
          error: !StringUtil.validUrl(url) ? 'URLが不正です' : null,
          isOuterLink: StringUtil.validUrl(url) && !StringUtil.sameOrigin(url)
        };
      }),
      disabled: gameObject.getUrls().length <= 0
    });
    actions.push(ContextMenuSeparator);
    actions.push(gameObject.isInventoryIndicate
      ? {
        name: '☑ テーブルインベントリに表示', action: () => {
          gameObject.isInventoryIndicate = false;
          EventSystem.trigger('UPDATE_INVENTORY', null);
        }
      } : {
        name: '☐ テーブルインベントリに表示', action: () => {
          gameObject.isInventoryIndicate = true;
          EventSystem.trigger('UPDATE_INVENTORY', null);
        }
      });
    let locations = [
      { name: 'table', alias: 'テーブル' },
      { name: 'common', alias: '共有インベントリ' },
      { name: this.playerService.myPlayer.playerId, alias: '個人インベントリ' },
      { name: 'graveyard', alias: '墓場' }
    ];
    actions.push({
      name: `${ (locations.find((location) => { return location.name == gameObject.location.name }) || locations[1]).alias }から移動`,
      action: null,
      subActions: locations
        .filter((location, i) => { return !(gameObject.location.name == location.name || (i == 1 && !locations.map(loc => loc.name).includes(gameObject.location.name))) })
        .map((location) => {
          return {
            name: `${location.alias}`,
            action: () => {
              EventSystem.call('FAREWELL_STAND_IMAGE', { characterIdentifier: gameObject.identifier });
              gameObject.setLocation(location.name);
              if (location.name == 'graveyard') {
                SoundEffect.play(PresetSound.sweep);
              } else {
                SoundEffect.play(PresetSound.piecePut);
              }
            }
          }
        })
    });
    /*
    for (let location of locations) {
      if (gameObject.location.name === location.name) continue;
      actions.push({
        name: location.alias, action: () => {
          gameObject.setLocation(location.name);
          SoundEffect.play(PresetSound.piecePut);
        }
      });
    }
    */
    actions.push(ContextMenuSeparator);
    actions.push({
      name: 'コピーを作る', action: () => {
        this.cloneGameObject(gameObject);
        SoundEffect.play(PresetSound.piecePut);
      }
    });
    actions.push({
      name: 'コピーを作る(自動採番)', action: () => {
        this.cloneNumberGameObject(gameObject);
        SoundEffect.play(PresetSound.piecePut);
      }
    });
    if (gameObject.location.name === 'graveyard') {
      actions.push({
        name: '削除する', action: () => {
          this.deleteGameObject(gameObject);
          SoundEffect.play(PresetSound.sweep);
        }
      });
    }
    this.contextMenuService.open(position, actions, gameObject.name);
  }

  toggleEdit() {
    this.isEdit = !this.isEdit;
    EventSystem.call('UPDATE_BAR',null)
  }

  toggleMultiMove() {
    if (this.isMultiMove) {
      this.multiMoveTargets.clear();
    }
    this.isMultiMove = !this.isMultiMove;
  }

  cleanInventory() {
    let tabTitle = this.getTabTitle(this.selectTab);
    let gameObjects = this.getGameObjects(this.selectTab);
    if (!confirm(`${tabTitle}に存在する${gameObjects.length}個の要素を完全に削除しますか？`)) return;
    for (const gameObject of gameObjects) {
      this.deleteGameObject(gameObject);
    }
    SoundEffect.play(PresetSound.sweep);
  }

  existsMultiMoveSelectedInTab(): boolean {
    return this.getGameObjects(this.selectTab).some(x => this.multiMoveTargets.has(x.identifier))
  }

  toggleMultiMoveTarget(e: Event, gameObject: GameCharacter) {
    if (!(e.target instanceof HTMLInputElement)) { return; }
    if (e.target.checked) {
      this.multiMoveTargets.add(gameObject.identifier);
    } else {
      this.multiMoveTargets.delete(gameObject.identifier);
    }
  }

  allTabBoxCheck() {
    if (this.existsMultiMoveSelectedInTab()) {
      this.getGameObjects(this.selectTab).forEach(x => this.multiMoveTargets.delete(x.identifier));
    } else {
      this.getGameObjects(this.selectTab).forEach(x => this.multiMoveTargets.add(x.identifier));
    }
  }

  onMultiMoveContextMenu() {
    if (!this.pointerDeviceService.isAllowedToOpenContextMenu) return;

    let position = this.pointerDeviceService.pointers[0];
    let actions: ContextMenuAction[] = [];
    let locations = [
      { name: 'table', alias: 'テーブルに移動' },
      { name: 'common', alias: '共有イベントリに移動' },
      { name: this.playerService.myPlayer.playerId, alias: '個人イベントリに移動' },
      { name: 'graveyard', alias: '墓場に移動' }
    ];
    for (let location of locations) {
      if (this.selectTab === location.name) continue;
      actions.push({
        name: location.alias, action: () => {
          this.multiMove(location.name);
          this.toggleMultiMove();
          SoundEffect.play(PresetSound.piecePut);
        }
      });
    }
    if (this.selectTab == 'graveyard') {
      actions.push({
        name: '墓場から削除', action: () => {
          this.multiDelete();
          this.toggleMultiMove();
          SoundEffect.play(PresetSound.sweep);
        }
      })
    }

    this.contextMenuService.open(position, actions, "一括移動");
  }

  multiMove(location: string) {
    for (const gameObjectIdentifier of this.multiMoveTargets) {
      let gameObject = ObjectStore.instance.get(gameObjectIdentifier);
      if (gameObject instanceof GameCharacter) {
        gameObject.setLocation(location);
      }
    }
  }

  multiDelete() {
    let inGraveyard: Set<GameCharacter> = new Set();
    for (const gameObjectIdentifier of this.multiMoveTargets) {
      let gameObject: GameCharacter = ObjectStore.instance.get(gameObjectIdentifier);
      if (gameObject instanceof GameCharacter && gameObject.location.name == 'graveyard') {
        inGraveyard.add(gameObject);
      }
    }
    if (inGraveyard.size < 1) return;

    if (!confirm(`選択したもののうち墓場に存在する${inGraveyard.size}個の要素を完全に削除しますか？`)) return;
    for (const gameObject of inGraveyard) {
      this.deleteGameObject(gameObject);
    }
  }

  private cloneGameObject(gameObject: TabletopObject) {
    gameObject.clone();
  }

  private cloneNumberGameObject(gameObject: TabletopObject) {
    let cloneObject = gameObject.clone();
    cloneObject.name = this.appendCloneNumber(cloneObject.name);
  }

  private appendCloneNumber(objectname: string): string {
    let reg = new RegExp('(.*)_([0-9]*)');
    let res = objectname.match(reg);

    if(res != null && res.length == 3) {
      let cloneNumber:number = parseInt(res[2]) + 1;
      return res[1] + "_" + cloneNumber;
    } else {
      return objectname + "_2";
    }
  }

  private showDetail(gameObject: GameCharacter) {
    EventSystem.trigger('SELECT_TABLETOP_OBJECT', { identifier: gameObject.identifier, className: gameObject.aliasName });
    let coordinate = this.pointerDeviceService.pointers[0];
    let title = 'キャラクターシート';
    if (gameObject.name.length) title += ' - ' + gameObject.name;
    let option: PanelOption = { title: title, left: coordinate.x - 800, top: coordinate.y - 300, width: 800, height: 600 };
    let component = this.panelService.open<GameCharacterSheetComponent>(GameCharacterSheetComponent, option);
    component.tabletopObject = gameObject;
  }

  private showStandSetting(gameObject: GameCharacter) {
    let coordinate = this.pointerDeviceService.pointers[0];
    let option: PanelOption = { left: coordinate.x - 400, top: coordinate.y - 175, width: 730, height: 572 };
    let component = this.panelService.open<StandSettingComponent>(StandSettingComponent, option);
    component.character = gameObject;
  }

  private showChatPalette(gameObject: GameCharacter) {
    let palette = this.playerService.myPalette;
    this.playerService.addList(gameObject.identifier);
    if (!palette) {
      let option: PanelOption = { left: 200, top: 100 , width: 620, height: 350 };
      palette = this.panelService.open<PlayerPaletteComponent>(PlayerPaletteComponent, option);
    }

  }

  selectGameObject(gameObject: GameObject) {
    if (this.isMultiMove) {
      if (this.multiMoveTargets.has(gameObject.identifier)) {
        this.multiMoveTargets.delete(gameObject.identifier);
      } else {
        this.multiMoveTargets.add(gameObject.identifier);
      }
    }
    let aliasName: string = gameObject.aliasName;
    EventSystem.trigger('SELECT_TABLETOP_OBJECT', { identifier: gameObject.identifier, className: gameObject.aliasName });
  }

  private deleteGameObject(gameObject: GameObject) {
    gameObject.destroy();
    this.changeDetector.markForCheck();
  }

  trackByGameObject(index: number, gameObject: GameObject) {
    return gameObject ? gameObject.identifier : index;
  }
}
