import { ImageFile } from './core/file-storage/image-file';
import { ImageStorage } from './core/file-storage/image-storage';
import { SyncObject, SyncVar } from './core/synchronize-object/decorator';
import { ObjectNode } from './core/synchronize-object/object-node';

const AuthType = {
  NONE: 0,
  PASSWORD: 1
} as const;
type AuthType = typeof AuthType[keyof typeof AuthType]; 

@SyncObject('player')
export class Player extends ObjectNode {
  @SyncVar() name: string = '';
  @SyncVar() imageIdentifier: string = '';
  @SyncVar() color: string = Player.CHAT_DEFAULT_COLOR;
  @SyncVar() peerIdentifier: string = '';
  @SyncVar() playerId: string = '';
  @SyncVar() authType: AuthType = AuthType.NONE;
  @SyncVar() password: string


  isInitial :boolean = false;
  static readonly CHAT_DEFAULT_COLOR = '#444444';
  static readonly CHAT_TRANSPARENT_COLOR = '#ffffff';

  get image(): ImageFile { return ImageStorage.instance.get(this.imageIdentifier); }

}
