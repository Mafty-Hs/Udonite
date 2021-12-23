import { Component, OnInit, OnDestroy, Input, ChangeDetectorRef} from '@angular/core';
import { EventSystem, Network } from '@udonarium/core/system';
import { PeerCursor } from '@udonarium/peer-cursor';

@Component({
  selector: 'network-status',
  templateUrl: './network-status.component.html',
  styleUrls: ['./network-status.component.css']
})
export class NetworkStatusComponent implements OnInit,OnDestroy{

  constructor(private changeDetectorRef: ChangeDetectorRef) {}
  isAlert:boolean = false;
  UserCount:number;
  private timer;
  myKeepalive: number = 0;
  @Input() minimumMode:boolean;

  countUserID() {
    if (Network.peerContext.roomId){
	this.peerCount()
    }
  }

  peerCount() {
    const result = Network.peerIds;
    if (this.UserCount != result.length) {
      this.UserCount = result.length;
    }
  }

  getRoomName():string {
    if (Network.peerContext && Network.peerContext.roomName.length <= 0){
      return "未設定";
    }
    return Network.peerContext.roomName;
  }

  ngAfterViewInit() {
    EventSystem.register(this)
      .on('KEEPALIVE', event => {
          this.countUserID();
          if (event.data == PeerCursor.myCursor.peerId) {
            this.myKeepalive -= 1;
            PeerCursor.myCursor.keepaliveAging();
            if (this.myKeepalive < -5 && this.UserCount > 1) {
               this.isAlert = true;
             }
             else {
               this.isAlert = false;
             }
          }
          else {
            PeerCursor.myCursor.keepalive[event.data] = 0;
            this.myKeepalive = 0;
          }
      });
  };

  ngOnInit(): void {
    this.startKeepAlive();
  }

  startKeepAlive(): void {
    this.timer = setInterval(() => {
      EventSystem.call('KEEPALIVE', PeerCursor.myCursor.peerId);
    },10000);
  }

  ngOnDestroy() {
    EventSystem.unregister(this);
  }

}
