import { Component, OnInit, AfterViewInit } from '@angular/core';
import { ImageFile } from '@udonarium/core/file-storage/image-file';
import { ImageStorage } from '@udonarium/core/file-storage/image-storage';
import { Player , AuthType} from '@udonarium/player';
import { PeerCursor } from '@udonarium/peer-cursor';
import { RoomService , RoomState } from 'service/room.service';
import { PlayerService } from 'service/player.service';

@Component({
  selector: 'player-select',
  templateUrl: './player-select.component.html',
  styleUrls: ['./player-select.component.css']
})
export class PlayerSelectComponent implements OnInit, AfterViewInit {

  playerType :PlayerType = PlayerType.NEW_PLAYER;
  myPlayer :Player = this.playerService.myPlayer;
  selectedPlayer :Player;
  password :string = '';
  savePW :boolean = false;
  get image() :ImageFile {
    return this.myPlayer.image;
  }

  get myName(): string {
    return this.playerService.myPlayer.name;
  }
  set myName(name: string) {
    if (window.localStorage) {
      localStorage.setItem(this.playerService.CHAT_MY_NAME_LOCAL_STORAGE_KEY, name);
    }
    this.playerService.myPlayer.name = name;
  }

  get myColor(): string {
    return this.playerService.myPlayer.color;
  }
  set myColor(color: string) {
    this.playerService.myPlayer.color = color;
    if (window.localStorage) {
      localStorage.setItem(this.playerService.CHAT_MY_COLOR_LOCAL_STORAGE_KEY, this.playerService.myPlayer.color);
    }
  }

  get allPlayers():Player[] {
    return this.roomService.allPlayers
  }

  get canConnect():boolean {
    if (this.playerType === PlayerType.SAVED_PLAYER) {
      if (!this.selectedPlayer) return false;
      if (this.selectedPlayer.authType == AuthType.PASSWORD && this.selectedPlayer.password !== this.roomService.getHash(this.password)) return false;
    }
    return true;
  }

  constructor(
    private roomService: RoomService,
    private playerService: PlayerService
  ) { }

  ngOnInit(): void {
    if (window.localStorage && localStorage.getItem(this.playerService.KEY_PHRASE_LOCAL_STORAGE_KEY))
    this.password = localStorage.getItem(this.playerService.KEY_PHRASE_LOCAL_STORAGE_KEY);
  }

  ngAfterViewInit(): void {     
  }

  async changeIcon(event :Event) {
    let input = <HTMLInputElement>event.target;
    if (!input.files.length) return ;
    let file = await 
      ImageStorage.instance.addAsync(input.files.item(0));
    if (file) this.playerService.myPlayer.imageIdentifier = file.identifier;   
  }

  login() {
    if (this.playerType == PlayerType.NEW_PLAYER) {
      if (this.password.length > 0) {
        this.playerService.myPlayer.authType = AuthType.PASSWORD;
        this.playerService.myPlayer.password = this.roomService.getHash(this.password);
        if (this.savePW) {
          localStorage.setItem(this.playerService.KEY_PHRASE_LOCAL_STORAGE_KEY, this.password);
        }
      }
    }
    else if (this.playerType == PlayerType.SAVED_PLAYER) {
      this.playerService.myPlayer = this.selectedPlayer;
      PeerCursor.myCursor.playerIdentifier = this.selectedPlayer.identifier;
      PeerCursor.myCursor.needUpdate = true;
      PeerCursor.myCursor.player.peerIdentifier = PeerCursor.myCursor.identifier;
      this.myPlayer.destroy();
    }
    this.roomService.roomState = RoomState.PLAY;
  }

}

const PlayerType = {
  NEW_PLAYER: 1,
  SAVED_PLAYER: 2
} as const;
type PlayerType = typeof PlayerType[keyof typeof PlayerType]; 