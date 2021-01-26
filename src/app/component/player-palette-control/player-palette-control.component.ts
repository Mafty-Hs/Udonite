import { Component, ElementRef, Input, NgZone, OnDestroy, OnInit, ViewChild } from '@angular/core';
import { ObjectNode } from '@udonarium/core/synchronize-object/object-node';
import { ObjectStore } from '@udonarium/core/synchronize-object/object-store';
import { EventSystem, Network } from '@udonarium/core/system';
import { DataElement } from '@udonarium/data-element';
import { TabletopObject } from '@udonarium/tabletop-object';
import { GameObjectInventoryService } from 'service/game-object-inventory.service';
import { GameCharacter } from '@udonarium/game-character';
import { GameCharacterSheetComponent } from 'component/game-character-sheet/game-character-sheet.component';
import { StandSettingComponent } from 'component/stand-setting/stand-setting.component';
import { ContextMenuAction, ContextMenuService, ContextMenuSeparator } from 'service/context-menu.service';
import { PanelOption, PanelService } from 'service/panel.service';
import { PointerDeviceService } from 'service/pointer-device.service';

@Component({
  selector: 'player-palette-control',
  templateUrl: './player-palette-control.component.html',
  styleUrls: ['./player-palette-control.component.css']
})
export class PlayerPaletteControlComponent implements OnInit,OnDestroy  {
  @Input() disableControl : boolean;
  private _character: GameCharacter;
  private tabletopObject : TabletopObject;
  @Input() set character(character :GameCharacter){
    this._character = character;
    this.tabletopObject = character;
  }
  get character() : GameCharacter {return this._character;}
  get newLineString(): string { return this.inventoryService.newLineString; }
  get inventoryDataElms(): DataElement[] { return this.tabletopObject ? this.getInventoryTags(this.tabletopObject) : []; }
  get dataElms(): DataElement[] { return this.tabletopObject && this.tabletopObject.detailDataElement ? this.tabletopObject.detailDataElement.children as DataElement[] : []; }
  private getInventoryTags(gameObject: TabletopObject): DataElement[] {
    return this.inventoryService.tableInventory.dataElementMap.get(gameObject.identifier);
  }

  constructor(
    private ngZone: NgZone,
    private panelService: PanelService,
    private inventoryService: GameObjectInventoryService,
    private contextMenuService: ContextMenuService,
    private pointerDeviceService: PointerDeviceService,
  ) {}

  ngOnInit(): void {
  }

  ngOnDestroy() {
    EventSystem.unregister(this);
  }

  displayContextMenu(e: Event) {
    if (document.activeElement instanceof HTMLInputElement && document.activeElement.getAttribute('type') !== 'range') return;
    e.stopPropagation();
    e.preventDefault();

    if (!this.pointerDeviceService.isAllowedToOpenContextMenu) return;
    let position = this.pointerDeviceService.pointers[0];    
    let actions: ContextMenuAction[] = [];  
    let gameObject = this.character;
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
    actions.push({ name: '詳細を表示', action: () => { this.showDetail(gameObject); } });
    actions.push({ name: 'スタンド設定', action: () => { this.showStandSetting(gameObject) } });
    let locations = [
      { name: 'table', alias: 'テーブル' },
      { name: 'common', alias: '共有インベントリへ移動' },
      { name: Network.peerId, alias: '個人インベントリへ移動' },
      { name: 'graveyard', alias: '墓場へ移動' }
    ];
    for (let location of locations) {
      if (gameObject.location.name === location.name) continue;
      actions.push({
        name: location.alias, action: () => {
          gameObject.setLocation(location.name);
        }
      });
    }
    this.contextMenuService.open(position, actions, gameObject.name);
  }

  private showStandSetting(gameObject: GameCharacter) {
    let coordinate = this.pointerDeviceService.pointers[0];
    let option: PanelOption = { left: coordinate.x - 400, top: coordinate.y - 175, width: 730, height: 572 };
    let component = this.panelService.open<StandSettingComponent>(StandSettingComponent, option);
    component.character = gameObject;
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

}
