import { SyncObject, SyncVar } from './core/synchronize-object/decorator';
import { DataElement } from './data-element';

@SyncObject('limit-resource')
export class LimitResource extends DataElement {
  @SyncVar() parentCharacter: string = "";

  get childElement():DataElement[] {
    return this.children as DataElement[];
  }

  get commonElement():DataElement {
    return this.childElement[0];
  }

  get names():string[] {
    return this.childElement.map(dataElm => { return dataElm.name ;} )
  }

  reset(resourceName:string) {
    let resources = this.childElement.find(dataElm => dataElm.name === resourceName).children as DataElement[];
    if (resources) {
      let numberResource = resources.filter(dataElm => dataElm.type === 'numberResource');
      if (numberResource.length > 0) {
        for (let dataElm of numberResource) {
          dataElm.currentValue = dataElm.value;
        }
      }
      let checkResource = resources.filter(dataElm => dataElm.type === 'checkProperty');
      if (checkResource.length > 0) {
        for (let dataElm of checkResource) {
          dataElm.value = dataElm.name;
        }
      }
    }
  }

}
