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

  private _aspect:number = 1;
  private _width:number = 1;
  private _height:number = 1;

  get identifier(): string { return this.context.identifier };
  get name(): string { return this.context.identifier };
  get url(): string { return this.context.url ? this.context.url : this.context.thumbnail.url; };
  get thumbnail(): ThumbnailContext { return this.context.thumbnail };
  get tag(): string[] { return this.context.tag };
  get type(): string { return this.context.type };
  get owner(): string[] { return this.context.owner };
  set owner(owner :string[]) {this.context.owner = owner; IONetwork.imageUpdate(this.context);}
  get aspect():number { return this._aspect}
  get width():number { return this._width}
  get height():number { return this._height}


  async calcAspect() {
    if (!this.url) return;
    let element = new Image();
    element.src = this.url ;
    element.onload = ()=>{
      this._width = element.naturalWidth;
      this._height = element.naturalHeight;
      this._aspect = this.height / this.width;
    }
  }

  static get Empty():ImageFile {
    if (!ImageFile._empty) {
      ImageFile._empty = new ImageFile;
      ImageFile._empty.context.owner = ["SYSTEM"];
      ImageFile._empty.context.isHide = true;
    }
    return ImageFile._empty
  }

  private static _empty:ImageFile;

  update() {
    IONetwork.imageUpdate(this.context);
  }

  addTag(tags :string[]) {
    for (let tag of tags) {
      if (!this.context.tag.includes(tag)) this.context.tag.push(tag)
    }
    this.update();
  }

  setOwner(owners :string[]) {
    let newOwner:string[] = this.owner;
    for (let player of owners) {
      if (!newOwner.includes(player)) newOwner = newOwner.concat(player);
    }
    this.owner = newOwner;
  }

  removeTag(tag :string) {
    this.context.tag = this.context.tag.filter(tagword => tagword != tag)
    this.update();
  }

  constructor() { }
}
