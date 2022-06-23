import { Injectable } from '@angular/core';
import { Round , IRound } from '@udonarium/round';
import { GameCharacter } from '@udonarium/game-character';
import { ObjectStore } from '@udonarium/core/synchronize-object/object-store';
import { GameCharacterService } from './game-character.service';
import { ContextMenuAction, ContextMenuSeparator } from 'service/context-menu.service';
import { ChatMessageService } from './chat-message.service';
import { CounterService } from './counter.service';
import { GameObjectInventoryService } from './game-object-inventory.service';
import { ChatTab } from '@udonarium/chat-tab';
import { DataElement } from '@udonarium/data-element';
import { EventSystem } from '@udonarium/core/system';

interface InitiativeCharacterList {
  character: GameCharacter;
  initiative :number;
}

@Injectable({
  providedIn: 'root'
})
export class RoundService {
  get iRound(): Round {return IRound.instance;};

  get newLineString(): string { return this.inventoryService.newLineString; }
  get isInitiative():boolean { return this.iRound.isInitiative }
  set isInitiative(_isInitiative :boolean) { this.iRound.isInitiative = _isInitiative}
  get currentInitiative():number { return this.iRound.currentInitiative }
  set currentInitiative(currentInitiative :number) { this.iRound.currentInitiative = currentInitiative}
  get currentInitiativeNumber():number { return this.iRound.currentInitiativeNumber }
  set currentInitiativeNumber(currentInitiativeNumber :number) { this.iRound.currentInitiativeNumber = currentInitiativeNumber}
  get roundState():number { return this.iRound.roundState }
  set roundState(_roundState :number) { this.iRound.roundState = _roundState}
  get initName():string { return this.iRound.initName }
  set initName(_initName :string) { this.iRound.initName = _initName}
  get chatTab(): ChatTab {
    let tab =  ObjectStore.instance.get<ChatTab>(this.iRound.tabIdentifier);
    if (tab) return tab;
    this.iRound.tabIdentifier = this.chatMessageService.chatTabs[0].identifier;
    return this.chatMessageService.chatTabs[0];
  };
  get dataTags(): string[] {
    return this.inventoryService.dataTags;
  }
  get round(): number { return this.iRound.count };
  set round(count: number) {
    this.iRound.count = count;
  };
  get roundText(): string {
    return this.round === 0 ? 'ラウンド開始' : 'ラウンド進行：' + this.round + 'R';
  }

  add() {
    if(this.isInitiative) this.addInitiative();
    else this.addRound();
  }

  private addRound() {
    this.round = this.round + 1;
    let message:string = "第" + this.round + "ラウンド";
    this.chatMessageService.systemSend(this.chatTab,message);
    this.counterService.assignedList().forEach(function (value) {
      value.aging();
    });
  }

  private addInitiative() {
    switch (this.roundState){
      case 0:
        //ラウンド開始
        this.addRound();
        this.chatMessageService.systemSend(this.chatTab,"ラウンド開始");
        this.roundState += 1;
        this.currentInitiative = NaN;
        this.currentInitiativeNumber = NaN;
      break;
      case 1:
        //イニシアティブ
        const sortedcharacter = this.sortedcharacter
        this.calcInitiative(sortedcharacter);
        if (!Number.isNaN(this.currentInitiative)) {
          this.chatMessageService.systemSend(this.chatTab, "イニシアティブ " + this.currentInitiative);
          this.callInitiative(sortedcharacter);
        }
        else {
          //ラウンド終了
          this.chatMessageService.systemSend(this.chatTab,"ラウンド終了");
          this.roundState = 0;
        }
      break;
    }
    EventSystem.call("ADD_ROUND",null)
  }

  reset() {
    IRound.reset();
  }

  contextMenu():ContextMenuAction[] {
    let actions:ContextMenuAction[] = [];
    actions.push({name:"出力先チャットタブ選択" , action: null, subActions: this.chatTabSelect(this.iRound.tabIdentifier)});
    actions.push(ContextMenuSeparator);
    actions.push({name:"ラウンド管理"});
    actions.push(ContextMenuSeparator);
    actions.push((this.isInitiative
      ? {
        name: '○ ラウンド単位で管理', action: () => {
          this.isInitiative = false;
        }
      } : {
        name: '◉ ラウンド単位で管理', action: () => {
          this.isInitiative = false;
        }
    }));
    actions.push((this.isInitiative
      ? {
        name: '◉ イニシアティブで管理', action: () => {
          this.isInitiative = true;
        }
      } : {
        name: '○ イニシアティブで管理', action: () => {
          this.isInitiative = true;
        }
    }));
    actions.push(ContextMenuSeparator);

      actions.push({name:"イニシアティブに使う項目" , action: null, subActions: this.initiativeSelect(this.initName)});
    return actions;
  }

  private chatTabSelect(chatTabIdentifier :string ):ContextMenuAction[]  {
    let actions:ContextMenuAction[] = [];
    for (const Tab of this.chatMessageService.chatTabs) {
      actions.push({
        name: ( Tab.identifier === chatTabIdentifier  ? "◉ " + Tab.name : "○ " + Tab.name) , action: () => {
          this.iRound.tabIdentifier = Tab.identifier;
        },
      });
    };
    return actions;
  }

  private initiativeSelect(initiative :string):ContextMenuAction[]  {
    let actions:ContextMenuAction[] = [];
    for (let tag of this.dataTags) {
      if(tag === this.newLineString) continue;
      actions.push(( tag == initiative
        ? {
          name: '◉' + tag, action: () => {
          this.initName = tag;
        }
        } : {
          name: '○ ' + tag, action: () => {
          this.initName = tag;
        }
      }));
    }
    return actions;
  }

  constructor(
    private chatMessageService: ChatMessageService,
    private counterService: CounterService,
    private gameCharacterService: GameCharacterService,
    private inventoryService: GameObjectInventoryService
  ) { }

  get getInventory():GameCharacter[] {
    const objects = this.inventoryService.tableInventory.tabletopObjects.filter(character => character.isInventoryIndicate);
    return objects as GameCharacter[];
  }

  get getInventoryWithInitiative():GameCharacter[] {
    const sortedcharacter = this.sortedcharacter;
    return sortedcharacter.map(character => character.character)
  }

  private get sortedcharacter():InitiativeCharacterList[]  {
    let unsortedcharacter:InitiativeCharacterList[] = [];
    const initiative = !Number.isNaN(this.currentInitiative) ? this.currentInitiative : 999999;
    const initiativeNumber = !Number.isNaN(this.currentInitiativeNumber ) ? this.currentInitiativeNumber : 999999;
    const inventory:Map<string,DataElement[]> =  this.inventoryService.tableInventory.dataElementMap;
    inventory.forEach((value,key)=>
    {
      let dataElms = value as DataElement[];
      let dataElm = dataElms.find(element => element?.name === this.initName)
      let character = this.gameCharacterService.get(key);
      if (dataElm && !isNaN(Number(dataElm.value)) &&  character.isInventoryIndicate) {
        unsortedcharacter.push(dataElm.type == 'numberResource' ?
          {character: character ,initiative: Number(dataElm.currentValue)}  :
          {character: character ,initiative: Number(dataElm.value)} );
      }
    });
    const preUnsortedCharacter = unsortedcharacter
    .filter(character_ => character_.initiative <= initiative && character_.character.initiative <= initiativeNumber)
    .sort((a, b) => {
      if (a.initiative < b.initiative) {
        return 1;
      }
      if (a.initiative > b.initiative) {
        return -1;
      }
      if (a.character.initiative < b.character.initiative) {
        return 1;
      }
      if (a.character.initiative > b.character.initiative) {
        return -1;
      }
      return 0;
    });
    return preUnsortedCharacter.concat(
      unsortedcharacter
      .filter(character_ => !preUnsortedCharacter.includes(character_))
      .sort((a, b) => {
        if (a.initiative < b.initiative) {
          return 1;
        }
        if (a.initiative > b.initiative) {
          return -1;
        }
        if (a.character.initiative < b.character.initiative) {
          return 1;
        }
        if (a.character.initiative > b.character.initiative) {
          return -1;
        }
        return 0;
      })
    );
  }

  calcInitiative(sortedcharacter :InitiativeCharacterList[]):void {
    if (sortedcharacter.length < 1) {
      this.currentInitiative = NaN;
      this.currentInitiativeNumber = NaN;
      return;
    }
    let lastCharacter = sortedcharacter[0];
    if (Number.isNaN(this.currentInitiative)) {
      this.currentInitiative = sortedcharacter[0].initiative;
      this.currentInitiativeNumber = sortedcharacter[0].character.initiative;
      return;
    }

    let initiativeNumber = this.calcInitiativeNumber(sortedcharacter);
    if (!Number.isNaN(initiativeNumber)) {
      this.currentInitiativeNumber = initiativeNumber;
      return;
    }

    const currents = sortedcharacter
      .filter(character => character.initiative < this.currentInitiative)
      .sort((a, b) => {
        if (a.initiative < b.initiative) {
          return 1;
        }
        if (a.initiative > b.initiative) {
          return -1;
        }
        if (a.character.initiative < b.character.initiative) {
          return 1;
        }
        if (a.character.initiative > b.character.initiative) {
          return -1;
        }
        return 0;
      });
    if (currents.length < 1)  {
      if (this.currentInitiative > 0) {
        this.currentInitiative = 0;
        this.currentInitiativeNumber = NaN;
        return;
      }
      else {
        this.currentInitiative = NaN;
        this.currentInitiativeNumber = NaN;
        return;

      }
    }
    let current = currents.find(character => character.initiative < this.currentInitiative);
    if ((this.currentInitiative != 0) &&
      lastCharacter.initiative > 0 && current.initiative < 0 ) {
      this.currentInitiative = 0;
      this.currentInitiativeNumber = NaN;
      return;
    }
    this.currentInitiative = current.initiative;
    this.currentInitiativeNumber = current.character.initiative;
    return;
  }


  private calcInitiativeNumber(sortedcharacter :InitiativeCharacterList[]):number {
    let currentCharacters = sortedcharacter
      .filter(character => character.initiative === this.currentInitiative)
      .sort((a, b) => {
        if (a.character.initiative < b.character.initiative) {
          return 1;
        }
        if (a.character.initiative > b.character.initiative) {
          return -1;
        }
        return 0;
      });
    if (currentCharacters.length <= 1) {
      return NaN;
    }
    let current =  currentCharacters
      .find(character => character.character.initiative < this.currentInitiativeNumber);
    return current ? current.character.initiative : NaN;
  }

  callInitiative(sortedcharacter :InitiativeCharacterList[]):void {
    for (let character of sortedcharacter
    .filter( character => character.initiative  === this.currentInitiative && character.character.initiative === this.currentInitiativeNumber )
    .map(character => character.character)) {
      this.chatMessageService.systemSend(this.chatTab, '修正値:' + character.initiative + ' → ' + character.name);
    }
  }

}
