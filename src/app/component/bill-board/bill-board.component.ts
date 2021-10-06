import { Component, OnInit , ViewChild, ElementRef,AfterViewInit } from '@angular/core';
import { animate, keyframes, style, transition, trigger } from '@angular/animations';
import { PanelOption, PanelService } from 'service/panel.service';
import { BillBoardService } from 'service/bill-board.service';
import { BillBoardCard } from '@udonarium/bill-board-card';
import { BillBoardCardComponent } from 'component/bill-board-card/bill-board-card.component';
import { EventSystem } from '@udonarium/core/system';

@Component({
  selector: 'bill-board',
  templateUrl: './bill-board.component.html',
  styleUrls: ['./bill-board.component.css'],
  animations: [
    trigger('flyInOut', [
      transition('* => active', [
        animate('200ms ease-out', keyframes([
          style({ transform: 'translateX(100px)', opacity: '0', offset: 0 }),
          style({ transform: 'translateX(0)', opacity: '1', offset: 1.0 })
        ]))
      ]),
      transition('void => *', [
        animate('200ms ease-out', keyframes([
          style({ opacity: '0', offset: 0 }),
          style({ opacity: '1', offset: 1.0 })
        ]))
      ])
    ]),
  ]
})
export class BillBoardComponent implements OnInit {
  @ViewChild('handle') _handle:ElementRef;
  handle :HTMLElement;
  @ViewChild('content') _content:ElementRef;
  content :HTMLElement;

  handle_message:string = "Message Board";
  notification :boolean = false;

  get cards():BillBoardCard[] {
    return this.billBoardService.list();
  }

  toggleSW:boolean = false;


  createCard() {
    let option: PanelOption = { left: 400, top: 100, width: 500, height: 450 };
    let component = this.panelService.open<BillBoardCardComponent>(BillBoardCardComponent, option);
    component.isEdit = true;
  }
  openCard(card :BillBoardCard) {
    let option: PanelOption = { left: 400, top: 100, width: 500, height: 400 };
    let component = this.panelService.open<BillBoardCardComponent>(BillBoardCardComponent, option);
    component.card = card;
  }

  toggle() {
    this.toggleSW = !this.toggleSW;
    if(this.toggleSW) {
      this.handle.style.top = "300px";
      this.content.style.height = "300px";
    }
    else {
      this.handle.style.top = "0px";
      this.content.style.height = "0px";
    }
  }
  constructor(
    private panelService: PanelService,
    private billBoardService: BillBoardService
  ) { }

  alert() {
    this.notification = true;
    this.handle_message = "Message Update";
    this.handle.style.zIndex = "100";
    setTimeout(() => {
      this.alertStop()
    },3000); 
  }
  alertStop() {
    this.notification = false; 
    this.handle_message = "Message Board"; 
    this.handle.style.zIndex = "";
  }


  ngOnInit(): void {
  }
  ngAfterViewInit() {
    this.handle = this._handle.nativeElement;
    this.content = this._content.nativeElement;
    EventSystem.register(this)
      .on('BOARD_UPDATE', event => {
          this.alert();
      });
  }

}
