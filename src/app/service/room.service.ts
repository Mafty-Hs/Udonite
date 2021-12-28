import { Injectable } from '@angular/core';
import { PeerContext } from '@udonarium/core/system/network/peer-context';
import { PeerCursor } from '@udonarium/peer-cursor';
import { RoomAdmin } from '@udonarium/room-admin';
import { EventSystem, Network } from '@udonarium/core/system';
import { ObjectStore } from '@udonarium/core/synchronize-object/object-store';
import { PlayerService } from 'service/player.service';
import * as SHA256 from 'crypto-js/sha256';
import { Player } from '@udonarium/player';

export const RoomState = {
  LOBBY: 0,
  PASSWORD: 1,
  CREATE: 2,
  PLAYER_SELECT: 3,
  PLAY: 4
} as const;
export type RoomState = typeof RoomState[keyof typeof RoomState]; 

@Injectable({
  providedIn: 'root'
})
export class RoomService {

  _roomState:RoomState = RoomState.LOBBY;
  get roomState():RoomState {return this._roomState}
  set roomState(roomState :RoomState) {
    if (roomState === RoomState.PLAY) RoomAdmin.setting.isLobby = false;
    this._roomState = roomState;
  }
  isStandalone:boolean = false;

  constructor(
    private playerService: PlayerService,
  ) { }

  get allPlayers():Player[] {
    return RoomAdmin.players;
  }

  //権限管理

  getHash(password: string) {
    return SHA256(password).toString();
  }
  
  enableAdmin() {
    this.roomAdmin.adminPlayer.push(this.playerService.myPlayer.playerId);
  }
   
  get roomAdmin():RoomAdmin {
    return RoomAdmin.setting;
  }
  
  get adminAuth():boolean {
    return RoomAdmin.auth(this.playerService.myPlayer.playerId);
  }
  
  get disableTableLoad():boolean {
    if  (this.adminAuth) return false;
    return this.roomAdmin.disableTableLoad as boolean;
  }
  
  get disableCharacterLoad():boolean {
    if  (this.adminAuth) return false;
    return this.roomAdmin.disableCharacterLoad as boolean;
  }
  get disableTableSetting():boolean {
    if  (this.adminAuth) return false;
    return this.roomAdmin.disableTableSetting as boolean;
  }
  get disableTabSetting():boolean {
    if  (this.adminAuth) return false;
    return this.roomAdmin.disableTabSetting as boolean;
  }
  get disableAllDataSave():boolean {
    if  (this.adminAuth) return false;
    return this.roomAdmin.disableAllDataSave as boolean;
  }
  get disableSeparateDataSave():boolean{
    if  (this.adminAuth) return false;
    return this.roomAdmin.disableSeparateDataSave as boolean;
  }
 
   //ルーム作成
  create(roomName: string ,password: string ,admin?: boolean) {
    let userId = Network.peerContext ? Network.peerContext.userId : PeerContext.generateId();
    Network.open(userId, PeerContext.generateId('***'), roomName, password);
    PeerCursor.myCursor.peerId = Network.peerId;
    if (admin) this.enableAdmin(); 
  }

  connect(peerContexts :PeerContext[], password? :string) {
    let context = peerContexts[0];
    let userId = Network.peerContext ? Network.peerContext.userId : PeerContext.generateId();
    Network.open(userId, context.roomId, context.roomName, password);
    PeerCursor.myCursor.peerId = Network.peerId;

    let triedPeer: string[] = [];
    EventSystem.register(triedPeer)
      .on('OPEN_NETWORK', event => {
        EventSystem.unregister(triedPeer);
        ObjectStore.instance.clearDeleteHistory();
        for (let context of peerContexts) {
          Network.connect(context.peerId);
        }
        EventSystem.register(triedPeer)
          .on('CONNECT_PEER', event => {
            console.log('接続成功！', event.data.peerId);
            triedPeer.push(event.data.peerId);
            console.log('接続成功 ' + triedPeer.length + '/' + peerContexts.length);
            this.roomState = RoomState.PLAYER_SELECT;
            if (peerContexts.length <= triedPeer.length) {
              this.resetNetwork();
              EventSystem.unregister(triedPeer);
            }
          })
          .on('DISCONNECT_PEER', event => {
            console.warn('接続失敗', event.data.peerId);
            triedPeer.push(event.data.peerId);
            console.warn('接続失敗 ' + triedPeer.length + '/' + peerContexts.length);
            if (peerContexts.length <= triedPeer.length) {
              this.resetNetwork();
              EventSystem.unregister(triedPeer);
            }
          });
      });
  }

  resetNetwork() {
    if (Network.peerContexts.length < 1) {
      Network.open();
      PeerCursor.myCursor.peerId = Network.peerId;
    }
  }

  //部屋の読み込み
  loadRoom(roomData :RoomAdmin) {
    let dataHasPlayer:boolean = false;
    for (let data of roomData.children) {
      if (data instanceof RoomAdmin) {
        RoomAdmin.setting.chatTab = data.chatTab;
        RoomAdmin.setting.cardLog = data.cardLog;
        RoomAdmin.setting.diceLog = data.diceLog;
      }
      else if (data instanceof Player){
        dataHasPlayer = true;
        let player = new Player();
        player.initialize();
        for (let key in data) {
          if (key === 'identifier') continue;
          if (key === 'paletteList' || key === 'peerIdentifier') continue;
          if (key === 'authType') {
            player.setAttribute(key, Number(data[key]));
          }
          if (data[key] == null || data[key] === '') continue;
          else {
            player.setAttribute(key, data[key]);
          }
        }
        RoomAdmin.instance.appendChild(player);
      }
    }
    roomData.destroy;
    //if (dataHasPlayer) EventSystem.call('PLAYER_LOADED',null)
  }

}
