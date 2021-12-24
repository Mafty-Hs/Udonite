import { Component, OnInit , ViewChild, ElementRef,AfterViewInit } from '@angular/core';
import { BillBoardCard } from '@udonarium/bill-board-card';
import { BillBoardService } from 'service/bill-board.service';
import { PanelService } from 'service/panel.service';
import { PlayerService } from 'service/player.service';
import { ModalService } from 'service/modal.service';
import { TextViewComponent } from 'component/text-view/text-view.component';
import { RoomService } from 'service/room.service';
import { EventSystem } from '@udonarium/core/system';
import { Buffer } from 'buffer';

@Component({
  selector: 'bill-board-card',
  templateUrl: './bill-board-card.component.html',
  styleUrls: ['./bill-board-card.component.css']
})
export class BillBoardCardComponent implements OnInit,AfterViewInit {
  isSecret:boolean = false;
  isEdit:boolean = false;
  dataType:number = 0;
  authType:string[] = ['全体に公開','全体に公開(編集不可)','公開範囲を制限'];
  readOnly:boolean = false;
  password:string = "";
  title:string = "";
  text:string = "";
  allowPlayerName :string[] = [];
  players:string[] = [];

  player:string = "";

  _card:BillBoardCard;
  get card():BillBoardCard { return this._card;}
  set card(card :BillBoardCard) {
    this._card = card; 
    this.title = card.title;
    this.dataType = Number(card.dataType);
    if (this.dataType == 1 && !this.auth()) this.readOnly = true;
    if (this.dataType == 2 && !this.auth()) {
      this.text = "この情報はあなたには秘匿されています。";
      this.isSecret = true;
    }
    else {
      this.text = this.decode(card.text);
    }
    this.players = card.allowPlayers;
    this.allowPlayerName = this.playerService.otherPlayers
      .filter( player => 
        this.players.includes(player.playerId)
      )
      .map( player => {
        return player.name
      });
  }

  create() {
    let identifier :string;
    if (this.dataType) {
      identifier = this.billBoardService.add(this.title ,this.encode(this.text), this.dataType,this.players);  
    }
    else {
      identifier = this.billBoardService.add(this.title ,this.encode(this.text), this.dataType);  
    } 
    EventSystem.call('BOARD_NEW', identifier);
    this.close();
  }

  close() {
    this.panelService.close();
  }

  remove() {
    this.billBoardService.remove(this.card);
    this.close();
  }

  edit() {
    this.isEdit = true;
    this.panelService.height += 50 ;
  }

  save() {
    this.card.title = this.title;
    this.card.text = this.encode(this.text);
    this.card.dataType = String(this.dataType);
    this.isEdit = false;
    this.panelService.height -= 50 ;
    EventSystem.call('BOARD_UPDATE', this.card.identifier);

  }

  addPlayer() {
    if (!this.players.includes(this.player)) {
      this.players.push(this.player);
      this.allowPlayerName.push(this.playerService.getPlayerById(this.player).name);
    }
  }

  auth():boolean {
    return ( (this.card.ownerPlayer.includes(this.playerService.myPlayer.playerId)) 
     || (this.card.allowPlayers.includes(this.playerService.myPlayer.playerId)) );
  }

  encode(text: string):string {
    return Buffer.from(text).toString('base64') ;
  }

  decode(text: string):string {
    return Buffer.from(text, 'base64').toString(); ;
  }
  constructor(
    private modalService: ModalService,
    private panelService: PanelService,
    private playerService: PlayerService,
    private roomService: RoomService,
    private billBoardService: BillBoardService
  ) { 
  }

  ngAfterViewInit() {
  }

  ngOnInit(): void {
  }

}
