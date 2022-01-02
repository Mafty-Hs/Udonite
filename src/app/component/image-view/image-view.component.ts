import { Component, OnInit } from '@angular/core';
import { ImageFile } from '@udonarium/core/file-storage/image-file';
import { ImageStorage } from '@udonarium/core/file-storage/image-storage';
import { ModalService } from 'service/modal.service';

@Component({
  selector: 'image-view',
  templateUrl: './image-view.component.html',
  styleUrls: ['./image-view.component.css']
})
export class ImageViewComponent implements OnInit {

  constructor(
    public modalService: ModalService
  ) { }

  imageIdentifier:string = "";
  get imageUrl():string {
    let image = ImageStorage.instance.get(this.imageIdentifier)
    return image.url;
  }

  ngOnInit(): void {
    Promise.resolve().then(() => {
      this.modalService.width = 0;
      this.modalService.height = 0;
      if (this.modalService.option && this.modalService.option.imageIdentifier && this.modalService.option.title) {
        this.imageIdentifier = this.modalService.option.imageIdentifier;
        this.modalService.title = this.modalService.option.title;
      }
    });
  }

}
