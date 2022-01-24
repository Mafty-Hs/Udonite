import { Injectable } from '@angular/core';
import { ImageFile } from '@udonarium/core/file-storage/image-file';
import { ImageStorage } from '@udonarium/core/file-storage/image-storage';

@Injectable({
  providedIn: 'root'
})
export class ImageService {

  skeletonImage: ImageFile = ImageStorage.instance.get('skelton')

  constructor() { }

  getSkeletonOr(image: ImageFile): ImageFile
  getSkeletonOr(imageIdentifier: string): ImageFile
  getSkeletonOr(arg: any): ImageFile {
    let image: ImageFile = arg instanceof ImageFile ? arg : ImageStorage.instance.get(arg);
    return image ? image : this.skeletonImage;
  }

  getEmptyOr(image: ImageFile): ImageFile
  getEmptyOr(imageIdentifier: string): ImageFile
  getEmptyOr(arg: any): ImageFile {
    let image: ImageFile = arg instanceof ImageFile ? arg : ImageStorage.instance.get(arg);
    return image ? image : ImageFile.Empty;
  }
}
