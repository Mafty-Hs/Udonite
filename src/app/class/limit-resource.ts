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
          if (dataElm.value) dataElm.currentValue = dataElm.value;
        }
      }
      let checkResource = resources.filter(dataElm => dataElm.type === 'checkProperty');
      if (checkResource.length > 0) {
        for (let dataElm of checkResource) {
          dataElm.value = '';
        }
      }
    }
  }

  castDataElement(dataElement :DataElement):void {
    if (dataElement.children.length > 0) {
      let dataElms = dataElement.children as DataElement[];
      for (let dataElm of dataElms) {
        this.dataElmCheck(dataElm);
        if (dataElm.children.length > 0 ) {
          let childElms = this.getChildElement(dataElm);
          childElms.forEach(_dataElm => {
            dataElement.appendChild(_dataElm);
            dataElement.insertBefore(_dataElm,dataElm);
          })
          dataElm.destroy();
        }
      }
      this.appendChild(dataElement);
      return;
    }
    this.dataElmCheck(dataElement);
    this.commonElement.appendChild(dataElement);
  }

  numberPattern:RegExp = new RegExp('^[0-9]*$');
  private dataElmCheck(dataElement :DataElement):void {
    if (dataElement.type === 'abilityScore' || dataElement.type === 'url') dataElement.type = '';
    let value = dataElement.value as string
    if (dataElement.type == '' && !dataElement.name && !this.numberPattern.test(value)) {
      dataElement.name = value;
      dataElement.value = '';
    }
  }

  private getChildElement(dataElement :DataElement): DataElement[] {
    let childElms:DataElement[] = [];
    let name = dataElement.name;
    let dataElms = dataElement.children as DataElement[];
    for (let dataElm of dataElms) {
      this.dataElmCheck(dataElm);
      if (dataElm.children.length > 0 ) {
        let _childElms = this.getChildElement(dataElm);
        childElms.forEach(dataElm => {
          dataElm.name = name + ' - ' + dataElm.name;
        })
        childElms = childElms.concat(_childElms);
      }
      else {
        dataElm.name = name + ' - ' + dataElm.name;
        childElms.push(dataElm);
      }
    }
    return childElms;
  }

}
