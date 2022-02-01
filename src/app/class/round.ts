import { IONetwork } from "./core/system";

export class Round {
  identifier:string = "Round";
  count:number = 0;
  tabIdentifier:string = "";
  isInitiative:boolean = false;;
  currentInitiative:number = -1;
  roundState:number = 0;
  initName:string = "";
}

export class IRound {
  private static round :Round = new Round;
  private static _instance = new Proxy(IRound.round, {
    set:  (target:any, propertyKey:PropertyKey, value:any, receiver:any):boolean  => {
      IRound.update();
      return Reflect.set(target, propertyKey, value, receiver);
  }
  })

  static reset() {
    IRound.round.count = 0;
    IRound.round.currentInitiative = -1;
    IRound.instance.roundState = 0;
  }

  static update() {
    setTimeout(() => {IONetwork.roundUpdate(IRound.round);},500)
  }

  static async initialize() {
    let round = await IONetwork.roundGet()
    if (round) IRound.round = round;
    IONetwork.socket.recieve("UPDATE_ROUND").subscribe(round => {
      if (round instanceof Round) IRound.round = round;
    });
  }

  static get instance(): Round {
    return IRound._instance;
  }

}
