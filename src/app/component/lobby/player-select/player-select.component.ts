import { Component, OnInit, AfterViewInit } from '@angular/core';
import { ImageFile } from '@udonarium/core/file-storage/image-file';
import { ObjectStore } from '@udonarium/core/synchronize-object/object-store';
import { Player , AuthType} from '@udonarium/player';
import { PeerCursor } from '@udonarium/peer-cursor';
import { RoomService , RoomState } from 'service/room.service';
import { PlayerService } from 'service/player.service';
import { ImageStorage } from '@udonarium/core/file-storage/image-storage';
import { FileArchiver } from '@udonarium/core/file-storage/file-archiver';
import { FileReaderUtil } from '@udonarium/core/file-storage/file-reader-util';
import { IONetwork } from '@udonarium/core/system';

@Component({
  selector: 'player-select',
  templateUrl: './player-select.component.html',
  styleUrls: ['../lobby.content.css']
})
export class PlayerSelectComponent implements OnInit, AfterViewInit {
  playerType :string = 'NEW';
  selectedPlayer :string = "";
  _playerName: string = (window.localStorage && localStorage.getItem(this.playerService.CHAT_MY_NAME_LOCAL_STORAGE_KEY)) ?
    localStorage.getItem(this.playerService.CHAT_MY_NAME_LOCAL_STORAGE_KEY) :
    "プレイヤー" ;
  _color: string = (window.localStorage && localStorage.getItem(this.playerService.CHAT_MY_COLOR_LOCAL_STORAGE_KEY)) ?
    localStorage.getItem(this.playerService.CHAT_MY_COLOR_LOCAL_STORAGE_KEY) :
    this.playerService.CHAT_WHITETEXT_COLOR ;
  imageFileChange:boolean = false;
  imageFile:File = null;
  imageBlob:string = "./assets/images/ic_account_circle_black_24dp_2x.png";
  password :string = '';
  savePW :boolean = false;
  getPlayer(identifier :string):Player {
   let player = ObjectStore.instance.get(identifier)
   if (player instanceof Player) return player;
   return null;
  }

  get playerName(): string {
    return this._playerName;
  }
  set playerName(playerName: string) {
    if (window.localStorage) {
      localStorage.setItem(this.playerService.CHAT_MY_NAME_LOCAL_STORAGE_KEY, playerName);
    }
    this._playerName = playerName;
  }

  get color(): string {
    return this._color;
  }
  set color(color: string) {
    this._color = color;
    if (window.localStorage) {
      localStorage.setItem(this.playerService.CHAT_MY_COLOR_LOCAL_STORAGE_KEY, color);
    }
  }

  get allPlayers():Player[] {
    return ObjectStore.instance.getObjects<Player>(Player);
  }

  get canLogin() :boolean {
    if (this.playerType == 'NEW') return true;
    if (this.selectedPlayer) {
      if (!this.needAuth) return true;
      return (this.authSuccess)
    }
    return false;
  }

  get needAuth() :boolean {
    return (this.selectedPlayer && this.getPlayer(this.selectedPlayer).authType != AuthType.NONE) ;
  }

  get authSuccess() :boolean {
    return  (this.getPlayer(this.selectedPlayer).password == this.roomService.getHash(this.password)) ;
  }

  constructor(
    private roomService: RoomService,
    private playerService: PlayerService
  ) { }

  ngOnInit(): void {
    if (window.localStorage && localStorage.getItem(this.playerService.KEY_PHRASE_LOCAL_STORAGE_KEY))
      this.password = localStorage.getItem(this.playerService.KEY_PHRASE_LOCAL_STORAGE_KEY);
    if ((window.localStorage && this.allPlayers.find(player => player.identifier == localStorage.getItem(this.playerService.PLAYER_LOCAL_STORAGE_KEY)))) {
      this.selectedPlayer = localStorage.getItem(this.playerService.PLAYER_LOCAL_STORAGE_KEY);
      this.playerType = "SAVE";
    }
  }

  ngAfterViewInit(): void {
  }

  async changeIcon(event :Event) {
    let input = <HTMLInputElement>event.target;
    if (this.roomService.roomAdmin.disableImageLoad) return;
    if (!input.files.length) return ;
    if (FileArchiver.instance.maxImageSize < input.files[0].size) return;
    this.imageFile = input.files[0];
    this.imageBlob = window.URL.createObjectURL(this.imageFile) ;
    this.imageFileChange = true;
  }

  async setImage() {
    let hash:string =  await FileReaderUtil.calcSHA256Async(this.imageFile)
    await FileArchiver.instance.load([this.imageFile]);
    if (!hash) return "none_icon";
    return hash
  }

  async login() {
    PeerCursor.myCursor = new PeerCursor;
    let context = {peerId: IONetwork.peerId ,playerIdentifier: ""};
    if (this.playerType == 'NEW') {
      this.playerService.myPlayer = this.playerService.playerCreate(this.playerName,this.color,"none_icon");
      if (this.password.length > 0) {
        this.playerService.myPlayer.authType = AuthType.PASSWORD;
        this.playerService.myPlayer.password = this.roomService.getHash(this.password);
        if (this.savePW) {
          localStorage.setItem(this.playerService.KEY_PHRASE_LOCAL_STORAGE_KEY, this.password);
        }
      }
      if (this.roomService.createRoom) {
        this.roomService.roomAdmin.adminPlayer = [this.playerService.myPlayer.playerId];
      }
    }
    else if (this.playerType == 'SAVE') {
      this.playerService.myPlayer = this.getPlayer(this.selectedPlayer);
    }
    context.playerIdentifier =  this.playerService.myPlayer.identifier;
    PeerCursor.myCursor.context = context;
    if (this.playerType == 'NEW')  this.playerService.myPlayer.imageIdentifier = this.imageFileChange ? await this.setImage() : "none_icon";
    localStorage.setItem(this.playerService.PLAYER_LOCAL_STORAGE_KEY, this.playerService.myPlayer.identifier);
    if (this.roomService.roomFile) {
      this.roomService.roomState = RoomState.ROOM_LOAD;
    }
    else {
      this.roomService.roomState = RoomState.PLAY;
    }
  }

}
