import { Component, OnInit, OnDestroy } from '@angular/core';
import { EventSystem, Network } from '@udonarium/core/system';
import { PlayerService } from 'service/player.service';
import { PeerCursor } from '@udonarium/peer-cursor';
import { PanelOption, PanelService } from 'service/panel.service';

@Component({
  selector: 'room-control',
  templateUrl: './room-control.component.html',
  styleUrls: ['./room-control.component.css']
})
export class RoomControlComponent implements OnInit {

  alarmTime:number = 0;
  get myPeer(): PeerCursor { return this.playerService.myPeer; }
  get otherPeers(): PeerCursor[] { return this.playerService.otherPeers; }
  sendTo:string = "";
  password:string = "";

  get adminAuth():boolean { return this.playerService.adminAuth;}

  alarmSend() {
    let peer:string = ""
    if (this.sendTo) {
      peer = this.playerService.getPeerId(this.sendTo);
      if (!peer) peer = '';
    }
    EventSystem.call('PLAY_ALARM', {identifier: peer  ,time: this.alarmTime * 1000});
  }

  constructor(
    private panelService: PanelService,
    public playerService: PlayerService
  ) { }

  ngOnInit(): void {
    Promise.resolve().then(() => this.panelService.title = 'ルーム共通設定');
  }

  ngOnDestry() {
    EventSystem.unregister(this);
  }

  passwordAuth() {
    this.playerService.adminPasswordAuth(this.password);
    this.panelService.close;
  }

}
