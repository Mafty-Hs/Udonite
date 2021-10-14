import { Component, OnDestroy, OnInit } from '@angular/core';

import { PeerContext } from '@udonarium/core/system/network/peer-context';
import { EventSystem, Network } from '@udonarium/core/system';
import { PeerCursor } from '@udonarium/peer-cursor';

import { ModalService } from 'service/modal.service';
import { PanelService } from 'service/panel.service';
import { PlayerService } from 'service/player.service';

@Component({
  selector: 'room-setting',
  templateUrl: './room-setting.component.html',
  styleUrls: ['./room-setting.component.css']
})
export class RoomSettingComponent implements OnInit, OnDestroy {
  peers: PeerContext[] = [];
  isReloading: boolean = false;

  roomName: string = 'ふつうの部屋';
  password: string = '';
  isPrivate: boolean = false;

  roomAdmin:boolean = false;
  adminPassword:string = "";

  get peerId(): string { return Network.peerId; }
  get isConnected(): boolean { return Network.peerIds.length <= 1 ? false : true; }
  validateLength: boolean = false;

  constructor(
    private panelService: PanelService,
    private playerService: PlayerService,
    private modalService: ModalService
  ) { }

  ngOnInit() {
    Promise.resolve().then(() => this.modalService.title = this.panelService.title = 'ルーム作成');
    EventSystem.register(this);
    this.calcPeerId(this.roomName, this.password);
  }

  ngOnDestroy() {
    EventSystem.unregister(this);
  }

  calcPeerId(roomName: string, password: string) {
    let userId = Network.peerContext ? Network.peerContext.userId : PeerContext.generateId();
    let context = PeerContext.create(userId, PeerContext.generateId('***'), roomName, password);
    this.validateLength = context.peerId.length < 64 ? true : false;
  }

  createRoom() {
    let userId = Network.peerContext ? Network.peerContext.userId : PeerContext.generateId();
    Network.open(userId, PeerContext.generateId('***'), this.roomName, this.password);
    PeerCursor.myCursor.peerId = Network.peerId;
    if (this.roomAdmin) this.playerService.enableAdmin(this.adminPassword); 

    this.modalService.resolve();
  }
}
