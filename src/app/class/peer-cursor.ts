import { SyncObject, SyncVar } from './core/synchronize-object/decorator';
import { GameObject, ObjectContext } from './core/synchronize-object/game-object';
import { ObjectStore } from './core/synchronize-object/object-store';
import { EventSystem, Network } from './core/system';
import { Player } from './player';

type PeerId = string;
type ObjectIdentifier = string;

@SyncObject('PeerCursor')
export class PeerCursor extends GameObject {
  @SyncVar() peerId: PeerId = '';
  @SyncVar() playerIdentifier: string ;

  _player: Player;
  needUpdate: boolean = true;
  get player() :Player {
    if (this.needUpdate) {
      this._player = ObjectStore.instance.get(this.playerIdentifier)
      this.needUpdate = false;
    }
    return this._player;
  }

  static myCursor: PeerCursor = null;
  private static peerIdMap: Map<PeerId, ObjectIdentifier> = new Map();
  keepalive: { [key: string]: number; } = {};

  keepaliveAging() {
    Object.keys(this.keepalive).forEach(key => {
      this.keepalive[key] -= 1;
    });  
    
  }

  get isMine(): boolean { return (PeerCursor.myCursor && PeerCursor.myCursor === this); }
  
  // GameObject Lifecycle
  onStoreAdded() {
    super.onStoreAdded();
    if (!this.isMine) {
      EventSystem.register(this)
        .on('DISCONNECT_PEER', -1000, event => {
          //if (this.keepalive[event.data.peerId]) delete this.keepalive[event.data.peerId] ;
          if (event.data.peerId !== this.peerId) return;
          PeerCursor.peerIdMap.delete(this.peerId);
          ObjectStore.instance.remove(this);
        });
    }
  }

  // GameObject Lifecycle
  onStoreRemoved() {
    super.onStoreRemoved();
    EventSystem.unregister(this);
    PeerCursor.peerIdMap.delete(this.peerId);
  }

  static findByPeerId(peerId: PeerId): PeerCursor {
    let identifier = PeerCursor.peerIdMap.get(peerId);
    if (identifier != null && ObjectStore.instance.get(identifier)) return ObjectStore.instance.get<PeerCursor>(identifier);
    for (let cursor of  ObjectStore.instance.getObjects<PeerCursor>(PeerCursor)) {
      if (cursor.peerId === peerId) {
        PeerCursor.peerIdMap.set(cursor.peerId, cursor.identifier);
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
    let peerId = context.syncData['peerId'];
    if (peerId !== this.peerId) {
      PeerCursor.peerIdMap.set(peerId, this.identifier);
      PeerCursor.peerIdMap.delete(this.peerId);
    }
    super.apply(context);
  }

}
