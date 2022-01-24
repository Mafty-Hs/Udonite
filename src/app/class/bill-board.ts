import { SyncObject } from './core/synchronize-object/decorator';
import { InnerXml } from './core/synchronize-object/object-serializer';
import { SyncVar } from './core/synchronize-object/decorator';
import { ObjectNode } from './core/synchronize-object/object-node';
import { BillBoardCard , BillBoardCardContext } from './bill-board-card';
import { ObjectStore } from './core/synchronize-object/object-store';

@SyncObject('bill-board')
export class BillBoard  extends ObjectNode implements InnerXml{
  private static _instance: BillBoard;

  static get instance(): BillBoard {
    if (!BillBoard._instance) {
      let billboard = ObjectStore.instance.get('BillBoard')
      if (billboard && billboard instanceof BillBoard) {
         BillBoard._instance = billboard;
      }
      else {
        BillBoard._instance = new BillBoard('BillBoard');
        BillBoard._instance.initialize();
      }
    }
    return BillBoard._instance;
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
