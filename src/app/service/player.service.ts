import { Injectable } from '@angular/core';
import { PeerCursor } from '@udonarium/peer-cursor';
import { ChatPalette } from '@udonarium/chat-palette';

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
  constructor() {
    this.localpalette =  new ChatPalette('LocalPalette');
  }
}
