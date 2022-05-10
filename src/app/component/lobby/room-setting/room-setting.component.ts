import { Component, Input, OnDestroy, OnInit} from '@angular/core';
import { EventSystem, IONetwork } from '@udonarium/core/system';
import { DiceBotService } from 'service/dice-bot.service';
import { RoomService , RoomState } from 'service/room.service';

@Component({
  selector: 'room-setting',
  templateUrl: './room-setting.component.html',
  styleUrls: ['../lobby.content.css','./room-setting.component.css']
})
export class RoomSettingComponent implements OnInit, OnDestroy {

  @Input() roomNo: number = NaN;
  close() {
    this.roomService.roomState = RoomState.LOBBY;
  }

  roomName: string = 'ふつうの部屋';
  password: string = '';
  isPrivate: boolean = false;
  is2d:boolean = false;

  roomFile:FileList;


  get diceBotInfos() { return this.diceBotService.diceBotInfos }
  get diceBotInfosIndexed() { return this.diceBotService.diceBotInfosIndexed }

  constructor(
    private diceBotService: DiceBotService,
    private roomService: RoomService,
  ) { }

  ngOnInit() {
  }

  ngOnDestroy() {
  }

  async createRoom() {
    if (isNaN(this.roomNo)) {
      EventSystem.trigger('LOBBY_ERROR','ルーム番号が不正です')
      return;
    }
    if ((await this.roomService.roomList()).length >= IONetwork.server.maxRoomCount) {
      this.roomFile = null;
      this.close();
    }
    if (this.roomFile) {
      this.roomService.roomFile = this.roomFile;
      this.roomFile = null;
    }
    this.roomService.create(this.roomNo ,this.roomName, this.password, this.is2d);
    this.roomService.roomState = RoomState.DATA_SYNC;
  }

  handleFileSelect(event :Event) {
    let input = <HTMLInputElement>event.target;
    if (input.files.length) this.roomFile = input.files;
  }
}
