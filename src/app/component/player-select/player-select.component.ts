import { Component, OnInit, AfterViewInit } from '@angular/core';
import { ImageFile } from '@udonarium/core/file-storage/image-file';
import { ImageStorage } from '@udonarium/core/file-storage/image-storage';
import { ObjectStore } from '@udonarium/core/synchronize-object/object-store';
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
  playerType :string = 'NEW';
  myPlayer :Player = this.playerService.myPlayer;
  selectedPlayer :string = this.myPlayer.identifier;
  password :string = '';
  savePW :boolean = false;
  get image() :ImageFile {
    return this.myPlayer.image;
  }
  getPlayer(identifier :string):Player {
   let player = ObjectStore.instance.get(identifier)
   if (player instanceof Player) return player;
   return null;
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

  get needAuth() :boolean {
    return (this.getPlayer(this.selectedPlayer).authType == AuthType.PASSWORD);
  }

  get authSuccess() :boolean {
    if (this.getPlayer(this.selectedPlayer).authType != AuthType.PASSWORD) return true;
    if (this.getPlayer(this.selectedPlayer).password == this.roomService.getHash(this.password)) return true;
    return false;
  }

  get canConnect():boolean {
    if (this.playerType == 'SAVE') {
      if (this.selectedPlayer == this.myPlayer.identifier) return false;
      return this.authSuccess;
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
    if (this.playerType == 'NEW') {
      if (this.password.length > 0) {
        this.playerService.myPlayer.authType = AuthType.PASSWORD;
        this.playerService.myPlayer.password = this.roomService.getHash(this.password);
        if (this.savePW) {
          localStorage.setItem(this.playerService.KEY_PHRASE_LOCAL_STORAGE_KEY, this.password);
        }
      }
    }
    else if (this.playerType == 'SAVE') {
      this.playerService.myPlayer = this.getPlayer(this.selectedPlayer);
      PeerCursor.myCursor.playerIdentifier = this.selectedPlayer;
      PeerCursor.myCursor.needUpdate = true;
      PeerCursor.myCursor.player.peerIdentifier = PeerCursor.myCursor.identifier;
      if (this.myPlayer.isInitial) this.myPlayer.destroy();
    }
    this.roomService.roomState = RoomState.PLAY;
  }

}
