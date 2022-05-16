import { Injectable } from '@angular/core';

import { GameCharacterService } from 'service/game-character.service';
import { StandService } from 'service/stand.service';
import { PlayerService } from 'service/player.service';
import { RoomService } from './room.service';

import { ChatMessageContext } from '@udonarium/chat-message';
import { ChatTab } from '@udonarium/chat-tab';
import { ChatTabList } from '@udonarium/chat-tab-list';
import { ObjectStore } from '@udonarium/core/synchronize-object/object-store';
import { StringUtil } from '@udonarium/core/system/util/string-util';
import { EventSystem } from '@udonarium/core/system';

const HOURS = 60 * 60 * 1000;

interface ControledChatTab {
  chatTab: ChatTab;
  name:string;
  identifier:string;
  isLock: boolean;
  isAllowed: boolean;
}

@Injectable()
export class ChatMessageService {
  private performanceOffset: number = performance.now();
  private timeOffset: number = Date.now();

  gameType: string = '';

  constructor(
    private gameCharacterService:  GameCharacterService,
    private standService:  StandService,
    private playerService:  PlayerService,
    private roomService: RoomService
  ) {
    EventSystem.register(this)
    .on('UPDATE_GAME_OBJECT', -1000, event => {
      if (event.data.aliasName === 'chat-tab') {
        this.updateChatTab();
      }
    })
    .on('DELETE_GAME_OBJECT', -1000, event => {
      if (event.data.aliasName === 'chat-tab') {
        this.updateChatTab();
      }
    });
    this.updateChatTab();
   }

  get chatTabs(): ChatTab[] {
    return ChatTabList.instance.chatTabs;
  }

  updateChatTab() {
    this.controledChatTabList = this.chatTabs.map( chatTab => {
      return {
        chatTab: chatTab,
        name: chatTab.name,
        identifier: chatTab.identifier,
        isLock: Boolean(chatTab.allowedPlayers.length > 0),
        isAllowed: chatTab.isAllowed
      }
    });
  }

  controledChatTabList:ControledChatTab[];

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
    let name :string;
    if (sendTo) {
      name = this.makeMessageName(chatSet.name , sendTo);
    }
    else {
      name = chatSet.name;
    }
    if (isUseStandImage && chatSet.standInfo) {
      this.standService.showStand(text,sendFrom,sendTo,color,chatSet.standInfo,true);
    }
    this.standService.cutIn(text,sendTo);
    let chatMessage: ChatMessageContext = {
      from: this.playerService.myPlayer.playerId,
      to: sendTo,
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
    let message = chatTab.addMessage(chatMessage);
    this.standService.trimming(message);
    return message;
  }

  systemSend(chatTab: ChatTab, text: string) {
    let chatMessage: ChatMessageContext = {
      from: this.playerService.myPlayer.playerId,
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
    let name :string;
    if (sendTo) {
      name = this.makeMessageName(this.playerService.myPlayer.name , sendTo);
    }
    else {
      name = this.playerService.myPlayer.name ;
    }
    this.standService.cutIn(text,sendTo);
    let chatMessage: ChatMessageContext = {
      from: this.playerService.myPlayer.playerId,
      to: sendTo,
      name: name,
      imageIdentifier: this.playerService.myImage.identifier,
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
    let message = chatTab.addMessage(chatMessage);
    this.standService.trimming(message);
    return message;
  }

  get myColor(): string {
     return this,this.playerService.myColor;
  }

  colorValidation(color :string):string {
    return color !== this.playerService.CHAT_WHITETEXT_COLOR ? color : "";
  }

  private makeMessageName(name: string, sendTo: string): string {
    return name + ' 筐。 ' + this.playerService.getPlayerById(sendTo).name;
  }

  sendOperationLog(text: string, logType: string) {
    switch (logType) {
      case "dice":
        if (!this.roomService.roomAdmin.diceLog) return;
        break;
      case "card":
        if (!this.roomService.roomAdmin.cardLog) return;
        break;
      default:
        return;
        break;
    }
    let chatTab = ObjectStore.instance.get<ChatTab>(this.roomService.roomAdmin.chatTab)
    if (chatTab)
     this.playerSend(chatTab ,text , "", this.playerService.myPlayer.playerId ,"");
  }

}
