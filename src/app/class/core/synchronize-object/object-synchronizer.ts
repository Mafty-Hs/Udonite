import { EventSystem, IONetwork　} from '../system';
import { ObjectNetworkContext } from './object-io';
import { CatalogItem, ObjectStore } from './object-store';

type ObjectIdentifier = string;

export class ObjectSynchronizer {
  private static _instance: ObjectSynchronizer
  static get instance(): ObjectSynchronizer {
    if (!ObjectSynchronizer._instance) ObjectSynchronizer._instance = new ObjectSynchronizer();
    return ObjectSynchronizer._instance;
  }
  private constructor() { }

  initialize() {
    this.destroy();
    console.log('ObjectSynchronizer ready...');
    EventSystem.register(this)
      .on('NW_UPDATE_GAME_OBJECT', event => {
        let context: ObjectNetworkContext = event.data;
        ObjectStore.instance.objectIo.ObjectBuild(context);
      })
      .on('START_SYNC', event => {
        this.dataInit()
      })
      .on('NEED_REFLESH', event => {
        this.runSyncTask()
      })
      .on('NW_DELETE_GAME_OBJECT', event => {
        let identifier = event.data.identifier;
        ObjectStore.instance.delete(identifier, false);
      });
  }

  destroy() {
    EventSystem.unregister(this);
  }

  private async dataInit() {
    let allContext = await IONetwork.allData();
    for (let context of allContext) {
      if (context.identifier == 'testdata') continue;
      ObjectStore.instance.objectIo.ObjectBuild(context);
    }
    this.runSyncTask()
  }

  private async runSyncTask() {
    let catalog = await IONetwork.getCatalog();
    let myCatalog = ObjectStore.instance.getCatalog();
    console.log('SYNCHRONIZE_GAME_OBJECT START');
    let requestCatalog = catalog.filter( catalogItem => {
       let myItem = myCatalog.find(item => item.identifier === catalogItem.identifier)
      if (catalogItem.identifier == 'testdata') return false;
      if (myItem) {
        if (myItem.version < catalogItem.version) return true;
        return false;
      }
      return true;
    });
    let uploadCatalog = myCatalog.filter( catalogItem => {
      let hostItem = catalog.find(item => item.identifier === catalogItem.identifier)
      if (hostItem) {
        if (hostItem.version < catalogItem.version) return true;
        return false;
      }
      return true;
    });
    if (requestCatalog.length < 1 && uploadCatalog.length < 1) {
      EventSystem.trigger('SYNC_END',null)
      console.log('SYNCHRONIZE_GAME_OBJECT END');
      this.repeatSyncTask();
      return;
    }
    console.log("request object :" +  requestCatalog.length);
    console.log("upload object :" + uploadCatalog.length);
    this.objectSync(requestCatalog, uploadCatalog);
   }

  async objectSync(requestCatalog :CatalogItem[], uploadCatalog :CatalogItem[]){
    for (let catalogitem of requestCatalog) {
      await ObjectStore.instance.objectIo.ObjectDL(catalogitem.identifier);
    }
    for (let catalogitem of uploadCatalog) {
      await ObjectStore.instance.objectIo.ObjectUL(catalogitem.identifier);
    }
    console.log("Sync Data End retry");
    await this.sleep(2);
    this.runSyncTask();
  }

  async sleep(second :number) {
    return new Promise<void>(resolve => {
      setTimeout(() => {
      resolve()
      }, second * 1000)
    })
  }

  async repeatSyncTask() {
    await this.sleep(600)
    this.runSyncTask();
  }

}
