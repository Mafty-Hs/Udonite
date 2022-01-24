import { SyncObject } from './core/synchronize-object/decorator';
import { InnerXml } from './core/synchronize-object/object-serializer';
import { SyncVar } from './core/synchronize-object/decorator';
import { ObjectNode } from './core/synchronize-object/object-node';
import { Player } from './player';
import { ObjectStore } from './core/synchronize-object/object-store';

@SyncObject('room-admin')
export class RoomAdmin extends ObjectNode implements InnerXml{

  @SyncVar() adminPlayer:string[];
  @SyncVar() disableRoomLoad:boolean;
  @SyncVar() disableObjectLoad:boolean;
  @SyncVar() disableTabletopLoad:boolean;
  @SyncVar() disableImageLoad:boolean;
  @SyncVar() disableAudioLoad:boolean;
  @SyncVar() disableTableSetting:boolean;
  @SyncVar() disableTabSetting:boolean;
  @SyncVar() disableAllDataSave:boolean;
  @SyncVar() disableSeparateDataSave:boolean;

  @SyncVar() gameType:string;
  @SyncVar() chatTab:string;
  @SyncVar() diceLog:boolean;
  @SyncVar() cardLog:boolean;
  myPlayerID:string = '';
  private static _instance:RoomAdmin;

  private static defaultSetting = {
    adminPlayer: [], 
    disableRoomLoad: false,
    disableObjectLoad: false,
    disableTabletopLoad: false,
    disableImageLoad: false,
    disableAudioLoad: false,
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
    let admin = ObjectStore.instance.get('RoomAdmin')
    if (admin && admin instanceof RoomAdmin) {
      RoomAdmin._instance = admin;
     }
    else {
      RoomAdmin._instance = new RoomAdmin('RoomAdmin');
      RoomAdmin._instance.initialize();
    }
  }

  makeChild() {
    let admin = ObjectStore.instance.get('admin')
    if (admin && admin instanceof RoomAdmin)  {
      RoomAdmin._instance.appendChild(admin);  
      return admin;
    }
    let newadmin = new RoomAdmin('admin')
    newadmin.initialize();
    for (let key in RoomAdmin.defaultSetting) {
      newadmin.setAttribute(key, RoomAdmin.defaultSetting[key]);
    }
    RoomAdmin._instance.appendChild(newadmin);
    return newadmin;
  }

  get getchild(): ObjectNode[] {  
    return this.children as ObjectNode[];
  }

  static get instance(): RoomAdmin {
    if (!RoomAdmin._instance) RoomAdmin.init();
    return RoomAdmin._instance;
  }
 
  static get setting(): RoomAdmin {
    let child = RoomAdmin.instance.getchild.find(object => 
      (object instanceof RoomAdmin)) as RoomAdmin;
    if (!child) {
      child = RoomAdmin._instance.makeChild()
    }
    return child;
  }

  static get auth() :boolean{
    if (RoomAdmin.setting.adminPlayer.length < 1) return true;
    return RoomAdmin.setting.adminPlayer.includes(RoomAdmin.setting.myPlayerID);
  }

}
