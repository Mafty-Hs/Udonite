import { IONetwork } from "./core/system";

export class Round {
  identifier:string = "Round";
  count:number = 0;
  tabIdentifier:string = "";
  isInitiative:boolean = false;;
  currentInitiative:number = NaN;
  currentInitiativeNumber:number = NaN;
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
    IRound.round.currentInitiative = NaN;
    IRound.round.currentInitiativeNumber = NaN;
    IRound.instance.roundState = 0;
  }

  static set(round :object) {
    IRound.round = <Round>round;
  }

  static update() {
    IONetwork.roundUpdate(IRound.round);
  }

  static async initialize() {
    let round = await IONetwork.roundGet()
    if (round) IRound.round = round;
  }

  static get instance(): Round {
    return IRound._instance;
  }

}
