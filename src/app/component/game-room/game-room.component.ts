import { OnInit ,AfterViewInit, Component, OnDestroy, ViewChild, ViewContainerRef, ElementRef } from '@angular/core';
import { EventSystem, Network } from '@udonarium/core/system';
import { CutInService } from 'service/cut-in.service';
import { ContextMenuSeparator, ContextMenuService } from 'service/context-menu.service';
import { EffectService } from 'service/effect.service';
import { ModalService } from 'service/modal.service';
import { PanelOption, PanelService } from 'service/panel.service';
import { PointerDeviceService } from 'service/pointer-device.service';
import { StandService } from 'service/stand.service';
import { StandImageService } from 'service/stand-image.service';

import { ContextMenuComponent } from 'component/context-menu/context-menu.component';
import { ChatWindowComponent } from 'component/chat-window/chat-window.component';
import { ModalComponent } from 'component/modal/modal.component';
import { StandImageComponent } from 'component/stand-image/stand-image.component';
import { StandViewSettingComponent } from 'component/stand-view-setting/stand-view-setting.component';
import { TextViewComponent } from 'component/text-view/text-view.component';
import { UIPanelComponent } from 'component/ui-panel/ui-panel.component';



@Component({
  selector: 'game-room',
  templateUrl: './game-room.component.html',
  styleUrls: ['./game-room.component.css']
})
export class GameRoomComponent implements OnInit {
  @ViewChild('modalLayer', { read: ViewContainerRef, static: true }) modalLayerViewContainerRef: ViewContainerRef;
  @ViewChild('subMenu') subMenu: ElementRef;
  minimumMode: boolean = false;
  selectMenu:string = "";

  constructor(
    private contextMenuService: ContextMenuService,
    private effectService: EffectService,
    private modalService: ModalService,
    private panelService: PanelService,
    private pointerDeviceService: PointerDeviceService,
    private standService: StandService,
    private standImageService: StandImageService,
  ) { }

  ngAfterViewInit() {
    PanelService.defaultParentViewContainerRef = ModalService.defaultParentViewContainerRef = ContextMenuService.defaultParentViewContainerRef = StandImageService.defaultParentViewContainerRef = CutInService.defaultParentViewContainerRef = this.modalLayerViewContainerRef;
    let chatWidth = 700;
    if (window.innerWidth < 600) {
      this.minimumMode = true;
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
  }

}

PanelService.UIPanelComponentClass = UIPanelComponent;
//ContextMenuService.UIPanelComponentClass = ContextMenuComponent;
ContextMenuService.ContextMenuComponentClass = ContextMenuComponent;
ModalService.ModalComponentClass = ModalComponent;
