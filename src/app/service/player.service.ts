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
  //パレットバインダー
  //最終的にはプレイヤークラスを作ってそこで管理すべき
  myPlayer:Player;
  localpalette: ChatPalette;
  _paletteList: string[] = [];
  myPalette = null;
  
  get paletteList() {
    return this._paletteList;
  }
  set paletteList(paletteList :string[]) {
    this._paletteList = paletteList;
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
    player.name = "プレイヤー";
    player.color = Player.CHAT_DEFAULT_COLOR;
    player.imageIdentifier = imageIdentifier;
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
      && this.myPlayer.color
      && this.myPlayer.color != Player.CHAT_TRANSPARENT_COLOR) {
      return this.myPlayer.color;
    }
    return Player.CHAT_DEFAULT_COLOR;
  }

  get myPeer(): PeerCursor { return PeerCursor.myCursor; }
  get otherPeers(): PeerCursor[] { return ObjectStore.instance.getObjects(PeerCursor); }
  getPeer(identifier :string): PeerCursor {
    let object = ObjectStore.instance.get(identifier);
    if (object instanceof PeerCursor) {
      return object as PeerCursor;
    }
    return null;
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
        color: (peer ? peer.player.color : PeerCursor.CHAT_TRANSPARENT_COLOR),
      };
  }


  constructor() {
    this.localpalette =  new ChatPalette('LocalPalette');
  }
}
