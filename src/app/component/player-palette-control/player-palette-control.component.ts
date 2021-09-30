import { Component, Input, Output, EventEmitter,OnDestroy, OnInit } from '@angular/core';
import { EventSystem, Network } from '@udonarium/core/system';
import { DataElement } from '@udonarium/data-element';
import { GameObjectInventoryService } from 'service/game-object-inventory.service';
import { GameCharacterService } from 'service/game-character.service';

@Component({
  selector: 'player-palette-control',
  templateUrl: './player-palette-control.component.html',
  styleUrls: ['./player-palette-control.component.css']
})
export class PlayerPaletteControlComponent implements OnInit,OnDestroy  {

  private _sendFrom: string = ""; 
  get sendFrom(){
    return this._sendFrom;
  }
  @Input() set sendFrom(sendFrom:string){
    this.cancelEdit();
    this._sendFrom = sendFrom;
    this.name = this.gameCharacterService.get(sendFrom).name;
  }
  private name:string;

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

  get inventoryDataElms(): DataElement[] {
    return this.inventoryService.tableInventory.dataElementMap.get(this.sendFrom);
  }
  get dataElms(): DataElement[] { return this.gameCharacterService.dataElements(this.sendFrom)  }
  get newLineString(): string { return this.inventoryService.newLineString; }

  isEdit : boolean = false;
  
  setDataElm(dataElm: DataElement){
    this.isEdit = true;
    this.selectElm = dataElm;
  }

  selectElm: DataElement;
 
  cancelEdit(){
    this.innerText = '';
    this.isEdit = false;
  }

  constructor(
    private inventoryService: GameObjectInventoryService,
    private gameCharacterService: GameCharacterService
  ) {}

  ngOnInit(): void {
  }

  ngOnDestroy() {
    EventSystem.unregister(this);
  }

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
    let resulttext : string = this.name + ' ' + this.selectElm.name + ': ' + beforeValue + ' -> ' + afterValue; 
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


}
