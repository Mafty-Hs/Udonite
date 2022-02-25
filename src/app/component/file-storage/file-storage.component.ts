import { AfterViewInit, ChangeDetectionStrategy, ChangeDetectorRef, Component, OnDestroy, OnInit } from '@angular/core';

import { FileArchiver } from '@udonarium/core/file-storage/file-archiver';
import { ImageFile } from '@udonarium/core/file-storage/image-file';
import { ImageStorage } from '@udonarium/core/file-storage/image-storage';
import { EventSystem } from '@udonarium/core/system';

import { PlayerService } from 'service/player.service';
import { PanelService } from 'service/panel.service';
import { RoomService } from 'service/room.service';
import { animate, keyframes, style, transition, trigger } from '@angular/animations';
import { StripPrefixConfigObj } from 'autolinker';

@Component({
  selector: 'file-storage',
  templateUrl: './file-storage.component.html',
  styleUrls: ['./file-storage.component.css'],
  changeDetection: ChangeDetectionStrategy.OnPush,
  animations: [
    trigger('scaleInOut', [
      transition('void => *', [
        animate('200ms ease', keyframes([
          style({ transform: 'scale3d(0, 0, 0)', offset: 0 }),
          style({ transform: 'scale3d(1.0, 1.0, 1.0)', offset: 1.0 })
        ]))
      ]),
      transition('* => void', [
        animate('180ms ease', style({ transform: 'scale3d(0, 0, 0)' }))
      ])
    ]),
    trigger('fadeAndUpInOut', [
      transition('void => *', [
        animate('100ms ease-in-out', keyframes([
          style({ 'transform-origin': 'center bottom', transform: 'translateY(8px) scaleY(0)', opacity: 0.6 }),
          style({ 'transform-origin': 'center bottom', transform: 'translateY(0px) scaleY(1.0)', opacity: 1.0 })
        ]))
      ]),
      transition('* => void', [
        animate('100ms ease-in-out', style({ 'transform-origin': 'center bottom', transform: 'translateY(0px) scaleY(1.0)', opacity: 1.0 })),
        animate('100ms ease-in-out', style({ 'transform-origin': 'center bottom', transform: 'translateY(8px) scaleY(0)', opacity: 0.6 }))
      ])
    ])
  ]
})
export class FileStorageComponent implements OnInit, OnDestroy, AfterViewInit {

  searchTags: string[] = [];
  selectedImageFiles: ImageFile[] = [];
  isShowAllImages = false;
  showType:string = "ALL"
  serchCondIsOr = true;

  addingTagWord:string = "";

  //static imageCount = 0;

  get images(): ImageFile[] {
    let images: ImageFile[];
    if (this.isShowAllImages) 
      images = ImageStorage.instance.images
        .filter((image) => !image.context.isHide);
    else 
      images = ImageStorage.instance.images
        .filter((image) => !image.context.isHide && (image.owner.includes(this.playerService.myPlayer.playerId)));
    if (this.showType == 'ALL')
      return images;
    else if (this.showType == 'No Tag')
      return images.filter((image) => image.tag.length < 1);
    else if (this.serchCondIsOr) {
      return images.filter((image) => { 
        for (let tagword of image.tag) {
          if (this.searchTags.includes(tagword))
            return true;
        }
        return false;
      });
    }
    return images.filter((image) => { 
      for (let tagword of this.searchTags) {
        if (!image.tag.includes(tagword))
          return false;
      }
      return true;
    });
  }

  get allTags() {
    return ImageStorage.instance.taglist;
  }
  
    constructor(
    private changeDetector: ChangeDetectorRef,
    private panelService: PanelService,
    private playerService: PlayerService,
    public roomService: RoomService,
  ) { }
  
  ngOnInit() {
    Promise.resolve().then(() => this.panelService.title = '画像一覧');
  }

  ngAfterViewInit() {
    EventSystem.register(this)
    .on('IMAGE_SYNC', event => {
      this.changeDetector.markForCheck();
    });
  }

  ngOnDestroy() {
    EventSystem.unregister(this);
  }

  onAll() {
    if (this.showType != 'ALL') {
      this.showType = 'ALL';
      this.searchTags = [];
    }
  }

  onNoTag() {
    if (this.showType != 'No Tag') {
      this.showType = 'No Tag';
      this.searchTags = [];
    }
  }

  onTagSelect(tag :string) {
    if (this.showType != 'Tag') this.showType = 'Tag'
    if (this.searchTags.includes(tag)) {
     this.searchTags = this.searchTags.filter(_tag => _tag !== tag )
    }
    else {
      this.searchTags.push(tag);
    }
  }

  countImagesHasWord(tag): number {
    let count = 0;
    if (tag != null && tag.trim() === '') return count;
    for (const imageFile of this.images) {
      const imageTag = imageFile.tag;
      if (tag == null) {
        if (!imageTag || imageTag.length < 1) count++;
      } else {
        if (imageTag && imageTag.includes(tag.trim())) count++;
      }
    }
    return count;
  }

  handleFileSelect(event: Event) {
    let input = <HTMLInputElement>event.target;
    let files = input.files;
    if (files.length) FileArchiver.instance.load(files);
    input.value = '';
  }

  onSelectedFile(file :ImageFile) {
    if (this.selected(file)) {
      this.selectedImageFiles = this.selectedImageFiles.filter(imageFile => imageFile.identifier !== file.identifier);
    } else {
      this.selectedImageFiles.push(file);
    }
  }

  selectedImagesOwnWords():string[] {
    return this.mergeTags(this.selectedImageFiles);
  }

  mergeTags(images :ImageFile[]) :string[] {
    let result :{[name :string] :string} = {};
    for (let image of images) {
      for (let tag of image.tag)
        result[tag] = tag;
    }
    if (!result) [];
    return Object.keys(result);
  }

  get isSelected(): boolean {
    let ret = this.selectedImageFiles.length > 0;
    //if (!ret) this.addingTagWord = '';
    return ret;
  }

  selected(file: ImageFile) {
    return this.selectedImageFiles.map(imageFile => imageFile.identifier).includes(file.identifier)
  }

  addTagWord() {
    if (this.addingTagWord == null || this.addingTagWord.trim() == '') return;
    const words = this.addingTagWord.trim().split(/\s+/);
    let addedWords = null;
    if (!window.confirm("選択した画像に " + words.map(word => `🏷️${word} `).join(' ') + "を追加します。\nよろしいですか？")) return;
    for (const image of this.selectedImageFiles) {
      image.addTag(words);
    }
  }

  removeTagWord(word: string) {
    if (!window.confirm("選択した画像から 🏷️" + word + " を削除します。\nよろしいですか？")) return;
    if (word == null || word.trim() == '') return;
    for (const image of this.selectedImageFiles) {
      image.removeTag(word);
    }
  }

  onShowAllImages($event: Event) {
    if (this.isShowAllImages) {
      this.isShowAllImages = false;
    } else {
      if (window.confirm("全てのプレイヤーの画像を表示します。\nよろしいですか？")) {
        this.isShowAllImages = true;
      } else {
        this.isShowAllImages = false;
        $event.preventDefault();
      }
    }
  }

  onUnselect() {
    this.selectedImageFiles = [];
  }

  remove() {
    if (window.confirm("選択した画像を削除します。\nよろしいですか？")) {
      for (let file of this.selectedImageFiles) {
        ImageStorage.instance.destroy(file.identifier);
      }
    }
  }

  identify(image){
    return image.identifier;
  }

 
}
