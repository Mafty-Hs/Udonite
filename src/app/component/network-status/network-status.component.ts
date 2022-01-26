import { Component, OnInit, OnDestroy, Input} from '@angular/core';
import { EventSystem, IONetwork } from '@udonarium/core/system';
import { PlayerService } from 'service/player.service';
import { RoomService } from 'service/room.service';

@Component({
  selector: 'network-status',
  templateUrl: './network-status.component.html',
  styleUrls: ['./network-status.component.css']
})
export class NetworkStatusComponent implements OnInit,OnDestroy{

  constructor(
    private playerService: PlayerService,
    private roomService: RoomService
    ) {}
  isAlert:boolean = false;
  @Input() minimumMode:boolean;

  get roomName():string {
    if (this.roomService.roomData?.roomName) return this.roomService.roomData.roomName;
    return "なし"
  }

  get userCount():number {
    return this.playerService.otherPeers.length;
  }

  ngAfterViewInit() {
  };

  ngOnInit(): void {
  }
  ngOnDestroy(): void {
  }
}
