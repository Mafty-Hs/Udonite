import { Component, OnInit, OnDestroy, ViewChild, ElementRef,AfterViewInit } from '@angular/core';
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
export class BillBoardComponent implements OnInit,OnDestroy,AfterViewInit {

  get newList():string[] {
    return this.billBoardService.newList;
  };
  get updateList():string[] {
    return this.billBoardService.updateList;
  }

  get cards():BillBoardCard[] {
    return this.billBoardService.list();
  }

  createCard() {
    let title = '新規作成';
    let option: PanelOption = { title: title,left: 400, top: 100, width: 500, height: 450 };
    let component = this.panelService.open<BillBoardCardComponent>(BillBoardCardComponent, option);
    component.isEdit = true;
  }
  openCard(card :BillBoardCard) {
    if (this.updateList.includes(card.identifier)) {
      this.updateList.splice(this.updateList.indexOf(card.identifier),1);
    }
    if (this.newList.includes(card.identifier)) {
      this.newList.splice(this.newList.indexOf(card.identifier),1);
    }
    let title = ' ' + card.titleWithoutRuby;
    let option: PanelOption = { title: title, left: 400, top: 100, width: 500, height: 420 };
    let component = this.panelService.open<BillBoardCardComponent>(BillBoardCardComponent, option);
    component.card = card;
  }

  constructor(
    private panelService: PanelService,
    private billBoardService: BillBoardService
  ) { }



  ngOnInit(): void {
  }

  ngOnDestroy(): void {
    EventSystem.unregister(this);
  }

  ngAfterViewInit(): void {
  }

}
