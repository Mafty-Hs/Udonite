import { Component, ElementRef, Input, OnDestroy, OnInit, ViewChild } from '@angular/core';
import { ChatPalette } from '@udonarium/chat-palette';
import { ChatTab } from '@udonarium/chat-tab';
import { ObjectStore } from '@udonarium/core/synchronize-object/object-store';
import { EventSystem } from '@udonarium/core/system';
import { DiceBot } from '@udonarium/dice-bot';
import { GameCharacter } from '@udonarium/game-character';
import { PeerCursor } from '@udonarium/peer-cursor';
import { ChatInputComponent } from 'component/chat-input/chat-input.component';
import { ChatMessageService } from 'service/chat-message.service';
import { PanelService } from 'service/panel.service';

@Component({
  selector: 'app-player-palette',
  templateUrl: './player-palette.component.html',
  styleUrls: ['./player-palette.component.css']
})
export class PlayerPaletteComponent implements OnInit, OnDestroy {
  @ViewChild('chatInput', { static: true }) chatInputComponent: ChatInputComponent;
  @ViewChild('chatPlette') chatPletteElementRef: ElementRef<HTMLSelectElement>;
  @Input() character: GameCharacter = null;

  get paletteList(): string[] {
    return PeerCursor.myCursor.paletteList;
  }
  set paletteList(identifers: string[]) {
    PeerCursor.myCursor.paletteList = identifers;
  };

  //Peerに紐付けると循環参照になるため、一旦コンポーネントに持たせる
  localpalette: ChatPalette = new ChatPalette('ChatPalette');
  get palette(): ChatPalette { 
    if (this.isMine(this.sendFrom)) {
      return this.localpalette; 
    }
    else {
      return this.getcharacter(this.sendFrom).chatPalette;
   }
  }

  get color(): string {
    return this.chatInputComponent.color;
  }
  private doubleClickTimer: NodeJS.Timer = null;
  private selectedPaletteIndex = -1;
  private _gameType: string = '';
  get gameType(): string { return this._gameType };
  set gameType(gameType: string) {
    this._gameType = gameType;
    if (this.character.chatPalette) this.character.chatPalette.dicebot = gameType;
  };

  private isMine(identifier: string):boolean {
    if (identifier == this.myPeer.identifier) {
      return true;
    }
    return false;
  }

  _sendFrom: string = this.myPeer.identifier;
  get sendFrom(): string { return this._sendFrom; }
  set sendFrom(sendFrom: string) {
    this._sendFrom = sendFrom;
    if (this.isEdit) this.toggleEditMode();
    if (!this.isMine(sendFrom)){
      this.character = this.getcharacter(sendFrom);
    }  
  }

  get myPeer(): PeerCursor { return PeerCursor.myCursor; }
  get otherPeers(): PeerCursor[] { return ObjectStore.instance.getObjects(PeerCursor); }
  get chatTab(): ChatTab { return ObjectStore.instance.get<ChatTab>(this.chatTabidentifier); }

  chatTabidentifier: string = '';
  text: string = '';
  sendTo: string = '';
  selectedCharacter: string = 'default';
  isEdit:boolean = false;
  hidePalette:boolean = false;
  editPalette: string = '';

  private shouldUpdateCharacterList: boolean = true;
  private _gameCharacters: GameCharacter[] = [];
  getcharacter(charaidentifier: string): GameCharacter {
    let object = ObjectStore.instance.get(charaidentifier);
    if (object instanceof GameCharacter) {
      return object;
    }
    return null;
  } 
  get gameCharacters(): GameCharacter[] {
    if (this.shouldUpdateCharacterList) {
      this.shouldUpdateCharacterList = false;
      this._gameCharacters = ObjectStore.instance
        .getObjects<GameCharacter>(GameCharacter)
        .filter(character => this.locationCheck(character));
    }
    return this._gameCharacters;
  }
  private locationCheck(gameCharacter: GameCharacter): boolean {
    if (!gameCharacter) return false; 
    switch (gameCharacter.location.name) {
      case 'table':
        return true;
      case 'graveyard':
        return false;
      default :
        return true;
    }
  }

 sendChat(value: { text: string, gameType: string, sendFrom: string, sendTo: string,
    color?: string, isInverse?:boolean, isHollow?: boolean, isBlackPaint?: boolean, aura?: number, isUseFaceIcon?: boolean, characterIdentifier?: string, standIdentifier?: string, standName?: string, isUseStandImage?: boolean }) {
    if (this.chatTab) {
        let text = this.evaluatLine(value.text);
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
    if (this.checkList(this.selectedCharacter)) { return }
    this.paletteList.push(this.selectedCharacter);
    this.selectedCharacter = 'default';
  }

  removeList(identifier: string) {
    if (identifier == this.myPeer.identifier) {return}
    if (identifier == this.sendFrom) {this.sendFrom = this.myPeer.identifier;}
    const index = this.paletteList.indexOf(identifier);
    if (index > -1) {
      this.paletteList.splice(index, 1);
    }
  }

  private checkList(identifier: string):boolean {     
    if (this.paletteList.indexOf(identifier) >= 0) { return true } 
    return false; 
  }

  constructor(
    public chatMessageService: ChatMessageService,
    private panelService: PanelService
  ) { }

  ngOnInit() {
    Promise.resolve().then(() => this.panelService.title = 'パレットバインダー');
    this.chatTabidentifier = this.chatMessageService.chatTabs ? this.chatMessageService.chatTabs[0].identifier : '';
    this.localpalette.setPalette(`プレイヤーチャットパレット`);
    for (const identifier of this.paletteList) {
      if (!this.locationCheck(this.getcharacter(identifier))) {
        this.removeList(identifier);
      }
    }
    EventSystem.register(this)
      .on('UPDATE_GAME_OBJECT', -1000, event => {
        if (event.data.aliasName !== GameCharacter.aliasName) return;
        if (!this.locationCheck(this.getcharacter(event.data.identifier))) {
          this.removeList(event.data.identifier); 
        }
        this.shouldUpdateCharacterList = true;
      })
      .on('DELETE_GAME_OBJECT', -1000, event => {
        if (this.chatTabidentifier === event.data.identifier) {
          this.chatTabidentifier = this.chatMessageService.chatTabs ? this.chatMessageService.chatTabs[0].identifier : '';
        }
        if (this.checkList(event.data.identifier)) {
          this.removeList(event.data.identifier);
        }
      });
  }

  ngOnDestroy() {
    EventSystem.unregister(this);
  }

  selectPalette(line: string) {
    this.text = line;
  }

}
