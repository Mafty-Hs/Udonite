import { Component, OnInit, OnDestroy } from '@angular/core';
import { EventSystem ,Network } from '@udonarium/core/system';
import { DiceBotService } from 'service/dice-bot.service';
import { PlayerService } from 'service/player.service';
import { RoomService } from 'service/room.service';
import { PeerCursor } from '@udonarium/peer-cursor';
import { PanelService , PanelOption } from 'service/panel.service';
import { TextViewComponent } from 'component/text-view/text-view.component';
import { ChatTab } from '@udonarium/chat-tab';
import { ChatTabList } from '@udonarium/chat-tab-list';
import { GameCharacterService } from 'service/game-character.service';

@Component({
  selector: 'room-control',
  templateUrl: './room-control.component.html',
  styleUrls: ['./room-control.component.css']
})
export class RoomControlComponent implements OnInit {

  networkService = Network;
  alarmTime:number = 0;
  get myPeer(): PeerCursor { return this.playerService.myPeer; }
  get otherPeers(): PeerCursor[] { return this.playerService.otherPeers; }
  sendTo:string = "";
  password:string = "";

  get isStandalone():boolean {
    return this.roomService.isStandalone;
  }
  get enableAdmin():boolean {
    return (this.roomService.roomAdmin.adminPlayer.length > 0);
  } 

  get adminPlayer():string {
    let name:string = "";
    for (let playerId of this.roomService.roomAdmin.adminPlayer)
      name += this.playerService.getPlayerById(playerId).name + ' ';
    return name;
  }

  get chatTabs():ChatTab[] {
    return ChatTabList.instance.chatTabs;
  }

  get adminAuth():boolean { return this.roomService.adminAuth;}

  alarmSend() {
    let peer:string = ""
    if (this.sendTo) {
      peer = this.playerService.getPeerId(this.sendTo);
      if (!peer) peer = '';
    }
    EventSystem.call('PLAY_ALARM', {identifier: peer  ,time: this.alarmTime * 1000});
  }

  get diceBotInfos() { return this.diceBotService.diceBotInfos }
  get diceBotInfosIndexed() { return this.diceBotService.diceBotInfosIndexed }

  constructor(
    private panelService: PanelService,
    private diceBotService: DiceBotService,
    public gameCharacterService: GameCharacterService,
    public playerService: PlayerService,
    public roomService: RoomService
  ) { }

  ngOnInit(): void {
    Promise.resolve().then(() => this.panelService.title = 'ルーム設定');
    this.panelService.isAbleFullScreenButton = false;
  }

  ngOnDestry() {
    EventSystem.unregister(this);
  }

    helpRoomControl() {
      let gameHelp:string[] =
      [
        'ルーム基本情報\n  ログイン中のルーム情報です',
        'ルーム設定\n  アラーム\n   通知音を鳴らします。\n  操作ログ\n   カード、ダイスの操作ログを出力するタブを指定します。\n  キャラクターテンプレート\n   新規キャラクターを作成するとき、指定したキャラクターのデータを引き継ぎます。\n   画像・立ち絵は初期化されます。',
        'ルーム権限\n  ルームマスター以外のプレイヤーの操作を制限します。',
        'ルーム権限でできること\n  データアップロード禁止(キャラクター以外)\n  データアップロード禁止(キャラクター)\n  テーブル設定禁止\n  チャットタブ設定禁止\n  部屋全データセーブ禁止\n  個別データセーブ禁止\n',
      ];     

      let coordinate = { x: 100, y: 100 };
      let option: PanelOption = { left: coordinate.x, top: coordinate.y, width: 600, height: 500 };
      let textView = this.panelService.open(TextViewComponent, option);
      textView.title = "ルーム設定説明";
      textView.text = gameHelp;
  }

}
