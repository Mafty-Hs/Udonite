import { animate, keyframes, style, transition, trigger } from '@angular/animations';
import { AfterViewInit, Component, Input, OnDestroy, OnInit } from '@angular/core';
import { TabletopObject } from '@udonarium/tabletop-object';
import { ImageFile } from '@udonarium/core/file-storage/image-file';
import { ModalService } from 'service/modal.service';
import { FileSelecterComponent } from 'component/file-selecter/file-selecter.component';
import { DataElement } from '@udonarium/data-element';

@Component({
  selector: 'character-image-card',
  templateUrl: './character-image-card.component.html',
  styleUrls: ['./character-image-card.component.css'],
  animations: [
    trigger('hide', [
      transition(':increment,:decrement', [
        animate('200ms ease', keyframes([
          style({ opacity: 0 }),
          style({ opacity: 0.5 })
        ]))
      ])
    ]),
    trigger('slide', [
      transition(':increment', [
        animate('200ms ease', keyframes([
          style({ transform: 'translateX(-50%)',opacity: 0.5 }),
          style({ transform: 'translateX(0%)',opacity: 1 })
        ]))
      ]),
      transition(':decrement', [
        animate('200ms ease', keyframes([
          style({ transform: 'translateX(50%)',opacity: 0.5 }),
          style({ transform: 'translateX(0%)',opacity: 1 })
        ]))
      ])
    ])
  ]
})
export class CharacterImageCardComponent implements OnInit, OnDestroy, AfterViewInit {
  @Input() tabletopObject: TabletopObject = null;

  replaceImage() {
    const element = this.tabletopObject.imageElement
    this.modalService.open<string>(FileSelecterComponent, { isAllowedEmpty: false, currentImageIdentifires: element.value }).then(value => {
      if (!this.tabletopObject || !this.tabletopObject.imageDataElement || !value) return;
      element.value = value;
    });
  }

  get images():DataElement[] {
    const elements = this.tabletopObject.imageDataElement.getElementsByName('imageIdentifier');
    return elements;
  }

  upImageIndex() {
    if (this.images.length < 2) return;
    const index = this.tabletopObject.currntImageIndex;
    if (index >= this.images.length - 1) this.tabletopObject.currntImageIndex = 0;
    else if (index >= 0) this.tabletopObject.currntImageIndex++;
    else this.tabletopObject.currntImageIndex = 1;
  }
  downImageIndex() {
    if (this.images.length < 2) return;
    const index = this.tabletopObject.currntImageIndex;
    if (index < 1 ) this.tabletopObject.currntImageIndex = this.images.length - 1;
    else this.tabletopObject.currntImageIndex--; 
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

}
