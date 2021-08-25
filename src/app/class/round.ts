import { SyncObject } from './core/synchronize-object/decorator';
import { InnerXml } from './core/synchronize-object/object-serializer';
import { SyncVar } from './core/synchronize-object/decorator';
import { ObjectNode } from './core/synchronize-object/object-node';
import { ChatTab } from '@udonarium/chat-tab';


@SyncObject('data')
export class Round extends ObjectNode implements InnerXml{
  private static _instance: Round;
  static get instance(): Round {
    if (!Round._instance) {
      Round._instance = new Round('Round');
      Round._instance.initialize();
      Round._instance.count = 0;
    }
    return Round._instance;
  }
  static set instance(_round : Round) {
    Round._instance = _round;
  }

  count:number;
  tab:ChatTab;
}
