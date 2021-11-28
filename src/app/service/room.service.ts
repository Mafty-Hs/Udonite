import { Injectable } from '@angular/core';
import { PeerContext } from '@udonarium/core/system/network/peer-context';
import { PeerCursor } from '@udonarium/peer-cursor';
import { EventSystem, Network } from '@udonarium/core/system';
import { ObjectStore } from '@udonarium/core/synchronize-object/object-store';
import { PlayerService } from 'service/player.service';

@Injectable({
  providedIn: 'root'
})
export class RoomService {

  isLobby:boolean = true;

  constructor(
    private playerService: PlayerService,
  ) { }

  create(roomName: string ,password: string ,adminPassword?: string) {
    let userId = Network.peerContext ? Network.peerContext.userId : PeerContext.generateId();
    Network.open(userId, PeerContext.generateId('***'), roomName, password);
    PeerCursor.myCursor.peerId = Network.peerId;
    if (adminPassword) this.playerService.enableAdmin(adminPassword); 
  }

  connect(peerContexts :PeerContext[], password? :string) {
    let context = peerContexts[0];
    let userId = Network.peerContext ? Network.peerContext.userId : PeerContext.generateId();
    Network.open(userId, context.roomId, context.roomName, password);
    PeerCursor.myCursor.peerId = Network.peerId;

    let triedPeer: string[] = [];
    EventSystem.register(triedPeer)
      .on('OPEN_NETWORK', event => {
        EventSystem.unregister(triedPeer);
        ObjectStore.instance.clearDeleteHistory();
        for (let context of peerContexts) {
          Network.connect(context.peerId);
        }
        EventSystem.register(triedPeer)
          .on('CONNECT_PEER', event => {
            console.log('接続成功！', event.data.peerId);
            triedPeer.push(event.data.peerId);
            console.log('接続成功 ' + triedPeer.length + '/' + peerContexts.length);
            this.isLobby = false;
            if (peerContexts.length <= triedPeer.length) {
              this.resetNetwork();
              EventSystem.unregister(triedPeer);
            }
          })
          .on('DISCONNECT_PEER', event => {
            console.warn('接続失敗', event.data.peerId);
            triedPeer.push(event.data.peerId);
            console.warn('接続失敗 ' + triedPeer.length + '/' + peerContexts.length);
            if (peerContexts.length <= triedPeer.length) {
              this.resetNetwork();
              EventSystem.unregister(triedPeer);
            }
          });
      });
  }

  resetNetwork() {
    if (Network.peerContexts.length < 1) {
      Network.open();
      PeerCursor.myCursor.peerId = Network.peerId;
    }
  }

}
