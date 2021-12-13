import { SyncObject, SyncVar } from './core/synchronize-object/decorator';
import { TabletopObject } from './tabletop-object';
import { DataElement } from './data-element';

@SyncObject('Popup')
export class Popup extends TabletopObject {
  @SyncVar() text: string = '';
  
  get name(): string { return this.getCommonValue('name', ''); }
  set name(name: string) { this.setCommonValue('name', name); }
  get size(): number { return this.getCommonValue('size', 1); }
  set size(size: number) { this.setCommonValue('size', size); }

  static create(): Popup {
    let object: Popup =  new Popup();

    object.createDataElements();
    object.commonDataElement.appendChild(DataElement.create('name', "ポップアップ", {}, 'name_' + object.identifier));
    object.commonDataElement.appendChild(DataElement.create('size', 1, {}, 'size_' + object.identifier));
    if (object.imageDataElement.getFirstElementByName('imageIdentifier')) {
      object.imageDataElement.getFirstElementByName('imageIdentifier').value = "";
    }

    object.initialize();
    return object;
  }
}
