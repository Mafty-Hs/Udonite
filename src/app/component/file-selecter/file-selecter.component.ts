import {
  AfterViewInit,
  ChangeDetectionStrategy,
  ChangeDetectorRef,
  Component,
  Input,
  OnDestroy,
  OnInit,
} from '@angular/core';
import { ImageFile } from '@udonarium/core/file-storage/image-file';
import { ImageStorage } from '@udonarium/core/file-storage/image-storage';

import { EventSystem } from '@udonarium/core/system';
import { ModalService } from 'service/modal.service';
import { PanelService } from 'service/panel.service';
import { RoomService } from 'service/room.service';


import { trigger, transition, animate, keyframes, style } from '@angular/animations';
import { PlayerService } from 'service/player.service';

@Component({
  selector: 'file-selector',
  templateUrl: './file-selecter.component.html',
  styleUrls: ['./file-selecter.component.css'],
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
    ])
  ]
})
export class FileSelecterComponent implements OnInit, OnDestroy, AfterViewInit {
  @Input() isAllowedEmpty: boolean = false;
  @Input() currentImageIdentifires: string[] = [] 
  searchTags: string[] = [];
  selectedImageFiles: ImageFile[] = [];
  isShowAllImages = false;
  showType:string = "ALL"
  serchCondIsOr = true;

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

  get empty(): ImageFile { return ImageFile.Empty; }



  constructor(
    private changeDetector: ChangeDetectorRef,
    private panelService: PanelService,
    private playerService: PlayerService,
    public roomService: RoomService,
    private modalService: ModalService
  ) {
    this.isAllowedEmpty = this.modalService.option && this.modalService.option.isAllowedEmpty ? true : false;
    if (this.modalService.option && this.modalService.option.currentImageIdentifires) {
      this.currentImageIdentifires = this.modalService.option.currentImageIdentifires;
    }
  }

  ngOnInit() {
    Promise.resolve().then(() => this.modalService.title = this.panelService.title = 'ファイル一覧');
  }

  ngAfterViewInit() {
    EventSystem.register(this)
    .on('IMAGE_SYNC', event => {
        this.changeDetector.markForCheck();
    })
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

  getCurrent(image: ImageFile): boolean {
    if (!this.currentImageIdentifires) return false;
    return this.currentImageIdentifires.includes(image.identifier);
  }

  onSelectedFile(file: ImageFile) {
    this.modalService.resolve(file.identifier);
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


  identify(index, image){
    return image.identifier;
  }
}
