import { Component, OnDestroy, OnInit} from '@angular/core';
import { DiceBotService } from 'service/dice-bot.service';
import { RoomService , RoomState } from 'service/room.service';

@Component({
  selector: 'room-setting',
  templateUrl: './room-setting.component.html',
  styleUrls: ['./room-setting.component.css']
})
export class RoomSettingComponent implements OnInit, OnDestroy {

  close() {
    this.roomService.roomState = RoomState.LOBBY;
  }

  roomName: string = 'ふつうの部屋';
  password: string = '';
  isPrivate: boolean = false;

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

  createRoom() {
    if (this.roomFile) {
      this.roomService.roomFile = this.roomFile; 
      this.roomFile = null;
    }
    this.roomService.create(this.roomName, this.password);
    this.roomService.roomState = RoomState.DATA_SYNC;
  }

  handleFileSelect(event :Event) {
    let input = <HTMLInputElement>event.target;
    if (input.files.length) this.roomFile = input.files;
  }
}
