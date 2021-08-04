import { Injectable } from '@angular/core';

import { ChatMessage, ChatMessageContext } from '@udonarium/chat-message';
import { ChatTab } from '@udonarium/chat-tab';
import { ChatTabList } from '@udonarium/chat-tab-list';
import { ObjectStore } from '@udonarium/core/synchronize-object/object-store';
import { Network } from '@udonarium/core/system';
import { GameCharacter } from '@udonarium/game-character';
import { PeerCursor } from '@udonarium/peer-cursor';
import { StringUtil } from '@udonarium/core/system/util/string-util';

const HOURS = 60 * 60 * 1000;

@Injectable()
export class ChatMessageService {
  private intervalTimer: NodeJS.Timer = null;
  private timeOffset: number = Date.now();
  private performanceOffset: number = performance.now();

  private ntpApiUrls: string[] = [
    'https://ntp-a1.nict.go.jp/cgi-bin/json',
    'https://ntp-b1.nict.go.jp/cgi-bin/json',
  ];

  gameType: string = '';

  constructor() { }

  get chatTabs(): ChatTab[] {
    return ChatTabList.instance.chatTabs;
  }

  calibrateTimeOffset() {
    if (this.intervalTimer != null) {
      console.log('calibrateTimeOffset was canceled.');
      return;
    }
    let index = Math.floor(Math.random() * this.ntpApiUrls.length);
    let ntpApiUrl = this.ntpApiUrls[index];
    let sendTime = performance.now();
    fetch(ntpApiUrl)
      .then(response => {
        if (response.ok) return response.json();
        throw new Error('Network response was not ok.');
      })
      .then(jsonObj => {
        let endTime = performance.now();
        let latency = (endTime - sendTime) / 2;
        let timeobj = jsonObj;
        let st: number = timeobj.st * 1000;
        let fixedTime = st + latency;
        this.timeOffset = fixedTime;
        this.performanceOffset = endTime;
        console.log('latency: ' + latency + 'ms');
        console.log('st: ' + st + '');
        console.log('timeOffset: ' + this.timeOffset);
        console.log('performanceOffset: ' + this.performanceOffset);
        this.setIntervalTimer();
      })
      .catch(error => {
        console.warn('There has been a problem with your fetch operation: ', error.message);
        this.setIntervalTimer();
      });
    this.setIntervalTimer();
  }

  private setIntervalTimer() {
    if (this.intervalTimer != null) clearTimeout(this.intervalTimer);
    this.intervalTimer = setTimeout(() => {
      this.intervalTimer = null;
      this.calibrateTimeOffset();
    }, 6 * HOURS);
  }

  getTime(): number {
    return Math.floor(this.timeOffset + (performance.now() - this.performanceOffset));
  }

  sendMessage(chatTab: ChatTab, text: string, gameType: string, sendFrom: string, sendTo?: string, color? :string, isInverseIcon? :boolean, isHollowIcon? :boolean, isBlackPaint? :boolean, aura?: number, isUseFaceIcon?: boolean, characterIdentifier?: string, standIdentifier?: string, standName? :string, isUseStandImage?: boolean): ChatMessage {
    // もうちょとなんとかする
    let effective = !(isUseFaceIcon && this.findFaceIconIdentifier(sendFrom));
    let chatMessage: ChatMessageContext = {
      from: Network.peerContext.userId,
      to: ChatMessageService.findId(sendTo),
      //to: this.findId(sendTo),
      name: this.makeMessageName(sendFrom, sendTo),
      imageIdentifier: this.findImageIdentifier(sendFrom, isUseFaceIcon),
      timestamp: this.calcTimeStamp(chatTab),
      tag: effective ? `${gameType} noface` : gameType,
      text: StringUtil.cr(text),
      color: color,
      isInverseIcon: effective && isInverseIcon ? 1 : 0,
      isHollowIcon: effective && isHollowIcon ? 1 : 0,
      isBlackPaint: effective && isBlackPaint ? 1 : 0,
      aura: effective ? aura : -1,
      characterIdentifier: characterIdentifier,
      standIdentifier: standIdentifier,
      standName: standName,
      isUseStandImage: isUseStandImage
    };

    return chatTab.addMessage(chatMessage);
  }

  static findId(identifier: string): string {
    let object = ObjectStore.instance.get(identifier);
    if (object instanceof GameCharacter) {
      return object.identifier;
    } else if (object instanceof PeerCursor) {
      return object.userId;
    }
    return null;
  }

  private findObjectName(identifier: string): string {
    let object = ObjectStore.instance.get(identifier);
    if (object instanceof GameCharacter) {
      return object.name;
    } else if (object instanceof PeerCursor) {
      return object.name;
    }
    return identifier;
  }

  private makeMessageName(sendFrom: string, sendTo?: string): string {
    let sendFromName = this.findObjectName(sendFrom);
    if (sendTo == null || sendTo.length < 1) return sendFromName;

    let sendToName = this.findObjectName(sendTo);
    return sendFromName + ' ➡ ' + sendToName;
  }

  private findImageIdentifier(identifier: string, isUseFaceIcon: boolean = false): string {
    let object = ObjectStore.instance.get(identifier);
    if (object instanceof GameCharacter) {
      if (isUseFaceIcon && object.faceIcon && 0 < object.faceIcon.url.length) return object.faceIcon.identifier;
      return object.imageFile ? object.imageFile.identifier : '';
    } else if (object instanceof PeerCursor) {
      return object.imageIdentifier;
    }
    return identifier;
  }

  private findFaceIconIdentifier(identifier: string): string {
    let object = ObjectStore.instance.get(identifier);
    if (object instanceof GameCharacter && object.faceIcon && 0 < object.faceIcon.url.length) {
      return object.faceIcon.identifier;
    }
    return '';
  }

  private calcTimeStamp(chatTab: ChatTab): number {
    let now = this.getTime();
    let latest = chatTab.latestTimeStamp;
    return now <= latest ? latest + 1 : now;
  }
}
