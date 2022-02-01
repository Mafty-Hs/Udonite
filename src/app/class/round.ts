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
    get: (target:any, propertyKey:PropertyKey) =>  {
      return IRound.round[propertyKey];
    },
    set:  (target:any, propertyKey:PropertyKey, value:any, receiver:any):boolean  => {
      IRound.round[propertyKey] = value;
      IRound.update();
      return true;
    }
  })

  static reset() {
    IRound.round.count = 0;
    IRound.round.currentInitiative = -1;
    IRound.instance.roundState = 0;
  }

  static update() {
    IONetwork.roundUpdate(IRound.round);
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
