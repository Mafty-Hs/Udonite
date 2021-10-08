import { SyncObject } from './core/synchronize-object/decorator';
import { InnerXml } from './core/synchronize-object/object-serializer';
import { SyncVar } from './core/synchronize-object/decorator';
import { ObjectNode } from './core/synchronize-object/object-node';
import { BillBoardCard , BillBoardCardContext } from './bill-board-card';

@SyncObject('bill-board')
export class BillBoard  extends ObjectNode implements InnerXml{
  private static _instance: BillBoard;

  static get instance(): BillBoard {
    return BillBoard._instance;
  }

  static init() {
    if (!BillBoard._instance) {
      BillBoard._instance = new BillBoard('BillBoard');
      BillBoard._instance.initialize();
    }
  }

  create(_card: BillBoardCardContext) {
    let card = new BillBoardCard();
    card.initialize();
    for (let key in _card) {
      if (key === 'identifier') continue;
      if (_card[key] == null || _card[key] === '') continue;
     card.setAttribute(key, _card[key]);
    }
    this.appendChild(card);
    return card;
  }
  
  remove(card: BillBoardCard) {
    this.removeChild(card);
    card.destroy;
  }

  get list(): BillBoardCard[] {
    return this.children as BillBoardCard[]; 
  }
}
