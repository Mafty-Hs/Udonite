import { Component, OnDestroy, OnInit,ChangeDetectorRef } from '@angular/core';
import { PeerContext } from '@udonarium/core/system/network/peer-context';

import { EventSystem, Network } from '@udonarium/core/system';
import { PeerCursor } from '@udonarium/peer-cursor';
import { RoomService , RoomState } from 'service/room.service';

@Component({
  selector: 'lobby',
  templateUrl: './lobby.component.html',
  styleUrls: ['./lobby.component.css'],
})
export class LobbyComponent implements OnInit, OnDestroy {
  rooms: { alias: string, roomName: string, peerContexts: PeerContext[] }[] = [];

  width:number = 550;
  height:number = 600;

  isReloading: boolean = false;
  isConnecting: boolean = true;
  roomId: PeerContext[];

  help: string = '「一覧を更新」ボタンを押すと接続可能なルーム一覧を表示します。';

  get currentRoom(): string { return Network.peerContext.roomId };
  get peerId(): string { return Network.peerId; }
  get isConnected(): boolean {
    return Network.peerIds.length <= 1 ? false : true;
  }
  constructor(
    public roomService: RoomService,
    private changeDetectorRef: ChangeDetectorRef
  ) {
    EventSystem.register(this)
      .on('OPEN_NETWORK', event => {
        this.isConnecting = false;
        this.reload();
        setTimeout(() => {
          this.ready();
        }, 1000);
      });
   if (window.innerWidth < 550) { this.width = window.innerWidth }
   if (window.innerHeight < 600) { this.height = window.innerHeight }
  }

  ngOnInit() {
  }

  ngOnDestroy() {
    EventSystem.unregister(this);
  }

  ready() {
    this.reload();
  }

  get myPeer(): PeerCursor { return PeerCursor.myCursor; }

  standalone() {
    this.roomService.roomState = RoomState.PLAY;
    this.roomService.isStandalone = true;
  }

  async reload() {
    this.isReloading = true;
    this.rooms = [];
    let peersOfroom: { [room: string]: PeerContext[] } = {};
    let peerIds = await Network.listAllPeers();
    for (let peerId of peerIds) {
      let context = PeerContext.parse(peerId);
      if (context.isRoom) {
        let alias = context.roomId + context.roomName;
        if (!(alias in peersOfroom)) {
          peersOfroom[alias] = [];
        }
        peersOfroom[alias].push(context);
      }
    }
    for (let alias in peersOfroom) {
      this.rooms.push({ alias: alias, roomName: peersOfroom[alias][0].roomName, peerContexts: peersOfroom[alias] });
    }
    this.rooms.sort((a, b) => {
      if (a.alias < b.alias) return -1;
      if (a.alias > b.alias) return 1;
      return 0;
    });
    this.help = '接続可能なルームが見つかりませんでした。「新しいルームを作成する」で新規ルームを作成できます。';
    this.isReloading = false;
  }

  connect(peerContexts: PeerContext[]) {
    let context = peerContexts[0];
    this.roomId = peerContexts;

    if (context.hasPassword) {
      this.roomService.roomState = RoomState.PASSWORD;
      return;
    }
    this.roomService.connect(this.roomId,"");
  }

  showRoomSetting() {
    this.roomService.roomState = RoomState.CREATE;
  }
}
