import { animate, keyframes, style, transition, trigger } from '@angular/animations';
import { AfterViewInit, Component, Input, OnDestroy, OnInit,ChangeDetectionStrategy,ChangeDetectorRef} from '@angular/core';
import { ImageStorage } from '@udonarium/core/file-storage/image-storage';
import { ImageFile } from '@udonarium/core/file-storage/image-file';
import { EventSystem } from '@udonarium/core/system';
import { DataElement } from '@udonarium/data-element';
import { GameCharacter } from '@udonarium/game-character';
import { TabletopObject } from '@udonarium/tabletop-object';
import { FileSelecterComponent } from 'component/file-selecter/file-selecter.component';
import { ModalService } from 'service/modal.service';
import { RoomService } from 'service/room.service';
import { UUID } from '@udonarium/core/system/util/uuid';

@Component({
  selector: 'common-data-card',
  templateUrl: './common-data-card.component.html',
  styleUrls: ['./common-data-card.component.css'],
  animations: [
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
export class CommonDataCardComponent implements OnInit, OnDestroy, AfterViewInit {
  @Input() tabletopObject: TabletopObject = null;
  @Input() tableTopObjectName: string = null;
  @Input() gameDataElement: DataElement = null;
  @Input() isHideText: boolean = false;

  get imageIcon():ImageFile {
    return this.tabletopObject.faceIcon;
  }

  isChracater:boolean = false;

  commonElement:DataElement[] = [];
  hasName:boolean = false;
  nameElement:DataElement = null;

  private _name: string = '';
  get name(): string { return this._name; }
  set name(name: string) { this._name = name; this.setUpdateTimer(); }

  constructor(
    private changeDetector:ChangeDetectorRef,
    private modalService:ModalService,
    private roomService:RoomService
  ) { }

  faceIconElement:DataElement
  getFaceIconElement():void {
    this.faceIconElement = this.images.length > 1 ? this.images[this.tabletopObject.currntIconIndex] :null;
  }

  get images():DataElement[] {
    const elements = this.tabletopObject.imageDataElement.getElementsByName('faceIcon');
    return elements;
  }

  upImageIndex() {
    if (this.images.length < 2) return;
    const index = this.tabletopObject.currntIconIndex;
    if (index >= this.images.length - 1) this.tabletopObject.currntIconIndex = 0;
    else if (index >= 0) this.tabletopObject.currntIconIndex++;
    else this.tabletopObject.currntIconIndex = 1;
  }
  downImageIndex() {
    if (this.images.length < 2) return;
    const index = this.tabletopObject.currntIconIndex;
    if (index < 1 ) this.tabletopObject.currntIconIndex = this.images.length - 1;
    else this.tabletopObject.currntIconIndex--;
  }

  setFaceIcon() {
    let faceiconElement = this.faceIconElement
    let identifier = faceiconElement ? faceiconElement.value : "";
    this.modalService.open<string>(FileSelecterComponent, { isAllowedEmpty: false, currentImageIdentifires: identifier }).then(value => {
      if (!this.tabletopObject || !this.tabletopObject.imageDataElement || !value) return;
      if (faceiconElement) {
        faceiconElement.value = value;
      }
      else if (value) {
        this.tabletopObject.imageDataElement.appendChild(DataElement.create('faceicon', value, { type: 'image' }, 'faceicon' + UUID.generateUuid()));
        if (this.tabletopObject.currntIconIndex !== 0) this.tabletopObject.currntIconIndex = 0;
      }
    });
    queueMicrotask(() => this.update());
  }

  update() {
    EventSystem.trigger('UPDATE_GAME_OBJECT', {identifier: this.tabletopObject.identifier });
    this.changeDetector.detectChanges();
  }

  checkElement() {
    for (let dataElm of this.gameDataElement.children as DataElement[] ) {
      if (dataElm.name == 'name') {
        this.hasName = true;
        this.nameElement = dataElm;
        this._name = this.nameElement.value as string
      }
      else if (dataElm.name == 'altitude' && this.roomService.roomData.is2d) {
        continue;
      }
      else {
        this.commonElement.push(dataElm);
      }
    }
  }

  ngOnInit(): void {
    if (this.gameDataElement) this.checkElement();
    if (this.tabletopObject && this.tabletopObject.aliasName === 'character') {
      this.isChracater = true;
      this.getFaceIconElement();
    }

    EventSystem.register(this)
      .on('UPDATE_GAME_OBJECT', -1000, event => {
        if (this.nameElement && event.data.identifier === this.nameElement.identifier) {
          this._name = this.nameElement.value as string;
          this.changeDetector.detectChanges();
        }
        else if(this.tabletopObject.identifier == event.data.identifier) {
          this.getFaceIconElement();
          this.changeDetector.detectChanges();
        }
      })
  }

  ngAfterViewInit(): void {
  }

  ngOnDestroy(): void {
    EventSystem.unregister(this);
  }

  private updateTimer:NodeJS.Timer;
  private setUpdateTimer() {
    clearTimeout(this.updateTimer);
    this.updateTimer = setTimeout(() => {
      if (this.nameElement.value !== this.name) this.nameElement.value = this.name;
      this.updateTimer = null;
    }, 66);
  }

}
