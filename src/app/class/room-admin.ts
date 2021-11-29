import { SyncObject } from './core/synchronize-object/decorator';
import { InnerXml } from './core/synchronize-object/object-serializer';
import { SyncVar } from './core/synchronize-object/decorator';
import { ObjectNode } from './core/synchronize-object/object-node';

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

  private static _instance:RoomAdmin;

  private static defaultSetting = {
    adminPassword: "", 
    adminPeers: [], 
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
      admin.gameType = "";
      RoomAdmin._instance.appendChild(admin);
    }
  }

  private get getchild(): RoomAdmin { 
    let roomAdmin:RoomAdmin[] = this.children as RoomAdmin[];
    return roomAdmin[0];
  }
  private set getchild(roomAdmin :RoomAdmin) {
    let _roomAdmin:RoomAdmin[] = this.children as RoomAdmin[];
    _roomAdmin[0] = roomAdmin;
  }

  static get instance(): RoomAdmin {
    return RoomAdmin._instance.getchild;
  }
  static set instance(roomAdmin : RoomAdmin) {
    RoomAdmin._instance.getchild = roomAdmin;
  }

}
