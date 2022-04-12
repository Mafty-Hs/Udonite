import { Component, OnInit , AfterViewInit } from '@angular/core';
import { BillBoardCard } from '@udonarium/bill-board-card';
import { ImageStorage } from '@udonarium/core/file-storage/image-storage';
import { ImageViewComponent } from 'component/image-view/image-view.component';
import { FileSelecterComponent } from 'component/file-selecter/file-selecter.component';
import { BillBoardService } from 'service/bill-board.service';
import { PanelService } from 'service/panel.service';
import { PlayerService } from 'service/player.service';
import { ModalService } from 'service/modal.service';
import { EventSystem } from '@udonarium/core/system';
import { Buffer } from 'buffer';
import { StringUtil } from '@udonarium/core/system/util/string-util';
import { RoomService } from 'service/room.service';

interface allowedPlayer {
  playerName: string;
  playerId: string;
}

@Component({
  selector: 'bill-board-card',
  templateUrl: './bill-board-card.component.html',
  styleUrls: ['./bill-board-card.component.css']
})
export class BillBoardCardComponent implements OnInit,AfterViewInit {
  isSecret:boolean = false;
  isEdit:boolean = false;
  isImage:boolean = false;
  dataType:number = 0;
  authType:string[] = ['全体に公開','全体に公開(編集不可)','公開範囲を制限'];
  readOnly:boolean = false;
  password:string = "";
  title:string = "";
  text:string = "";
  allowPlayers :allowedPlayer[] = [];
  players:string[] = [];
  imageIdentifier:string = ""

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
    this.allowPlayers = this.playerService.otherPlayers
      .filter( player =>
        this.players.includes(player.playerId)
      )
      .map( player => {
        return { playerName: player.name, playerId: player.playerId }
      });
    if (card.isImage) {
      this.isImage = true;
      this.imageIdentifier = card.imageIdentifier
    }
  }

  get titleAsHtml(): string {
    return StringUtil.escapeHtmlAndRuby(this.title)
  }

  get textAsHtml(): string {
    return StringUtil.escapeHtmlAndRuby(this.text).replace(/\n/g,'<br/>')
  }

  get imageurl(): string {
    let imagefile = ImageStorage.instance.get(this.imageIdentifier)
    if (imagefile)  return imagefile.url;
    return ""
  }

  changeImage() {
    let currentImageIdentifires: string[] = [];
    if (this.imageIdentifier) currentImageIdentifires = [this.imageIdentifier];
    this.modalService.open<string>(FileSelecterComponent, { currentImageIdentifires: currentImageIdentifires }).then(value => {
      if (!value) return;
      this.imageIdentifier = value;
    });
  }

  create() {
    let identifier :string;
    if (this.dataType) {
      identifier = this.billBoardService.add(this.title ,this.encode(this.text), this.dataType,this.players,this.imageIdentifier);
    }
    else {
      identifier = this.billBoardService.add(this.title ,this.encode(this.text), this.dataType,[],this.imageIdentifier);
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
    this.panelService.height += 30 ;
  }

  save() {
    this.card.title = this.title;
    this.card.text = this.encode(this.text);
    this.card.allowPlayers = this.players;
    this.card.dataType = String(this.dataType);
    if (this.isImage) this.card.imageIdentifier = this.imageIdentifier;
    else this.imageIdentifier = "";
    this.isEdit = false;
    this.panelService.height -= 30 ;

    EventSystem.call('BOARD_UPDATE', this.card.identifier);

  }

  addPlayer() {
    if (!this.players.includes(this.player)) {
      this.players.push(this.player);
      this.allowPlayers.push({ playerName: this.playerService.getPlayerById(this.player).name, playerId: this.player });
      this.player = '';
    }
  }

  removePlayer(playerId :string) {
    if (this.players.includes(playerId)) {
      this.players = this.players.filter( _playerid => _playerid != playerId );
      this.allowPlayers = this.playerService.otherPlayers
      .filter( player =>
        this.players.includes(player.playerId)
      )
      .map( player => {
        return { playerName: player.name, playerId: player.playerId }
      });
    }
  }

  auth():boolean {
    return ( (this.card.ownerPlayer.includes(this.playerService.myPlayer.playerId))
     || (this.card.allowPlayers.includes(this.playerService.myPlayer.playerId))
     || (this.roomService.adminAuth && this.roomService.roomAdmin.transparentMode)
     );
  }

  encode(text: string):string {
    return Buffer.from(text).toString('base64') ;
  }

  decode(text: string):string {
    return Buffer.from(text, 'base64').toString(); ;
  }

  viewImg() {
    this.modalService.open<string>(ImageViewComponent, { title: this.title,imageIdentifier: this.imageIdentifier })
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
