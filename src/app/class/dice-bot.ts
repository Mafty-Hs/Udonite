import { SyncObject } from './core/synchronize-object/decorator';
import { InnerXml } from './core/synchronize-object/object-serializer';
import { ObjectNode } from './core/synchronize-object/object-node';

export interface DiceBotInfo {
  script: string;
  game: string;
  lang?: string;
  sort_key?: string;
}

export interface DiceBotInfosIndexed {
  index: string;
  infos: DiceBotInfo[];
}

export interface DiceRollResult {
  result: string;
  isSecret: boolean;
  isDiceRollTable?: boolean;
  tableName?: string;
  isEmptyDice?: boolean;
  isSuccess?: boolean;
  isFailure?: boolean;
  isCritical?: boolean;
  isFumble?: boolean;
}

export interface api {
  url: string;
  version: number;
  retry:number;
  isConnect: boolean;
}

@SyncObject('dice-bot')
export class DiceBot extends ObjectNode implements InnerXml {
  
  private static _instance: DiceBot;
  static get instance(): DiceBot {
    if (!DiceBot._instance) {
      DiceBot._instance = new DiceBot('DiceBot');
      DiceBot._instance.initialize();
    }
    return DiceBot._instance;
  }

  public diceBotInfos: DiceBotInfo[] = [];
  public diceBotInfosIndexed: DiceBotInfosIndexed[] = [];
  public api:api = { url: "" ,version: 2 ,retry: 0 ,isConnect: false };  
}
