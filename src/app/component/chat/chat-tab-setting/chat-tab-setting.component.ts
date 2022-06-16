import { Component, OnDestroy, OnInit,ChangeDetectorRef } from '@angular/core';

import { ChatTab } from '@udonarium/chat-tab';
import { ChatTabList } from '@udonarium/chat-tab-list';
import { ObjectSerializer } from '@udonarium/core/synchronize-object/object-serializer';
import { ObjectStore } from '@udonarium/core/synchronize-object/object-store';
import { EventSystem } from '@udonarium/core/system';

import { ChatMessageService } from 'service/chat-message.service';
import { ModalService } from 'service/modal.service';
import { PanelService } from 'service/panel.service';
import { PlayerService } from 'service/player.service';
import { RoomService } from 'service/room.service';
import { SaveDataService } from 'service/save-data.service';

import { LogSaveComponent } from 'component/log-save/log-save.component';

interface allowedPlayer {
  playerName: string;
  playerId: string;
};
export class ChatWindowSetting {
  chatWindowIdentifier :string;
  localFontsize :number;
  bgColor :string;
  isEase :boolean;
  isLogOnly :boolean;
  controlType :string;
}

@Component({
  selector: 'app-chat-tab-setting',
  templateUrl: './chat-tab-setting.component.html',
  styleUrls: ['./chat-tab-setting.component.css'],
})
export class ChatTabSettingComponent implements OnInit, OnDestroy {
  _selectedTabIdentifier: string = "";
  get selectedTabIdentifier():string { return this._selectedTabIdentifier };
  set selectedTabIdentifier(selectedTabIdentifier:string) {
    this._selectedTabIdentifier = selectedTabIdentifier;
    this.selectedTab = ObjectStore.instance.get<ChatTab>(this._selectedTabIdentifier);
    this.selectedTabXml = '';
    this.updateAllowPlayers();
  };

  selectedTab: ChatTab = null;
  selectedTabXml: string = '';
  chatWindowSetting: ChatWindowSetting = null;

  get tabName(): string { return this.selectedTab.name; }
  set tabName(tabName: string) { if (this.isEditable) this.selectedTab.name = tabName; }

  get isUseStandImage(): boolean { return this.selectedTab.isUseStandImage; }
  set isUseStandImage(isUseStandImage: boolean) { if (this.isEditable) this.selectedTab.isUseStandImage = isUseStandImage; }

  get chatTabs(): ChatTab[] { return this.chatMessageService.chatTabs; }
  get isEmpty(): boolean { return this.chatMessageService.chatTabs.length < 1 }
  get isDeleted(): boolean { return this.selectedTab ? ObjectStore.instance.get(this.selectedTab.identifier) == null : false; }
  get isEditable(): boolean { return !this.isEmpty && !this.isDeleted; }

  get disableTabSetting(): boolean { return this.roomService.disableTabSetting; }

  get adminAuth():boolean { return this.roomService.adminAuth;}

  allowPlayers:allowedPlayer[] = [];
  updateAllowPlayers():void {
    if (this.selectedTab) {
      this.allowPlayers = this.selectedTab.allowedPlayers.map(playerId => {
        let player = this.playerService.getPlayerById(playerId);
        if (player) return {playerName: player.name ,playerId: playerId }
      });
    }
    else {
      this.allowPlayers = [];
    }
    this.changeDetector.detectChanges();
  }

  isSaveing:boolean = false;
  progresPercent: number = 0;

  get identifier(): string { return this.chatWindowSetting.chatWindowIdentifier; }
  get localFontsize(): number { return this.chatWindowSetting.localFontsize; }
  set localFontsize(localFontSize : number) { this.chatWindowSetting.localFontsize = localFontSize;this.settingUpdate(); }
  get bgColor(): string { return this.chatWindowSetting.bgColor; }
  set bgColor(bgColor :string) { this.chatWindowSetting.bgColor = bgColor;this.settingUpdate();  }
  get isEase(): boolean { return this.chatWindowSetting.isEase; }
  set isEase(isEase :boolean) { this.chatWindowSetting.isEase = isEase;this.settingUpdate();  }
  get isLogOnly(): boolean { return this.chatWindowSetting.isLogOnly; }
  set isLogOnly(isLogOnly :boolean) { this.chatWindowSetting.isLogOnly = isLogOnly;}
  get controlType(): string  { return this.chatWindowSetting.controlType; }
  set controlType(controlType :string) { this.chatWindowSetting.controlType = controlType; }

  updateTimer:NodeJS.Timer;
  settingUpdate() {
    if (this.updateTimer) clearTimeout(this.updateTimer);
    this.updateTimer = setTimeout(()=>{EventSystem.trigger('CHAT_WINDOW_UPDATE',this.identifier)} , 300)
  }

  constructor(
    private changeDetector: ChangeDetectorRef,
    private modalService: ModalService,
    private panelService: PanelService,
    private playerService: PlayerService,
    public roomService: RoomService,
    private chatMessageService: ChatMessageService,
    private saveDataService: SaveDataService,
  ) { }

  ngOnInit() {
    Promise.resolve().then(() => this.modalService.title = this.panelService.title = 'チャット設定');
    EventSystem.register(this)
      .on('DELETE_GAME_OBJECT', 1000, event => {
        if (!this.selectedTab || event.data.identifier !== this.selectedTab.identifier) return;
        let object = ObjectStore.instance.get(event.data.identifier);
        if (object !== null) {
          this.selectedTabXml = object.toXml();
        }
      });
    this.selectedTabIdentifier = this.chatTabs[0].identifier;
  }

  ngOnDestroy() {
    EventSystem.unregister(this);
  }

  create() {
    ChatTabList.instance.addChatTab('タブ');
  }

  htmlsave() {
    if (!this.selectedTab) return;
    this.modalService.open<string>(LogSaveComponent, { chatTabIdentifier: this.selectedTab.identifier });
  }

  async save() {
    if (!this.selectedTab || this.isSaveing) return;
    this.isSaveing = true;
    this.progresPercent = 0;

    let fileName: string = 'chat_' + this.selectedTab.name;

    await this.saveDataService.saveGameObjectAsync(this.selectedTab, fileName, percent => {
      this.progresPercent = percent;
    });

    setTimeout(() => {
      this.isSaveing = false;
      this.progresPercent = 0;
    }, 500);
  }
  logClear() {
    if (!this.isEmpty && this.selectedTab) {
      if (confirm('「' + this.selectedTab.name + '」のログを全て削除します。\nこのまま続行すると復活できません。\nよろしいですか？')) {
        this.selectedTab.clearAll();
        let text = "ログは" + this.playerService.myPlayer.name  + "が削除しました";
        this.chatMessageService.sendMessage(this.selectedTab,text,"","System");
      }
    }
  }

  delete() {
    if (!this.isEmpty && this.selectedTab) {
      this.selectedTabXml = this.selectedTab.toXml();
      this.selectedTab.destroy();
      this.selectedTabIdentifier = '';
      this.selectedTab = null;
      EventSystem.call('UPDATE_CHATTAB',null)
    }
  }

  restore() {
    if (this.selectedTab && this.selectedTabXml) {
      let restoreTable = <ChatTab>ObjectSerializer.instance.parseXml(this.selectedTabXml);
      ChatTabList.instance.addChatTab(restoreTable);
      this.selectedTabXml = '';
    }
  }

  upTabIndex() {
    if (!this.selectedTab) return;
    let parentElement = this.selectedTab.parent;
    let index: number = parentElement.children.indexOf(this.selectedTab);
    if (0 < index) {
      let prevElement = parentElement.children[index - 1];
      parentElement.insertBefore(this.selectedTab, prevElement);
    }
  }

  downTabIndex() {
    if (!this.selectedTab) return;
    let parentElement = this.selectedTab.parent;
    let index: number = parentElement.children.indexOf(this.selectedTab);
    if (index < parentElement.children.length - 1) {
      let nextElement = parentElement.children[index + 1];
      parentElement.insertBefore(nextElement, this.selectedTab);
    }
  }

  select_player:string ="";

  addPlayer() {
    if (!this.selectedTab || !this.select_player) return;
    if (this.selectedTab.allowedPlayers.includes(this.select_player)) return;
    this.selectedTab.allowedPlayers.push(this.select_player);
    this.selectedTab.update();
    this.select_player = "";
    this.updateAllowPlayers();
  }

  removePlayer(playerId :string) {
    if (!this.selectedTab) return;
    if (!this.selectedTab.allowedPlayers.includes(playerId)) return;
    this.selectedTab.allowedPlayers = this.selectedTab.allowedPlayers.filter( _playerid => _playerid != playerId );
    this.selectedTab.update();
    this.updateAllowPlayers();
  }
}
