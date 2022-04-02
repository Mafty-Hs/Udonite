import { EventSystem, IONetwork } from '../system';
import { CatalogItem, ObjectStore } from './object-store';
import { GameObject, ObjectContext } from './game-object';
import { ObjectFactory } from './object-factory';


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
        let context: ObjectContext = event.data;
        this.ObjectBuild(context);
      })
      .on('UPLOAD_GAME_OBJECT', event => {
        EventSystem.trigger('UPDATE_GAME_OBJECT',event.data)
        this.ObjectUL(event.data.identifier)
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
      this.ObjectBuild(context);
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
      setTimeout(() => {
        this.runSyncTask();
       }
        , 5 * 60 * 1000);
      return;
    }
    console.log("request object :" +  requestCatalog.length);
    console.log("upload object :" + uploadCatalog.length);
    this.objectSync(requestCatalog, uploadCatalog);
   }

  async objectSync(requestCatalog :CatalogItem[], uploadCatalog :CatalogItem[]){
    for (let catalogitem of requestCatalog) {
      await this.ObjectDL(catalogitem.identifier);
    }
    for (let catalogitem of uploadCatalog) {
      await this.ObjectUL(catalogitem.identifier);
    }
    console.log("Sync Data End retry");
    await this.sleep(2);
    this.runSyncTask();
  }

  async ObjectUL(identifier :string) {
    //待機しないとappendChildが反映されない
    await this.sleep(0.1);
    let object:GameObject = this.get(identifier);
    if (!object) return;
    let context = object.toContext();
    await IONetwork.objectUpdate(context)
  }

  async ObjectDL(identifier :string) {
    let context:ObjectContext = await IONetwork.objectGet(identifier);
    this.ObjectBuild(context);
    return;
  }

  ObjectBuild(context:ObjectContext) {
    let object = this.get(context.identifier);
      if (object) {
        this.ObjectUpdate(object,context);
      }
      else this.ObjectCreate(context);

  }

  ObjectUpdate(object: GameObject, context: ObjectContext) {
    if (context.majorVersion + context.minorVersion > object.version) {
      object.apply(context);
      EventSystem.trigger('UPDATE_GAME_OBJECT', context);
    }
  }


  ObjectCreate(context :ObjectContext) {
    let newObject: GameObject = ObjectFactory.instance.create(context.aliasName, context.identifier);
    if (!newObject) {
      console.warn(context.aliasName + ' is Unknown...?', context);
      return;
    }
    newObject.apply(context);
    ObjectStore.instance.add(newObject, false);
    EventSystem.trigger('UPDATE_GAME_OBJECT', context);
  }

  private get(identifier :string) :GameObject {
    return ObjectStore.instance.get(identifier);
  }

  async sleep(second :number) {
    return new Promise<void>(resolve => {
      setTimeout(() => {
      resolve()
      }, second * 1000)
    })
  }

}

