import { CounterAssign } from '@udonarium/counter';
import { ChatTab } from '@udonarium/chat-tab';
import { ChatTabList } from '@udonarium/chat-tab-list';
import { Component, OnInit, Input} from '@angular/core';
import { CounterService } from 'service/counter.service';
import { ChatMessageService } from 'service/chat-message.service';
import { ContextMenuAction, ContextMenuSeparator ,ContextMenuService } from 'service/context-menu.service';
import { PointerDeviceService } from 'service/pointer-device.service';
import { DataElement } from '@udonarium/data-element';
import { GameCharacter } from '@udonarium/game-character';
import { GameObjectInventoryService } from 'service/game-object-inventory.service';
import { ObjectStore } from '@udonarium/core/synchronize-object/object-store';

@Component({
  selector: 'round',
  templateUrl: './round.component.html',
  styleUrls: ['./round.component.css']
})
export class RoundComponent implements OnInit {

  constructor(
    public chatMessageService: ChatMessageService,
    private counterService: CounterService,
    private contextMenuService: ContextMenuService,
    private pointerDeviceService: PointerDeviceService,
    private inventoryService: GameObjectInventoryService,
  ) { }

  @Input() minimumMode:boolean;

  get chatTabs(): ChatTab[] {
    return ChatTabList.instance.chatTabs;
  } 

  get newLineString(): string { return this.inventoryService.newLineString; }
  get isInitiative():boolean { return this.counterService.round.isInitiative }
  set isInitiative(_isInitiative :boolean) { this.counterService.round.isInitiative = _isInitiative}
  get currentInitiative():number { return this.counterService.round.currentInitiative }
  set currentInitiative(_currentInitiative :number) { this.counterService.round.currentInitiative = _currentInitiative}
  get roundState():number { return this.counterService.round.roundState }
  set roundState(_roundState :number) { this.counterService.round.roundState = _roundState}
  get initName():string { return this.counterService.round.initName }
  set initName(_initName :string) { this.counterService.round.initName = _initName}

  get dataTags(): string[] {
    return this.inventoryService.dataTags;
  }
  getInventory() {
    let newArray = new Array;
    this.inventoryService.tableInventory.dataElementMap.forEach((value,key)=>
    {
      let dataElms = value as DataElement[];
      let dataElm = dataElms.find(element => element?.name === this.initName) 
      if (dataElm)
        newArray.push([key , dataElm.value]);
    });
    return newArray;
  }
  getCharacter(charaidentifier: string): GameCharacter {
    let object = ObjectStore.instance.get(charaidentifier);
    if (object instanceof GameCharacter) {
      return object;
    }
    return null;
  }
  get chatTab(): ChatTab { return ObjectStore.instance.get<ChatTab>(this.counterService.round.tabIdentifier) };
  set chatTab(tab: ChatTab) {
    this.counterService.round.tabIdentifier = tab.identifier;
  };
  get round(): number { return this.counterService.round.count };
  set round(count: number) {
    this.counterService.round.count = count;
  };

  ngOnInit(): void {
  }

  add() {
    if(this.isInitiative) this.addInitiative();
    else this.addRound();
  }
  
  addInitiative() {
    let message:string
    switch (this.roundState){
      case 0:
        //ラウンド開始
        this.addRound();
        this.chat("ラウンド開始");
        this.roundState += 1;
      break; 
      case 1:
        //イニシアティブ
        this.currentInitiative = this.calcInitiative();
        message = "イニシアティブ " + this.currentInitiative;
        this.chat(message);
        this.callInitiative();
        if(this.currentInitiative == 0) {
          this.roundState += 1;
        }
      break; 
      case 2:
        //ラウンド終了
        this.chat("ラウンド終了");
        this.roundState = 0;
        this.currentInitiative = -1;
      break; 
    }
  }

  calcInitiative():number {
    let inventory = this.getInventory().sort(function(a,b){return(b[1] - a[1]);});
    if (inventory.length == 0) return 0;
    if (this.currentInitiative == -1) return inventory[0][1]  
    let current = inventory.find(value => Number(value[1]) < Number(this.currentInitiative))
    if (!current || current[1] < 0) return 0;
    return current[1];
  }

  callInitiative() {
    let inventory = this.getInventory()
      .filter( (value) =>
        value[1] === this.currentInitiative
      )
      .map(item => item[0]);
    for (let identifier of inventory) {
      let message:string = this.getCharacter(identifier).name;
      this.chat(message);
    }
  }

  addRound() {
    this.round = this.round + 1;
    let message:string = "第" + this.round + "ラウンド";
    this.chat(message);
    this.counterService.assignedList().forEach(function (value) {
      value.aging();
    });
  }

  displayContextMenu(e: Event){
    e.stopPropagation();
    e.preventDefault();

    if (!this.pointerDeviceService.isAllowedToOpenContextMenu) return;
    let position = this.pointerDeviceService.pointers[0];
    let tabSelect = new Array;
    let initSelect = new Array;

    let actions: ContextMenuAction[] = [];
    for (const Tab of this.chatTabs) {
      tabSelect.push({
        name: ( Tab.identifier === this.chatTab.identifier  ? "◉ " + Tab.name : "○ " + Tab.name) , action: () => {
          this.setChatTab(Tab)
        },
      });
    };
    actions.push({name:"出力先チャットタブ選択" , action: null, subActions: tabSelect});
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
      for (let tag of this.dataTags) {
        if(tag === this.newLineString) continue;
        initSelect.push(( tag == this.initName
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
    actions.push({name:"イニシアティブに使う項目" , action: null, subActions: initSelect});
    this.contextMenuService.open(position, actions, 'ラウンド設定');
  }

  private setChatTab(tab :ChatTab) {
    this.chatTab = tab;
  }

  private chat(chattext: string) {
    if (!this.chatTabs.includes(this.chatTab)) {
      this.chatTab = this.chatTabs[0];  
    }

    this.chatMessageService.sendMessage
      (
      this.chatTab,
      chattext,
      "",
      "System",
      "",
      "",
      false,
      false,
      false,
      -1,
      false,
      null,
      null,
      "",
      false
     );
  }

}
