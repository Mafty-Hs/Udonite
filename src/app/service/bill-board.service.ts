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

  add(_title:string ,_text:string, _dataType: number, _allowPlayers?: string[]){
    let result = this.billBoard.create({
        title: _title,
        text: _text,
        dataType:String(_dataType),
        ownerName: this.playerService.myPlayer.name,
        ownerPlayer: [this.playerService.myPlayer.playerId],
        allowPlayers: _allowPlayers
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
        ownerPlayer: card.ownerPlayer ? card.ownerPlayer  : [],
        allowPlayers: card.allowPlayers ? card.allowPlayers  : []
      });
    }
    gameObject.destroy;
  }
  constructor(
    private playerService: PlayerService,
  ) { }
}
