import { Component, OnInit, OnDestroy } from '@angular/core';
import { EventSystem , IONetwork } from '@udonarium/core/system';
import { DiceBotService } from 'service/dice-bot.service';
import { PlayerService } from 'service/player.service';
import { RoomService } from 'service/room.service';
import { PeerCursor } from '@udonarium/peer-cursor';
import { PanelService , PanelOption } from 'service/panel.service';
import { HelpComponent } from 'component/help/help.component';
import { TextViewComponent } from 'component/text-view/text-view.component';
import { ChatTab } from '@udonarium/chat-tab';
import { ChatTabList } from '@udonarium/chat-tab-list';
import { GameCharacterService } from 'service/game-character.service';
import { ImageStorage } from '@udonarium/core/file-storage/image-storage';
import { AudioStorage } from '@udonarium/core/file-storage/audio-storage';

@Component({
  selector: 'room-control',
  templateUrl: './room-control.component.html',
  styleUrls: ['./room-control.component.css']
})
export class RoomControlComponent implements OnInit {

  alarmInterval:boolean = false;
  alarmTime:number = 0;
  get myPeer(): PeerCursor { return this.playerService.myPeer; }
  get otherPeers(): PeerCursor[] { return this.playerService.otherPeers; }
  sendTo:string = "";
  password:string = "";

  get enableAdmin():boolean {
    return (this.roomService.roomAdmin.adminPlayer.length > 0);
  } 

  get adminPlayer():string {
    let name:string = "";
    for (let playerId of this.roomService.roomAdmin.adminPlayer)
      name += this.playerService.getPlayerById(playerId).name + ' ';
    return name;
  }

  get chatTabs():ChatTab[] {
    return ChatTabList.instance.chatTabs;
  }

  get adminAuth():boolean { return this.roomService.adminAuth;}

  get imageSize():string {
    return  Math.floor(ImageStorage.instance.dataSize / 1024) + " / " + (IONetwork.server.imageStorageMaxSize * 1024) ;
  }

  get audioSize():string {
    return Math.floor(AudioStorage.instance.dataSize / 1024) + " / " + (IONetwork.server.audioStorageMaxSize * 1024);
  }

  alarmSend() {
    this.alarmInterval = true;
    let peer:string = "";
    if (this.sendTo) {
      peer = this.sendTo;
      this.sendTo = "";
    }
    EventSystem.call('PLAY_ALARM', {identifier: peer  ,time: this.alarmTime * 1000});
    setTimeout(() => {
      this.alarmInterval = false;
    }, 3000);
  }

  get diceBotInfos() { return this.diceBotService.diceBotInfos }
  get diceBotInfosIndexed() { return this.diceBotService.diceBotInfosIndexed }

  constructor(
    private panelService: PanelService,
    private diceBotService: DiceBotService,
    public gameCharacterService: GameCharacterService,
    public playerService: PlayerService,
    public roomService: RoomService
  ) { }

  ngOnInit(): void {
    Promise.resolve().then(() => { this.panelService.title = 'ルーム設定'; this.panelService.isAbleFullScreenButton = false });
  }

  ngOnDestry() {
    EventSystem.unregister(this);
  }

  helpRoomControl() {
    let option: PanelOption = { width: 800 , height: 600, left: 50, top: 100 };
    let component = this.panelService.open(HelpComponent,option);
    component.menu = "room";
  }

}
