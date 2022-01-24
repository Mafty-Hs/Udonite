import { Component, OnInit, AfterViewInit, OnDestroy } from '@angular/core';
import { IONetwork,EventSystem } from '@udonarium/core/system';

import { BillBoard } from '@udonarium/bill-board';
import { ChatTabList } from '@udonarium/chat-tab-list';
import { CounterList } from '@udonarium/counter-list';
import { CutInList } from '@udonarium/cut-in-list';
import { DataSummarySetting } from '@udonarium/data-summary-setting';
import { DiceRollTable } from '@udonarium/dice-roll-table';
import { DiceRollTableList } from '@udonarium/dice-roll-table-list';
import { FileArchiver } from '@udonarium/core/file-storage/file-archiver';
import { AudioStorage } from '@udonarium/core/file-storage/audio-storage';
import { ImageStorage } from '@udonarium/core/file-storage/image-storage';
import { IRound } from '@udonarium/round';
import { ObjectTemplate } from '@udonarium/object-template';
import { ObjectStore } from '@udonarium/core/synchronize-object/object-store';
import { GameTable } from '@udonarium/game-table';
import { TableSelecter } from '@udonarium/table-selecter';
import { PlayerService } from 'service/player.service';
import { RoomService , RoomState } from 'service/room.service';
import { RoomAdmin } from '@udonarium/room-admin';


@Component({
  selector: 'sync-wait',
  templateUrl: './sync-wait.component.html',
  styleUrls: ['./sync-wait.component.css']
})
export class SyncWaitComponent implements OnInit, AfterViewInit, OnDestroy {

  message:string = "部屋に接続しています";

  constructor(
    public roomService: RoomService,
    private playerService: PlayerService,
  ) { }

  roomSync() { 
    FileArchiver.instance.initialize();
    ImageStorage.instance;
    AudioStorage.instance;
    ImageStorage.instance.getCatalog().then(() => {
      EventSystem.trigger("START_SYNC",null) ;
      this.message = "サーバのデータを取得しています。";
    });
  }

  commonInitialnize() {
    this.roomService.roomData = IONetwork.roomInfo;
    
    IRound.instance.identifier;
    BillBoard.instance.identifier;
    ObjectTemplate.instance.identifier;
    CounterList.instance.identifier;
    ChatTabList.instance.identifier;
    DataSummarySetting.instance.identifier;
    CutInList.instance.identifier;
    DiceRollTableList.instance.identifier;
    RoomAdmin.instance.identifier;
    RoomAdmin.setting.identifier;

    let tableSelecter =  <TableSelecter>ObjectStore.instance.get('tableSelecter');
    if (!tableSelecter) {
      console.log("TableSelecter Initialize");
      tableSelecter = new TableSelecter('tableSelecter');
      tableSelecter.initialize();
    }
    if (!tableSelecter.viewTableIdentifier) {
      let gameTable = <GameTable>ObjectStore.instance.get('gameTable');
      if (!gameTable) {
        console.log("GameTable Initialize");
         gameTable = new GameTable('gameTable');
         gameTable.name = '最初のテーブル';
         gameTable.imageIdentifier = "testTableBackgroundImage_image";
         gameTable.width = 20;
         gameTable.height = 15;
         gameTable.initialize();
      }
      tableSelecter.viewTableIdentifier = gameTable.identifier;
    }
  }

  initialize() {
    ChatTabList.instance.addChatTab('メインタブ', 'MainTab');
    ChatTabList.instance.addChatTab('サブタブ', 'SubTab');

    let sampleDiceRollTable = new DiceRollTable('SampleDiceRollTable');
    sampleDiceRollTable.initialize();
    sampleDiceRollTable.name = 'サンプルダイスボット表'
    sampleDiceRollTable.command = 'SAMPLE'
    sampleDiceRollTable.dice = '1d6';
    sampleDiceRollTable.value = "1:これはダイスボット表のサンプルです\n2:数字と対応する結果を1行に1つづつ:（コロン）で区切り\n3:数字:結果のように記述します\n4:\\\\n  \\nで改行します\n5-6:また、-（ハイフン）で区切って数字の範囲を指定可能です";
    DiceRollTableList.instance.addDiceRollTable(sampleDiceRollTable); 
  }

  roomInit() {
    this.message = "ルームを作成しています。";
    this.commonInitialnize();
    this.initialize();
    this.roomService.roomState = RoomState.PLAYER_SELECT;
  }

  roomJoin() {
    this.message = "ルームにログインしています。";
    this.commonInitialnize();
    this.roomService.roomState = RoomState.PLAYER_SELECT;
  }

  ngOnInit(): void {
    EventSystem.register(this)
    .on('SYNC_END', event => {
      EventSystem.unregister(this);
      if (this.roomService.createRoom) {
        this.roomInit();
      }
      else {
        this.roomJoin();
      }
    }); 
  }
  ngAfterViewInit(): void {
    if (!IONetwork.roomId) {
      EventSystem.register(this)
      .on('ROOM_JOIN', event => {
        this.roomSync();
      });
    }
    else {
      this.roomSync();
    }
  }
  ngOnDestroy(): void {
      EventSystem.unregister(this)
  }

}
