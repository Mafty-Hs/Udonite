import { SyncObject } from './core/synchronize-object/decorator';
import { InnerXml } from './core/synchronize-object/object-serializer';
import { SyncVar } from './core/synchronize-object/decorator';
import { ObjectNode } from './core/synchronize-object/object-node';
import { ObjectStore } from './core/synchronize-object/object-store';

@SyncObject('ObjectTemplate')
export class ObjectTemplate extends ObjectNode implements InnerXml{
  private static _instance: ObjectTemplate;
  static get instance(): ObjectTemplate {
    if (!ObjectTemplate._instance) {
      let objectTemplate = ObjectStore.instance.get('ObjectTemplate')
      if (objectTemplate && objectTemplate instanceof ObjectTemplate) {
         ObjectTemplate._instance = objectTemplate;
      }
      else {
        ObjectTemplate.init();
      }
    }
    return ObjectTemplate._instance;
  }
  static init() {
      ObjectTemplate._instance = new ObjectTemplate('ObjectTemplate');
      ObjectTemplate._instance.initialize();
      let character = new ObjectTemplateData();
      character.initialize();
      character.name = "character";
      character.data = "";
      this.instance.appendChild(character);
  }

  get list(): ObjectTemplateData[] { 
  return this.children as ObjectTemplateData[]; }

  get character() :string {
    return this.list.find(template => template.name === 'character').data;
  }

  set character(character :string) {
    this.list.find(template => template.name === 'character').data = character;
  }
}

@SyncObject('object-template-data')
export class ObjectTemplateData extends ObjectNode {
  @SyncVar() name: string;
  @SyncVar() data: string;
}
