import { IONetwork } from '../system';
import { ImageFile } from './image-file';
import { ImageContext } from './image-context';
import { PeerCursor } from '@udonarium/peer-cursor';
import { RoomAdmin } from '@udonarium/room-admin';

export class ImageStorage {
  private static _instance: ImageStorage
  static get instance(): ImageStorage {
    if (!ImageStorage._instance) ImageStorage._instance = new ImageStorage();
    return ImageStorage._instance;
  }

  get dataSize():number {
    return Object.values(this.imageHash).reduce((totalSize, Image) => totalSize + Image.context.filesize ,0 )
  } 

  private imageHash: { [identifier: string]: ImageFile } = {};
  taglist:string[] = [];

  get images(): ImageFile[] {
    let images: ImageFile[] = [];
    for (let identifier in this.imageHash) {
      images.push(this.imageHash[identifier]);
    }
    return images;
  }

  private constructor() {
    console.log('ImageStorage ready...');
  }

  private set(context :ImageContext): ImageFile {
    let image = new ImageFile();
    image.context = context;
    if (!context.isHide && context.tag) {
      for (let tag of context.tag) {
        if (!this.taglist.includes(tag)) this.taglist.push(tag);
      }
    }
    return image;
  }

  tagAdd(tag :string) {
    if (!this.taglist.includes(tag)) this.taglist.push(tag);
  }

  create(context :ImageContext) {
    let image = this.set(context);
    this.imageHash[image.identifier] = image; 
  }

  update(context :ImageContext) {
    let image = this.get(context.identifier);
    if (!context.isHide && context.tag) {
      for (let tag of context.tag) {
        if (!this.taglist.includes(tag)) this.taglist.push(tag);
      }
    }
    image.context = context;
  }

  remove(identifier :string) {
    IONetwork.imageRemove(identifier);
  }

  setMine(identifier: string):boolean {
    let image: ImageFile = this.imageHash[identifier];
    if (image) {
      image.owner.push(PeerCursor.myCursor.player.playerId);
      return true;
    }
    return false;
  }

  destroy(identifier: string): boolean {
    let deleteImage: ImageFile = this.imageHash[identifier];
    if (deleteImage) {
      if (deleteImage.owner.length > 1 && !RoomAdmin.setting.adminPlayer.includes(PeerCursor.myCursor.player.playerId)) {
        deleteImage.owner = deleteImage.owner.filter( playerid => playerid != PeerCursor.myCursor.player.playerId );
        return true;
      }
      delete this.imageHash[identifier];
      return true;
    }
    return false;
  }

  get(identifier: string): ImageFile {
    let image: ImageFile = this.imageHash[identifier];
    if (image) return image;
    return null;
  }


  async getCatalog() {
    let images = await IONetwork.imageMap()
    for (let image of images) {
      if (!this.imageHash[image.identifier])
        this.imageHash[image.identifier] = this.set(image); 
    }
  }
}
