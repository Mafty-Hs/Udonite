import { Component, OnDestroy, OnInit,ChangeDetectorRef } from '@angular/core';
import { EventSystem, IONetwork } from '@udonarium/core/system';
import { RoomService , RoomState } from 'service/room.service';
import { RoomList } from '@udonarium/core/system/socketio/netowrkContext';
import { timeStamp } from 'console';

@Component({
  selector: 'lobby',
  templateUrl: './lobby.component.html',
  styleUrls: ['./lobby.component.css'],
})
export class LobbyComponent implements OnInit, OnDestroy {
  rooms: RoomList[] = [];

  width:number = 550;
  height:number = 600;

  selectNo: number = NaN;
  lobbyTabStartIndex: number = 0;

  isReloading: boolean = false;
  isConnecting: boolean = true;
  isError:boolean = false;
  room:RoomList;
  deleteMode:boolean = false;

  help: string = '';

  get peerId(): string { return IONetwork.peerId; }

  get indexedRoomList():RoomList[] {
    let rooms: RoomList[] = [];
    for (let index = this.lobbyTabStartIndex;
      index < this.lobbyTabStartIndex + this.roomPerPage;
      index++ ) {
      let room:RoomList = this.rooms.find(room => room.roomNo == index);
      if (!room) {
        room = {roomNo : index}
      }
      rooms.push(room);
    }
    return rooms;
  }

  constructor(
    public roomService: RoomService
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
    EventSystem.register(this)
      .on('LOBBY_ERROR', event => {
        this.onError(event.data);
      });
  }

  ngOnDestroy() {
    EventSystem.unregister(this);
  }

  ready() {
    this.reload();
  }

  tabChange(index :number) {
    this.lobbyTabStartIndex = Number(index);
  }

  get indexes():lobbyindex[] {
    let _indexes:lobbyindex[] = [];
    if (!this.maxRoomCount) return []
    if (this.roomPerPage >= this.maxRoomCount) {
      return [{index: 0, name: '0-' + this.maxRoomCount }] as lobbyindex[];
    }
    let max = this.maxRoomCount;
    let page = this.roomPerPage;
     for (let i = 0;
      i < max;
      i = i + page ) {
      let name:string = this.zeroPadding(i) + '-' + this.zeroPadding(i + page - 1);
      let _index:lobbyindex = {index: i,name:  name}
      _indexes.push(_index);
    }
    let mod = this.maxRoomCount % this.roomPerPage;
    if (mod)
    {
      let lastindex = this.maxRoomCount - mod - 1;
      let _index:lobbyindex = {index: lastindex ,name: this.zeroPadding(lastindex) + '-' + this.zeroPadding( this.maxRoomCount - 1) }
      _indexes.push(_index);
    }
    return _indexes
  }

  get numberDigit():number {
    return String((this.maxRoomCount - 1)).length;
  }

  zeroPadding(num :number) :string{
    let zero:string = '0'.repeat(this.numberDigit);
	  return (zero + num).slice(-1 * this.numberDigit);
  }

  get maxRoomCount():number {
    return IONetwork.server ? IONetwork.server.maxRoomCount : 0
  }

  get roomPerPage():number {
    return IONetwork.server ? IONetwork.server.roomPerPage : 10
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
    this.isError = false;
    this.help = '';
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
    this.roomService.connect(room.roomId);
  }

  delete(room :RoomList) {
    if (confirm(room.roomName + 'を削除します。削除したら復活できません。\nよろしいですか？')) {
      if (room.password) {
        this.room = room;
        this.deleteMode = true;
        this.roomService.roomState = RoomState.PASSWORD;
        return;
      }
      this.roomService.delete(room.roomId,"");
    }
    this.reload();
  }

  create(roomNo: number) {
    this.selectNo = roomNo;
    this.roomService.roomState = RoomState.CREATE;
  }

  onError(eventString :string) {
    if (!this.roomService.isLobby) return;
    this.help = eventString;
    this.roomService.roomState = RoomState.LOBBY;
    this.isError = true;
  }
}

interface lobbyindex {
  index: number;
  name: string;
}
