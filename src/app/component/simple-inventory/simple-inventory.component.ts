import { Component, OnInit, ChangeDetectionStrategy, ChangeDetectorRef, } from '@angular/core';
import { DataElement } from '@udonarium/data-element';
import { GameCharacter } from '@udonarium/game-character';
import { ContextMenuService, ContextMenuAction, ContextMenuSeparator } from 'service/context-menu.service';
import { RoundService } from 'service/round.service';
import { GameCharacterService } from 'service/game-character.service';
import { GameObjectInventoryService, ObjectInventory } from 'service/game-object-inventory.service';
import { EventSystem } from '@udonarium/core/system';
import { ObjectStore } from '@udonarium/core/synchronize-object/object-store';
import { PlayerService } from 'service/player.service';
import { PointerDeviceService } from 'service/pointer-device.service';

@Component({
  selector: 'simple-inventory',
  templateUrl: './simple-inventory.component.html',
  styleUrls: ['./simple-inventory.component.css'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class SimpleInventoryComponent implements OnInit {
  private _inventoryMode:number = 0; // 0:全て(イニシアティブ連動)　1:パレットバインダー 2:カスタム
  private _statusMode:number = 1; // 0:イニシアティブ(最初の３つまで)　1:ステータスバー 2:カスタム

  get inventoryMode():number {
    return this._inventoryMode;
  }
  set inventoryMode(inventoryMode :number) {
    this._inventoryMode = inventoryMode;
    this.changeDetector.detectChanges();
  }
  get statusMode():number {
    return this._statusMode;
  }
  set statusMode(statusMode :number) {
    this._statusMode = statusMode;
    this.changeDetector.detectChanges();
  }


  get inventoryTags():string[] {
    return this.inventoryService.dataTags.length > 2 ? this.inventoryService.dataTags : this.inventoryService.dataTags.concat(['','','']);
  }

  get customTags():string[] {
    return ['','',''];
  }

  get dataElmTag1():string {
    switch(this.statusMode) {
      case 0:
        return this.inventoryTags[0];
      case 1:
        return this.inventoryService.statusBar_1;
      case 2:
        return this.customTags[0];
    }
  }
  get dataElmTag2():string {
    switch(this.statusMode) {
      case 0:
        return this.inventoryTags[1];
      case 1:
        return this.inventoryService.statusBar_2;
      case 2:
        return this.customTags[1];
    }
  }
  get dataElmTag3():string {
    switch(this.statusMode) {
      case 0:
        return this.inventoryTags[2];
      case 1:
        return this.inventoryService.statusBar_3;
      case 2:
        return this.customTags[2];
    }
  }

  dataElms(characterIdentifier:string):DataElement[] {
    let dataElms:DataElement[] = [];
    dataElms.push(this.gameCharacterService.findDataElm(characterIdentifier ,this.dataElmTag1));
    dataElms.push(this.gameCharacterService.findDataElm(characterIdentifier ,this.dataElmTag2));
    dataElms.push(this.gameCharacterService.findDataElm(characterIdentifier ,this.dataElmTag3));
    return dataElms;
  }


  get characters():GameCharacter[] {
    switch(this.inventoryMode) {
      case 0:
        return this.initiative ? this.roundService.getInventoryWithInitiative : this.roundService.getInventory;
      case 1:
        return this.customInventory(this.playerService.paletteList);
      case 2:
        return this.customInventory(this.customList);
      default:
        return this.roundService.getInventory;
    }

  }

  get tableInventory():ObjectInventory {
    return this.inventoryService.tableInventory;
  }

  customList:string[] = [];

  customInventory(identifiers :string[]):GameCharacter[] {
    return identifiers.map(characterIdentifier => { return this.gameCharacterService.get(characterIdentifier) });
  }

  get initiative():string {
    if (!this.roundService.isInitiative) return null;
    return this.roundService.initName;
  }

  initDataElm(identifier :string):number {
    let dataElm = this.gameCharacterService.findDataElm(identifier ,this.initiative);
    if (dataElm && !isNaN(Number(dataElm.value))) return dataElm.type == 'numberResource' ? Number(dataElm.currentValue) : Number(dataElm.value);
    return 0;
  }

  constructor(
    private changeDetector: ChangeDetectorRef,
    private contextMenuService: ContextMenuService,
    private roundService: RoundService,
    private gameCharacterService: GameCharacterService,
    private inventoryService: GameObjectInventoryService,
    private playerService: PlayerService,
    private pointerDeviceService: PointerDeviceService
  ) {
    EventSystem.register(this)
    .on('ADD_ROUND', event => {
      this.changeDetector.detectChanges();
    })
    .on('UPDATE_GAME_OBJECT', -1000, event => {
      let object = ObjectStore.instance.get(event.data.identifier);
      if (object instanceof DataElement || object instanceof GameCharacter) {
        this.changeDetector.detectChanges();
      }
    });
  }

  ngOnInit(): void {
  }

  displayContextMenu(e: Event):void{
    e.stopPropagation();
    e.preventDefault();

    if (!this.pointerDeviceService.isAllowedToOpenContextMenu) return;
    let position = this.pointerDeviceService.pointers[0];

    let actions: ContextMenuAction[] = [
      { name: "表示するキャラクター" },
      ContextMenuSeparator,
        { name: `${this.inventoryMode == 0 ? '◉' : '○'} 全て(イニシアティブ連動)`, action: () => this.inventoryMode = 0 },
        { name: `${this.inventoryMode == 1 ? '◉' : '○'} パレットバインダー`, action: () => this.inventoryMode = 1 },
        { name: `${this.inventoryMode == 2 ? '◉' : '○'} カスタム`, action: () => this.inventoryMode = 2, disabled: true},
      ContextMenuSeparator,
      { name: "表示するステータス" },
      ContextMenuSeparator,
        { name: `${this.statusMode == 0 ? '◉' : '○'} イニシアティブ`, action: () => this.statusMode = 0 },
        { name: `${this.statusMode == 1 ? '◉' : '○'} ステータスバー`, action: () => this.statusMode = 1 },
        { name: `${this.statusMode == 2 ? '◉' : '○'} カスタム`, action: () => this.statusMode = 2, disabled: true},
    ];
    this.contextMenuService.open(position, actions, '表示項目');
  }

  trackByCharacter(index: number, gameCharacter: GameCharacter):string {
    return gameCharacter.identifier;
  }

}
