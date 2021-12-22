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
  allowPlayerName :string[];
  peers:string[] = [];


  peer:string = "";

  get otherPeerName(): { name: string, color: string }[]  {
    return [];
  }
  get otherPeers() {
    return this.playerService.otherPeers;
  }
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
    this.peers = card.allowPeers;
    this.allowPlayerName = this.peers.map( identifier => {
      let peer = this.playerService.getPeer(identifier);
      if (peer) return peer.player.name;
    });
  }

  create() {
    let identifier :string;
    if (this.dataType) {
      if (!this.password) {
        this.modalService.open(TextViewComponent, { title: 'パスワードが設定されていません', text: 'パスワードが設定されていません。\n接続が切れたとき・部屋を再作成した時に権限情報は全て失われるため、パスワードが必要になります。' });
        return;
      }
      identifier = this.billBoardService.add(this.title ,this.encode(this.text), this.dataType,this.getHash(this.password),this.peers);  
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

  addPeer() {
    if (!this.peers.includes(this.peer)) {
      this.peers.push(this.peer);
      this.allowPlayerName.push(this.playerService.getPeer(this.peer).player.name);
    }
  }

  passwordAuth() {
    if (this.card.ownerPassword == this.getHash(this.password)) {
      this.readOnly = false;
      this.isSecret = false;
      this.text = this.decode(this.card.text);
      this.card.ownerPeers.push(this.playerService.myPeer.identifier);
    }
    else {
      this.modalService.open(TextViewComponent, { title: '認証失敗', text: 'パスワードが違います' });
    }
    this.password = '';
  }

  auth():boolean {
    return ( (this.card.ownerPeers.includes(this.playerService.myPeer.identifier)) 
     || (this.card.allowPeers.includes(this.playerService.myPeer.identifier)) );
  }

  getHash(password: string) {
    return this.roomService.getHash(password);
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
