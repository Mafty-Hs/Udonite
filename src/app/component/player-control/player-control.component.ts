import { Component, OnInit } from '@angular/core';
import { ImageFile } from '@udonarium/core/file-storage/image-file';
import { ImageStorage } from '@udonarium/core/file-storage/image-storage';
import { ObjectStore } from '@udonarium/core/synchronize-object/object-store';
import { Player } from '@udonarium/player';
import { PlayerService } from 'service/player.service';
import { RoomService } from 'service/room.service';

@Component({
  selector: 'player-control',
  templateUrl: './player-control.component.html',
  styleUrls: ['./player-control.component.css']
})
export class PlayerControlComponent implements OnInit {

  constructor(
    private playerService:PlayerService,
    private roomService:RoomService
  ) {

   }

  ngOnInit(): void {
  }

  image(imageIdentifier :string):ImageFile {
    return ImageStorage.instance.get(imageIdentifier);
  }

  get players():Player[] {
    ObjectStore
    return  ObjectStore.instance.getObjects<Player>(Player)
  }

  isMine(playerId:string):boolean {
    return (this.playerService.myPlayer.playerId == playerId)
  }

  isOnline(playerId:string):boolean {
    return Boolean(this.playerService.otherPlayers.find(player => player.playerId == playerId))
  }

  isAdmin(playerId:string):boolean {
    return this.roomService.roomAdmin.adminPlayer.includes(playerId)
  }

  remove(playerId:string) {
    let player = this.playerService.getPlayerById(playerId);
    if (player && !this.isOnline(playerId)) player.destroy();
  }

}
