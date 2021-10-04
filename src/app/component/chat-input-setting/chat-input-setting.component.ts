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

interface chatDataContext {
  sendTo : string;
  gameType : string;
  isCharacter : boolean;
  isUseStandImage : boolean;
  standName : string;
}

@Component({
  selector: 'chat-input-setting',
  templateUrl: './chat-input-setting.component.html',
  styleUrls: ['./chat-input-setting.component.css']
})
export class ChatInputSettingComponent implements OnInit,AfterViewInit {

  @ViewChild('setting') settingDOM: ElementRef;
  myWindow:HTMLElement;
  chatData:chatDataContext = {sendTo: "", gameType: "", isCharacter: false ,isUseStandImage: true , standName: ""};
  @Output() chatSetting = new EventEmitter<object>();

  get gameType(): string { return this.chatData.gameType };
  set gameType(gameType: string) { 
    this.chatData.gameType = gameType;
    this.chatSetting.emit(this.chatData);
    if (this.character && this.character.chatPalette && (this.character.chatPalette.dicebot != gameType)){
      this.character.chatPalette.dicebot = gameType;
    }
  };
  private _character: GameCharacter;
  @Input()
  set character(character: GameCharacter) {
    this._character = character;
    if (character) {
      this.chatData.isCharacter = true;
      if(!this.gameType && this.diceBotInfos) {
        this.gameType = character.chatPalette?.dicebot;
      }
    }
    else this.chatData.isCharacter = false;
    this.chatSetting.emit(this.chatData);
    this.canVisible();
  }
  get character(): GameCharacter { return this._character; }

  get sendTo(): string { return this.chatData.sendTo };
  set sendTo(sendTo: string) { this.chatData.sendTo = sendTo; this.chatSetting.emit(this.chatData);}

  get isUseStandImage(): boolean { return this.chatData.isUseStandImage };
  set isUseStandImage(isUseStandImage: boolean) { this.chatData.isUseStandImage = isUseStandImage; this.chatSetting.emit(this.chatData); }
  get standName(): string { return this.chatData.standName };
  set standName(standName: string) { this.chatData.standName = standName; this.chatSetting.emit(this.chatData); }

  visibleList:string[] = ["sendTo","gameType","stand","standPos","color"];
  characterVisibleList:string[] = ["stand","standPos","color"];
  isSendTo:boolean = true;
  isGameType:boolean = true;
  isStand:boolean = false;
  isStandPos:boolean = false;
  isColor:boolean = false;
  canVisible() {
    let canDisplayCount: number = this.myWindow?.offsetWidth < 190 ? 1 : 2;
    let count: number = 0;
    if (!this.character) this.sortVisible(canDisplayCount);
    for (let item = 0; item < this.visibleList.length ; item++) {
      (item < canDisplayCount) ? this.changeVisible(item,true)  : this.changeVisible(item,false)
    }
  }
  sortVisible(canDisplayCount :number) {
    for (let item = 0; item < canDisplayCount ; item++) {
      if (this.characterVisibleList.includes(this.visibleList[item])) {
        let itemObject:string = this.visibleList[item];
        this.visibleList.splice(item,1);
        this.visibleList.push(itemObject);
      }
    }
  }
  changeVisible(item :number,bool :boolean) {
    let result:boolean;
    switch (this.visibleList[item]) {
      case 'sendTo':
        this.isSendTo = bool;
       break;
      case 'gameType':
        this.isGameType = bool;
       break;
      case 'stand':
        this.isStand = this.character ?  bool : false;
       break;
      case 'standPos':
        this.isStandPos = this.character ? bool : false;
       break;
      case 'color':
        this.isColor = this.character ? bool : false;
       break;
      default:
    }
  }

  setVisible(selectType:string) {
    this.visibleList.splice(this.visibleList.indexOf(selectType),1);
    this.visibleList.unshift(selectType);
    this.canVisible();
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
    this.canVisible()
  }

  ngOnInit(): void {
  }

}
