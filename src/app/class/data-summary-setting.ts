import { SyncObject, SyncVar } from './core/synchronize-object/decorator';
import { GameObject } from './core/synchronize-object/game-object';
import { InnerXml } from './core/synchronize-object/object-serializer';
import { ObjectStore } from './core/synchronize-object/object-store';

export enum SortOrder {
  ASC = 'ASC',
  DESC = 'DESC'
}

@SyncObject('summary-setting')
export class DataSummarySetting extends GameObject implements InnerXml {
  // todo:シングルトン化するのは妥当？
  private static _instance: DataSummarySetting;
  static get instance(): DataSummarySetting {
    if (!DataSummarySetting._instance) {
      let dataSummarySetting = ObjectStore.instance.get('DataSummarySetting')
      if (dataSummarySetting && dataSummarySetting instanceof DataSummarySetting) {
         DataSummarySetting._instance = dataSummarySetting;
      }
      else {
        DataSummarySetting._instance = new DataSummarySetting('DataSummarySetting');
        DataSummarySetting._instance.initialize();
      }
    }
    return DataSummarySetting._instance;
  }

  @SyncVar() sortType:string = 'free';
  @SyncVar() sortTag: string = 'name';
  @SyncVar() sortOrder: SortOrder = SortOrder.ASC;
  @SyncVar() dataTag: string = 'HP MP 敏捷度 生命力 精神力';
  @SyncVar() StatusBarTag_1: string = "HP";
  @SyncVar() StatusBarTag_2: string = "MP";
  @SyncVar() StatusBarTag_3: string = "";
  @SyncVar() StatusBarColor_1: string = "#00CC00";
  @SyncVar() StatusBarColor_2: string = "#0000CC";
  @SyncVar() StatusBarColor_3: string = "#CC9900";

  private _dataTag: string;
  private _dataTags: string[];
  get dataTags(): string[] {
    if (this._dataTag !== this.dataTag) {
      this._dataTag = this.dataTag;
      this._dataTags = this.dataTag != null && 0 < this.dataTag.trim().length ? this.dataTag.trim().split(/\s+/) : [];
    }
    return this._dataTags;
  }

  innerXml(): string { return ''; }
  parseInnerXml(element: Element) {
    // XMLからの新規作成を許可せず、既存のオブジェクトを更新する
    let context = DataSummarySetting.instance.toContext();
    context.syncData = this.toContext().syncData;
    DataSummarySetting.instance.apply(context);
    DataSummarySetting.instance.update();

    this.destroy();
  }
}
