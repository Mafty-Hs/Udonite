import { OnInit ,AfterViewInit, Component, OnDestroy, ViewChild, ViewContainerRef, ElementRef } from '@angular/core';
import { CutIn } from '@udonarium/cut-in';
import { DataElement } from '@udonarium/data-element';
import { EventSystem, IONetwork } from '@udonarium/core/system';
import { GameCharacter } from '@udonarium/game-character';
import { ObjectStore } from '@udonarium/core/synchronize-object/object-store';
import { PeerCursor } from '@udonarium/peer-cursor';
import { PresetSound, SoundEffect } from '@udonarium/sound-effect';
import { CutInService } from 'service/cut-in.service';
import { ContextMenuSeparator, ContextMenuService } from 'service/context-menu.service';
import { EffectService } from 'service/effect.service';
import { ModalService } from 'service/modal.service';
import { PanelOption, PanelService } from 'service/panel.service';
import { PlayerService } from 'service/player.service';
import { RoomService } from 'service/room.service';
import { StandService } from 'service/stand.service';
import { StandImageService } from 'service/stand-image.service';
import { ContextMenuComponent } from 'component/context-menu/context-menu.component';
import { ChatWindowComponent } from 'component/chat-window/chat-window.component';
import { ModalComponent } from 'component/modal/modal.component';
import { RoundComponent } from 'component/round/round.component';
import { StandImageComponent } from 'component/stand-image/stand-image.component';
import { StandViewSettingComponent } from 'component/stand-view-setting/stand-view-setting.component';
import { TextViewComponent } from 'component/text-view/text-view.component';
import { UIPanelComponent } from 'component/ui-panel/ui-panel.component';
import { RoomAdmin } from '@udonarium/room-admin';
import { IRound } from '@udonarium/round';




@Component({
  selector: 'game-room',
  templateUrl: './game-room.component.html',
  styleUrls: ['./game-room.component.css']
})
export class GameRoomComponent implements OnInit {
  @ViewChild('modalLayer', { read: ViewContainerRef, static: true }) modalLayerViewContainerRef: ViewContainerRef;
  @ViewChild('subMenu') subMenu: ElementRef;
  @ViewChild(RoundComponent) round:RoundComponent;
  minimumMode: boolean = false;
  selectMenu:string = "";

  get isFlat():boolean {
    return this.roomService.roomData.is2d;
  }

  constructor(
    private cutInService: CutInService,
    private contextMenuService: ContextMenuService,
    private effectService: EffectService,
    private panelService: PanelService,
    private standService: StandService,
    private playerService: PlayerService,
    private roomService: RoomService,
    private standImageService: StandImageService,
  ) {
    if (this.roomService.gameType && this.roomService.createRoom) this.roomService.roomAdmin.gameType = this.roomService.gameType;
    if (window.innerWidth < 600) this.minimumMode = true;
   }

  ngAfterViewInit() {
    PanelService.defaultParentViewContainerRef = ModalService.defaultParentViewContainerRef = ContextMenuService.defaultParentViewContainerRef = StandImageService.defaultParentViewContainerRef = CutInService.defaultParentViewContainerRef = this.modalLayerViewContainerRef;
    let chatWidth = 700;
    if (window.innerWidth < 600) {
      StandImageComponent.isShowStand = false;
      chatWidth = 500;
      this.standService.leftEnd = 200;
      this.standService.width = 200;
    }
    else if (window.innerWidth < 900) { 
      chatWidth = 500;
      this.standService.leftEnd = 500;
      this.standService.width = (window.innerWidth - 700);
    }
    else {
      this.standService.leftEnd = 700;
      this.standService.width = (window.innerWidth - 700);
    }
    setTimeout(() => {
      this.panelService.open(ChatWindowComponent, { width: chatWidth, height: 400, left: 0, top: 490 });
    }, 0);
  }

    isOpen(menuName: string) {
    if (this.selectMenu == menuName)
      return "▲";
    else
      return "▼";
  }

  closePanel() {
    if (confirm('表示されているパネルを全て削除しますか？')) {
      EventSystem.trigger('ALL_PANEL_DIE', null);
    }
    return;
  }


  showStandView() {
    let top = window.innerHeight - 150;
    
    let component = this.panelService.open(StandViewSettingComponent, { width: this.standService.width, height: 150, left: this.standService.leftEnd , top: top });
  }

  showViewMenu(left: number) {

    const isShowStand = StandImageComponent.isShowStand;
    const isShowNameTag = StandImageComponent.isShowNameTag;
    const isCanBeGone = StandImageComponent.isCanBeGone; 
    const canEffect = this.effectService.canEffect; 

    this.contextMenuService.open(
      { x: left, y: 50 }, [
        { name: "パネル設定" },
        ContextMenuSeparator,
          { name: '全てのパネルを消去', action: () => this.closePanel() },
        ContextMenuSeparator,
        { name: "視点設定" },
        ContextMenuSeparator,
          { name: '初期視点に戻す', action: () => EventSystem.trigger('RESET_POINT_OF_VIEW', null) },
          { name: '真上から視る', action: () => EventSystem.trigger('RESET_POINT_OF_VIEW', 'top') },
        ContextMenuSeparator,
        { name: "立ち絵設定" },
        ContextMenuSeparator,
          { name: '立ち絵表示設定', action: () => this.showStandView()}, 
          { name: `${ isShowStand ? '☑' : '☐' }立ち絵表示`, 
            action: () => {
              StandImageComponent.isShowStand = !isShowStand;
            }
          },
          { name: `${ isShowNameTag ? '☑' : '☐' }ネームタグ表示`, 
            action: () => {
              StandImageComponent.isShowNameTag = !isShowNameTag;
            }
          },
          { name: `${ isCanBeGone ? '☑' : '☐' }透明化、自動退去`, 
            action: () => {
            StandImageComponent.isCanBeGone = !isCanBeGone;
            }
          },
          { name: '表示中の立ち絵全消去', action: () => EventSystem.trigger('DESTORY_STAND_IMAGE_ALL', null) }, 
        ContextMenuSeparator,
        { name: "エフェクト設定" },
        ContextMenuSeparator,
          { name: `${ canEffect ? '☑' : '☐' }エフェクト表示`,
            action: () => {
              this.effectService.canEffect = !canEffect;
            }
          }
      ], 
      '自分のみ反映されます');
  }

  openSubMenu(e: Event , menuName: string) {
    if (this.selectMenu == menuName) {
      this.closeSub();
      return;
    }
    let button = e.srcElement as HTMLElement;
    let rect = button.getBoundingClientRect();
    if (menuName == "view") {
      this.selectMenu = menuName;
      this.showViewMenu(rect.left);
      this.closeSub();
    }
    else {
      this.subMenu.nativeElement.style.top = "50px";
      this.subMenu.nativeElement.style.left = rect.left + 'px';
      this.selectMenu = menuName;
      this.subMenu.nativeElement.style.display = "block";
   }
  }

  closeSub() {
    this.selectMenu = "";
    this.subMenu.nativeElement.style.display = "none";
  }

  roundContext(e:Event) {
    this.round.displayContextMenu(e);
  }

  menuHelp(){
    let gameHelp:string[] =
      [
      'ファイル\n  画像の管理、部屋データの保存、チャットログの保存ができます。',
      'ルーム\n  接続の管理、テーブルの管理ができます。',
      '機能\n  セッション中に便利な機能があります。',
      '表示\n  自分だけ非表示にしたい項目を選択できます。',
      'ラウンド管理\n  ラウンド制またはイニシアティブ制でラウンド進行を管理できます。\n  右クリックすることで動作の設定が可能です。',
      'ネットワークインジケーター\n  データの送受信が発生しているとき、白く光ります',
      'ルーム情報\n  ルーム名、参加人数が表示されます。自分以外全員とデータ送受信できていないとき赤く点滅します'
      ];     

      let coordinate = { x: ( window.innerWidth - 650 ), y: 50 };
      let option: PanelOption = { left: coordinate.x, top: coordinate.y, width: 600, height: 450 };
      let textView = this.panelService.open(TextViewComponent, option);
      textView.title = "メニューバー説明";
      textView.text = gameHelp;
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
          setTimeout(() => {
            SoundEffect.play(PresetSound.alarm);
          },event.data.time); 
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
      }); 
    this.roomService.adminAuth;
    EventSystem.trigger("ROOM_PLAY",null)
  }
  
}

PanelService.UIPanelComponentClass = UIPanelComponent;
//ContextMenuService.UIPanelComponentClass = ContextMenuComponent;
ContextMenuService.ContextMenuComponentClass = ContextMenuComponent;
ModalService.ModalComponentClass = ModalComponent;
