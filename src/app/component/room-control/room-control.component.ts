import { Component, OnInit, OnDestroy } from '@angular/core';
import { EventSystem } from '@udonarium/core/system';
import { DiceBotService } from 'service/dice-bot.service';
import { PlayerService } from 'service/player.service';
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

  alarmTime:number = 0;
  get myPeer(): PeerCursor { return this.playerService.myPeer; }
  get otherPeers(): PeerCursor[] { return this.playerService.otherPeers; }
  sendTo:string = "";
  password:string = "";

  get chatTabs():ChatTab[] {
    return ChatTabList.instance.chatTabs;
  }

  get adminAuth():boolean { return this.playerService.adminAuth;}

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
    public playerService: PlayerService
  ) { }

  ngOnInit(): void {
    Promise.resolve().then(() => this.panelService.title = 'ルーム共通設定');
  }

  ngOnDestry() {
    EventSystem.unregister(this);
  }

  passwordAuth() {
    this.playerService.adminPasswordAuth(this.password);
    this.panelService.close;
  }

  helpRoomControl() {
      let gameHelp:string[] =
      [
      'デフォルトダイスボット\n  プレイヤーがログインしたときのデフォルトのダイスボットを変更します。\n  ログイン中のプレイヤーには反映されません。',
      'デフォルトキャラクター\n  新規キャラクターを作成するとき、指定したキャラクターのデータを引き継ぎます。\n  画像・立ち絵は初期化されます。',
      '操作ログ\n  カード、ダイスの操作ログを出力するタブを指定します。',
      'アラーム\n  通知音を鳴らします。',
      'ルーム管理者\n  全プレイヤー共通の権限に加え、特別な権限をもったプレイヤーです。\n  この機能はルーム作成時にのみ有効化可能で、プレイヤーのピアIDで認証します。\n  接続が切れた場合、ルーム作成時に設定したパスワードでもう一度ルーム管理者になることができます。',
      'ルーム管理権限でできること\n  データアップロード禁止(キャラクター以外)\n  データアップロード禁止(キャラクター)\n  テーブル設定禁止\n  チャットタブ設定禁止\n  部屋全データセーブ禁止\n  個別データセーブ禁止\n',
      ];     

      let coordinate = { x: 100, y: 100 };
      let option: PanelOption = { left: coordinate.x, top: coordinate.y, width: 600, height: 500 };
      let textView = this.panelService.open(TextViewComponent, option);
      textView.title = "ルーム共通設定説明";
      textView.text = gameHelp;
  }

}
