import { Component, ElementRef, OnDestroy, OnInit, ViewChild, ChangeDetectionStrategy,ChangeDetectorRef } from '@angular/core';
import { ChatPalette, SubPalette } from '@udonarium/chat-palette';
import { ChatTab } from '@udonarium/chat-tab';
import { ObjectStore } from '@udonarium/core/synchronize-object/object-store';
import { EventSystem } from '@udonarium/core/system';
import { GameCharacter } from '@udonarium/game-character';
import { ChatInputComponent } from '../chat-input/chat-input.component';
import { SimpleCreateComponent } from 'component/simple-create/simple-create.component';
import { GameCharacterSheetComponent } from 'component/game-character-sheet/game-character-sheet.component';
import { PlayerPaletteControlComponent } from '../player-palette-control/player-palette-control.component';
import { GameCharacterService } from 'service/game-character.service';
import { PlayerService } from 'service/player.service';
import { ChatMessageService } from 'service/chat-message.service';
import { PanelOption, PanelService } from 'service/panel.service';
import { ModalService } from 'service/modal.service';
import { ContextMenuAction, ContextMenuService, ContextMenuSeparator } from 'service/context-menu.service';
import { PointerDeviceService } from 'service/pointer-device.service';
import { Player } from '@udonarium/player';
import { ImageFile } from '@udonarium/core/file-storage/image-file';
import { Subscription } from 'rxjs';

@Component({
  selector: 'player-palette',
  templateUrl: './player-palette.component.html',
  styleUrls: ['../../../common/component.common.css','./player-palette.component.css','../chat-window.common.css','../chat-window.design.css'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class PlayerPaletteComponent implements OnInit, OnDestroy {
  @ViewChild('chatInput', { static: true }) chatInputComponent: ChatInputComponent;
  @ViewChild('playerPaletteControl', { static: true }) playerPaletteControlComponent: PlayerPaletteControlComponent;
  @ViewChild('chatPlette') chatPletteElementRef: ElementRef<HTMLSelectElement>;
  @ViewChild('characterSelect') characterSelect: ElementRef;

  private chatTabSubscriber:Subscription;

  private _isSyncChatWindow:boolean = true;
  get isSyncChatWindow():boolean {
    return this._isSyncChatWindow
  }
  set isSyncChatWindow(isSyncChatWindow :boolean){
    if (isSyncChatWindow) this.chatTabidentifier = this.playerService.primaryChatTabIdentifier;
    this._isSyncChatWindow = isSyncChatWindow;
  }

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

  get myPlayerId():string {
    return this.playerService.myPlayer.playerId;
  }

  _selectCharacter:string = this.myPlayerId + ',-1';
  get selectCharacter() :string {return this._selectCharacter};
  set selectCharacter(select :string) {
    if (!select) return;
    this._selectCharacter = select;
    if (this.isEdit) this.toggleEditMode();
    let array = select.split(',');
    this.paletteIdentifier = String(array[1]);
    this.sendFrom = array[0];
    if (this.isMine(this.sendFrom)){
      this.disableControl = true;
    }
    else {
      this.disableControl = false;
    }
    this.changeDetector.detectChanges();
  }
  paletteIdentifier:string ="";

  addPalette() {
    let subPalette:SubPalette = this.character.subPalette;
    let palette = new ChatPalette;
    palette.initialize();
    let initPalette:string = this.character.name + 'の追加パレット\n//1行目がタブに表示されるタイトルになります\n';
    palette.setPalette(initPalette);
    palette.getPalette();
    subPalette.appendChild(palette);
  }
  removePalette() {
    let tmp = this.paletteIdentifier;
    this.paletteIdentifier = "";
    let palette = this.character.subPalette.palette(tmp);
    if (palette) palette.destroy();
    this.selectCharacter = this.sendFrom + ',';
  }

  get palette(): ChatPalette {
    if (!this.paletteIdentifier) {
      if (this.isMine(this.sendFrom)) {
        return  this.playerService.localpalette;
      }
      else {
        return this.character.chatPalette;
      }
    }
    else {
      return this.character.subPalette.palette(this.paletteIdentifier)
    }
  }

  _disableControl : boolean = true;
  get disableControl(): boolean { return this._disableControl };
  set disableControl(control: boolean) {
    this._disableControl = control;
  };

  get color(): string {
    if (this.character) {
      return this.character.chatPalette?.color ? this.character.chatPalette?.color : this.playerService.myColor;
    }
    return this.playerService.myColor;
  }
  private doubleClickTimer: NodeJS.Timer = null;
  private selectedPaletteIndex = -1;

  get myImage():ImageFile {
    return this.playerService.myImage;
  }
  get myPlayer():Player {
    return this.playerService.myPlayer;
  }

  private isMine(identifier: string):boolean {
    if (identifier == this.playerService.myPlayer.playerId) {
      return true;
    }
    return false;
  }

  sendFrom: string =  this.playerService.myPlayer.playerId;

  resizeHeight() {
    if(this.characterSelect.nativeElement.clientHeight > 32
      && this.panelService.height == 400)
      this.panelService.height += 32 ;
    if(this.characterSelect.nativeElement.clientHeight == 32
      && this.panelService.height > 400)
      this.panelService.height -= 32 ;

  }

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
      this.modalService.open(SimpleCreateComponent);
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
    private modalService: ModalService,
    private changeDetector: ChangeDetectorRef
  ) { }

  lazyUpdateTimer:NodeJS.Timer = null;

  async lazyUpdate():Promise<void> {
    if (this.lazyUpdateTimer) clearTimeout(this.lazyUpdateTimer);
    this.lazyUpdateTimer = setTimeout(() => this.lazyUpdateDo() ,500)
  }

  lazyUpdateDo():void {
    this.changeDetector.detectChanges();
  }

  ngOnInit() {
    Promise.resolve().then(() => this.panelService.title = 'パレットバインダー');
    this.chatTabidentifier = this.chatMessageService.chatTabs ? this.chatMessageService.chatTabs[0].identifier : '';
    EventSystem.register(this)
      .on('DELETE_GAME_OBJECT', -1000, event => {
        if (this.chatTabidentifier === event.data.identifier) {
          this.chatTabidentifier = this.chatMessageService.chatTabs ? this.chatMessageService.chatTabs[0].identifier : '';
        }
        this.lazyUpdate()
      })
      .on('UPDATE_GAME_OBJECT', -1000, event => {
        this.lazyUpdate()
      })
      .on<string>('WRITING_A_MESSAGE', event => {
        this.changeDetector.markForCheck();
      });
    if(!this.playerService.myPalette) this.playerService.myPalette = this;
    this.chatTabSubscriber = this.playerService.primaryChatTabIdentifierEmit.subscribe((chatTabIdentifier) => {
      if (this.isSyncChatWindow) this.chatTabidentifier = chatTabIdentifier;
      this.changeDetector.detectChanges();
    });
    this.refleshList()
  }

  ngOnDestroy() {
    this.chatTabSubscriber.unsubscribe();
    EventSystem.unregister(this);
    this.playerService.myPalette = null;
  }

  private refleshList():void {
    let list = this.playerService.paletteList;
    for (let identifier of list) {
      let character = this.gameCharacterService.get(identifier);
      if (!character) this.playerService.removeList(identifier);
    }
    this.changeDetector.detectChanges();
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
      { name: this.playerService.myPlayer.playerId, alias: '個人インベントリへ移動' },
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
