import { Component, Input, Output, EventEmitter,OnDestroy, OnInit, ChangeDetectionStrategy, ChangeDetectorRef } from '@angular/core';
import { DataElement } from '@udonarium/data-element';
import { GameObjectInventoryService } from 'service/game-object-inventory.service';
import { GameCharacterService } from 'service/game-character.service';
import { EventSystem } from '@udonarium/core/system';
import { ObjectStore } from '@udonarium/core/synchronize-object/object-store';
import { ObjectNode } from '@udonarium/core/synchronize-object/object-node';
import { GameCharacter } from '@udonarium/game-character';
import { StringUtil } from '@udonarium/core/system/util/string-util';
import { OpenUrlComponent } from 'component/open-url/open-url.component';
import { ModalService } from 'service/modal.service';
import { LimitResource } from '@udonarium/limit-resource';


@Component({
  selector: 'player-palette-control',
  templateUrl: './player-palette-control.component.html',
  styleUrls: ['./player-palette-control.component.css'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class PlayerPaletteControlComponent implements OnInit,OnDestroy  {

  gameCharacter: GameCharacter = null;
  private _sendFrom: string = "";

  mode:string = 'status'

  get sendFrom(){
    return this._sendFrom;
  }
  @Input() set sendFrom(sendFrom:string){
    this.cancelEdit();
    this.resourceTitle = 'common'
    this._sendFrom = sendFrom;
    let character = this.gameCharacterService.get(sendFrom);
    if (character) this.gameCharacter = character;
  }
  get name():string {return this.gameCharacter.name};
  get isTransparent():boolean {return this.gameCharacter.isTransparent};

  @Output() chat = new EventEmitter<{
    text: string, gameType: string, sendFrom: string, sendTo: string
    }>();
  sendChat(e) {
    this.chat.emit(e);
  }

  get inventoryDataElms(): DataElement[] {
    return this.inventoryService.tableInventory.dataElementMap.get(this.sendFrom);
  }
  get dataElms(): DataElement[] { return this.gameCharacterService.dataElements(this.sendFrom)  }
  get newLineString(): string { return this.inventoryService.newLineString; }

  isEdit: boolean = false;
  isString: boolean = false;

  get limitResource():LimitResource { return this.gameCharacter.limitResource }

  get currentResouce():DataElement[] {
    let resource = this.limitResource.childElement.find(dataElm => dataElm.name === this.resourceTitle)
    if (resource) return resource.children as DataElement[]
    return this.limitResource.commonElement.children as DataElement[]
  }

  resourceTitle:string = 'common';

  toggleMode() {
    this.mode = this.mode === 'resource' ? 'status' : 'resource'
  }

  resetResource() {
    this.limitResource.reset(this.resourceTitle);
  }

  setDataElm(event:Event ,dataElm: DataElement){
    switch(true) {
      case dataElm.isCheckProperty:
        this.switchCheckValue(dataElm);
        break;
      case dataElm.isUrl:
        this.openUrl(dataElm);
        break;
      case !Boolean(dataElm.type):
      case dataElm.isSimpleNumber:
      case dataElm.isNumberResource:
      case dataElm.isAbilityScore:
        if ( dataElm.isNumberValue || dataElm.isNumberResource ){
          this.isEdit = true;
          this.isString = false;
          this.selectElm = dataElm;
          break;
        }
      case dataElm.isNote:
        this.isEdit = true;
        this.isString = true;
        this.selectElm = dataElm;
    }
    this.changeDetector.detectChanges();
  }

  selectElm: DataElement;

  switchCheckValue(dataElm :DataElement) {
    dataElm.value = dataElm.value ? '' : dataElm.name ;
  }

  openUrl(urlElement :DataElement) {
    const url = urlElement.value.toString();
    return {
      name: urlElement.name ? urlElement.name : url,
      action: () => {
        if (StringUtil.sameOrigin(url)) {
          window.open(url.trim(), '_blank', 'noopener');
        } else {
          this.modalService.open(OpenUrlComponent, { url: url, title: this.gameCharacter.name, subTitle: urlElement.name });
        }
      },
      disabled: !StringUtil.validUrl(url),
      error: !StringUtil.validUrl(url) ? 'URLが不正です' : null,
      isOuterLink: StringUtil.validUrl(url) && !StringUtil.sameOrigin(url)
    };

  }

  cancelEdit(){
    this.innerText = '';
    this.isEdit = false;
  }

  constructor(
    private inventoryService: GameObjectInventoryService,
    private gameCharacterService: GameCharacterService,
    private modalService: ModalService,
    private changeDetector: ChangeDetectorRef
  ) {
    EventSystem.register(this)
    .on('UPDATE_GAME_OBJECT', -1000, event => {
      let object = ObjectStore.instance.get(event.data.identifier);
      if (!this.gameCharacter || !object) return;
      if (this.gameCharacter === object || (object instanceof ObjectNode && this.gameCharacter.contains(object)) ||
          event.data.aliasName === "summary-setting"
        ) {
          this.changeDetector.detectChanges();
      }});
  }

  ngOnInit(): void {
  }

  ngOnDestroy() {
  }

  innerText:string;
  text:string;
  sendCalc($event){
    let beforeValue:number = Number(this.selectElm.value);
    let afterValue:number = 0;
    let overValue:number = 0;
    if (this.selectElm.type == 'numberResource') {
      beforeValue = Number(this.selectElm.currentValue);
      let result = this.calcValue(Number(this.selectElm.currentValue) , StringUtil.text2Byte(this.innerText));
      if (result < 0) {
        overValue = result;
        result = 0;
      }
      this.selectElm.currentValue = result;
      afterValue = this.selectElm.currentValue;
    }
    else {
      this.selectElm.value = this.calcValue(Number(this.selectElm.value) , StringUtil.text2Byte(this.innerText));
      afterValue = this.selectElm.value;
    }
    this.innerText = '';
    let resulttext : string = this.name + ':' + this.selectElm.name + ' ' + beforeValue + ' → ' + afterValue;
    if (overValue < 0) resulttext += ' 超過 ' + overValue;
    this.chat.emit({
        text: resulttext,
        gameType: "",
        sendFrom: "System",
        sendTo: "",
      });
    this.isEdit = false;
  }

  calcValue(targetNum:number , targetText:string):number {
  let result : any;
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
