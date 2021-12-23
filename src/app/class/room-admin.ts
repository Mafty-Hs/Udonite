import { SyncObject } from './core/synchronize-object/decorator';
import { InnerXml } from './core/synchronize-object/object-serializer';
import { SyncVar } from './core/synchronize-object/decorator';
import { ObjectNode } from './core/synchronize-object/object-node';
import { Player } from './player';

@SyncObject('room-admin')
export class RoomAdmin extends ObjectNode implements InnerXml{

//この情報は個別の部屋に紐付け保存させない
  @SyncVar() adminPassword:string;
  @SyncVar() adminPeers:string[];
  @SyncVar() disableTableLoad:boolean;
  @SyncVar() disableCharacterLoad:boolean;
  @SyncVar() disableTableSetting:boolean;
  @SyncVar() disableTabSetting:boolean;
  @SyncVar() disableAllDataSave:boolean;
  @SyncVar() disableSeparateDataSave:boolean;

  @SyncVar() gameType:string;
  @SyncVar() chatTab:string;
  @SyncVar() diceLog:boolean;
  @SyncVar() cardLog:boolean;

  private static _instance:RoomAdmin;

  private static defaultSetting = {
    adminPassword: "", 
    adminPeers: [], 
    disableTableLoad: false,
    disableCharacterLoad: false,
    disableTableSetting: false,
    disableTabSetting: false,
    disableAllDataSave: false,
    disableSeparateDataSave: false,
    gameType: "",
    chatTab: "",
    diceLog: false,
    cardLog: false
  }

  static init() {
    if (!RoomAdmin._instance) {
      RoomAdmin._instance = new RoomAdmin('RoomAdmin');
      RoomAdmin._instance.initialize();
      let admin = new RoomAdmin('admin')
      admin.initialize();
      for (let key in RoomAdmin.defaultSetting) {
        admin.setAttribute(key, RoomAdmin.defaultSetting[key]);
      }
      RoomAdmin._instance.appendChild(admin);
    }
  }

  private get getchild(): ObjectNode[] {  
    return this.children as ObjectNode[];
  }

  static get instance(): RoomAdmin {
    return RoomAdmin._instance;
  }
 
  static get setting(): RoomAdmin {
     return RoomAdmin.instance.getchild.find(object => 
      (object instanceof RoomAdmin)
    ) as RoomAdmin;
  }

  static get players(): Player[] {
    return RoomAdmin.instance.getchild.filter(object => 
      (object instanceof Player)
    ) as Player[];
  }

  static findPlayerById(playerId: string): Player {
    return RoomAdmin.players.find( player =>
      player.playerId === playerId
    );
  }


}
