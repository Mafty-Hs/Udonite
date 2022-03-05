import { Injectable } from '@angular/core';
import { RoomAdmin ,RoomControl} from '@udonarium/room-admin';
import { EventSystem, IONetwork } from '@udonarium/core/system';

import { PlayerService } from 'service/player.service';
import * as SHA256 from 'crypto-js/sha256';
import { Player } from '@udonarium/player';
import { RoomContext, RoomList } from '@udonarium/core/system/socketio/netowrkContext';

export const RoomState = {
  LOBBY: 0,
  PASSWORD: 1,
  CREATE: 2,
  DATA_SYNC: 3,
  PLAYER_SELECT: 4,
  ROOM_LOAD: 5,
  PLAY: 6
} as const;
export type RoomState = typeof RoomState[keyof typeof RoomState];

@Injectable({
  providedIn: 'root'
})
export class RoomService {

  roomState:RoomState = RoomState.LOBBY;
  get isLobby():boolean {
    return (this.roomState != RoomState.PLAY)
  }
  roomFile :FileList;
  roomData :RoomList;
  createRoom :boolean = false;
  gameType :string = "";


  constructor(
    private playerService: PlayerService,
  ) {
   }

  //権限管理

  getHash(password: string) {
    return SHA256(password).toString();
  }

  enableAdmin() {
    this.roomAdmin.adminPlayer.push(this.playerService.myPlayer.playerId);
  }

  get roomAdmin():RoomControl {
    return RoomAdmin.setting;
  }

  get adminAuth():boolean {
    return RoomAdmin.auth;
  }

  get disableRoomLoad():boolean {
     return this.roomAdmin.disableRoomLoad as boolean;
  }

  get disableObjectLoad():boolean {
    if  (this.adminAuth) return false;
    return this.roomAdmin.disableObjectLoad as boolean;
  }

  get disableTabletopLoad():boolean {
    if  (this.adminAuth) return false;
    return this.roomAdmin.disableTabletopLoad as boolean;
  }

  get disableImageLoad():boolean {
    if  (this.adminAuth) return false;
    return this.roomAdmin.disableImageLoad as boolean;
  }

  get disableAudioLoad():boolean {
    if  (this.adminAuth) return false;
    return this.roomAdmin.disableAudioLoad as boolean;
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

   //ロビー

  async roomList() {
    let list = await IONetwork.listRoom()
    return list.sort((a, b) => {
      return (a.roomNo < b.roomNo) ? -1 : 1;
    });
  }

  async create(roomNo: number ,roomName: string ,password: string ,is2d :boolean) {
    let roomList = await this.roomList()
    if (roomList.find(list => list.roomNo === roomNo)) {
      EventSystem.trigger('LOBBY_ERROR','そのルーム番号は他の誰かに使われてしまいました')
      return;
    }
    let room:RoomContext = {
      roomNo: roomNo,
      roomName: roomName,
      password: password,
      isOpen: true,
      is2d: is2d
    }
    IONetwork.create(room);
    this.createRoom = true;
  }

  async connect(roomId :string) {
    let roomList = await this.roomList()
    if (!roomList.find(list => list.roomId === roomId)) {
      EventSystem.trigger('LOBBY_ERROR','ルームが存在しません')
      return;
    }
    IONetwork.join(roomId);
    this.roomState = RoomState.DATA_SYNC;
  }

  delete(roomId :string, password? :string) {
    IONetwork.remove(roomId)
    this.roomState = RoomState.LOBBY;
  }
}
