import { Injectable } from '@angular/core';
import { GameCharacterService } from 'service/game-character.service';
import { GameCharacter } from '@udonarium/game-character';
import { CutInList } from '@udonarium/cut-in-list';
import { PeerCursor } from '@udonarium/peer-cursor';
import { EventSystem } from '@udonarium/core/system';
import { ObjectStore } from '@udonarium/core/synchronize-object/object-store';
import { StringUtil } from '@udonarium/core/system/util/string-util';

@Injectable({
  providedIn: 'root'
})
export class StandService {

  constructor(
   private gameCharacterService: GameCharacterService
  ) { }

  getCacheCharacter(identifier :string) {
    if (this.gameCharacterService.chatId == identifier) return this.gameCharacterService.chatCharacter;
    return this.gameCharacterService.get(identifier);
  }

  async diceBotShowStand(text:string ,sendFrom:string ,sendTo:string ,color:string,
    imageIdentifier:string) {
    let character =  this.gameCharacterService.get(sendFrom);
    if(character && character.standList) {
      const standInfo = character.standList.matchStandInfo(text, imageIdentifier);
      this.showStand(text,sendFrom,sendTo,color,standInfo,false);
    }
    return;
  }
 
  async showStand(text:string ,sendFrom:string ,sendTo:string ,color:string,
    standInfo,isChat:boolean) {
    let sendToPeer :string; 
    if (sendTo) {
     sendToPeer = this.getPeer(sendTo).peerId;
    }
    if (standInfo.farewell) {
      const sendObj = {
        characterIdentifier: sendFrom
      };
      if (sendTo) {
        if (sendToPeer) {
          if (sendToPeer != PeerCursor.myCursor.peerId) EventSystem.call('FAREWELL_STAND_IMAGE', sendObj, sendToPeer);
          EventSystem.call('FAREWELL_STAND_IMAGE', sendObj, PeerCursor.myCursor.peerId);
          }
        } else {
          EventSystem.call('FAREWELL_STAND_IMAGE', sendObj);
      }
    }
    else if (standInfo && standInfo.standElementIdentifier) {
      const sendObj = {
        characterIdentifier: sendFrom, 
        standIdentifier: standInfo.standElementIdentifier, 
        color: color,
        secret: sendTo ? true : false
      };
      if (sendObj.secret) {
        if (sendToPeer) {
          if (sendToPeer != PeerCursor.myCursor.peerId) EventSystem.call('POPUP_STAND_IMAGE', sendObj, sendToPeer);
           EventSystem.call('POPUP_STAND_IMAGE', sendObj, PeerCursor.myCursor.peerId);
        }
      } else {
        EventSystem.call('POPUP_STAND_IMAGE', sendObj);
      }
    }
    if(isChat && StringUtil.cr(text).trim()) this.showBaloon(text ,sendFrom ,sendToPeer ,color);
  }

  async showBaloon(text:string ,sendFrom:string ,sendToPeer:string ,color:string) {
    const dialogRegExp = /「([\s\S]+?)」/gm;
    let match;
    let dialog = [];
    let character = this.getCacheCharacter(sendFrom);
    if (character.identifier != sendFrom) return;
    while ((match = dialogRegExp.exec(text)) !== null) {
      dialog.push(match[1]);
    }
    if (dialog.length === 0) {
      const emoteTest = text.split(/[\s　]/).slice(-1)[0];
      if (StringUtil.isEmote(emoteTest)) {
        dialog.push(emoteTest);
      }
    }
    if (dialog.length > 0) {
      const dialogObj = {
        characterIdentifier: sendFrom, 
        text: dialog.join("\n\n"),
        faceIconIdentifier: character.faceIcon ? character.faceIcon.identifier : null,
        color: color,
        secret: sendToPeer ? true : false
      };
      if (dialogObj.secret) {
        if (sendToPeer) {
          if (sendToPeer != PeerCursor.myCursor.peerId) EventSystem.call('POPUP_CHAT_BALLOON', dialogObj, sendToPeer);
          EventSystem.call('POPUP_CHAT_BALLOON', dialogObj, PeerCursor.myCursor.peerId);
        }
      } else {
       EventSystem.call('POPUP_CHAT_BALLOON', dialogObj);
      }
    } else if (StringUtil.cr(text).trim() && character.text) {
      EventSystem.call('FAREWELL_CHAT_BALLOON', { characterIdentifier: sendFrom });
    }
  }

  getPeer(identifier :string ) {
     return ObjectStore.instance.get<PeerCursor>(identifier) as PeerCursor;
  }

  async cutIn(text :string,sendTo :string) {
      const cutInInfo = CutInList.instance.matchCutInInfo(text);
      for (const identifier of cutInInfo.identifiers) {
        const sendObj = {
          identifier: identifier, 
          secret: sendTo ? true : false,
          sender: PeerCursor.myCursor.peerId
        };
        if (sendObj.secret) {
          if (sendTo) {
            let peer : string = this.getPeer(sendTo).peerId;
            if (peer != PeerCursor.myCursor.peerId) EventSystem.call('PLAY_CUT_IN', sendObj, peer);
            EventSystem.call('PLAY_CUT_IN', sendObj, PeerCursor.myCursor.peerId);
          }
        } else {
          EventSystem.call('PLAY_CUT_IN', sendObj);
        }
      }
  }
    
}
