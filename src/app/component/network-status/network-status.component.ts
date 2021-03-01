import { Component, OnInit, OnDestroy, ChangeDetectorRef} from '@angular/core';
import { EventSystem, Network } from '@udonarium/core/system';

@Component({
  selector: 'network-status',
  templateUrl: './network-status.component.html',
  styleUrls: ['./network-status.component.css']
})
export class NetworkStatusComponent implements OnInit,OnDestroy{

  constructor(private changeDetectorRef: ChangeDetectorRef) {}
  isChange:boolean = false;
  isAlert:boolean = false;
  UserCount:number;
  private timer;
  countUserID() {
    console.log(Network)
    if (Network.peerContext.roomId){
      Network.listAllPeers().then((x) => this.peerCount(x));
    }
  }
  peerCount(peerList:string[]) {
    const result = peerList.filter(item => item.length == 28);
    if (this.UserCount != result.length) {
      this.UserCount = result.length;
      this.isChange = true;
      this.changeDetectorRef.detectChanges();
      setInterval(() => {
        this.isChange = false;
        this.changeDetectorRef.detectChanges();
      },5000);
      if (this.UserCount == 1) this.isAlert = true; 
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
      .on('*', event => {
          this.countUserID();
          clearTimeout(this.timer);
          this.startTimer();
      });
  };

  ngOnInit(): void {
    this.startTimer();
  }

  startTimer(): void {
    this.timer = setInterval(() => {
      this.countUserID(); 
    },60000);
  }

  ngOnDestroy() {
    EventSystem.unregister(this);
  }

}
