import { AfterViewInit, Component, Input, OnDestroy, OnInit } from '@angular/core';
import { Card } from '@udonarium/card';
import { ImageFile } from '@udonarium/core/file-storage/image-file';
import { DataElement } from '@udonarium/data-element';
import { GameCharacter } from '@udonarium/game-character';
import { TabletopObject } from '@udonarium/tabletop-object';

@Component({
  selector: 'data-sheet',
  templateUrl: './data-sheet.component.html',
  styleUrls: ['./data-sheet.component.css']
})
export class DataSheetComponent implements OnInit, OnDestroy, AfterViewInit{

  @Input() tabletopObject: TabletopObject = null;
  isCharacter:boolean = false;
  isCard:boolean = false;

  get characterIdentifier():string {
    return this.tabletopObject.aliasName === 'character' ? this.tabletopObject.identifier : '';
  }

  get hasImage():boolean {
    let type = this.tabletopObject.aliasName;
    switch(type) {
      case 'character':
        let character = this.tabletopObject as GameCharacter;
        return (character.imageFile !== ImageFile.Empty);
      case 'card':
      case 'card-stack':
      case 'dice-symbol':
        return true;
    }
    return false;
  }

  get isHideText():boolean {
    if (this.tabletopObject instanceof Card) {
      return (!this.tabletopObject.isFront && !this.tabletopObject.isHand);
    }
    return false;
  }

  get tableTopObjectName(): string {
    let element = this.tabletopObject.commonDataElement.getFirstElementByName('name') || this.tabletopObject.commonDataElement.getFirstElementByName('title');
    return element ? <string>element.value : '';
  }

  get commonElement():DataElement {
    return this.tabletopObject.commonDataElement;
  }

  get detailElement():DataElement[] {
    return this.tabletopObject.detailDataElement.children as DataElement[];
  }

  constructor() { }

  ngOnInit(): void {
    this.isCharacter = (this.tabletopObject instanceof GameCharacter);
    this.isCard = (this.tabletopObject instanceof Card);
  }

  ngAfterViewInit(): void {
  }

  ngOnDestroy(): void {
  }

}
