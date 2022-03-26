import { IONetwork } from "./core/system";

export class RoomControl {
  identifier = "RoomAdmin";
  adminPlayer:string[] = [];
  transparentMode:boolean = false;
  disableRoomLoad:boolean = false;
  disableObjectLoad:boolean = false;
  disableTabletopLoad:boolean = false;
  disableImageLoad:boolean = false;
  disableAudioLoad:boolean = false;
  disableTableSetting:boolean = false;
  disableTabSetting:boolean = false;
  disableAllDataSave:boolean = false;
  disableSeparateDataSave:boolean = false;
  gameType:string = "";
  templateCharacter:string = "";
  chatTab:string = "";
  diceLog:boolean = false;
  cardLog:boolean = false;
}

export class RoomAdmin {

  static myPlayerID:string = '';
  private static control:RoomControl = new RoomControl;
  private static _setting = new Proxy(RoomAdmin.control, {
    get: (target:any, propertyKey:PropertyKey) =>  {
      return RoomAdmin.control[propertyKey];
    },
    set:  (target:any, propertyKey:PropertyKey, value:any, receiver:any):boolean  => {
      RoomAdmin.control[propertyKey] = value;
      RoomAdmin.update();
      return true;
    }
  })

  static set(control :object) {
    RoomAdmin.control = <RoomControl>control;
  }

  static update() {
    IONetwork.roomAdminUpdate(RoomAdmin.control);
  }

  static async initialize() {
    let control = await IONetwork.roomAdminGet()
    if (control) RoomAdmin.control = control;
  }

  static get setting(): RoomControl {
    return RoomAdmin._setting;
  }

  static get auth() :boolean{
    if (RoomAdmin.setting.adminPlayer.length < 1) return true;
    return RoomAdmin.setting.adminPlayer.includes(RoomAdmin.myPlayerID);
  }

}
