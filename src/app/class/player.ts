import { ImageFile } from './core/file-storage/image-file';
import { ImageStorage } from './core/file-storage/image-storage';
import { SyncObject, SyncVar } from './core/synchronize-object/decorator';
import { ObjectNode } from './core/synchronize-object/object-node';
import { StickyNote } from './sticky-note';

export const AuthType = {
  NONE: 0,
  PASSWORD: 1
} as const;
export type AuthType = typeof AuthType[keyof typeof AuthType];

@SyncObject('player')
export class Player extends ObjectNode {
  @SyncVar() name: string = '';
  @SyncVar() imageIdentifier: string = '';
  @SyncVar() color: string = Player.CHAT_WHITETEXT_COLOR;
  @SyncVar() playerId: string = '';
  @SyncVar() authType: AuthType = AuthType.NONE;
  @SyncVar() password: string = '';
  @SyncVar() paletteList: string[] = [];

  isInitial :boolean = false;
  static readonly CHAT_BLACKTEXT_COLOR = '#444444';
  static readonly CHAT_WHITETEXT_COLOR = '#ffffff';

  get stickyNote():StickyNote {
    for (let child of this.children) {
      if (child instanceof StickyNote) return child;
    }
    let note = new StickyNote();
    note.initialize();
    this.appendChild(note);
    return note;
  }

  get image(): ImageFile {
    let image = ImageStorage.instance.get(this.imageIdentifier);
    return image;
   }

}
