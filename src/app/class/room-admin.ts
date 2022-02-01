

export class RoomAdmin {

  adminPlayer:string[];
  disableRoomLoad:boolean;
  disableObjectLoad:boolean;
  disableTabletopLoad:boolean;
  disableImageLoad:boolean;
  disableAudioLoad:boolean;
  disableTableSetting:boolean;
  disableTabSetting:boolean;
  disableAllDataSave:boolean;
  disableSeparateDataSave:boolean;

  gameType:string;
  chatTab:string;
  diceLog:boolean;
  cardLog:boolean;
  myPlayerID:string = '';
  private static _instance:RoomAdmin = new RoomAdmin;

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

  static get instance(): RoomAdmin {
    return RoomAdmin._instance;
  }
 
  static get setting(): RoomAdmin {
    return RoomAdmin._instance;
  }

  static get auth() :boolean{
    if (RoomAdmin.setting.adminPlayer.length < 1) return true;
    return RoomAdmin.setting.adminPlayer.includes(RoomAdmin.setting.myPlayerID);
  }

}
