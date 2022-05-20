import { OnInit ,AfterViewInit, Component, OnDestroy, ViewChild, ViewContainerRef, ElementRef, ChangeDetectionStrategy,ChangeDetectorRef } from '@angular/core';
import { CutIn } from '@udonarium/cut-in';
import { DataElement } from '@udonarium/data-element';
import { EventSystem, IONetwork } from '@udonarium/core/system';
import { GameCharacter } from '@udonarium/game-character';
import { ObjectStore } from '@udonarium/core/synchronize-object/object-store';
import { PeerCursor } from '@udonarium/peer-cursor';
import { PresetSound, SoundEffect } from '@udonarium/sound-effect';
import { CutInService } from 'service/cut-in.service';
import { ChatMessageService } from 'service/chat-message.service';
import { ContextMenuService, ContextMenuAction, ContextMenuSeparator } from 'service/context-menu.service';
import { ModalService } from 'service/modal.service';
import { PanelOption, PanelService } from 'service/panel.service';
import { PlayerService } from 'service/player.service';
import { PointerDeviceService } from 'service/pointer-device.service';
import { RoomService } from 'service/room.service';
import { RoundService } from 'service/round.service';
import { StandService } from 'service/stand.service';
import { StandImageService } from 'service/stand-image.service';
import { ContextMenuComponent } from 'component/context-menu/context-menu.component';
import { ChatWindowComponent } from 'component/chat/chat-window/chat-window.component';
import { GameObjectInventoryComponent } from 'component/game-object-inventory/game-object-inventory.component';
import { HelpComponent } from 'component/help/help.component';
import { ModalComponent } from 'component/modal/modal.component';
import { StandImageComponent } from 'component/stand-image/stand-image.component';
import { UIPanelComponent } from 'component/ui-panel/ui-panel.component';
import { RoomAdmin } from '@udonarium/room-admin';
import { IRound } from '@udonarium/round';
import { AlarmComponent } from 'component/alarm/alarm.component';
import { NetworkStatus } from '@udonarium/core/system/socketio/connection';




@Component({
  selector: 'game-room',
  templateUrl: './game-room.component.html',
  styleUrls: ['./game-room.component.css'],
  changeDetection: ChangeDetectionStrategy.Default,
})
export class GameRoomComponent implements OnInit {
  @ViewChild('modalLayer', { read: ViewContainerRef, static: true }) modalLayerViewContainerRef: ViewContainerRef;
  @ViewChild('subMenu') subMenu: ElementRef;
  minimumMode: boolean = false;
  selectMenu:string = "";

  get isFlat():boolean {
    return this.roomService.roomData.is2d;
  }

  constructor(
    private chatMessageService: ChatMessageService,
    private cutInService: CutInService,
    private contextMenuService: ContextMenuService,
    private panelService: PanelService,
    private standService: StandService,
    private playerService: PlayerService,
    private pointerDeviceService: PointerDeviceService,
    private roomService: RoomService,
    private roundService: RoundService,
    private standImageService: StandImageService,
    private changeDetector: ChangeDetectorRef
  ) {
    if (this.roomService.gameType && this.roomService.createRoom) this.roomService.roomAdmin.gameType = this.roomService.gameType;
    if (window.innerWidth < 600) this.minimumMode = true;
   }

  ngAfterViewInit() {
    PanelService.defaultParentViewContainerRef = ModalService.defaultParentViewContainerRef = ContextMenuService.defaultParentViewContainerRef = StandImageService.defaultParentViewContainerRef = CutInService.defaultParentViewContainerRef = this.modalLayerViewContainerRef;
    this.chatMessageService.updateChatTab()
    let chatWidth = 700;
    if (window.innerWidth < 600) {
      StandImageComponent.isShowStand = false;
      this.standService.leftEnd = 0;
      this.standService.width = window.innerWidth;
    }
    else if (window.innerWidth < 900) {
      chatWidth = 500;
      this.standService.leftEnd = 500;
      this.standService.width = (window.innerWidth - 700);
      setTimeout(() => {
        this.panelService.open(ChatWindowComponent, { width: 500, height: 400, left: 0, top: 490 });
      }, 0);
    }
    else {
      this.standService.leftEnd = 700;
      this.standService.width = (window.innerWidth - 700);
      setTimeout(() => {
        this.panelService.open(ChatWindowComponent, { width: 700, height: 400, left: 0, top: 490 });
      }, 0);
    }
  }

  isOpen(menuName: string) {
    if (this.selectMenu == menuName)
      return "▲";
    else
      return "▼";
  }

  openSubMenu(e: Event , menuName: string) {
    if (this.selectMenu == menuName) {
      this.closeSub();
      return;
    }
    let button = e.srcElement as HTMLElement;
    let rect = button.getBoundingClientRect();
    this.subMenu.nativeElement.style.top = "50px";
    this.subMenu.nativeElement.style.left = menuName === 'view' ? (rect.left - 50) + 'px' : rect.left + 'px';
    this.selectMenu = menuName;
    this.changeDetector.markForCheck();
  }

  closeSub() {
    this.selectMenu = "";
  }

  chatOpen(e:Event):void {
    if (this.playerService.primaryChatWindow) return;
    this.panelService.open(ChatWindowComponent, { width: 700, height: 500, left: 50, top: 50 });
  }

  inventoryOpen(e:Event):void {
    this.panelService.open(GameObjectInventoryComponent, { width: 550, height: 700, left: 50, top: 50 });
  }

  get roomName():string {
    if (this.roomService.roomData?.roomName) return this.roomService.roomData.roomName;
    return "なし"
  }

  get isAlert():boolean {
    return (IONetwork.socket.status !== NetworkStatus.CONNECT)
  }

  get roomInfo():string {
    return this.minimumMode ? this.playerService.otherPeers.length + '名' : this.roomName + ' : ' + this.playerService.otherPeers.length +'名'
  }

  roundAdd(e:Event):void {
    if (this.roomService.disableRoundControl) return;
    this.roundService.add();
  }

  roundContext(e:Event):void {
    if (!this.pointerDeviceService.isAllowedToOpenContextMenu || this.roomService.disableRoundControl) return;
    e.stopPropagation();
    e.preventDefault();
    const position = this.pointerDeviceService.pointers[0];
    const actions: ContextMenuAction[] = this.roundService.contextMenu();
    this.contextMenuService.open(position, actions, 'ラウンド設定');
  }

  get roundText():string {
    return this.minimumMode ? this.roundService.round + 'R' : this.roundService.roundText;
  }
  roomMenu(e: Event) {
    if (!this.pointerDeviceService.isAllowedToOpenContextMenu) return;
    e.stopPropagation();
    e.preventDefault();
    const position = this.pointerDeviceService.pointers[0];
    const actions: ContextMenuAction[] =
    [{ name: 'ルームから退出する', action: () => { this.leave(); } }];
    this.contextMenuService.open(position, actions, 'ルームメニュー');
  }

  leave() {
    if (confirm('ルームから退出します。よろしいですか？')) {
      location.reload();
    }
  }

  menuHelp(){
    let option: PanelOption = { width: 800 , height: 600, left: 50, top: 100 };
    this.panelService.open(HelpComponent,option);
  }



  ngOnInit(): void {
    RoomAdmin.myPlayerID = this.playerService.myPlayer.playerId;
    EventSystem.register(this)
      .on('PLAY_CUT_IN', -1000, event => {
        let cutIn = ObjectStore.instance.get<CutIn>(event.data.identifier);
        this.cutInService.play(cutIn, event.data.secret ? event.data.secret : false, event.data.test ? event.data.test : false, event.data.sender);
      })
      .on('STOP_CUT_IN', -1000, event => {
        this.cutInService.stop(event.data.identifier);
      })
      .on('PLAY_ALARM', -1000, event => {
        if (!event.data.identifier || event.data.identifier == PeerCursor.myCursor.peerId ) {
          if (event.data.time > 1) {
            let option: PanelOption = { left: 200, top: 250, width: 200, height: 230 };
            let component = this.panelService.open(AlarmComponent, option);
            component.timer = event.data.time;
          }
          else {
            setTimeout(() => {
              SoundEffect.play(PresetSound.alarm);
            },event.data.time);
          }
        }
      })
      .on('POPUP_STAND_IMAGE', -1000, event => {
        let standElement = ObjectStore.instance.get<DataElement>(event.data.standIdentifier);
        let gameCharacter = ObjectStore.instance.get<GameCharacter>(event.data.characterIdentifier);
        this.standImageService.show(gameCharacter, standElement, event.data.color ? event.data.color : null, event.data.secret);
      })
      .on('FAREWELL_STAND_IMAGE', -1000, event => {
        this.standImageService.farewell(event.data.characterIdentifier);
      })
      .on('DELETE_STAND_IMAGE', -1000, event => {
        this.standImageService.destroy(event.data.characterIdentifier, event.data.identifier);
      })
      .on('DESTORY_STAND_IMAGE_ALL', -1000, event => {
        this.standImageService.destroyAll();
      })
      .on('UPDATE_ROOMADMIN', -1000, event => {
        RoomAdmin.set(event.data);
      })
      .on('UPDATE_ROUND', -1000, event => {
        IRound.set(event.data);
      })
      .on('ROOM_UPDATE', event => {
        this.roomService.roomData = event.data;
      });
    this.roomService.adminAuth;
    EventSystem.trigger("ROOM_PLAY",null)
  }

}

PanelService.UIPanelComponentClass = UIPanelComponent;
//ContextMenuService.UIPanelComponentClass = ContextMenuComponent;
ContextMenuService.ContextMenuComponentClass = ContextMenuComponent;
ModalService.ModalComponentClass = ModalComponent;
