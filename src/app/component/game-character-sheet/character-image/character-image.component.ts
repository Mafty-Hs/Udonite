import { AfterViewInit, Component, Input, OnDestroy, OnInit, ChangeDetectionStrategy , ChangeDetectorRef} from '@angular/core';
import { GameCharacter } from '@udonarium/game-character';
import { ImageFile } from '@udonarium/core/file-storage/image-file';
import { DataElement } from '@udonarium/data-element';
import { ModalService } from 'service/modal.service';
import { FileSelecterComponent } from 'component/file-selecter/file-selecter.component';
import { UUID } from '@udonarium/core/system/util/uuid';
import { EventSystem } from '@udonarium/core/system';
import { ImageStorage } from '@udonarium/core/file-storage/image-storage';
import { ImageService } from 'service/image.service';

interface editImage {
  image: ImageFile;
  shadowImage: ImageFile;
}

@Component({
  selector: 'character-image',
  templateUrl: './character-image.component.html',
  styleUrls: ['./character-image.component.css'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class CharacterImageComponent implements OnInit, OnDestroy, AfterViewInit {
  @Input() character: GameCharacter = null;

  private dblClickTimer:NodeJS.Timer;

  get imageIndex():number {
    return this.character.currntImageIndex;
  }
  get iconIndex():number {
    return this.character.currntIconIndex;
  }

  get images():editImage[] {
    return this.imageDataElements.map(dataElm => {
      let image = this.imageService.getEmptyOr(ImageStorage.instance.get(dataElm.value as string));
      let shadowIdentifier = dataElm.currentValue as string;
      if (shadowIdentifier.length < 1) dataElm.currentValue = dataElm.value as string;
      let shadow = this.imageService.getEmptyOr(ImageStorage.instance.get(dataElm.currentValue as string));
      return {image: image, shadowImage: shadow};
    })
  }

  get icons():ImageFile[] {
    return this.character.faceIcons;
  }

  get imageDataElements():DataElement[] {
    return  this.character.imageDataElement.getElementsByName('imageIdentifier');
  }

  get iconElements():DataElement[] {
    return this.character.imageDataElement.getElementsByName('faceIcon');
  }

  async replaceImage(index :number) {
    const element = this.imageDataElements[index];
    if (!element) return;
    let newIdentifier = await this.replaceImageModal(element.value as string);
    if (newIdentifier) element.value = newIdentifier;
    queueMicrotask(() => this.update());
  }

  async replaceIcon(index :number) {
    const element = this.iconElements[index];
    if (!element) return;
    let newIdentifier = await this.replaceImageModal(element.value as string);
    if (newIdentifier) element.value = newIdentifier;
    queueMicrotask(() => this.update());
  }

  async replaceShadow(index :number) {
    const element =this.imageDataElements[index];
    if (!element) return;
    let newIdentifier = await this.replaceImageModal(element.currentValue as string);
    if (newIdentifier) element.currentValue = newIdentifier;
    queueMicrotask(() => this.update());
  }

  private async replaceImageModal(imageIdentidier :string):Promise<string> {
    return await this.modalService.open<string>(FileSelecterComponent, { isAllowedEmpty: false,currentImageIdentifires: imageIdentidier })
  }

  removeImage(e:Event ,name: string,index :number) {
    e.stopPropagation();
    e.preventDefault();
    const elements = this.character.imageDataElement.getElementsByName(name);
    if (elements[index]) {
      if (name == 'imageIdentifier') {
        if (this.imageDataElements.length == 1) {
          this.imageDataElements[0].value = "";
          this.imageDataElements[0].currentValue = "";
          this.character.currntImageIndex = 0;
        }
        else {
          if (this.character.currntImageIndex > index) this.character.currntImageIndex -= 1;
          this.character.imageDataElement.removeChild(elements[index]);
          if (this.character.currntImageIndex >= elements.length - 1) this.character.currntImageIndex =  elements.length - 2;
          if (this.character.currntImageIndex < 0) this.character.currntImageIndex = 0;

        }
      }
      else if (name == 'faceIcon') {
        if (this.character.currntIconIndex > index) this.character.currntIconIndex -= 1;
        this.character.imageDataElement.removeChild(elements[index]);
        if (this.character.currntIconIndex >= elements.length - 1) this.character.currntIconIndex =  elements.length - 2;
        if (this.character.currntIconIndex < 0) this.character.currntIconIndex = 0;

      }
    }
    queueMicrotask(() => this.update());
  }

  addImageModal(name :string) {
    this.modalService.open<string>(FileSelecterComponent, { currentImageIdentifires: '' }).then(value => {
      if (!this.character || !this.character.imageDataElement || !value) return;
      let element:DataElement;
      if (name == 'imageIdentifier' && this.imageDataElements.length == 1 && this.imageDataElements[0].value == '') {
        element = this.imageDataElements[0];
        element.value = value;
      }
      else element = DataElement.create(name, value, { type: 'image' }, name + UUID.generateUuid());
      if (name == 'imageIdentifier') {
        element.currentValue = value;
      }
      this.character.imageDataElement.appendChild(element);
      if (name == 'imageIdentifier' && this.images.length == 1) {
        this.character.currntImageIndex = 0;
      }
      if (name == 'faceIcon' && this.icons.length == 1) {
        this.character.currntIconIndex = 0;
      }
      queueMicrotask(() => this.update());
    });
  }

  update() {
    EventSystem.trigger('UPDATE_GAME_OBJECT', {identifier: this.character.identifier });
    this.changeDetector.detectChanges();
  }

  selectIcon(index :number) {
    if (this.dblClickTimer) {
      this.dblClickTimer = null;
      this.replaceIcon(index);
      return;
    }
    this.dblClickTimer = setTimeout(()=> {this._selectIcon(index)} ,300);
  }
  selectImage(index :number) {
    if (this.dblClickTimer) {
      this.dblClickTimer = null;
      this.replaceImage(index);
      return;
    }
    this.dblClickTimer = setTimeout(()=> {this._selectImage(index)} ,300);
  }
  private _selectIcon(index :number) {
    this.dblClickTimer = null
    this.character.currntIconIndex = index;
  }
  private _selectImage(index :number) {
    this.dblClickTimer = null
    this.character.currntImageIndex = index;
  }

  constructor(
    private changeDetector:ChangeDetectorRef,
    private imageService:ImageService,
    private modalService:ModalService
  ) {

  }

  ngOnInit(): void {
    EventSystem.register(this)
    .on('UPDATE_GAME_OBJECT', -1000, event => {
      if (event.data.identifier === this.character.identifier) {
          this.changeDetector.markForCheck();
      }
    });
  }

  ngAfterViewInit(): void {
  }

  ngOnDestroy(): void {
  }

}
