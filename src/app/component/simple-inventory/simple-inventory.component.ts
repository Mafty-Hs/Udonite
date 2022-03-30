import { Component, OnInit, ChangeDetectionStrategy, ChangeDetectorRef, } from '@angular/core';
import { DataElement } from '@udonarium/data-element';
import { GameCharacter } from '@udonarium/game-character';
import { CounterService } from 'service/counter.service';
import { GameCharacterService } from 'service/game-character.service';
import { GameObjectInventoryService, ObjectInventory } from 'service/game-object-inventory.service';
import { EventSystem } from '@udonarium/core/system';
import { ObjectStore } from '@udonarium/core/synchronize-object/object-store';

@Component({
  selector: 'simple-inventory',
  templateUrl: './simple-inventory.component.html',
  styleUrls: ['./simple-inventory.component.css'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class SimpleInventoryComponent implements OnInit {
  inventoryMode:number = 0; // 0:全て(イニシアティブ連動)　1:パレットバインダー 2:カスタム
  statusMode:number = 0; // 0:イニシアティブ(最初の３つまで)　1:ステータスバー 2:カスタム
  deepReflesh:boolean = true;

  get dataElmTag1():string {
    return this.inventoryService.statusBar_1;
  }
  get dataElmTag2():string {
    return this.inventoryService.statusBar_2;
  }
  get dataElmTag3():string {
    return this.inventoryService.statusBar_3;
  }

  dataElms(characterIdentifier:string):DataElement[] {
    let dataElms:DataElement[] = [];
    dataElms.push(this.gameCharacterService.findDataElm(characterIdentifier ,this.dataElmTag1));
    dataElms.push(this.gameCharacterService.findDataElm(characterIdentifier ,this.dataElmTag2));
    dataElms.push(this.gameCharacterService.findDataElm(characterIdentifier ,this.dataElmTag3));
    return dataElms;
  }


  get characters():GameCharacter[] {
    return this.initiative ? this.getInventoryWithInitiative : this.getInventory;
  }

  get getInventory():GameCharacter[] {
    let objects = this.tableInventory.tabletopObjects.filter(character => character.isInventoryIndicate);
    return objects as GameCharacter[];
  }

  get tableInventory():ObjectInventory {
    return this.inventoryService.tableInventory;
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
    private counterService: CounterService,
    private gameCharacterService: GameCharacterService,
    private inventoryService: GameObjectInventoryService,
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

  trackByCharacter(index: number, gameCharacter: GameCharacter):string {
    return gameCharacter.identifier;
  }

}
