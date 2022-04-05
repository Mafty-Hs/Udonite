import { ImageFile } from './core/file-storage/image-file';
import { ImageStorage } from './core/file-storage/image-storage';
import { SyncObject, SyncVar } from './core/synchronize-object/decorator';
import { ObjectNode } from './core/synchronize-object/object-node';

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

  get image(): ImageFile {
    let image = ImageStorage.instance.get(this.imageIdentifier);
    return image;
   }

}
