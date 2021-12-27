import { AfterViewInit, Component, ElementRef, NgZone, OnDestroy, OnInit, ViewChild } from '@angular/core';

import { ObjectStore } from '@udonarium/core/synchronize-object/object-store';
import { EventSystem, Network } from '@udonarium/core/system';
import { PeerCursor } from '@udonarium/peer-cursor';

import { FileSelecterComponent } from 'component/file-selecter/file-selecter.component';
import { AppConfigService } from 'service/app-config.service';
import { ModalService } from 'service/modal.service';
import { PanelService } from 'service/panel.service';
import { PlayerService } from 'service/player.service';
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

  networkService = Network;
  help: string = '';
  isCopied = false;

  get player():Player {
    return this.playerService.myPlayer;
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

  colorReset() {
    this.myColor = this.playerService.CHAT_WHITETEXT_COLOR;
  }

  constructor(
    private modalService: ModalService,
    private panelService: PanelService,
    private playerService: PlayerService,
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

  peerStatus(peerID: string) :string {
    let count = PeerCursor.myCursor.keepalive[peerID];
    if (count < -5) return '#F00';
    if (count < -1) return '#FF0';
    return '#0F0';
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
}
