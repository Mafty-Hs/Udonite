import { Injectable } from '@angular/core';
import { ImageFile } from '@udonarium/core/file-storage/image-file';
import { PeerCursor } from '@udonarium/peer-cursor';
import { PeerContext } from '@udonarium/core/system/network/peer-context';
import { Player } from '@udonarium/player';
import { RoomAdmin } from '@udonarium/room-admin';
import { ChatPalette } from '@udonarium/chat-palette';
import { ObjectStore } from '@udonarium/core/synchronize-object/object-store';

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
    if (identifier == this.myPeer.identifier) {return}
    const index = this.paletteList.indexOf(identifier);
    if (index > -1) {
      this.paletteList.splice(index, 1);
    }
  }

  checkList(identifier: string):boolean {     
    if (this.paletteList.indexOf(identifier) >= 0) { return true } 
    return false; 
  }

  playerCreate(imageIdentifier :string) {
    let player = new Player();
    player.initialize();
    player.isInitial = true;
    player.name =  (window.localStorage && localStorage.getItem(this.CHAT_MY_NAME_LOCAL_STORAGE_KEY)) ?
      localStorage.getItem(this.CHAT_MY_NAME_LOCAL_STORAGE_KEY) :
      "プレイヤー" ;
    player.color = (window.localStorage && localStorage.getItem(this.CHAT_MY_COLOR_LOCAL_STORAGE_KEY)) ?
      localStorage.getItem(this.CHAT_MY_COLOR_LOCAL_STORAGE_KEY) :
      this.CHAT_WHITETEXT_COLOR ;
    player.imageIdentifier = imageIdentifier;
    player.playerId = PeerContext.generateId();
    RoomAdmin.instance.appendChild(player);
    PeerCursor.createMyCursor(player.identifier);
    this.myPlayer = player;
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
  get myPeerIdentifier(): string { return this.myPeer.identifier; }
  get otherPeers(): PeerCursor[] { return ObjectStore.instance.getObjects(PeerCursor); }

  get otherPlayers(): Player[] {
    return this.otherPeers.map(peer => {
      return peer.player;
    });
  }

  getPeer(identifier :string): PeerCursor {
    let object = ObjectStore.instance.get(identifier);
    if (object instanceof PeerCursor) {
      return object as PeerCursor;
    }
    return null;
  }
 
  getPlayerById(playerId :string): Player {
    return this.otherPeers.find( peer => 
      peer.player.playerId === playerId
    ).player;
  }

  getPeerId(identifier :string): string {
    let peer = this.getPeer(identifier);
    if (peer) {
      let peerContext = PeerContext.parse(peer.peerId);
      return peerContext.peerId;
    }
    return null;
  }

  findPeerNameAndColor(peerId: string):{ name: string, color: string } {
    let peer = PeerCursor.findByPeerId(peerId);
      return {
        name: (peer ? peer.player.name : ''),
        color: (peer ? peer.player.color : this.CHAT_WHITETEXT_COLOR),
      };
  }


  constructor() {
    this.localpalette =  new ChatPalette('LocalPalette');
  }
}
