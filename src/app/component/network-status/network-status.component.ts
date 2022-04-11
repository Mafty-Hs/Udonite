import { Component, OnInit, AfterViewInit, OnDestroy, Input } from '@angular/core';
import { EventSystem, IONetwork } from '@udonarium/core/system';
import { NetworkStatus } from '@udonarium/core/system/socketio/connection';
import { PlayerService } from 'service/player.service';
import { RoomService } from 'service/room.service';

@Component({
  selector: 'network-status',
  templateUrl: './network-status.component.html',
  styleUrls: ['./network-status.component.css'],
})
export class NetworkStatusComponent implements OnInit, AfterViewInit, OnDestroy{

  constructor(
    private playerService: PlayerService,
    private roomService: RoomService,
    ) {}
  get isAlert():boolean {
    return (IONetwork.socket.status !== NetworkStatus.CONNECT)
  }
  @Input() minimumMode:boolean;

  get roomName():string {
    if (this.roomService.roomData?.roomName) return this.roomService.roomData.roomName;
    return "なし"
  }

  get userCount():number {
    return this.playerService.otherPeers.length;
  }

  ngAfterViewInit(): void {
    EventSystem.register(this)
      .on('ROOM_UPDATE', event => {
        this.roomService.roomData = event.data;
      });
  };

  ngOnInit(): void {
  }
  ngOnDestroy(): void {
  }
}
