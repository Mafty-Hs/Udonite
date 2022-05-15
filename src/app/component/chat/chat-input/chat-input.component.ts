import { Component, ElementRef, EventEmitter, Input, NgZone, OnDestroy, OnInit,  AfterViewInit, Output, ViewChild, ChangeDetectionStrategy, ChangeDetectorRef } from '@angular/core';
import { ChatMessage } from '@udonarium/chat-message';
import { ObjectStore } from '@udonarium/core/synchronize-object/object-store';
import { EventSystem } from '@udonarium/core/system';
import { PlayerService } from 'service/player.service';
import { ResettableTimeout } from '@udonarium/core/system/util/resettable-timeout';
import { PointerDeviceService } from 'service/pointer-device.service';
import { ContextMenuAction, ContextMenuSeparator, ContextMenuService} from 'service/context-menu.service';
import { BatchService } from 'service/batch.service';
import { ChatMessageService } from 'service/chat-message.service';
import { StringUtil } from '@udonarium/core/system/util/string-util';
import { PresetSound, SoundEffect } from '@udonarium/sound-effect';

import { ChatTab } from '@udonarium/chat-tab';

interface chatDataContext {
  sendTo : string;
  gameType : string;
  isCharacter : boolean;
  isUseStandImage : boolean;
  standName : string;
}

@Component({
  selector: 'chat-input',
  templateUrl: './chat-input.component.html',
  styleUrls: ['../../../common/component.common.css','../chat-input.common.css','./chat-input.component.css','../chat-window.design.css'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ChatInputComponent implements OnInit  ,AfterViewInit  , OnDestroy {
  @ViewChild('textArea', { static: true }) textAreaElementRef: ElementRef;

  @Input() chatTabidentifier: string = '';
  get isUseStandImageOnChatTab(): boolean {
    const chatTab = <ChatTab>ObjectStore.instance.get(this.chatTabidentifier);
    return chatTab && chatTab.isUseStandImage;
  }
  private chatData:chatDataContext = {sendTo: "",gameType: "",isCharacter: false,isUseStandImage: true , standName : ""}
  get sendTo(): string { return this.chatData.sendTo };
  get gameType(): string { return this.chatData.gameType };
  get isCharacter():boolean { return this.chatData.isCharacter };
  get isUseStandImage():boolean { return this.chatData.isUseStandImage };
  get standName():string { return this.chatData.standName };

  @Input() isBlack: boolean = true;

  _sendFrom: string = this.playerService.myPlayer.playerId;
  @Input('sendFrom') set sendFrom(sendFrom: string) {
    this._sendFrom = sendFrom;
    this.sendFromChange.emit(sendFrom);
    this.changeDetector.detectChanges();
  }
  @Output() sendFromChange = new EventEmitter<string>();
  get sendFrom(): string { return this._sendFrom };

  _text: string = '';
  @Output() textChange = new EventEmitter<string>();
  get text(): string { return this._text };
  @Input('text') set text(text: string) {
    this._text = text;
    this.lazyUpdate();
    this.textChange.emit(text);
  }

  @Output() chat = new EventEmitter<{
    text: string, gameType: string, sendFrom: string, sendTo: string,
    isUseFaceIcon?: boolean,
    isCharacter?: boolean,
    isUseStandImage?: boolean,
    standName?: string }>();

  isDirect: boolean = false;
  @Input('isPalette') isPalette: boolean = false;
  isUseFaceIcon: boolean = true;
  public chatSetting(e :chatDataContext) {
    this.chatData = e;
    this.isDirect = (this.sendTo != null && this.sendTo.length) ? true : false;
    this.changeDetector.detectChanges();
  }

  private writingEventInterval: NodeJS.Timer = null;
  private previousWritingLength: number = 0;

  writingPeers: Map<string, ResettableTimeout> = new Map();
  writingPeerNameAndColors: { name: string, color: string }[] = [];

  constructor(
    private ngZone: NgZone,
    public chatMessageService: ChatMessageService,
    private contextMenuService: ContextMenuService,
    private batchService: BatchService,
    private playerService: PlayerService,
    private pointerDeviceService: PointerDeviceService,
    private changeDetector: ChangeDetectorRef,

  ) { }

  ngOnInit(): void {
    EventSystem.register(this)
      .on('MESSAGE_ADDED', event => {
        if (event.data.tabIdentifier !== this.chatTabidentifier) return;
        let message = ObjectStore.instance.get<ChatMessage>(event.data.messageIdentifier);
        if (message.tags.includes('system')) return;
        let sendFrom = this.playerService.getPeerByPlayer(message.from);
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
        this.batchService.requireChangeDetection();
      });
  }

  ngAfterViewInit(): void {
  }

  ngOnDestroy() {
    EventSystem.unregister(this);
    this.batchService.remove(this);
  }

  private updateWritingPeerNameAndColors() {
    this.writingPeerNameAndColors = Array.from(this.writingPeers.keys()).map(peerId => {
      return this.playerService.findPeerNameAndColor(peerId);
    });
    this.changeDetector.detectChanges();
  }

  onInput() {
    if (this.writingEventInterval === null && this.previousWritingLength <= this.text.length) {
      let sendTo: string = null;
      if (this.isDirect) {
        let peerId = this.playerService.getPeerByPlayer(this.sendTo);
        if (peerId) sendTo = peerId;
      }
      EventSystem.call('WRITING_A_MESSAGE', this.chatTabidentifier, sendTo);
      this.writingEventInterval = setTimeout(() => {
        this.writingEventInterval = null;
      }, 200);
    }
    this.previousWritingLength = this.text.length;
    this.calcFitHeight();
  }


  private history: string[] = new Array();
  private currentHistoryIndex: number = -1;
  private static MAX_HISTORY_NUM = 10;
  private keyText = ['Ctrl + 1 : ' ,'Ctrl + 2 : ' ,'Ctrl + 3 : ' ,'Ctrl + 4 : ' ,'Ctrl + 5 : ' ,
    'Ctrl + 6 : ' ,'Ctrl + 7 : ' ,'Ctrl + 8 : ' ,'Ctrl + 9 : ' ,'Ctrl + 0 : '];

  get historyStylevisibility():string {
    return  this.currentHistoryIndex > -1 ? 'visible' : 'hidden'
  }
  get targetHistory():string [] {
    let index = this.currentHistoryIndex === -1 ? this.history.length : this.currentHistoryIndex;
    return this.history.length <= 10 ? this.history : this.history.slice(index - 10 ,index)
  }

  get historyText():string[] {
    let targetHistory = this.targetHistory;
    let historytext:string[] =[];
    for (let row = 0; row < 10; row++) {
      let addText = targetHistory.length > row ? targetHistory[row] : '';
      historytext.push( this.keyText[row] + addText);
    }
    return historytext;
  }

  moveHistory(event: KeyboardEvent, direction: number) {
    if (event) event.preventDefault();
    if (direction < 0 && this.currentHistoryIndex < 0) {
      this.currentHistoryIndex = this.history.length - 1;
    } else if (direction > 0 && this.currentHistoryIndex >= this.history.length - 1) {
      this.currentHistoryIndex = -1;
    } else {
      this.currentHistoryIndex = this.currentHistoryIndex + direction;
    }

    this.historyToText()
  }

  selectHistory(event :Event ,index :number) {
    if (event) event.preventDefault();
    let maxIndex = this.history.length > 9 ? 9 : this.history.length - 1;
    if (maxIndex < index) {
      let textArea: HTMLTextAreaElement = this.textAreaElementRef.nativeElement;
      textArea.focus();
      return;
    }
    if (this.currentHistoryIndex < 0) this.currentHistoryIndex = this.history.length - 1;
    this.currentHistoryIndex -= (maxIndex - index);
    this.historyToText()
  }

  private historyToText() {
    let histText: string;
    if (this.currentHistoryIndex < 0) {
      histText = '';
    } else {
      histText = this.history[this.currentHistoryIndex];
    }
    this.text = histText;
    this.previousWritingLength = this.text.length;
    let textArea: HTMLTextAreaElement = this.textAreaElementRef.nativeElement;
    textArea.value = histText;
    this.calcFitHeight();
    textArea.focus();
  }

  cancel() {
    this.currentHistoryIndex = -1;
  }

  sendChat(event: KeyboardEvent) {
    if (event) event.preventDefault();
    if (event && event.keyCode !== 13) return;
    if (!this.sendFrom.length) this.sendFrom = this.playerService.myPlayer.playerId;;

    if (this.history.length >= ChatInputComponent.MAX_HISTORY_NUM) {
      this.history.shift();
    }
    this.history.push(this.text);
    this.currentHistoryIndex = -1;

    let text = this.text;
    if (StringUtil.cr(text).trim()) {
      this.chat.emit({
        text: text,
        gameType: this.gameType,
        sendFrom: this.sendFrom,
        sendTo: this.sendTo,
        isUseFaceIcon: this.isUseFaceIcon,
        isCharacter: this.isCharacter,
        standName: this.standName,
        isUseStandImage: (this.isUseStandImage && this.isUseStandImageOnChatTab)
      });
    }
    this.text = '';
    this.previousWritingLength = this.text.length;
    let textArea: HTMLTextAreaElement = this.textAreaElementRef.nativeElement;
    textArea.value = '';
    this.calcFitHeight();
    this.changeDetector.detectChanges();
  }

  calcFitHeight() {
    let textArea: HTMLTextAreaElement = this.textAreaElementRef.nativeElement;
    textArea.style.height = '';
    if (textArea.scrollHeight >= textArea.offsetHeight) {
      textArea.style.height = textArea.scrollHeight + 'px';
    }
  }

  helper(e: Event) {
    e.stopPropagation();
    e.preventDefault();
    if (!this.pointerDeviceService.isAllowedToOpenContextMenu) return;
    let position = this.pointerDeviceService.pointers[0];

    let actions: ContextMenuAction[] = [];
    actions.push({ name: '入力履歴', action: () => {
      this.currentHistoryIndex = this.history.length - 1;
      this.lazyUpdate();
    } });
    actions.push({ name: 'ルビ入力テンプレート', action: () => {
      this.rubi();
     } });
    this.contextMenuService.open(position, actions, '入力支援');
  }

  rubi() {
    this.text += '|ルビを振られる文字《ルビ》'
    this.lazyUpdate();
  }

  lazyUpdateTimer:NodeJS.Timer = null;

  async lazyUpdate():Promise<void> {
    if (this.lazyUpdateTimer) clearTimeout(this.lazyUpdateTimer);
    this.lazyUpdateTimer = setTimeout(() => this.lazyUpdateDo() ,100)
  }

  lazyUpdateDo():void {
    this.changeDetector.detectChanges();
  }
}
