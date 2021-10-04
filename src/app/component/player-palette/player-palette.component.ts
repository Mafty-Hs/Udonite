import { Component, ElementRef, Input, OnDestroy, OnInit, ViewChild } from '@angular/core';
import { ChatPalette } from '@udonarium/chat-palette';
import { ChatTab } from '@udonarium/chat-tab';
import { ObjectStore } from '@udonarium/core/synchronize-object/object-store';
import { EventSystem, Network } from '@udonarium/core/system';
import { DiceBot } from '@udonarium/dice-bot';
import { GameCharacter } from '@udonarium/game-character';
import { PeerCursor } from '@udonarium/peer-cursor';
import { ChatInputComponent } from 'component/chat-input/chat-input.component';
import { PlayerPaletteControlComponent } from 'component/player-palette-control/player-palette-control.component';
import { GameCharacterService } from 'service/game-character.service';
import { PlayerService } from 'service/player.service';
import { ChatMessageService } from 'service/chat-message.service';
import { PanelOption, PanelService } from 'service/panel.service';
import { ContextMenuAction, ContextMenuService, ContextMenuSeparator } from 'service/context-menu.service';
import { PointerDeviceService } from 'service/pointer-device.service';

@Component({
  selector: 'player-palette',
  templateUrl: './player-palette.component.html',
  styleUrls: ['./player-palette.component.css']
})
export class PlayerPaletteComponent implements OnInit, OnDestroy {
  @ViewChild('chatInput', { static: true }) chatInputComponent: ChatInputComponent;
  @ViewChild('playerPaletteControl', { static: true }) playerPaletteControlComponent: PlayerPaletteControlComponent;
  @ViewChild('chatPlette') chatPletteElementRef: ElementRef<HTMLSelectElement>;
  @ViewChild('characterSelect') characterSelect: ElementRef;


  get character() {
    return this.gameCharacterService.get(this.sendFrom);
  } ;

  get paletteList(): string[] {
    return this.playerService.paletteList;
  }
  get characterPaletteList(): GameCharacter[] {
    return this.paletteList.map( identifier => 
      this.gameCharacterService.get(identifier)
    )
  }

  get palette(): ChatPalette { 
    if (this.isMine(this.sendFrom)) {
      return  this.playerService.localpalette; 
    }
    else {
      return this.character.chatPalette;
   }
  }
  
  _disableControl : boolean = true;
  get disableControl(): boolean { return this._disableControl };
  set disableControl(control: boolean) {
    this._disableControl = control;
  };

  get color(): string {
    return this.chatInputComponent.color;
  }
  private doubleClickTimer: NodeJS.Timer = null;
  private selectedPaletteIndex = -1;

  private isMine(identifier: string):boolean {
    if (identifier == this.myPeer.identifier) {
      return true;
    }
    return false;
  }

  _sendFrom: string = this.myPeer.identifier;
  get sendFrom(): string { return this._sendFrom; }
  set sendFrom(sendFrom: string) {
    if (!sendFrom) return;
    this._sendFrom = sendFrom;
    if (this.isEdit) this.toggleEditMode();
    if (this.isMine(sendFrom)){
      this.disableControl = true;
    }
    else {
      this.disableControl = false;
    }  
  }

  resizeHeight() {
    if(this.characterSelect.nativeElement.clientHeight > 32
      && this.panelService.height == 400) 
      this.panelService.height += 32 ;
    if(this.characterSelect.nativeElement.clientHeight == 32
      && this.panelService.height > 400) 
      this.panelService.height -= 32 ;

  }

  get myPeer(): PeerCursor { return PeerCursor.myCursor; }
  get otherPeers(): PeerCursor[] { return ObjectStore.instance.getObjects(PeerCursor); }
  get chatTab(): ChatTab { return ObjectStore.instance.get<ChatTab>(this.chatTabidentifier); }

  chatTabidentifier: string = '';
  text: string = '';
  selectedCharacter: string = 'default';
  isEdit:boolean = false;
  editPalette: string = '';
  _showPalette:boolean = true;
  get showPalette(): boolean { return this._showPalette };
  set showPalette(showPalette: boolean) {
    if (showPalette) {
      this.panelService.height += 100 ;
    }
    else {
      this.panelService.height -= 100 ;
    }
    this._showPalette = showPalette;
  };

  get gameCharacters(): GameCharacter[] {
    let onlyTable : boolean = false;
    return this.gameCharacterService.list(onlyTable);
  }

  sendChat(value: { text: string, gameType: string, sendFrom: string, sendTo: string,    isUseFaceIcon?:boolean, isCharacter?: boolean, standName?: string, isUseStandImage?: boolean }) {
    if (this.chatTab) {
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

  private evaluatLine(line: string): string {
    if (this.isMine(this.sendFrom)) {
      return this.palette.evaluate(line);
    }
    else {
      return this.palette.evaluate(line, this.character.rootDataElement);
    }
  }

  clickPalette(line: string) {
    if (!this.chatPletteElementRef.nativeElement) return;
    const evaluatedLine = this.evaluatLine(line); 
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

  addList() {
    if (this.selectedCharacter == 'default') { return }
    this.playerService.addList(this.selectedCharacter);
    this.selectedCharacter = 'default';
    this.resizeHeight();
  }

  removeList(identifier: string) {
    this.playerService.removeList(identifier);
    this.resizeHeight();
  }

  constructor(
    public chatMessageService: ChatMessageService,
    private panelService: PanelService,
    private gameCharacterService: GameCharacterService,
    private playerService: PlayerService,
    private contextMenuService: ContextMenuService,
    private pointerDeviceService: PointerDeviceService,
  ) { }

  ngOnInit() {
    Promise.resolve().then(() => this.panelService.title = 'パレットバインダー');
    this.chatTabidentifier = this.chatMessageService.chatTabs ? this.chatMessageService.chatTabs[0].identifier : '';
    EventSystem.register(this)
      .on('DELETE_GAME_OBJECT', -1000, event => {
        if (this.chatTabidentifier === event.data.identifier) {
          this.chatTabidentifier = this.chatMessageService.chatTabs ? this.chatMessageService.chatTabs[0].identifier : '';
        }
      });
   if(!this.playerService.myPalette) this.playerService.myPalette = this;
  }

  ngOnDestroy() {
    EventSystem.unregister(this);
    this.playerService.myPalette = null;
  }

  selectPalette(line: string) {
    this.text = line;
  }

  displayContextMenu(e: Event , gameObject: GameCharacter) {
    if (document.activeElement instanceof HTMLInputElement && document.activeElement.getAttribute('type') !== 'range') return;
    e.stopPropagation();
    e.preventDefault();

    if (!this.pointerDeviceService.isAllowedToOpenContextMenu) return;
    let position = this.pointerDeviceService.pointers[0];
    let actions: ContextMenuAction[] = [];
    let locations = [
      { name: 'table', alias: 'テーブルへ移動' },
      { name: 'common', alias: '共有インベントリへ移動' },
      { name: Network.peerId, alias: '個人インベントリへ移動' },
      { name: 'graveyard', alias: '墓場へ移動' }
    ];
    actions.push(ContextMenuSeparator);
    for (let location of locations) {
      if (gameObject.location.name === location.name) continue;
      actions.push({
        name: location.alias, action: () => {
          gameObject.setLocation(location.name);
        }
      });
    }
    this.contextMenuService.open(position, actions, gameObject.name);
  }

}
