import { EventSystem } from '@udonarium/core/system';
import { Injectable } from '@angular/core';
import { ObjectSerializer } from '@udonarium/core/synchronize-object/object-serializer';

import { BillBoard } from '@udonarium/bill-board';
import { ChatTab } from '@udonarium/chat-tab';
import { ChatTabList } from '@udonarium/chat-tab-list';
import { CutIn } from '@udonarium/cut-in';
import { CutInList } from '@udonarium/cut-in-list';
import { CounterList } from '@udonarium/counter-list';
import { DiceRollTable } from '@udonarium/dice-roll-table';
import { DiceRollTableList } from '@udonarium/dice-roll-table-list';
import { Round } from '@udonarium/round';
import { Room } from '@udonarium/room';
import { RoomAdmin } from '@udonarium/room-admin';

import { PlayerService } from './player.service';
import { RoomService } from './room.service';
import { CounterService } from './counter.service';
import { BillBoardService } from './bill-board.service';
import { TabletopObject } from '@udonarium/tabletop-object';



@Injectable({
  providedIn: 'root'
})
export class LoadDataService {

  roomNodeList:string[] = [
    'bill-board',
    'chat-tab-list',
    'counter-list',
    'cut-in-list',
    'dice-roll-table-list',
    'image-tag-list',    
    'room',
    'room-admin',
    'round',
    'summary-setting'
  ];
  tableTopNodeList:string[] = [
    'character',
    'table-mask',
    'terrain',
    'text-note',
    'card-stack',
    'card',
    'dice-symbol'
  ];
  otherNodeList:string[] = [
    'game-table',
    'chat-tab',
    'cut-in',
    'dice-roll-table'
  ];

  loadData(xmlElement :Element) {
    let nodeName = xmlElement.nodeName;
    if (this.tableTopNodeList.includes(nodeName)) {
      if (!this.roomService.disableTabletopLoad)
        this.tabletopDataLoad(xmlElement ,nodeName);
    }
    else if (this.roomNodeList.includes(nodeName)) {
      if (this.roomService.roomAdmin.isLobby || this.roomService.isStandalone || !this.roomService.roomAdmin.disableRoomLoad)
        this.roomDataLoad(xmlElement ,nodeName);
    }
    else if (this.otherNodeList.includes(nodeName)) {
      if (!this.roomService.disableObjectLoad)
        this.tabletopDataLoad(xmlElement ,nodeName);
    }    
    return;
  }
  
  roomDataLoad(xmlElement :Element ,nodeName :string) {
    let gameObject = ObjectSerializer.instance.parseXml(xmlElement);
    switch (true) {
      case (gameObject instanceof Round):
        this.counterService.loadRound(<Round>gameObject);
        break;
      case (gameObject instanceof CounterList):
        this.counterService.loadCounter(<CounterList>gameObject);
        break;
      case (gameObject instanceof BillBoard):
        this.billBoardService.loadCard(<BillBoard>gameObject);
        break;
      case (gameObject instanceof RoomAdmin):
        this.roomService.loadRoom(<RoomAdmin>gameObject);
        break;
      default:
        return;
    };
  }
  
  tabletopDataLoad(xmlElement :Element ,nodeName :string) {
    let gameObject = ObjectSerializer.instance.parseXml(xmlElement);
    switch (true) {
      case (gameObject instanceof TabletopObject):
        EventSystem.trigger('TABLETOP_OBJECT_LOADED',gameObject.identifier);
        break;
      case (gameObject instanceof ChatTab):
       ChatTabList.instance.addChatTab(<ChatTab>gameObject);
        break;
      case (gameObject instanceof DiceRollTable):
        DiceRollTableList.instance.addDiceRollTable(<DiceRollTable>gameObject);
        break;
      case (gameObject instanceof CutIn):
       CutInList.instance.addCutIn(<CutIn>gameObject);
        break;
      default:
        return;
    };
  }

  initialize() {
    EventSystem.register(this)
      .on('XML_LOADED', event => {
        let xmlElement:Element = event.data.xmlElement;
        this.loadData(xmlElement);
    });
  }

  constructor(
    private counterService: CounterService,
    private billBoardService: BillBoardService,
    private roomService: RoomService
  ) {
  }
}
