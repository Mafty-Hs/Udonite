import { Component, OnDestroy, OnInit ,Input ,Output ,EventEmitter} from '@angular/core';

import { PeerContext } from '@udonarium/core/system/network/peer-context';
import { EventSystem, Network } from '@udonarium/core/system';
import { FileArchiver } from '@udonarium/core/file-storage/file-archiver';
import { DiceBotService } from 'service/dice-bot.service';
import { RoomService , RoomState } from 'service/room.service';

@Component({
  selector: 'room-setting',
  templateUrl: './room-setting.component.html',
  styleUrls: ['./room-setting.component.css']
})
export class RoomSettingComponent implements OnInit, OnDestroy {
  peers: PeerContext[] = [];
  isReloading: boolean = false;

  close() {
    this.roomService.roomState = RoomState.LOBBY;
  }

  roomName: string = 'ふつうの部屋';
  password: string = '';
  isPrivate: boolean = false;

  roomAdmin:boolean = false;
  roomFile:FileList;

  get peerId(): string { return Network.peerId; }
  get isConnected(): boolean { return Network.peerIds.length <= 1 ? false : true; }
  validateLength: boolean = false;

  get diceBotInfos() { return this.diceBotService.diceBotInfos }
  get diceBotInfosIndexed() { return this.diceBotService.diceBotInfosIndexed }

  constructor(
    private diceBotService: DiceBotService,
    private roomService: RoomService,
  ) { }

  ngOnInit() {
    EventSystem.register(this);
    this.calcPeerId(this.roomName, this.password);
  }

  ngOnDestroy() {
    EventSystem.unregister(this);
  }

  calcPeerId(roomName: string, password: string) {
    let userId = Network.peerContext ? Network.peerContext.userId : PeerContext.generateId();
    let context = PeerContext.create(userId, PeerContext.generateId('***'), roomName, password);
    this.validateLength = context.peerId.length < 64 ? true : false;
  }

  createRoom() {
    if (this.roomFile) {
      FileArchiver.instance.load(this.roomFile);
      this.roomFile = null;
    }
    this.roomService.create(this.roomName, this.password, this.roomAdmin);
    this.roomService.roomState = RoomState.PLAYER_SELECT;
  }

  handleFileSelect(event :Event) {
    let input = <HTMLInputElement>event.target;
    if (input.files.length) this.roomFile = input.files;
  }
}
