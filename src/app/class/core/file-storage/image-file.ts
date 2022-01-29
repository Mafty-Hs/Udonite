import { IONetwork } from '../system';
import { ImageContext , ThumbnailContext } from './image-context';

export class ImageFile {
  context: ImageContext = {
    identifier: '',
    type: '',
    url: '',
    thumbnail: {type: "", url: ""},
    filesize: 0,
    owner: [],
    isHide: false,
    tag: []
  };

  get identifier(): string { return this.context.identifier };
  get name(): string { return this.context.identifier };
  get url(): string { return this.context.url ? this.context.url : this.context.thumbnail.url; };
  get thumbnail(): ThumbnailContext { return this.context.thumbnail };
  get tag(): string[] { return this.context.tag };
  get owner(): string[] { return this.context.owner };
  set owner(owner :string[]) {this.context.owner = owner; IONetwork.imageUpdate(this.context);}

  static get Empty():ImageFile {
    if (!ImageFile._empty) {
      ImageFile._empty = new ImageFile;
      ImageFile._empty.context.owner = ["SYSTEM"];
      ImageFile._empty.context.isHide = true;
    }
    return ImageFile._empty
  }

  private static _empty:ImageFile;

  addTag(tags :string[]) {
    for (let tag of tags) {
      if (!this.context.tag.includes(tag)) this.context.tag.push(tag)
    }
    IONetwork.imageUpdate(this.context);
  }

  removeTag(tag :string) {
    this.context.tag = this.context.tag.filter(tagword => tagword != tag)
    IONetwork.imageUpdate(this.context);
  }

  constructor() { } 
}
