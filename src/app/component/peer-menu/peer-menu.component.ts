import { AfterViewInit, Component, ElementRef, NgZone, OnDestroy, OnInit, ViewChild } from '@angular/core';

import { ObjectStore } from '@udonarium/core/synchronize-object/object-store';
import { PeerContext } from '@udonarium/core/system/network/peer-context';
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
  @ViewChild('idInput') idInput: ElementRef;
  @ViewChild('idSpacer') idSpacer: ElementRef;

  networkService = Network
  gameRoomService = ObjectStore.instance;
  help: string = '';
  isCopied = false;

  get player():Player {
    return this.playerService.myPlayer;
  }
  private _timeOutId;

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
    this.myColor = Player.CHAT_DEFAULT_COLOR;
  }

  constructor(
    private ngZone: NgZone,
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
    EventSystem.register(this)
      .on('OPEN_NETWORK', event => {
        this.ngZone.run(() => { });
        if (this.idInput && this.idInput.nativeElement) this.idInput.nativeElement.style.width = this.idSpacer.nativeElement.getBoundingClientRect().width + 'px'
      });
    if (this.idInput && this.idInput.nativeElement) this.idInput.nativeElement.style.width = this.idSpacer.nativeElement.getBoundingClientRect().width + 'px' 
  }

  ngOnDestroy() {
    clearTimeout(this._timeOutId);
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

  private resetPeerIfNeeded() {
    if (Network.peerContexts.length < 1) {
      Network.open();
      PeerCursor.myCursor.peerId = Network.peerId;
    }
  }

  async connectPeerHistory() {
    this.help = '';
    let conectPeers: PeerContext[] = [];
    let roomId: string = '';

    for (let peerId of this.appConfigService.peerHistory) {
      let context = PeerContext.parse(peerId);
      if (context.isRoom) {
        if (roomId !== context.roomId) conectPeers = [];
        roomId = context.roomId;
        conectPeers.push(context);
      } else {
        if (roomId !== context.roomId) conectPeers = [];
        conectPeers.push(context);
      }
    }

    if (roomId.length) {
      console.warn('connectPeerRoom <' + roomId + '>');
      let conectPeers: PeerContext[] = [];
      let peerIds = await Network.listAllPeers();
      for (let peerId of peerIds) {
        console.log(peerId);
        let context = PeerContext.parse(peerId);
        if (context.roomId === roomId) {
          conectPeers.push(context);
        }
      }
      if (conectPeers.length < 1) {
        this.help = '前回接続していたルームが見つかりませんでした。既に解散しているかもしれません。';
        console.warn('Room is already closed...');
        return;
      }
      Network.open(PeerContext.generateId(), conectPeers[0].roomId, conectPeers[0].roomName, conectPeers[0].password);
    } else {
      console.warn('connectPeers ' + conectPeers.length);
      Network.open();
    }

    PeerCursor.myCursor.peerId = Network.peerId;

    let listener = EventSystem.register(this);
    listener.on('OPEN_NETWORK', event => {
      console.log('OPEN_NETWORK', event.data.peerId);
      EventSystem.unregisterListener(listener);
      ObjectStore.instance.clearDeleteHistory();
      for (let context of conectPeers) {
        Network.connect(context.peerId);
      }
    });
  }

  findPeerName(peerId: string) {
    const peerCursor = PeerCursor.findByPeerId(peerId);
    return peerCursor ? peerCursor.player.name : '';
  }

  findPeerColor(peerId: string) {
    const peerCursor = PeerCursor.findByPeerId(peerId);
    return peerCursor ? peerCursor.player.color : '';
  }
}
