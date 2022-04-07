import { AfterViewInit, Component, ElementRef, NgZone, OnDestroy, OnInit, ViewChild } from '@angular/core';

import { EventSystem } from '@udonarium/core/system';
import { PeerCursor } from '@udonarium/peer-cursor';

import { PlayerControlComponent } from 'component/player-control/player-control.component';
import { FileSelecterComponent } from 'component/file-selecter/file-selecter.component';
import { AppConfigService } from 'service/app-config.service';
import { ModalService } from 'service/modal.service';
import { PanelService , PanelOption } from 'service/panel.service';
import { PointerDeviceService } from 'service/pointer-device.service';
import { PlayerService } from 'service/player.service';
import { RoomService } from 'service/room.service';
import { DiceBotService } from 'service/dice-bot.service';
import { animate, style, transition, trigger } from '@angular/animations';
import { Player } from '@udonarium/player';

@Component({
  selector: 'peer-menu',
  templateUrl: './peer-menu.component.html',
  styleUrls: ['./peer-menu.component.css'],
  animations: [
    trigger('fadeInOut', [
      transition('false => true', [
        animate('50ms ease-in-out', style({ opacity: 1.0 })),
        animate('900ms ease-in-out', style({ opacity: 0 }))
      ])
    ])
  ]
})
export class PeerMenuComponent implements OnInit, OnDestroy, AfterViewInit {

  help: string = '';
  isCopied = false;

  get player():Player {
    return this.playerService.myPlayer;
  }

  get myPeer():string {
    return PeerCursor.myCursor.peerId;
  }

  get myName(): string {
    return this.player.name;
  }
  set myName(name: string) {
    this.player.name = name;
  }

  get myColor(): string {
    return this.player.color;
  }
  set myColor(color: string) {
    this.player.color = color;
  }

  get auth():boolean {
    return this.roomService.adminAuth;
  }

  colorReset() {
    this.myColor = this.playerService.CHAT_WHITETEXT_COLOR;
  }

  constructor(
    private pointerDeviceService: PointerDeviceService,
    private modalService: ModalService,
    private panelService: PanelService,
    public playerService: PlayerService,
    private roomService: RoomService,
    public diceBotService: DiceBotService,
    public appConfigService: AppConfigService
  ) { }

  ngOnInit() {
    Promise.resolve().then(() => { this.panelService.title = 'プレイヤー情報'; this.panelService.isAbleFullScreenButton = false });
  }

  ngAfterViewInit() {
  }

  ngOnDestroy() {
    EventSystem.unregister(this);
  }

  changeIcon() {
    let currentImageIdentifires: string[] = [];
    if (this.player.imageIdentifier) currentImageIdentifires = [this.player.imageIdentifier];
    this.modalService.open<string>(FileSelecterComponent, { currentImageIdentifires: currentImageIdentifires }).then(value => {
      if (!value) return;
      this.player.imageIdentifier = value;
    });
  }

  get otherPeers():PeerCursor[] {
    return this.playerService.otherPeers
  }

  playerControl() {
    let coordinate = this.pointerDeviceService.pointers[0];
    let title = '全プレイヤー';
    let option: PanelOption = { title: title, width: 600, height: 600 }
    let component = this.panelService.open<PlayerControlComponent>(PlayerControlComponent, option);
  }
}
