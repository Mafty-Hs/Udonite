import { AfterViewInit, Component, OnDestroy, OnInit } from '@angular/core';
import { ChatMessage } from '@udonarium/chat-message';
import { ChatTab } from '@udonarium/chat-tab';
import { ObjectStore } from '@udonarium/core/synchronize-object/object-store';
import { EventSystem } from '@udonarium/core/system';
import { ChatTabSettingComponent } from 'component/chat-tab-setting/chat-tab-setting.component';
import { ChatMessageService } from 'service/chat-message.service';
import { PanelOption, PanelService } from 'service/panel.service';
import { PointerDeviceService } from 'service/pointer-device.service';
import { UUID } from '@udonarium/core/system/util/uuid';
import { PlayerService } from 'service/player.service';

@Component({
  selector: 'chat-window',
  templateUrl: './chat-window.component.html',
  styleUrls: ['./chat-window.component.css'],
})
export class ChatWindowComponent implements OnInit, OnDestroy, AfterViewInit {
  _sendFrom: string = this.playerService.myPlayer.playerId;
  canAutoScroll:boolean = true;

  get sendFrom(): string { return this._sendFrom; }
  set sendFrom(sendFrom: string) {
    this._sendFrom = sendFrom;
    if (this.isMine(sendFrom)){
      this.disableControl = true;
    }
    else {
      this.disableControl = false;
    }
  }

   private isMine(playerId: string):boolean {
    if (playerId ==  this.playerService.myPlayer.playerId) {
      return true;
    }
    return false;
  }

  chatWindowID:string;
  isEase:boolean = false;
  isLogOnly:boolean = true;
  localFontsize:number = 14;
  bgColor:string = "black";
  get isBlack():boolean {
    return (this.bgColor === 'black')
  }

  controlType:string = "resource";
  _disableControl: boolean = true;
  get disableControl(): boolean { return this._disableControl };
  set disableControl(control: boolean) {
    this._disableControl = control;
  };

  isEdit:boolean = false;
  editMessage:ChatMessage = null;

  toggleEdit() {
    this.isEdit = false;
    this.editMessage = null;
  }

  private _chatTabidentifier: string = '';
  get chatTabidentifier(): string { return this._chatTabidentifier; }
  set chatTabidentifier(chatTabidentifier: string) {
    let hasChanged: boolean = this._chatTabidentifier !== chatTabidentifier;
    this._chatTabidentifier = chatTabidentifier;
    if (this.isPrimary) this.playerService.primaryChatTabIdentifier = chatTabidentifier;
    this.updatePanelTitle();
    if (hasChanged) {
      this.scrollToBottom(true);
    }
  }

  get chatTab(): ChatTab { return ObjectStore.instance.get<ChatTab>(this.chatTabidentifier); }

  get isPrimary():boolean {
    return this.playerService.primaryChatWindowID === this.chatWindowID;
  }

  isAutoScroll: boolean = true;
  scrollToBottomTimer: NodeJS.Timer = null;

  constructor(
    public chatMessageService: ChatMessageService,
    private panelService: PanelService,
    private playerService: PlayerService,
    private pointerDeviceService: PointerDeviceService
  ) { }

  ngOnInit():void {
    EventSystem.register(this)
      .on('MESSAGE_ADDED', event => {
        if (event.data.tabIdentifier !== this.chatTabidentifier) return;
        let message = ObjectStore.instance.get<ChatMessage>(event.data.messageIdentifier);
        if (message && message.isSendFromSelf) {
          this.isAutoScroll = true;
        } else {
          this.checkAutoScroll();
        }
        if (this.isAutoScroll && this.chatTab) this.chatTab.markForRead();
      })
      .on('CHAT_WINDOW_CONF', event => {
        if (event.data[0] == this.chatWindowID) {
          this.localFontsize = event.data[1];
          this.bgColor = event.data[2];
          this.isEase = event.data[3];
          this.isLogOnly = event.data[4];
          this.controlType = event.data[5];
        }
      });
    Promise.resolve().then(() => {
      this.chatWindowID = UUID.generateUuid() ;
      if (!this.playerService.primaryChatWindowID) {
        this.playerService.primaryChatWindowID = this.chatWindowID;
      }
      if (this.isPrimary && this.playerService.primaryChatTabIdentifier) {
          this._chatTabidentifier = this.playerService.primaryChatTabIdentifier;
          if (!this.chatTab) {
            this._chatTabidentifier = 0 < this.chatMessageService.chatTabs.length ? this.chatMessageService.chatTabs[0].identifier : '';
            this.playerService.primaryChatTabIdentifier = this._chatTabidentifier;
          }
      }
      else {
        this._chatTabidentifier = 0 < this.chatMessageService.chatTabs.length ? this.chatMessageService.chatTabs[0].identifier : '';
        if (this.isPrimary) this.playerService.primaryChatTabIdentifier = this._chatTabidentifier;
      }
      this.updatePanelTitle();
    });
  }

  ngAfterViewInit():void {
    this.scrollToBottom(true);
  }

  ngOnDestroy():void {
    if (this.isPrimary) this.playerService.primaryChatWindowID = "";
    EventSystem.unregister(this);
  }

  messageEdit(value: { chatMessage: ChatMessage} ):void {
    this.editMessage = value.chatMessage;
    this.isEdit = true;
  }

  // @TODO やり方はもう少し考えた方がいいい
  scrollToBottom(isForce: boolean = false):void {
    if (!this.canAutoScroll) return;
    if (isForce) this.isAutoScroll = true;
    if (this.scrollToBottomTimer != null || !this.isAutoScroll) return;
    this.scrollToBottomTimer = setTimeout(() => {
      if (this.chatTab) this.chatTab.markForRead();
      this.scrollToBottomTimer = null;
      this.isAutoScroll = false;
      if (this.panelService.scrollablePanel) {
        this.panelService.scrollablePanel.scrollTop = this.panelService.scrollablePanel.scrollHeight;
        let event = new CustomEvent('scrolltobottom', {});
        this.panelService.scrollablePanel.dispatchEvent(event);
      }
    }, 0);
  }

  // @TODO
  checkAutoScroll():void {
    if (!this.panelService.scrollablePanel) return;
    let top = this.panelService.scrollablePanel.scrollHeight - this.panelService.scrollablePanel.clientHeight;
    if (top - 150 <= this.panelService.scrollablePanel.scrollTop) {
      this.isAutoScroll = true;
    } else {
      this.isAutoScroll = false;
    }
  }

  updatePanelTitle():void {
    let title = this.isPrimary ? '*チャットウィンドウ*' : 'チャットウィンドウ';
    if (this.chatTab) {
      this.panelService.title = title + ' - ' + this.chatTab.name;
    } else {
      this.panelService.title = title;
    }
  }

  showTabSetting():void {
    let coordinate = this.pointerDeviceService.pointers[0];
    let option: PanelOption = { left: coordinate.x - 300, top: coordinate.y - 250, width: 500, height: 500 };
    let component = this.panelService.open<ChatTabSettingComponent>(ChatTabSettingComponent, option);
    component.selectedTab = this.chatTab;
    component.identifier = this.chatWindowID;
    component.localFontsize = this.localFontsize;
    component.bgColor = this.bgColor;
    component.isEase = this.isEase;
    component.isLogOnly = this.isLogOnly;
    component.controlType = this.controlType;
  }

  sendChat(value: { text: string, gameType: string, sendFrom: string, sendTo: string,
    isUseFaceIcon?:boolean ,isCharacter?: boolean, standName?: string, isUseStandImage?: boolean }):void {
    if (this.chatTab) {
      if (!this.chatTab.isAllowed) return;
      this.chatMessageService.sendMessage(
        this.chatTab,
        value.text,
        value.gameType,
        value.sendFrom,
        value.sendTo,
        value.isCharacter,
        value.isUseFaceIcon,
        value.isUseStandImage,
        value.standName
      );
    }
  }

  trackByChatTab(index: number, chatTab: ChatTab):string {
    return chatTab.identifier;
  }
}
