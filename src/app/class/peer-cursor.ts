import { SyncObject, SyncVar } from './core/synchronize-object/decorator';
import { GameObject, ObjectContext } from './core/synchronize-object/game-object';
import { ObjectStore } from './core/synchronize-object/object-store';
import { EventSystem, Network } from './core/system';
import { Player } from './player';

type UserId = string;
type PeerId = string;
type ObjectIdentifier = string;

@SyncObject('PeerCursor')
export class PeerCursor extends GameObject {
  @SyncVar() userId: UserId = '';
  @SyncVar() peerId: PeerId = '';
  @SyncVar() playerIdentifier: string ;
  
  get player() :Player {
    return ObjectStore.instance.get(this.playerIdentifier)
  }

  static readonly CHAT_MY_NAME_LOCAL_STORAGE_KEY = 'udonanaumu-chat-my-name-local-storage';
  static readonly CHAT_MY_COLOR_LOCAL_STORAGE_KEY = 'udonanaumu-chat-my-color-local-storage';
  
  static readonly CHAT_DEFAULT_COLOR = '#444444';
  static readonly CHAT_TRANSPARENT_COLOR = '#ffffff';

  static myCursor: PeerCursor = null;
  private static userIdMap: Map<UserId, ObjectIdentifier> = new Map();
  private static peerIdMap: Map<PeerId, ObjectIdentifier> = new Map();
  keepalive: { [key: string]: number; } = {};

  keepaliveAging() {
    Object.keys(this.keepalive).forEach(key => {
      this.keepalive[key] -= 1;
      if (this.keepalive[key] < -180 ) delete this.keepalive[key];
    });  
    
  }

  get isMine(): boolean { return (PeerCursor.myCursor && PeerCursor.myCursor === this); }
  



  // GameObject Lifecycle
  onStoreAdded() {
    super.onStoreAdded();
    if (!this.isMine) {
      EventSystem.register(this)
        .on('DISCONNECT_PEER', -1000, event => {
          if (event.data.peerId !== this.peerId) return;
          PeerCursor.userIdMap.delete(this.userId);
          PeerCursor.peerIdMap.delete(this.peerId);
          ObjectStore.instance.remove(this);
        });
    }
  }

  // GameObject Lifecycle
  onStoreRemoved() {
    super.onStoreRemoved();
    EventSystem.unregister(this);
    PeerCursor.userIdMap.delete(this.userId);
    PeerCursor.peerIdMap.delete(this.peerId);
  }

  static findByUserId(userId: UserId): PeerCursor {
    return this.find(PeerCursor.userIdMap, userId, true);
  }

  static findByPeerId(peerId: PeerId): PeerCursor {
    return this.find(PeerCursor.peerIdMap, peerId, false);
  }

  private static find(map: Map<string, string>, key: string, isUserId: boolean): PeerCursor {
    let identifier = map.get(key);
    if (identifier != null && ObjectStore.instance.get(identifier)) return ObjectStore.instance.get<PeerCursor>(identifier);
    let cursors = ObjectStore.instance.getObjects<PeerCursor>(PeerCursor);
    for (let cursor of cursors) {
      let id = isUserId ? cursor.userId : cursor.peerId;
      if (id === key) {
        map.set(id, cursor.identifier);
        return cursor;
      }
    }
    return null;
  }

  static createMyCursor(playerIdentifier :string): PeerCursor {
    if (PeerCursor.myCursor) {
      console.warn('It is already created.');
      return PeerCursor.myCursor;
    }
    PeerCursor.myCursor = new PeerCursor();
    PeerCursor.myCursor.peerId = Network.peerId;
    PeerCursor.myCursor.playerIdentifier = playerIdentifier;
    PeerCursor.myCursor.initialize();
    PeerCursor.myCursor.player.peerIdentifier = PeerCursor.myCursor.identifier;
    return PeerCursor.myCursor;
  }

  // override
  apply(context: ObjectContext) {
    let userId = context.syncData['userId'];
    let peerId = context.syncData['peerId'];
    if (userId !== this.userId) {
      PeerCursor.userIdMap.set(userId, this.identifier);
      PeerCursor.userIdMap.delete(this.userId);
    }
    if (peerId !== this.peerId) {
      PeerCursor.peerIdMap.set(peerId, this.identifier);
      PeerCursor.peerIdMap.delete(this.peerId);
    }
    super.apply(context);
  }

  isPeerAUdon(): boolean {
    return /u.*d.*o.*n/ig.exec(this.peerId) != null;
  }
}
