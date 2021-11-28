import { Component, ElementRef, Input, OnDestroy, OnInit, ViewChild } from '@angular/core';
import { ChatPalette, SubPalette } from '@udonarium/chat-palette';
import { ChatTab } from '@udonarium/chat-tab';
import { ObjectStore } from '@udonarium/core/synchronize-object/object-store';
import { EventSystem, Network } from '@udonarium/core/system';
import { GameCharacter } from '@udonarium/game-character';
import { PeerCursor } from '@udonarium/peer-cursor';
import { ChatInputComponent } from 'component/chat-input/chat-input.component';
import { SimpleCreateComponent } from 'component/simple-create/simple-create.component';
import { GameCharacterSheetComponent } from 'component/game-character-sheet/game-character-sheet.component';
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

  _selectCharacter:string = this.myPeer.identifier + ',-1';
  get selectCharacter() :string {return this._selectCharacter};
  set selectCharacter(select :string) {
    if (!select) return;
    this._selectCharacter = select;
    if (this.isEdit) this.toggleEditMode();
    let array = select.split(',');
    this.paletteIndex = Number(array[1]);
    this.sendFrom = array[0];
    if (this.isMine(this.sendFrom)){
      this.disableControl = true;
    }
    else {
      this.disableControl = false;
    }  
  }
  paletteIndex:number = -1;

  subPalette(character: GameCharacter): SubPalette {
     for (let child of character.children) {
      if (child instanceof SubPalette) return child;
    }
    return null;
  }
  addPalette() {
    let subPalette:SubPalette = this.subPalette(this.character);
    if (!subPalette) {
      subPalette = new SubPalette;
      subPalette.initialize;
      this.character.appendChild(subPalette);
    }
    let palette = new ChatPalette;
    palette.initialize;
    let initPalette:string = this.character.name + 'の追加パレット\n//1行目がタブに表示されるタイトルになります\n'; 
    palette.setPalette(initPalette);
    palette.getPalette();
    subPalette.palette.push(palette);
  }
  removePalette() {
    let tmp = this.paletteIndex;
    this.paletteIndex = -1;
    this.subPalette(this.character).palette.splice(tmp,1);
    this.selectCharacter = this.sendFrom + ',-1';
  }

  get palette(): ChatPalette { 
    if (this.paletteIndex == -1) {
      if (this.isMine(this.sendFrom)) {
        return  this.playerService.localpalette; 
      }
      else {
        return this.character.chatPalette;
      }
    }
    else {
      return this.subPalette(this.character).palette[this.paletteIndex];
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

  sendFrom: string = this.myPeer.identifier;

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
    if (this.selectedCharacter == 'create') { 
      let coordinate = this.pointerDeviceService.pointers[0];
      let option: PanelOption = { left: coordinate.x - 200 , top: coordinate.y -200, width: 300, height: 200 };
      let component = this.panelService.open(SimpleCreateComponent, option);
      component.panelService.title = "キャラクター簡易作成"
      return; 
    }
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

  private showDetail(gameObject: GameCharacter) {
    let coordinate = this.pointerDeviceService.pointers[0];
    let title = 'キャラクターシート';
    if (gameObject.name.length) title += ' - ' + gameObject.name;
    let option: PanelOption = { title: title, left: coordinate.x - 400, top: coordinate.y - 300, width: 800, height: 600 };
    let component = this.panelService.open<GameCharacterSheetComponent>(GameCharacterSheetComponent, option);
    component.tabletopObject = gameObject;
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
    let aura = ['ブラック', 'ブルー', 'グリーン', 'シアン', 'レッド', 'マゼンタ', 'イエロー', 'ホワイト'].map((color, i) => {
                return { name: `${gameObject.aura == i ? '◉' : '○'} ${color}`,
                action: () => { gameObject.aura = i}} 
              });

    actions.push({ name: '画像効果', action: null, subActions: [
        (gameObject.isInverse
          ? {
            name: '☑ 反転', action: () => {
              gameObject.isInverse = false;
            }
          } : {
            name: '☐ 反転', action: () => {
              gameObject.isInverse = true;
            }
          }),
        (gameObject.isHollow
          ? {
            name: '☑ ぼかし', action: () => {
              gameObject.isHollow = false;
            }
          } : {
            name: '☐ ぼかし', action: () => {
              gameObject.isHollow = true;
            }
          }),
        (gameObject.isBlackPaint
          ? {
            name: '☑ 黒塗り', action: () => {
              gameObject.isBlackPaint = false;
            }
          } : {
            name: '☐ 黒塗り', action: () => {
              gameObject.isBlackPaint = true;
            }
          }),
        { name: 'オーラ', 
          action: null,   
          subActions: [
            { name: `${gameObject.aura == -1 ? '◉' : '○'} なし`,
             action: () => { gameObject.aura = -1} },
            ContextMenuSeparator]
            .concat(aura)
        }
      ]});
    actions.push(ContextMenuSeparator);
    for (let location of locations) {
      if (gameObject.location.name === location.name) continue;
      actions.push({
        name: location.alias, action: () => {
          gameObject.setLocation(location.name);
        }
      });
    }
    actions.push(ContextMenuSeparator);
    actions.push({
      name: '詳細を表示', action: () => { this.showDetail(gameObject); } 
    });
    this.contextMenuService.open(position, actions, gameObject.name);
  }

}
