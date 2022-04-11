import { Component, OnInit, OnDestroy, ViewChild, ElementRef,AfterViewInit,ChangeDetectorRef } from '@angular/core';
import { BillBoardService } from 'service/bill-board.service';
import { EventSystem } from '@udonarium/core/system';

@Component({
  selector: 'ui-tray',
  templateUrl: './ui-tray.component.html',
  styleUrls: ['./ui-tray.component.css']
})
export class UiTrayComponent implements  OnInit,OnDestroy,AfterViewInit {

  @ViewChild('handle') _handle:ElementRef;
  handle :HTMLElement;
  @ViewChild('content') _content:ElementRef;
  content :HTMLElement;

  maxHeight = 500;
  menu = "board";

  handle_message:string = "▼";
  notification :boolean = false;

  toggleSW:boolean = false;

  toggle() {
    this.toggleSW = !this.toggleSW;
    this.handle_message = this.toggleSW ? "▲" : "▼" ;
    if(this.toggleSW) {
      this.handle.style.top = this.maxHeight + 'px';
      this.content.style.height = this.maxHeight + 'px';
    }
    else {
      this.handle.style.top = "0px";
      this.content.style.height = "0px";
    }
  }

  alert() {
    this.notification = true;
    this.handle_message = "Message Update";
    this.handle.style.zIndex = "100";
    setTimeout(() => {
      this.alertStop()
      this.changeDetector.detectChanges();
    },3000);
  }
  alertStop() {
    this.notification = false;
    this.handle_message = this.toggleSW ? "▲" : "▼" ;
    this.handle.style.zIndex = "";
  }


  constructor(
    private billBoardService: BillBoardService,
    private changeDetector: ChangeDetectorRef
  ) { }

  ngOnInit(): void {
    if (window.innerHeight < (500 + 50 + 20) )
      this.maxHeight = (window.innerHeight - 70);
  }

  ngOnDestroy(): void {
    EventSystem.unregister(this);
  }

  ngAfterViewInit(): void {
    this.handle = this._handle.nativeElement;
    this.content = this._content.nativeElement;
    EventSystem.register(this)
      .on('BOARD_UPDATE', event => {
          this.alert();
          this.billBoardService.updateList.push(event.data);
      });
    EventSystem.register(this)
      .on('BOARD_NEW', event => {
          this.alert();
          this.billBoardService.newList.push(event.data);
      });
  }

}
