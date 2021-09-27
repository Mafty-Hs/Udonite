import { Component, OnInit,Input ,Output ,EventEmitter, ViewChild, AfterViewInit , ElementRef,ChangeDetectorRef } from '@angular/core';
import { PeerContext } from '@udonarium/core/system/network/peer-context';
import { DiceBotService } from 'service/dice-bot.service';
import { ObjectStore } from '@udonarium/core/synchronize-object/object-store';
import { PeerCursor } from '@udonarium/peer-cursor';
import { PanelOption, PanelService } from 'service/panel.service';
import { PointerDeviceService } from 'service/pointer-device.service';
import { TextViewComponent } from 'component/text-view/text-view.component';
import { GameCharacter } from '@udonarium/game-character';
import { GameCharacterService } from 'service/game-character.service';
import { ContextMenuAction, ContextMenuSeparator, ContextMenuService} from 'service/context-menu.service';

@Component({
  selector: 'chat-input-setting',
  templateUrl: './chat-input-setting.component.html',
  styleUrls: ['./chat-input-setting.component.css']
})
export class ChatInputSettingComponent implements OnInit,AfterViewInit {

  @ViewChild('setting') settingDOM: ElementRef;
  myWindow:HTMLElement;

  @Input('gameType') _gameType: string = '';
  @Output() gameTypeChange = new EventEmitter<string>();
  get gameType(): string { return this._gameType };
  set gameType(gameType: string) { this._gameType = gameType; this.gameTypeChange.emit(gameType); }
  @Input('sendFrom') sendFrom: string;

  @Input('sendTo') _sendTo: string = '';
  @Output() sendToChange = new EventEmitter<string>();
  get sendTo(): string { return this._sendTo };
  set sendTo(sendTo: string) { this._sendTo = sendTo; this.sendToChange.emit(sendTo);}

  visibleList:string[] = ["sendTo","gameType","stand","standPos","color"];
  mustCharacter:string[] = ["stand","standPos","color"];
  canVisible(selectType :string) {
    let canDisplayCount: number = this.myWindow?.offsetWidth < 190 ? 1 : 2;
    if (this.visibleList.indexOf(selectType) + 1 > canDisplayCount ) return false;
    if (!this.character && this.mustCharacter.includes(selectType)) return false;
    return true;
  }

  setVisible(selectType:string) {
    this.visibleList.splice(this.visibleList.indexOf(selectType),1);
    this.visibleList.unshift(selectType);
  }

  config(e: Event) {
    e.stopPropagation();
    e.preventDefault();

    if (!this.pointerDeviceService.isAllowedToOpenContextMenu) return;
    let position = this.pointerDeviceService.pointers[0];

    let actions: ContextMenuAction[] = [];
    actions.push({ name: '送信先', action: () =>
     { this.setVisible("sendTo"); } });
    actions.push({ name: 'ダイスボット', action: () =>
     { this.setVisible("gameType"); } });
    if (this.character) {
      if (this.character.standList) {
        actions.push({ name: 'スタンド', action: () =>
         { this.setVisible("stand"); } });
        actions.push({ name: 'スタンド位置', action: () =>
         { this.setVisible("standPos"); } });
      }
      actions.push({ name: '色', action: () =>
       { this.setVisible("color"); } });
    }
    this.contextMenuService.open(position, actions, '現在表示可能な項目');
  }

  get myPeer(): PeerCursor { return PeerCursor.myCursor; }
  get otherPeers(): PeerCursor[] { return ObjectStore.instance.getObjects(PeerCursor); }
  get sendToColor(): string {
    let object = ObjectStore.instance.get(this.sendTo);
    if (object instanceof PeerCursor) {
      return object.color;
    }
    return PeerCursor.CHAT_DEFAULT_COLOR;
  }


  get diceBotInfos() { return this.diceBotService.diceBotInfos }
  get diceBotInfosIndexed() { return this.diceBotService.diceBotInfosIndexed }
  gameHelp: string|string[] = '';

  loadDiceBot(gameType: string) {
    console.log('onChangeGameType ready');
    this.diceBotService.getHelpMessage(gameType).then(help => {
      console.log('onChangeGameType done\n' + help);
    });
  }

  showDicebotHelp() {
    this.diceBotService.getHelpMessage(this.gameType).then(help => {
      this.gameHelp = help;

      let gameName: string = 'ダイスボット';
      for (let diceBotInfo of this.diceBotService.diceBotInfos) {
        if (diceBotInfo.script === this.gameType) {
          gameName = 'ダイスボット〈' + diceBotInfo.game + '〉'
        }
      }
      gameName += '使用法';

      let coordinate = this.pointerDeviceService.pointers[0];
      let option: PanelOption = { left: coordinate.x, top: coordinate.y, width: 600, height: 500 };
      let textView = this.panelService.open(TextViewComponent, option);
      textView.title = gameName;
      textView.text = this.gameHelp;
    });
  }

  get character(): GameCharacter {
    return this.gameCharacterService.get(this.sendFrom);
  }

  isUseStandImage: boolean = true;
  get hasStand(): boolean {
    if (!this.character || !this.character.standList) return false;
    return this.character.standList.standElements.length > 0;
  }
  get standNameList(): string[] {
    if (!this.hasStand) return [];
    let ret: string[] = [];
    for (let standElement of this.character.standList.standElements) {
      let nameElement = standElement.getFirstElementByName('name');
      if (nameElement && nameElement.value && ret.indexOf(nameElement.value.toString()) < 0) {
        ret.push(nameElement.value.toString());
      }
    }
    return ret.sort();
  }
  standName: string = '';

  get paletteColor(): string {
    if (this.character 
      && this.character.chatPalette 
      && this.character.chatPalette.paletteColor) {
      return this.character.chatPalette.paletteColor;
    }
    return PeerCursor.CHAT_TRANSPARENT_COLOR; 
  }

  set paletteColor(color: string) {
    this.character.chatPalette.color = color ? color : PeerCursor.CHAT_TRANSPARENT_COLOR;
  }

  constructor(
    private panelService: PanelService,
    private pointerDeviceService: PointerDeviceService,
    private diceBotService: DiceBotService,
    private gameCharacterService:GameCharacterService,
    private contextMenuService: ContextMenuService,
    private changeDetectorRef: ChangeDetectorRef
  ) { }

  ngAfterViewInit() {
    this.myWindow = this.settingDOM.nativeElement as HTMLElement;
  }

  ngOnInit(): void {
  }

}
