import { AfterViewInit, Component, ElementRef, OnDestroy } from '@angular/core';

import { EventSystem, IONetwork } from '@udonarium/core/system';

@Component({
  selector: 'network-indicator',
  templateUrl: './network-indicator.component.html',
  styleUrls: ['./network-indicator.component.css']
})
export class NetworkIndicatorComponent implements AfterViewInit, OnDestroy {
  private timer: NodeJS.Timer = null;
  private needRepeat = false;
  nowConnect: boolean = false;
  constructor(private elementRef: ElementRef, ) { }

  ngAfterViewInit() {
    let repeatFunc = () => {
      if (this.needRepeat) {
        this.timer = setTimeout(repeatFunc, 650);
        this.nowConnect = false;
        this.needRepeat = false;
      } else {
        this.timer = null;
      }
    };

    EventSystem.register(this)
      .on('*', event => {
        return;
        //if (this.needRepeat || Network.bandwidthUsage < 3 * 1024) return;
        if (this.timer === null) {
          this.nowConnect = true;
          this.timer = setTimeout(repeatFunc, 650);
        } else {
          this.needRepeat = true;
        }
      });
  }

  ngOnDestroy() {
    EventSystem.unregister(this);
  }
}
