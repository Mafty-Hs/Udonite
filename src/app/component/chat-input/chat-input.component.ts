import { Component, ElementRef, EventEmitter, Input, NgZone, OnDestroy, OnInit, Output, ViewChild } from '@angular/core';
import { ChatMessage } from '@udonarium/chat-message';
import { ObjectStore } from '@udonarium/core/synchronize-object/object-store';
import { GameCharacter } from '@udonarium/game-character';
import { GameCharacterService } from 'service/game-character.service';
import { EventSystem, Network } from '@udonarium/core/system';
import { PeerContext } from '@udonarium/core/system/network/peer-context';
import { ResettableTimeout } from '@udonarium/core/system/util/resettable-timeout';
import { PeerCursor } from '@udonarium/peer-cursor';
import { TextViewComponent } from 'component/text-view/text-view.component';
import { ChatInputSendfromComponent } from 'component/chat-input-sendfrom/chat-input-sendfrom.component';
import { BatchService } from 'service/batch.service';
import { ChatMessageService } from 'service/chat-message.service';
import { PanelOption, PanelService } from 'service/panel.service';
import { PointerDeviceService } from 'service/pointer-device.service';
import { ChatPaletteComponent } from 'component/chat-palette/chat-palette.component';
import { StringUtil } from '@udonarium/core/system/util/string-util';
import { PresetSound, SoundEffect } from '@udonarium/sound-effect';
import { StandSettingComponent } from 'component/stand-setting/stand-setting.component';

import { PeerMenuComponent } from 'component/peer-menu/peer-menu.component';
import { ChatTab } from '@udonarium/chat-tab';

@Component({
  selector: 'chat-input',
  templateUrl: './chat-input.component.html',
  styleUrls: ['./chat-input.component.css']
})
export class ChatInputComponent implements OnInit, OnDestroy {
  @ViewChild('textArea', { static: true }) textAreaElementRef: ElementRef;

  @Input() chatTabidentifier: string = '';
  get isUseStandImageOnChatTab(): boolean {
    const chatTab = <ChatTab>ObjectStore.instance.get(this.chatTabidentifier);
    return chatTab && chatTab.isUseStandImage;
  }

  @Input('gameType') _gameType: string = '';
  @Output() gameTypeChange = new EventEmitter<string>();
  get gameType(): string { return this._gameType };
  set gameType(gameType: string) { this._gameType = gameType; this.gameTypeChange.emit(gameType); }
  @Input('sendFrom') _sendFrom: string = this.myPeer ? this.myPeer.identifier : '';
  @Output() sendFromChange = new EventEmitter<string>();
  get sendFrom(): string { return this._sendFrom };
  set sendFrom(sendFrom: string) { this._sendFrom = sendFrom; this.sendFromChange.emit(sendFrom); }
  @Input('sendTo') _sendTo: string = '';
  @Output() sendToChange = new EventEmitter<string>();
  get sendTo(): string { return this._sendTo };
  set sendTo(sendTo: string) { this._sendTo = sendTo; this.sendToChange.emit(sendTo);}
  @Input('text') _text: string = '';
  @Output() textChange = new EventEmitter<string>();
  get text(): string { return this._text };
  set text(text: string) { this._text = text; this.textChange.emit(text); }

  @Output() chat = new EventEmitter<{ 
    text: string, gameType: string, sendFrom: string, sendTo: string,
    color?: string, 
    isInverse?:boolean, 
    isHollow?: boolean, 
    isBlackPaint?: boolean, 
    aura?: number, 
    isUseFaceIcon?: boolean, 
    characterIdentifier?: string, 
    standIdentifier?: string, 
    standName?: string,
    isUseStandImage?: boolean }>();

  get isDirect(): boolean { return this.sendTo != null && this.sendTo.length ? true : false }

  isUseFaceIcon: boolean = true;
  isUseStandImage: boolean = true;
  color:string = PeerCursor.myCursor.color; 
  standName: string;

  get character(): GameCharacter {
    return this.gameCharacterService.get(this.sendFrom);
  }

  private writingEventInterval: NodeJS.Timer = null;
  private previousWritingLength: number = 0;

  writingPeers: Map<string, ResettableTimeout> = new Map();
  writingPeerNameAndColors: { name: string, color: string }[] = [];

  get myPeer(): PeerCursor { return PeerCursor.myCursor; }
  get otherPeers(): PeerCursor[] { return ObjectStore.instance.getObjects(PeerCursor); }


  constructor(
    private ngZone: NgZone,
    public chatMessageService: ChatMessageService,
    private batchService: BatchService,
    private panelService: PanelService,
    private gameCharacterService: GameCharacterService
  ) { }

  ngOnInit(): void {
    EventSystem.register(this)
      .on('MESSAGE_ADDED', event => {
        if (event.data.tabIdentifier !== this.chatTabidentifier) return;
        let message = ObjectStore.instance.get<ChatMessage>(event.data.messageIdentifier);
        let peerCursor = ObjectStore.instance.getObjects<PeerCursor>(PeerCursor).find(obj => obj.userId === message.from);
        let sendFrom = peerCursor ? peerCursor.peerId : '?';
        if (this.writingPeers.has(sendFrom)) {
          this.writingPeers.get(sendFrom).stop();
          this.writingPeers.delete(sendFrom);
          this.updateWritingPeerNameAndColors();
        }
      })
      .on<string>('WRITING_A_MESSAGE', event => {
        if (event.isSendFromSelf || event.data !== this.chatTabidentifier) return;
        if (!this.writingPeers.has(event.sendFrom)) {
          this.writingPeers.set(event.sendFrom, new ResettableTimeout(() => {
            this.writingPeers.delete(event.sendFrom);
            this.updateWritingPeerNameAndColors();
            this.ngZone.run(() => { });
          }, 2000));
        }
        this.writingPeers.get(event.sendFrom).reset();
        this.updateWritingPeerNameAndColors();
        this.batchService.add(() => this.ngZone.run(() => { }), this);
      });
  }

  ngOnDestroy() {
    EventSystem.unregister(this);
    this.batchService.remove(this);
  }

  private updateWritingPeerNameAndColors() {
    this.writingPeerNameAndColors = Array.from(this.writingPeers.keys()).map(peerId => {
      let peer = PeerCursor.findByPeerId(peerId);
      return {
        name: (peer ? peer.name : ''),
        color: (peer ? peer.color : PeerCursor.CHAT_TRANSPARENT_COLOR),
      };
    });
  }
  
  onInput() {
    if (this.writingEventInterval === null && this.previousWritingLength <= this.text.length) {
      let sendTo: string = null;
      if (this.isDirect) {
        let object = ObjectStore.instance.get(this.sendTo);
        if (object instanceof PeerCursor) {
          let peer = PeerContext.parse(object.peerId);
          if (peer) sendTo = peer.peerId;
        }
      }
      EventSystem.call('WRITING_A_MESSAGE', this.chatTabidentifier, sendTo);
      this.writingEventInterval = setTimeout(() => {
        this.writingEventInterval = null;
      }, 200);
    }
    this.previousWritingLength = this.text.length;
    this.calcFitHeight();
  }

  sendChat(event: KeyboardEvent) {
    if (event) event.preventDefault();
    if (event && event.keyCode !== 13) return;

    if (!this.sendFrom.length) this.sendFrom = this.myPeer.identifier;

    let text = this.text;
    let standIdentifier = null;
    if (this.character && (StringUtil.cr(text).trim() || this.standName)) {
      text = this.character.chatPalette.evaluate(this.text, this.character.rootDataElement);
      // 立ち絵
      if (this.character.standList) {
        let imageIdentifier = null;
        if (this.isUseFaceIcon && this.character.faceIcon) {
          imageIdentifier = this.character.faceIcon.identifier;
        } else {
          imageIdentifier = this.character.imageFile ? this.character.imageFile.identifier : null;
        }
        
        const standInfo = this.character.standList.matchStandInfo(text, imageIdentifier, this.standName);
        if (standInfo.farewell) {
          //this.farewellStand();
        } else if (this.isUseStandImage && this.isUseStandImageOnChatTab && standInfo.standElementIdentifier) {
          standIdentifier = standInfo.standElementIdentifier;
          const sendObj = {
            characterIdentifier: this.character.identifier, 
            standIdentifier: standInfo.standElementIdentifier, 
            color: this.character.chatPalette ? this.character.chatPalette.color : PeerCursor.CHAT_DEFAULT_COLOR,
            secret: this.sendTo ? true : false
          };
          if (sendObj.secret) {
            const targetPeer = ObjectStore.instance.get<PeerCursor>(this.sendTo);
            if (targetPeer) {
              if (targetPeer.peerId != PeerCursor.myCursor.peerId) EventSystem.call('POPUP_STAND_IMAGE', sendObj, targetPeer.peerId);
              EventSystem.call('POPUP_STAND_IMAGE', sendObj, PeerCursor.myCursor.peerId);
            }
          } else {
            EventSystem.call('POPUP_STAND_IMAGE', sendObj);
          }
        }

        if (standInfo.matchMostLongText) {
          text = text.slice(0, text.length - standInfo.matchMostLongText.length);
        }
      }

      //💭はEvant機能使うようにする
      const dialogRegExp = /「([\s\S]+?)」/gm;
      // const dialogRegExp = /(?:^|[^\￥])「([\s\S]+?[^\￥])」/gm; 
      //ToDO ちゃんとパースする
      let match;
      let dialog = [];
      while ((match = dialogRegExp.exec(text)) !== null) {
        dialog.push(match[1]);
      }
      if (dialog.length > 0) {
        //連続💭とりあえずやめる（複数表示できないかな）
        //const dialogs = [...dialog, null];
        //const gameCharacter = this.character;
        //const color = this.color;
        
        const dialogObj = {
          characterIdentifier: this.character.identifier, 
          text: dialog.join("\n\n"),
          faceIconIdentifier: (this.isUseFaceIcon && this.character.faceIcon) ? this.character.faceIcon.identifier : null,
          color: this.color,
          secret: this.sendTo ? true : false
        };
        if (dialogObj.secret) {
          const targetPeer = ObjectStore.instance.get<PeerCursor>(this.sendTo);
          if (targetPeer) {
            if (targetPeer.peerId != PeerCursor.myCursor.peerId) EventSystem.call('POPUP_CHAT_BALLOON', dialogObj, targetPeer.peerId);
            EventSystem.call('POPUP_CHAT_BALLOON', dialogObj, PeerCursor.myCursor.peerId);
          }
        } else {
          EventSystem.call('POPUP_CHAT_BALLOON', dialogObj);
        }
      } else if (StringUtil.cr(text).trim() && this.character.text) {
        EventSystem.call('FAREWELL_CHAT_BALLOON', { characterIdentifier: this.character.identifier });
      }
    }
    if (StringUtil.cr(text).trim()) {
      this.chat.emit({
        text: text,
        gameType: this.gameType,
        sendFrom: this.sendFrom,
        sendTo: this.sendTo,
        color: this.color, 
        isInverse: this.character ? this.character.isInverse : false,
        isHollow: this.character ? this.character.isHollow : false,
        isBlackPaint: this.character ? this.character.isBlackPaint : false,
        aura: this.character ? this.character.aura : -1,
        isUseFaceIcon: this.isUseFaceIcon,
        characterIdentifier: this.character ? this.character.identifier : null,
        standIdentifier: standIdentifier,
        standName: this.standName,
        isUseStandImage: (this.isUseStandImage && this.isUseStandImageOnChatTab)
      });
    }
    this.text = '';
    this.previousWritingLength = this.text.length;
    let textArea: HTMLTextAreaElement = this.textAreaElementRef.nativeElement;
    textArea.value = '';
    this.calcFitHeight();
  }

  calcFitHeight() {
    let textArea: HTMLTextAreaElement = this.textAreaElementRef.nativeElement;
    textArea.style.height = '';
    if (textArea.scrollHeight >= textArea.offsetHeight) {
      textArea.style.height = textArea.scrollHeight + 'px';
    }
  }
}
