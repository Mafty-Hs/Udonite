import { ObjectStore } from './core/synchronize-object/object-store';
import { Player } from './player';
import { PeerContext } from'./core/system/socketio/netowrkContext';
import { IONetwork } from './core/system'; 

export class PeerCursor {
  _context: PeerContext;
  get context():PeerContext {return this._context}
  set context(cursor :PeerContext) {
    this._context = cursor;
    this._player = null;
    IONetwork.myCursor(this.context);
  }
  get peerId() :string { return this.context.peerId }
  get playerIdentifier():string { return this.context.playerIdentifier }

  private _player: Player;
  get player() :Player {
     if (!this._player) {
      this._player = ObjectStore.instance.get(this.playerIdentifier)
    }
    return this._player;
  }

  static myCursor: PeerCursor = null;

  get isMine(): boolean { return (PeerCursor.myCursor && PeerCursor.myCursor.peerId === this.peerId); }
}
