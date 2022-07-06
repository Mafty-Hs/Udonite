import { AfterViewInit, Component, Input, OnDestroy, OnInit } from '@angular/core';
import { Card } from '@udonarium/card';
import { CardStack } from '@udonarium/card-stack';
import { TabletopObject } from '@udonarium/tabletop-object';
import { StringUtil } from '@udonarium/core/system/util/string-util';
import { ImageFile } from '@udonarium/core/file-storage/image-file';
import { ModalService } from 'service/modal.service';
import { FileSelecterComponent } from 'component/file-selecter/file-selecter.component';
import { DataElement } from '@udonarium/data-element';
import { DiceSymbol } from '@udonarium/dice-symbol';
import { EventSystem } from '@udonarium/core/system';

interface CardScale {
  width: number, height: number,  scale: number
}

@Component({
  selector: 'tabletop-image-card',
  templateUrl: './tabletop-image-card.component.html',
  styleUrls: ['./tabletop-image-card.component.css']
})
export class TabletopImageCardComponent implements OnInit, OnDestroy, AfterViewInit {
  @Input() tabletopObject: TabletopObject = null;
  gridSize = 50;

  get showCard():boolean {
    if (this.tabletopObject instanceof Card) {
      return (this.tabletopObject.isFront || this.tabletopObject.isHand);
    }
    else if (this.tabletopObject instanceof CardStack) {
      return this.tabletopObject.topCard.isFront;
    }
    return false;
  }

  get imageAreaRreact(): CardScale {
    const rect = {width: 0, height: 0,  scale: 1};
    let size:number = null;
    let image:ImageFile = null;
    if (this.tabletopObject instanceof CardStack) {
      size = this.tabletopObject.topCard.size;
      image = this.tabletopObject.topCard.imageFile;
    } else if (this.tabletopObject instanceof Card) {
      size = this.tabletopObject.size;
      image = this.tabletopObject.imageFile;
    }
    if (size && image) {
      rect.width = size * this.gridSize;
      rect.height = rect.width * image.aspect;
      rect.scale = 250 / rect.width;
    }
    return rect;
  }

  replaceImage() {
    let element:DataElement = null;
    if (this.tabletopObject instanceof CardStack) {
      return;
    }
    else if (this.tabletopObject instanceof Card) {
      let name = this.tabletopObject.isVisible ? 'front' : 'back'
      const elements = this.tabletopObject.imageDataElement.getElementsByName(name);
      if (elements && elements.length > 0) element = elements[0];
    }
    else if (this.tabletopObject instanceof DiceSymbol) {
      let name = this.tabletopObject['face']
      const elements = this.tabletopObject.imageDataElement.getElementsByName(name);
      if (elements && elements.length > 0) element = elements[0];
    }
    if (!element) return;
    this.modalService.open<string>(FileSelecterComponent, { isAllowedEmpty: false, currentImageIdentifires: element.value }).then(value => {
      if (!this.tabletopObject || !value) return;
      element.value = value;
    });
    EventSystem.trigger('UPDATE_GAME_OBJECT', this.tabletopObject);
  }

  constructor(
    private modalService:ModalService
  ) { }

  ngOnInit(): void {
  }

  ngAfterViewInit(): void {
  }

  ngOnDestroy(): void {
  }


  get cardColor(): string {
    let card = null;
    if (this.tabletopObject instanceof CardStack) {
      card = this.tabletopObject.topCard;
    } else if (this.tabletopObject instanceof Card) {
      card = this.tabletopObject;
    }
    return card ? card.color : '#555555';
  }

  get cardFontSize(): number {
    let card = null;
    if (this.tabletopObject instanceof CardStack) {
      card = this.tabletopObject.topCard;
    } else if (this.tabletopObject instanceof Card) {
      card = this.tabletopObject;
    }
    return card ? card.fontsize + 9 : 18;
  }

  get cardText(): string {
    let card = null;
    if (this.tabletopObject instanceof CardStack) {
      card = this.tabletopObject.topCard;
    } else if (this.tabletopObject instanceof Card) {
      card = this.tabletopObject;
    }
    return card ? StringUtil.escapeHtmlAndRuby(card.text) : '';
  }

}
