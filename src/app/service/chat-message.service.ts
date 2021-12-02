import { Injectable } from '@angular/core';

import { GameCharacterService } from 'service/game-character.service';
import { StandService } from 'service/stand.service';
import { PlayerService } from 'service/player.service';

import { ChatMessageContext } from '@udonarium/chat-message';
import { ChatTab } from '@udonarium/chat-tab';
import { ChatTabList } from '@udonarium/chat-tab-list';
import { ObjectStore } from '@udonarium/core/synchronize-object/object-store';
import { Network } from '@udonarium/core/system';
import { PeerCursor } from '@udonarium/peer-cursor';
import { StringUtil } from '@udonarium/core/system/util/string-util';

const HOURS = 60 * 60 * 1000;

@Injectable()
export class ChatMessageService {
  private performanceOffset: number = performance.now();
  private timeOffset: number = Date.now();

  gameType: string = '';

  constructor(
    private gameCharacterService:  GameCharacterService,
    private standService:  StandService,
    private playerService:  PlayerService
  ) { }

  get chatTabs(): ChatTab[] {
    return ChatTabList.instance.chatTabs;
  }

  getTime(): number {
    return Math.floor(this.timeOffset + (performance.now() - this.performanceOffset));
  }

  private calcTimeStamp(chatTab: ChatTab): number {
    let now = this.getTime();
    let latest = chatTab.latestTimeStamp;
    return now <= latest ? latest + 1 : now;
  }

  sendMessage(chatTab: ChatTab, text: string, gameType: string, sendFrom: string, 
   sendTo?: string, isCharacter?: boolean, isUseFaceIcon?: boolean,
   isUseStandImage?: boolean ,standName? :string) 
  {
    if(isCharacter) return this.characterSend(chatTab, text, gameType, sendFrom,
      sendTo,isUseFaceIcon,isUseStandImage,standName);
    return this.playerSend(chatTab, text, gameType, sendFrom, sendTo);
  }

  characterSend(chatTab: ChatTab, text: string, gameType: string, sendFrom: string,
   sendTo?: string,isUseFaceIcon?: boolean, isUseStandImage?: boolean ,standName? :string)
  {
    let chatSet = this.gameCharacterService.chatSet(sendFrom,isUseFaceIcon,text,standName);
    let color = chatSet.color ? chatSet.color : this.myColor; 
    let name,newTo :string;
    if (sendTo) {
      newTo = this.findId(sendTo);
      name = this.makeMessageName(chatSet.name , sendTo);
    }
    else {
      newTo = "";
      name = chatSet.name;
    } 
    if (isUseStandImage && chatSet.standInfo) {
      this.standService.showStand(text,sendFrom,sendTo,color,chatSet.standInfo,true);
    }
    this.standService.cutIn(text,sendTo);
    let chatMessage: ChatMessageContext = {
      from: Network.peerContext.userId,
      to: newTo,
      name: name,
      imageIdentifier: chatSet.imageIdentifier,
      timestamp: this.calcTimeStamp(chatTab),
      tag: chatSet.isUseFaceIcon ? gameType : `${gameType} noface`,
      text: StringUtil.cr(text),
      color: this.colorValidation(color) ,
      isInverseIcon: chatSet.isInverse,
      isHollowIcon:  chatSet.isHollow,
      isBlackPaint:  chatSet.isBlackPaint,
      aura:  chatSet.aura,
      characterIdentifier: sendFrom,
      standIdentifier: chatSet.standIdentifier,
      standName: standName,
      isUseStandImage: isUseStandImage
    };
    return chatTab.addMessage(chatMessage);
  }

  systemSend(chatTab: ChatTab, text: string) {
    let chatMessage: ChatMessageContext = {
      from: Network.peerContext.userId,
      name: 'System',
      timestamp: this.calcTimeStamp(chatTab),
      tag: 'system',
      text: StringUtil.cr(text),
      color: '',
    };
    return chatTab.addMessage(chatMessage);
  }

  playerSend(chatTab: ChatTab, text: string, gameType: string, sendFrom: string,
   sendTo?: string)
  {
    if (sendFrom === 'System') return this.systemSend(chatTab, text);
    let name,newTo :string;
    if (sendTo) {
      newTo = this.findId(sendTo);
      name = this.makeMessageName(PeerCursor.myCursor.name , sendTo);
    }
    else {
      name = PeerCursor.myCursor.name;
      newTo = "";
    }
    this.standService.cutIn(text,sendTo);
    let chatMessage: ChatMessageContext = {
      from: Network.peerContext.userId,
      to: newTo,
      name: name,
      imageIdentifier: PeerCursor.myCursor?.imageIdentifier,
      timestamp: this.calcTimeStamp(chatTab),
      tag: gameType,
      text: StringUtil.cr(text),
      color: this.colorValidation(this.myColor),
      isInverseIcon: 0,
      isHollowIcon:  0,
      isBlackPaint:  0,
      aura:  -1,
      characterIdentifier: "",
      standIdentifier: "",
      standName: "",
      isUseStandImage: false
    };

    return chatTab.addMessage(chatMessage);
  }

  get myColor(): string {
    if (PeerCursor.myCursor
      && PeerCursor.myCursor.color
      && PeerCursor.myCursor.color != PeerCursor.CHAT_TRANSPARENT_COLOR) {
      return PeerCursor.myCursor.color;
    }
    return PeerCursor.CHAT_DEFAULT_COLOR;
  }

  colorValidation(color :string):string {
    return color !== PeerCursor.CHAT_DEFAULT_COLOR ? color : ""; 
  }

  getPeer(identifier: string): PeerCursor {
    return ObjectStore.instance.get(identifier) as PeerCursor;
  }

  findId(identifier: string): string {
    return this.getPeer(identifier)?.userId;
  }

  private makeMessageName(name: string, sendTo: string): string {
    return name + ' ➡ ' + this.getPeer(sendTo)?.name;
  }

  sendOperationLog(text: string, logType: string) {
    switch (logType) {
      case "dice":
        if (!this.playerService.roomAdmin.diceLog) return;
        break;
      case "card":
        if (!this.playerService.roomAdmin.cardLog) return;
        break;
      default:
        return;
        break;
    }
    let chatTab = ObjectStore.instance.get<ChatTab>(this.playerService.roomAdmin.chatTab)
    if (chatTab) 
     this.playerSend(chatTab ,text , "", Network.peerContext.userId ,"");
  }

}
