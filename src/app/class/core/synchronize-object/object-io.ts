import { GameObject, ObjectContext } from './game-object';
import { ObjectFactory } from './object-factory';
import { ObjectStore } from './object-store';
import { IONetwork,EventSystem } from '../system';
import { ObjectNode } from './object-node';

export interface ObjectNetworkContext {
  aliasName: string;
  identifier: string;
  majorVersion: number;
  minorVersion: number;
  parentIdentifier: string;
  context: ObjectContext
}

export class ObjectIO {

  constructor(){
    console.log("IO");
  }

  async ObjectUL(identifier :string) {
    //待機しないとappendChildが反映されない
    await this.sleep(0.1);
    let object:GameObject = this.get(identifier);
    let parent:string = "";
    if (!object) return;
    if (object instanceof ObjectNode) parent = object.parentId;
    let context = object.toContext();
    let uploadContext:ObjectNetworkContext = {
      aliasName: context.aliasName,
      identifier: context.identifier,
      majorVersion: context.majorVersion,
      minorVersion: context.minorVersion,
      parentIdentifier: parent,
      context: context
    };
    await IONetwork.objectUpdate(uploadContext) 
  }

  async ObjectDL(identifier :string) {
    let context:ObjectNetworkContext = await IONetwork.objectGet(identifier);
    this.ObjectBuild(context);
    return;
  }

  ObjectBuild(context:ObjectNetworkContext) {
    let object = this.get(context.identifier); 
      if (object) {
        this.ObjectUpdate(object,context);
      }
      else this.ObjectCreate(context.context);

  }

  ObjectUpdate(object: GameObject, context: ObjectNetworkContext) {
    if (context.majorVersion + context.minorVersion > object.version) {
      object.apply(context.context);
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