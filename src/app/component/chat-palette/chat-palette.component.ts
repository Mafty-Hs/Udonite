import { Component, ElementRef, Input, OnDestroy, OnInit, ViewChild } from '@angular/core';
import { ChatPalette } from '@udonarium/chat-palette';
import { ChatTab } from '@udonarium/chat-tab';
import { ObjectStore } from '@udonarium/core/synchronize-object/object-store';
import { EventSystem } from '@udonarium/core/system';
import { GameCharacter } from '@udonarium/game-character';
import { PeerCursor } from '@udonarium/peer-cursor';
import { ChatInputComponent } from 'component/chat-input/chat-input.component';
import { ChatMessageService } from 'service/chat-message.service';
import { PanelService } from 'service/panel.service';
import { DiceBotService } from 'service/dice-bot.service';

@Component({
  selector: 'chat-palette',
  templateUrl: './chat-palette.component.html',
  styleUrls: ['./chat-palette.component.css']
})
export class ChatPaletteComponent implements OnInit, OnDestroy {
  @ViewChild('chatInput', { static: true }) chatInputComponent: ChatInputComponent;
  @ViewChild('chatPlette') chatPletteElementRef: ElementRef<HTMLSelectElement>;
  @Input() character: GameCharacter = null;

  get palette(): ChatPalette { return this.character.chatPalette; }

  get color(): string {
    return this.chatInputComponent.color;
  }

  private _gameType: string = '';
  get gameType(): string { return this._gameType };
  set gameType(gameType: string) {
    this._gameType = gameType;
    if (this.character.chatPalette) this.character.chatPalette.dicebot = gameType;
  };

  get sendFrom(): string { return this.character.identifier; }
  set sendFrom(sendFrom: string) {
    this.onSelectedCharacter(sendFrom);
  }

  chatTabidentifier: string = '';
  text: string = '';
  sendTo: string = '';

  isEdit: boolean = false;
  editPalette: string = '';

  filterText = '';

  private doubleClickTimer: NodeJS.Timer = null;

  private selectedPaletteIndex = -1;

  get diceBotInfos() { return this.diceBotService.diceBotInfos }

  get chatTab(): ChatTab { return ObjectStore.instance.get<ChatTab>(this.chatTabidentifier); }
  get myPeer(): PeerCursor { return PeerCursor.myCursor; }
  get otherPeers(): PeerCursor[] { return ObjectStore.instance.getObjects(PeerCursor); }

  constructor(
    public chatMessageService: ChatMessageService,
    private panelService: PanelService,
    private diceBotService: DiceBotService
  ) { }

  ngOnInit() {
    Promise.resolve().then(() => this.updatePanelTitle());
    this.chatTabidentifier = this.chatMessageService.chatTabs ? this.chatMessageService.chatTabs[0].identifier : '';
    this.gameType = this.character.chatPalette ? this.character.chatPalette.dicebot : '';
    EventSystem.register(this)
      .on('DELETE_GAME_OBJECT', -1000, event => {
        if (this.character && this.character.identifier === event.data.identifier) {
          this.panelService.close();
        }
        if (this.chatTabidentifier === event.data.identifier) {
          this.chatTabidentifier = this.chatMessageService.chatTabs ? this.chatMessageService.chatTabs[0].identifier : '';
        }
      });
  }

  ngOnDestroy() {
    EventSystem.unregister(this);
    if (this.isEdit) this.toggleEditMode();
  }

  updatePanelTitle() {
    this.panelService.title = this.character.name + ' のチャットパレット';
  }

  onSelectedCharacter(identifier: string) {
    if (this.isEdit) this.toggleEditMode();
    let object = ObjectStore.instance.get(identifier);
    if (object instanceof GameCharacter) {
      this.character = object;
      let gameType = this.character.chatPalette ? this.character.chatPalette.dicebot : '';
      if (0 < gameType.length) this.gameType = gameType;
    }
    this.updatePanelTitle();
  }

  selectPalette(line: string) {
    this.text = line;
    /* 作りかけ、とりあえず封印
    setTimeout(() => {
      this.filterText = line;
    }, 300);
    */
  }

  clickPalette(line: string) {
    if (!this.chatPletteElementRef.nativeElement) return;
    const evaluatedLine = this.palette.evaluate(line, this.character.rootDataElement);
    if (this.doubleClickTimer && this.selectedPaletteIndex === this.chatPletteElementRef.nativeElement.selectedIndex) {
      clearTimeout(this.doubleClickTimer);
      this.doubleClickTimer = null;
      this.chatInputComponent.sendChat(null);
    } else {
      this.selectedPaletteIndex = this.chatPletteElementRef.nativeElement.selectedIndex;
      this.text = evaluatedLine;
      let textArea: HTMLTextAreaElement = this.chatInputComponent.textAreaElementRef.nativeElement;
      textArea.value = this.text;
      this.doubleClickTimer = setTimeout(() => { this.doubleClickTimer = null }, 400);
    }
  }

  sendChat(value: { text: string, gameType: string, sendFrom: string, sendTo: string,
    color?: string, isInverse?:boolean, isHollow?: boolean, isBlackPaint?: boolean, aura?: number, isUseFaceIcon?: boolean, characterIdentifier?: string, standIdentifier?: string, standName?: string, isUseStandImage?: boolean }) {
    if (this.chatTab) {
      let text = this.palette.evaluate(value.text, this.character.rootDataElement);
      this.chatMessageService.sendMessage(
        this.chatTab, 
        text, 
        value.gameType, 
        value.sendFrom, 
        value.sendTo,
        value.color, 
        value.isInverse,
        value.isHollow,
        value.isBlackPaint,
        value.aura,
        value.isUseFaceIcon,
        value.characterIdentifier,
        value.standIdentifier,
        value.standName,
        value.isUseStandImage
      );
      this.filterText = '';
    }
  }

  resetPletteSelect() {
    if (!this.chatPletteElementRef.nativeElement) return;
    this.chatPletteElementRef.nativeElement.selectedIndex = -1;
  }

  toggleEditMode() {
    this.isEdit = this.isEdit ? false : true;
    if (this.isEdit) {
      this.editPalette = this.palette.value + '';
    } else {
      this.palette.setPalette(this.editPalette);
    }
  }
  //ToDO あいまい検索
  filter(value: string): boolean {
    if (this.filterText == null || this.filterText.trim() == '') return true;
    return value.search(this.filterText) >= 0;
  }
}
