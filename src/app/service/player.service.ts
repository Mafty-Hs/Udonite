import { Injectable } from '@angular/core';
import { PeerCursor } from '@udonarium/peer-cursor';
import { PeerContext } from '@udonarium/core/system/network/peer-context';
import { RoomAdmin } from '@udonarium/room-admin';
import { ChatPalette } from '@udonarium/chat-palette';
import { ObjectStore } from '@udonarium/core/synchronize-object/object-store';
import * as SHA256 from 'crypto-js/sha256';

@Injectable({
  providedIn: 'root'
})
export class PlayerService {
  //パレットバインダー
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

  //権限管理 将来的にこれも独立したほうがいいかも

  getHash(password: string) {
    return SHA256(password).toString();
  }

  enableAdmin(text :string) {
    RoomAdmin.instance.adminPassword = this.getHash(text);
    RoomAdmin.instance.adminPeers.push(this.myPeer.identifier);
  }

  adminPasswordAuth(text :string) {
   if (this.roomAdmin.adminPassword == this.getHash(text)) {
     RoomAdmin.instance.adminPeers.push(this.myPeer.identifier);
   }
  } 

  get roomAdmin():RoomAdmin {
    return RoomAdmin.instance;
  }

  get adminAuth():boolean {
    if (this.roomAdmin.adminPeers.includes(this.myPeer.identifier)) return true;
    return false;
  }

  get disableTableLoad():boolean {
    if  (this.adminAuth) return false;
    return this.roomAdmin.disableTableLoad as boolean;
  }

  get disableCharacterLoad():boolean {
    if  (this.adminAuth) return false;
    return this.roomAdmin.disableCharacterLoad as boolean;
  }

  get disableTabSetting():boolean {
    if  (this.adminAuth) return false;
    return this.roomAdmin.disableTabSetting as boolean;
  }
  get disableAllDataSave():boolean {
    if  (this.adminAuth) return false;
    return this.roomAdmin.disableAllDataSave as boolean;
  }
  get disableSeparateDataSave():boolean{
    return true;
    if  (this.adminAuth) return false;
    return this.roomAdmin.disableSeparateDataSave as boolean;
  }



  //ユーザー管理
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
