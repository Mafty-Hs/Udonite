import { IONetwork } from "./core/system";

export class RoomControl {
  identifier = "RoomAdmin";
  adminPlayer:string[] = [];
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
    set:  (target:any, propertyKey:PropertyKey, value:any, receiver:any):boolean  => {
      RoomAdmin.update();
      return Reflect.set(target, propertyKey, value, receiver);
  }
  })

  static update() {
    setTimeout(() => {IONetwork.roomAdminUpdate(RoomAdmin.control);},500)
  }

  static async initialize() {
    let control = await IONetwork.roomAdminGet()
    if (control) RoomAdmin.control = control;
    IONetwork.socket.recieve("UPDATE_ROOMADMIN").subscribe(control => {
      if (control instanceof RoomControl) RoomAdmin.control = control;
    });
  }

  static get setting(): RoomControl {
    return RoomAdmin._setting;
  }

  static get auth() :boolean{
    if (RoomAdmin.setting.adminPlayer.length < 1) return true;
    return RoomAdmin.setting.adminPlayer.includes(RoomAdmin.myPlayerID);
  }

}
