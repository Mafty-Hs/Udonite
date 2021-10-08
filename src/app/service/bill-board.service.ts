import { Injectable } from '@angular/core';
import { BillBoardCard , BillBoardCardContext } from '@udonarium/bill-board-card';
import { BillBoard } from '@udonarium/bill-board';
import { PlayerService } from 'service/player.service';

@Injectable({
  providedIn: 'root'
})
export class BillBoardService {

  get billBoard(): BillBoard{
    return BillBoard.instance;
  } 

  list() :BillBoardCard[] {
   return this.billBoard.list;

  } 

  add(_title:string ,_text:string, _dataType: number, _ownerPassword?: string, _allowPeers?: string[]){
    let result = this.billBoard.create({
        title: _title,
        text: _text,
        dataType:String(_dataType),
        ownerName: this.playerService.myPeer.name,
        ownerPeers: [this.playerService.myPeer.identifier],
        ownerPassword: _ownerPassword,
        allowPeers: _allowPeers
    });
    return result.identifier;
  }

  remove(card :BillBoardCard) {
    this.billBoard.remove(card);
  }

  loadCard(gameObject :BillBoard) {
    let board = gameObject.children as BillBoardCard[];
    for (let card of board) {
    this.billBoard.create({
        title: card.title,
        text: card.text,
        dataType:card.dataType,
        ownerName: card.ownerName,
        ownerPeers: [],
        ownerPassword: card.ownerPassword,
        allowPeers: []
      });
    }
  }
  constructor(
    private playerService: PlayerService,
  ) { }
}
