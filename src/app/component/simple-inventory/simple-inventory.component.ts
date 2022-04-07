import { Component, OnInit, ChangeDetectionStrategy, ChangeDetectorRef, } from '@angular/core';
import { DataElement } from '@udonarium/data-element';
import { GameCharacter } from '@udonarium/game-character';
import { ContextMenuService, ContextMenuAction, ContextMenuSeparator } from 'service/context-menu.service';
import { CounterService } from 'service/counter.service';
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
  deepReflesh:boolean = true;

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
        return this.initiative ? this.getInventoryWithInitiative : this.getInventory;
      case 1:
        return this.customInventory(this.playerService.paletteList);
      case 2:
        return this.customInventory(this.customList);
      default:
        return this.getInventory;
    }

  }

  get getInventory():GameCharacter[] {
    let objects = this.tableInventory.tabletopObjects.filter(character => character.isInventoryIndicate);
    return objects as GameCharacter[];
  }

  get tableInventory():ObjectInventory {
    return this.inventoryService.tableInventory;
  }

  customList:string[] = [];

  customInventory(identifiers :string[]):GameCharacter[] {
    return identifiers.map(characterIdentifier => { return this.gameCharacterService.get(characterIdentifier) });
  }

  get initiative():string {
    if (!this.counterService.round.isInitiative) return null;
    return this.counterService.round.initName
  }

  initDataElm(identifier :string):number {
    let dataElm = this.gameCharacterService.findDataElm(identifier ,this.initiative);
    if (dataElm && !isNaN(Number(dataElm.value))) return dataElm.type == 'numberResource' ? Number(dataElm.currentValue) : Number(dataElm.value);
    return 0;
  }

  get getInventoryWithInitiative():GameCharacter[] {
    let unsortedcharacter:{character: GameCharacter, initiative :number}[] = [];
    let initiative = this.counterService.round.currentInitiative ? this.counterService.round.currentInitiative : 999999;
    let inventory:Map<string,DataElement[]> =  this.tableInventory.dataElementMap;
    inventory.forEach((value,key)=>
    {
      let dataElms = value as DataElement[];
      let dataElm = dataElms.find(element => element?.name === this.initiative)
      if (dataElm && !isNaN(Number(dataElm.value)))
      unsortedcharacter.push(dataElm.type == 'numberResource' ?
        {character: this.gameCharacterService.get(key) ,initiative: Number(dataElm.currentValue)}  :
        {character: this.gameCharacterService.get(key) ,initiative: Number(dataElm.value)} );
    });
    if (this.deepReflesh) {
      unsortedcharacter = unsortedcharacter.reverse()
      this.deepReflesh = false;
    }
    let character:GameCharacter[] = []
    character = unsortedcharacter
      .filter(character_ => character_.initiative <= initiative)
      .sort((a, b) => {
        if (a.initiative < b.initiative) {
          return 1;
        }
        if (a.initiative > b.initiative) {
          return -1;
        }
        return 0;
      })
      .map(character_ => { return character_.character });
    character = character.concat(
      unsortedcharacter
      .filter(character_ => character_.initiative > initiative)
      .sort((a, b) => {
        if (a.initiative < b.initiative) {
          return 1;
        }
        if (a.initiative > b.initiative) {
          return -1;
        }
        return 0;
      })
      .map(character_ => { return character_.character })
    );
    console.log("return list");
    return character;
  }

  constructor(
    private changeDetector: ChangeDetectorRef,
    private contextMenuService: ContextMenuService,
    private counterService: CounterService,
    private gameCharacterService: GameCharacterService,
    private inventoryService: GameObjectInventoryService,
    private playerService: PlayerService,
    private pointerDeviceService: PointerDeviceService
  ) {
    EventSystem.register(this)
    .on('ADD_ROUND', event => {
      this.deepReflesh = true;
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
