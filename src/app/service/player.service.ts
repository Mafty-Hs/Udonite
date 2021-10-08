import { Injectable } from '@angular/core';
import { PeerCursor } from '@udonarium/peer-cursor';
import { PeerContext } from '@udonarium/core/system/network/peer-context';
import { ChatPalette } from '@udonarium/chat-palette';
import { ObjectStore } from '@udonarium/core/synchronize-object/object-store';

@Injectable({
  providedIn: 'root'
})
export class PlayerService {
  //最終的にはプレイヤークラスを作ってそこで管理すべき
  localpalette: ChatPalette;
  paletteList: string[] = [];
  myPalette = null;

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
        name: (peer ? peer.name : ''),
        color: (peer ? peer.color : PeerCursor.CHAT_TRANSPARENT_COLOR),
      };
  }


  constructor() {
    this.localpalette =  new ChatPalette('LocalPalette');
  }
}
