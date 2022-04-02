import { Component, Input, Output, EventEmitter,OnDestroy, OnInit } from '@angular/core';
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
    let character = this.gameCharacterService.get(sendFrom)
    if (character) this.name = character.name;
    this.isTranparent = character.isTransparent;
  }
  private name:string;
  isTranparent:boolean = true;

  @Output() chat = new EventEmitter<{
    text: string, gameType: string, sendFrom: string, sendTo: string
    }>();

  get inventoryDataElms(): DataElement[] {
    return this.inventoryService.tableInventory.dataElementMap.get(this.sendFrom);
  }
  get dataElms(): DataElement[] { return this.gameCharacterService.dataElements(this.sendFrom)  }
  get newLineString(): string { return this.inventoryService.newLineString; }

  isEdit : boolean = false;

  invalidcr:string[] = [ 'note' , 'checkProperty' , 'url' ];

  setDataElm(dataElm: DataElement){
    if ((dataElm.value && Number.isNaN(dataElm.value)) ||
    (dataElm.currentValue && Number.isNaN(dataElm.currentValue)) ||
    this.invalidcr.includes(dataElm.type)) return;
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
