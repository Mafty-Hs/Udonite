import { Component, OnDestroy, OnInit,ChangeDetectorRef } from '@angular/core';
import { EventSystem, IONetwork } from '@udonarium/core/system';
import { RoomService , RoomState } from 'service/room.service';
import { RoomList } from '@udonarium/core/system/socketio/netowrkContext';

@Component({
  selector: 'lobby',
  templateUrl: './lobby.component.html',
  styleUrls: ['./lobby.component.css'],
})
export class LobbyComponent implements OnInit, OnDestroy {
  rooms: RoomList[] = [];

  width:number = 550;
  height:number = 600;

  isReloading: boolean = false;
  isConnecting: boolean = true;
  room:RoomList;
  deleteMode:boolean = false;

  help: string = '「一覧を更新」ボタンを押すと接続可能なルーム一覧を表示します。';

  get peerId(): string { return IONetwork.peerId; }

  constructor(
    public roomService: RoomService,
    private changeDetectorRef: ChangeDetectorRef
  ) {
    EventSystem.register(this)
      .on('OPEN_NETWORK', event => {
        this.isConnecting = false;
        this.reload();
        setTimeout(() => {
          this.ready();
        }, 1000);
      });
   if (window.innerWidth < 550) { this.width = window.innerWidth }
   if (window.innerHeight < 600) { this.height = window.innerHeight }
  }

  ngOnInit() {
  }

  ngOnDestroy() {
    EventSystem.unregister(this);
  }

  ready() {
    this.reload();
  }

  get maxRoomCount():number {
    return IONetwork.server ? IONetwork.server.maxRoomCount : 0
  }
  get roomCount():number {
    return this.rooms.length
  }

  get reachRooms():boolean {
    if (IONetwork.server) return (this.maxRoomCount <= this.roomCount)
    return true;
  }

  dateString(unixtime: number):string {
    let date = new Date(unixtime * 1000);
    return date.toLocaleDateString('ja-JP').slice(5) +  " " + date.toLocaleTimeString('ja-JP')
  }

  async reload() {
    this.isReloading = true;
    this.rooms = [];
    this.rooms = await this.roomService.roomList();
    this.isReloading = false;
  }

  connect(room :RoomList) {
    if (room.password) {
      this.room = room;
      this.roomService.roomState = RoomState.PASSWORD;
      return;
    }
    this.roomService.connect(room.roomId,"");
  }

  delete(room :RoomList) {
    if (room.password) {
      this.room = room;
      this.deleteMode = true;
      this.roomService.roomState = RoomState.PASSWORD;
      return;
    }
    this.roomService.delete(room.roomId,"");
    this.reload();
  }

  showRoomSetting() {
    this.roomService.roomState = RoomState.CREATE;
  }
}
