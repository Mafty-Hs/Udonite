import { Component, OnInit,Input } from '@angular/core';
import { GameCharacter } from '@udonarium/game-character';
import { DataElement } from '@udonarium/data-element';
import { LimitResource } from '@udonarium/limit-resource';

@Component({
  selector: 'limit-resource',
  templateUrl: './limit-resource.component.html',
  styleUrls: ['./limit-resource.component.css']
})
export class LimitResourceComponent implements OnInit {
  @Input() character:GameCharacter = null;

  limitResource:LimitResource;

  get resouces():DataElement[] {
    return this.limitResource.children as DataElement[];
  }

  addElement() {
    this.limitResource.appendChild(DataElement.create('項目名', '', {}));
  }

  removeElement(dataElm :DataElement) {
    dataElm.destroy();
  }

  addItem(dataElm :DataElement) {
    dataElm.appendChild(DataElement.create('リソース名', 1, { 'type': 'numberResource', 'currentValue': '1' }))
  }

  constructor() {

  }

  ngOnInit(): void {
    this.limitResource = this.character.limitResource;
  }

}
