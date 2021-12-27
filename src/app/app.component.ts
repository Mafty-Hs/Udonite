import { AfterViewInit, Component, NgZone, OnDestroy} from '@angular/core';

import { AudioSharingSystem } from '@udonarium/core/file-storage/audio-sharing-system';
import { AudioStorage } from '@udonarium/core/file-storage/audio-storage';
import { EventSystem, Network } from '@udonarium/core/system';
import { FileArchiver } from '@udonarium/core/file-storage/file-archiver';
import { ImageFile } from '@udonarium/core/file-storage/image-file';
import { ImageSharingSystem } from '@udonarium/core/file-storage/image-sharing-system';
import { ImageStorage } from '@udonarium/core/file-storage/image-storage';
import { ObjectFactory } from '@udonarium/core/synchronize-object/object-factory';
import { ObjectSerializer } from '@udonarium/core/synchronize-object/object-serializer';
import { ObjectStore } from '@udonarium/core/synchronize-object/object-store';
import { ObjectSynchronizer } from '@udonarium/core/synchronize-object/object-synchronizer';

import { BillBoard } from '@udonarium/bill-board';
import { ChatTabList } from '@udonarium/chat-tab-list';
import { CounterList } from '@udonarium/counter-list';
import { CutInList } from '@udonarium/cut-in-list';
import { DataSummarySetting } from '@udonarium/data-summary-setting';
import { DiceRollTable } from '@udonarium/dice-roll-table';
import { DiceRollTableList } from '@udonarium/dice-roll-table-list';
import { ImageTag } from '@udonarium/image-tag';
import { IRound } from '@udonarium/round';
import { ObjectTemplate } from '@udonarium/object-template';
import { PeerCursor } from '@udonarium/peer-cursor';
import { RoomAdmin } from '@udonarium/room-admin';

import { AppConfig, AppConfigService } from 'service/app-config.service';
import { DiceBotService } from 'service/dice-bot.service';
import { LoadDataService } from 'service/load-data.service';
import { ModalService } from 'service/modal.service';
import { PointerDeviceService } from 'service/pointer-device.service';
import { PlayerService } from 'service/player.service';
import { RoomService } from 'service/room.service';

import { TextViewComponent } from 'component/text-view/text-view.component';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css']
})
export class AppComponent implements AfterViewInit, OnDestroy {

  private immediateUpdateTimer: NodeJS.Timer = null;
  private lazyUpdateTimer: NodeJS.Timer = null;
  get isLobby():boolean {
    return this.roomService.roomAdmin.isLobby;
  }

  constructor(  
    private modalService: ModalService,
    private diceBotService: DiceBotService,
    private pointerDeviceService: PointerDeviceService,
    private appConfigService: AppConfigService,
    private ngZone: NgZone,
    private playerService: PlayerService,
    private roomService: RoomService,
    private loadDataService: LoadDataService
  ) {

    this.ngZone.runOutsideAngular(() => {
      EventSystem;
      Network;
      FileArchiver.instance.initialize();
      ImageSharingSystem.instance.initialize();
      ImageStorage.instance;
      AudioSharingSystem.instance.initialize();
      AudioStorage.instance;
      ObjectFactory.instance;
      ObjectSerializer.instance;
      ObjectStore.instance;
      ObjectSynchronizer.instance.initialize();
    });
    this.appConfigService.initialize();
    this.pointerDeviceService.initialize();
    this.loadDataService.initialize();    

    IRound.init();
    BillBoard.init();
    RoomAdmin.init();
    ObjectTemplate.init();
    CounterList.instance.initialize();
    ChatTabList.instance.initialize();
    DataSummarySetting.instance.initialize();

    ChatTabList.instance.addChatTab('メインタブ', 'MainTab');
    ChatTabList.instance.addChatTab('サブタブ', 'SubTab');

    CutInList.instance.initialize();

    let sampleDiceRollTable = new DiceRollTable('SampleDiceRollTable');
    sampleDiceRollTable.initialize();
    sampleDiceRollTable.name = 'サンプルダイスボット表'
    sampleDiceRollTable.command = 'SAMPLE'
    sampleDiceRollTable.dice = '1d6';
    sampleDiceRollTable.value = "1:これはダイスボット表のサンプルです\n2:数字と対応する結果を1行に1つづつ:（コロン）で区切り\n3:数字:結果のように記述します\n4:\\\\n  \\nで改行します\n5-6:また、-（ハイフン）で区切って数字の範囲を指定可能です";
    DiceRollTableList.instance.addDiceRollTable(sampleDiceRollTable);

    let fileContext = ImageFile.createEmpty('none_icon').toContext();
    fileContext.url = './assets/images/ic_account_circle_black_24dp_2x.png';
    let noneIconImage = ImageStorage.instance.add(fileContext);
    ImageTag.create(noneIconImage.identifier).tag = '*default アイコン';

    fileContext = ImageFile.createEmpty('stand_no_image').toContext();
    fileContext.url = './assets/images/nc96424.png';
    let standNoIconImage = ImageStorage.instance.add(fileContext);
    ImageTag.create(standNoIconImage.identifier).tag = '*default スタンド';

    this.playerService.playerCreate(noneIconImage.identifier);

     EventSystem.register(this)
      .on('UPDATE_GAME_OBJECT', event => { this.lazyNgZoneUpdate(event.isSendFromSelf); })
      .on('DELETE_GAME_OBJECT', event => { this.lazyNgZoneUpdate(event.isSendFromSelf); })
      .on('SYNCHRONIZE_AUDIO_LIST', event => { if (event.isSendFromSelf) this.lazyNgZoneUpdate(false); })
      .on('SYNCHRONIZE_FILE_LIST', event => { if (event.isSendFromSelf) this.lazyNgZoneUpdate(false); })
      .on<AppConfig>('LOAD_CONFIG', event => {
        console.log('LOAD_CONFIG !!!', event.data);
        if (event.data.dice && event.data.dice.url) {
          this.diceBotService.initialize(event.data.dice.url);
        } else {
            this.modalService.open(TextViewComponent, { title: '設定エラー', text: 'bcDice-APIサーバの設定がありません。ダイスボットは利用できません。' });
        }
        Network.setApiKey(event.data.webrtc.key);
        Network.open();
      })
      .on<File>('FILE_LOADED', event => {
        this.lazyNgZoneUpdate(false);
      })
      .on('OPEN_NETWORK', event => {
        console.log('OPEN_NETWORK', event.data.peerId);
        PeerCursor.myCursor.peerId = Network.peerContext.peerId;
      })
      .on('CLOSE_NETWORK', event => {
        console.log('CLOSE_NETWORK', event.data.peerId);
        this.ngZone.run(async () => {
          if (1 < Network.peerIds.length) {
            await this.modalService.open(TextViewComponent, { title: 'ネットワークエラー', text: 'ネットワーク接続に何らかの異常が発生しました。\nこの表示以後、接続が不安定であれば、ページリロードと再接続を試みてください。' });
          } else {
            await this.modalService.open(TextViewComponent, { title: 'ネットワークエラー', text: '接続情報が破棄されました。\nこのウィンドウを閉じると再接続を試みます。' });
            Network.open();
          }
        });
      })
      .on('CONNECT_PEER', event => {
        //if (event.isSendFromSelf) this.chatMessageService.calibrateTimeOffset();
        this.lazyNgZoneUpdate(event.isSendFromSelf);
      })
      .on('DISCONNECT_PEER', event => {
        this.lazyNgZoneUpdate(event.isSendFromSelf);
      });
  }

  ngAfterViewInit() {
  }

  ngOnDestroy() {
    EventSystem.unregister(this);
  }

  private lazyNgZoneUpdate(isImmediate: boolean) {
    if (isImmediate) {
      if (this.immediateUpdateTimer !== null) return;
      this.immediateUpdateTimer = setTimeout(() => {
        this.immediateUpdateTimer = null;
        if (this.lazyUpdateTimer != null) {
          clearTimeout(this.lazyUpdateTimer);
          this.lazyUpdateTimer = null;
        }
        this.ngZone.run(() => { });
      }, 0);
    } else {
      if (this.lazyUpdateTimer !== null) return;
      this.lazyUpdateTimer = setTimeout(() => {
        this.lazyUpdateTimer = null;
        if (this.immediateUpdateTimer != null) {
          clearTimeout(this.immediateUpdateTimer);
          this.immediateUpdateTimer = null;
        }
        this.ngZone.run(() => { });
      }, 100);
    }
  }
}

