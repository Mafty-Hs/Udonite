import { Injectable } from '@angular/core';
import { ImageFile } from '@udonarium/core/file-storage/image-file';
import { PeerCursor } from '@udonarium/peer-cursor';
import { generateId } from '@udonarium/core/system/util/generateId';
import { Player } from '@udonarium/player';
import { RoomAdmin } from '@udonarium/room-admin';
import { ChatPalette } from '@udonarium/chat-palette';
import { ObjectStore } from '@udonarium/core/synchronize-object/object-store';
import { EventSystem, IONetwork } from '@udonarium/core/system';
import { Color } from 'three';

@Injectable({
  providedIn: 'root'
})
export class PlayerService {
  //定義
  CHAT_MY_NAME_LOCAL_STORAGE_KEY = 'udonanaumu-chat-my-name-local-storage';
  CHAT_MY_COLOR_LOCAL_STORAGE_KEY = 'udonanaumu-chat-my-color-local-storage';
  KEY_PHRASE_LOCAL_STORAGE_KEY = 'kake-udon-keyphrase-local-storage';
  
  CHAT_WHITETEXT_COLOR = Player.CHAT_WHITETEXT_COLOR;
  CHAT_BLACKTEXT_COLOR = Player.CHAT_BLACKTEXT_COLOR;
  
  myPlayer:Player;
  peerCursors:PeerCursor[] = [];
  
  //プレイヤーパレット
  localpalette: ChatPalette;
  myPalette = null;
  
  get paletteList() {
    return this.myPlayer.paletteList;
  }
  set paletteList(paletteList :string[]) {
    this.myPlayer.paletteList = paletteList;
  }

  addList(identifier: string) {
    if (this.checkList(identifier)) { return }
    this.paletteList.push(identifier);
  }

  removeList(identifier: string) {
    if (identifier == this.myPlayer.playerId) {return}
    const index = this.paletteList.indexOf(identifier);
    if (index > -1) {
      this.paletteList.splice(index, 1);
    }
  }

  checkList(identifier: string):boolean {     
    if (this.paletteList.indexOf(identifier) >= 0) { return true } 
    return false; 
  }
  playerCreate(playerName :string, color :string ,imageIdentifier :string) {
    let player = new Player();
    player.initialize();
    player.isInitial = true;
    player.name =  playerName;
    player.color = color;
    player.imageIdentifier = imageIdentifier;
    player.playerId = generateId();
    this.refleshPeers();
    return player;
  }


  //ユーザー管理

  get myImage():ImageFile {
    if (this.myPlayer
      && this.myPlayer.image
      && this.myPlayer.image.url.length > 0) {
      return this.myPlayer.image;
    }  
    return ImageFile.Empty;
  }

  get myColor():string {
    if (this.myPlayer
      && this.myPlayer.color) {
      return this.myPlayer.color;
    }
    return this.CHAT_WHITETEXT_COLOR;
  }

  get myPeer(): PeerCursor { return PeerCursor.myCursor; }
  get otherPeers(): PeerCursor[] { return this.peerCursors; }

  get otherPlayers(): Player[] {
    return this.otherPeers.map(peer => {
      if (peer.player) return peer.player;
    });
  }

  findByPeerId(peerId :string): PeerCursor {
    return this.otherPeers.find(peer => 
      peer.peerId == peerId
    );
  }

  getPlayerById(playerId :string): Player {
    let players = ObjectStore.instance.getObjects<Player>(Player)
    return players.find( player => 
      player.playerId === playerId
    );
  }

  getPeerByPlayer(playerId:string): string {
    return this.otherPeers.find(peer => peer.player.playerId == playerId).peerId
  }

  findPeerNameAndColor(peerId: string):{ name: string, color: string } {
    let peer = this.findByPeerId(peerId);
      return {
        name: (peer ? peer.player.name : ''),
        color: (peer ? peer.player.color : this.CHAT_WHITETEXT_COLOR),
      };
  }

  refleshPeers() {
    IONetwork.otherPeers().then(peers => {
      let newCursors:PeerCursor[] = [];
      for (let context of peers) {
        let newPeer = new PeerCursor;
        newPeer._context = context;
        if (newPeer.playerIdentifier) newPeer.player;
        newCursors.push(newPeer);
      }
      this.peerCursors = newCursors;
    })
  }

  constructor() {
    this.localpalette =  new ChatPalette('LocalPalette');
    EventSystem.register(this)
    .on('NEED_UPDATE', event => {
      PeerCursor.myCursor.context = {peerId: IONetwork.peerId ,playerIdentifier: PeerCursor.myCursor.playerIdentifier};
    });
  }
}
