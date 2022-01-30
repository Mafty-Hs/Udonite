import { AfterViewInit, Component, NgZone, OnDestroy} from '@angular/core';

import { EventSystem, IONetwork } from '@udonarium/core/system';
import { FileArchiver } from '@udonarium/core/file-storage/file-archiver';
import { ObjectFactory } from '@udonarium/core/synchronize-object/object-factory';
import { ObjectSerializer } from '@udonarium/core/synchronize-object/object-serializer';
import { ObjectStore } from '@udonarium/core/synchronize-object/object-store';
import { ObjectSynchronizer } from '@udonarium/core/synchronize-object/object-synchronizer';

import { AppConfig, AppConfigService } from 'service/app-config.service';
import { DiceBotService } from 'service/dice-bot.service';
import { PointerDeviceService } from 'service/pointer-device.service';
import { RoomService } from 'service/room.service';

import { PeerCursor } from '@udonarium/peer-cursor';
import { PlayerService } from 'service/player.service';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css']
})
export class AppComponent implements AfterViewInit, OnDestroy {

  private immediateUpdateTimer: NodeJS.Timer = null;
  private lazyUpdateTimer: NodeJS.Timer = null;
  get isLobby():boolean {
    return this.roomService.isLobby;
  }

  constructor(  
    private diceBotService: DiceBotService,
    private pointerDeviceService: PointerDeviceService,
    private appConfigService: AppConfigService,
    private ngZone: NgZone,
    private roomService: RoomService,
    private playerService: PlayerService
  ) {
    this.ngZone.runOutsideAngular(() => {
      IONetwork;
      EventSystem;
      FileArchiver.instance.initialize();
      ObjectFactory.instance;
      ObjectSerializer.instance;
      ObjectStore.instance;
      ObjectSynchronizer.instance.initialize();
    });
    this.appConfigService.initialize();
    this.pointerDeviceService.initialize();    
    PeerCursor.myCursor = new PeerCursor();
     EventSystem.register(this)
      .on('UPDATE_GAME_OBJECT', event => { this.lazyNgZoneUpdate(event.isSendFromSelf); })
      .on('DELETE_GAME_OBJECT', event => { this.lazyNgZoneUpdate(event.isSendFromSelf); })
      .on('IMAGE_SYNC', event => { this.lazyNgZoneUpdate(event.isSendFromSelf); })
      .on<AppConfig>('LOAD_CONFIG', event => {
        console.log('LOAD_CONFIG !!!', event.data);
        this.diceBotService.initialize(event.data.dice.url);
        IONetwork.open(event.data.server.url);
      })
      .on<File>('FILE_LOADED', event => {
        this.lazyNgZoneUpdate(false);
      })
      .on('CLOSE_NETWORK', event => {
        console.log('CLOSE_NETWORK', event.data.peerId);
        
      })
      .on('CONNECT_PEER', event => {
        //if (event.isSendFromSelf) this.chatMessageService.calibrateTimeOffset();
        this.playerService.refleshPeers();
        this.lazyNgZoneUpdate(event.isSendFromSelf);
      })
      .on('DISCONNECT_PEER', event => {
        this.playerService.refleshPeers();
        this.lazyNgZoneUpdate(event.isSendFromSelf);
      });
  }

  ngAfterViewInit() {
  }

  ngOnDestroy() {
    EventSystem.unregister(this);
  }

  private lazyNgZoneUpdate(isImmediate: boolean) {
    if (isImmediate) {
      if (this.immediateUpdateTimer !== null) return;
      this.immediateUpdateTimer = setTimeout(() => {
        this.immediateUpdateTimer = null;
        if (this.lazyUpdateTimer != null) {
          clearTimeout(this.lazyUpdateTimer);
          this.lazyUpdateTimer = null;
        }
        this.ngZone.run(() => { });
      }, 0);
    } else {
      if (this.lazyUpdateTimer !== null) return;
      this.lazyUpdateTimer = setTimeout(() => {
        this.lazyUpdateTimer = null;
        if (this.immediateUpdateTimer != null) {
          clearTimeout(this.immediateUpdateTimer);
          this.immediateUpdateTimer = null;
        }
        this.ngZone.run(() => { });
      }, 100);
    }
  }
}

