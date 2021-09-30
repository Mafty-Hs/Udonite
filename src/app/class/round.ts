import { SyncObject } from './core/synchronize-object/decorator';
import { InnerXml } from './core/synchronize-object/object-serializer';
import { SyncVar } from './core/synchronize-object/decorator';
import { ObjectNode } from './core/synchronize-object/object-node';
import { ChatTab } from '@udonarium/chat-tab';


@SyncObject('round')
export class Round extends ObjectNode{
  @SyncVar() count:number;
  @SyncVar() tabIdentifier:string;
  @SyncVar() _isInitiative:number;
  @SyncVar() currentInitiative:number;
  @SyncVar() roundState:number;
  @SyncVar() initName:string;

  get isInitiative():boolean {
    return this._isInitiative === 1 ? true : false;
  }
  set isInitiative(_isInitiative :boolean) {
    this._isInitiative = _isInitiative ? 1 : 0;
  }

  reset() {
    this.count = 0;
    this.currentInitiative = -1;
    this.roundState = 0;
  }
}

@SyncObject('Iround')
export class IRound extends ObjectNode implements InnerXml{
  private static _instance: IRound;

  static init() {
    if (!IRound._instance) {
      IRound._instance = new IRound('Round');
      IRound._instance.initialize();
    }
    if (IRound._instance.children.length == 0) {
      let round = new Round('CommonRound')
      round.initialize();
      round.reset();
      round.isInitiative = false;
      IRound._instance.appendChild(round);
    }
  }

  private get getchild(): Round { 
    let round:Round[] = this.children as Round[];
    return round[0];
  }
  private set getchild(_round :Round) {
    let round:Round[] = this.children as Round[];
    round[0] = _round;
  }

  static get instance(): Round {
    return IRound._instance.getchild;
  }
  static set instance(_round : Round) {
    IRound._instance.getchild = _round;
  }
}
