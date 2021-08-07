import { Component, ElementRef, Input, Output, EventEmitter, NgZone, OnDestroy, OnInit } from '@angular/core';
import { ObjectNode } from '@udonarium/core/synchronize-object/object-node';
import { ObjectStore } from '@udonarium/core/synchronize-object/object-store';
import { EventSystem, Network } from '@udonarium/core/system';
import { DataElement } from '@udonarium/data-element';
import { TabletopObject } from '@udonarium/tabletop-object';
import { GameObjectInventoryService } from 'service/game-object-inventory.service';
import { GameCharacter } from '@udonarium/game-character';

@Component({
  selector: 'player-palette-control',
  templateUrl: './player-palette-control.component.html',
  styleUrls: ['./player-palette-control.component.css']
})
export class PlayerPaletteControlComponent implements OnInit,OnDestroy  {
  @Input() disableControl : boolean;
  private _character: GameCharacter;
  private tabletopObject : TabletopObject;
  @Input() set character(character :GameCharacter){
    this.cancelEdit();
    this._character = character;
    this.tabletopObject = character;
  }
  @Output() chat = new EventEmitter<{ 
    text: string, gameType: string, sendFrom: string, sendTo: string,
    color?: string, 
    isInverse?:boolean, 
    isHollow?: boolean, 
    isBlackPaint?: boolean, 
    aura?: number, 
    isUseFaceIcon?: boolean, 
    characterIdentifier?: string, 
    standIdentifier?: string, 
    standName?: string,
    isUseStandImage?: boolean }>();

  isEdit : boolean = false;

  get character() : GameCharacter {return this._character;}
  get newLineString(): string { return this.inventoryService.newLineString; }
  get inventoryDataElms(): DataElement[] { return this.tabletopObject ? this.getInventoryTags(this.tabletopObject) : []; }
  get dataElms(): DataElement[] { return this.tabletopObject && this.tabletopObject.detailDataElement ? this.tabletopObject.detailDataElement.children as DataElement[] : []; }
  private getInventoryTags(gameObject: TabletopObject): DataElement[] {
    return this.inventoryService.tableInventory.dataElementMap.get(gameObject.identifier);
  }

  constructor(
    private ngZone: NgZone,
    private inventoryService: GameObjectInventoryService,
  ) {}

  ngOnInit(): void {
  }

  ngOnDestroy() {
    EventSystem.unregister(this);
  }

selectElm: DataElement;
innerText:string;
text:string;
sendCalc($event){
  let beforeValue = this.selectElm.value;
  let afterValue;
  if (this.selectElm.type == 'numberResource') {
    beforeValue = this.selectElm.currentValue;
    this.selectElm.currentValue = this.calcValue(Number(this.selectElm.currentValue) , this.text2Byte());
    afterValue = this.selectElm.currentValue;
  }
  else {
    if (typeof this.selectElm.value === 'number') {
      this.selectElm.value = this.calcValue(Number(this.selectElm.value) , this.text2Byte());
      afterValue = this.selectElm.value;
    }
    if (typeof this.selectElm.value === 'string') {
      this.selectElm.value = this.innerText;
      afterValue = this.selectElm.value;
    }
  }
  this.innerText = '';
  let resulttext : string = this.character.name + ' ' + this.selectElm.name + ': ' + beforeValue + ' -> ' + afterValue; 
  this.chat.emit({
        text: resulttext,
        gameType: "",
        sendFrom: "System",
        sendTo: "",
        color: "", 
        isInverse: false,
        isHollow:  false,
        isBlackPaint: false,
        aura: -1,
        isUseFaceIcon: false,
        characterIdentifier: null,
        standIdentifier: null,
        standName: "",
        isUseStandImage: false
      });
  this.isEdit = false;
}

text2Byte () : string {
  let calcMap = { '＋': '+' ,'－': '-' ,'×': '*' , '÷': '/' ,
    'ー': '-' ,'＊': '*' ,'％': '%' ,'（': '(' ,'）': ')'  
  };
  let calcEnc = new RegExp('(' + Object.keys(calcMap).join('|') + ')', 'g');

  let baseText:string = this.innerText
  .replace(/[Ａ-Ｚａ-ｚ０-９]/g, function(str) {
    return String.fromCharCode(str.charCodeAt(0) - 0xFEE0);
  })
  .replace(calcEnc, function (str) {
    return calcMap[str];
  });
  baseText = baseText.replace(/[^\x20-\x7e]/g,'');
  
  return baseText;
}

calcValue(targetNum:number , targetText:string):number {
 let result : any;
  console.log(targetText);
 switch (targetText.slice( 0, 1 )) {
  case "+":
    result = targetNum + this.myeval(targetText.slice( 1 ));
    break;
  case "-":
    result = targetNum + this.myeval(targetText);
    break;
  default:
    result = this.myeval(targetText);
    break;
  }
 
 if(!isNaN(result)) return Number(result);
 return targetNum;
}

myeval(value : string): number{
  let result :any;
  result = Function('"use strict";return ('+value+')')();
  if(!isNaN(result)) return Number(result);
  return 0;
}

setDataElm(dataElm: DataElement){
  console.log(dataElm)
  this.isEdit = true;
  this.selectElm = dataElm;
}

cancelEdit(){
  this.innerText = '';
  this.isEdit = false;
}

}
