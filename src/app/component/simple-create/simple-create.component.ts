import { Component, OnInit, AfterViewInit } from '@angular/core';
import { Network } from '@udonarium/core/system';
import { PanelService } from 'service/panel.service';
import { ModalService } from 'service/modal.service';
import { PlayerService } from 'service/player.service';
import { GameCharacterService } from 'service/game-character.service';
import { FileSelecterComponent } from 'component/file-selecter/file-selecter.component';
import { GameCharacter } from '@udonarium/game-character';
import { ImageStorage } from '@udonarium/core/file-storage/image-storage';

@Component({
  selector: 'simple-create',
  templateUrl: './simple-create.component.html',
  styleUrls: ['./simple-create.component.css']
})
export class SimpleCreateComponent implements OnInit,AfterViewInit {

  name:string = "";
  imageIdentifier:string = "stand_no_image";
  get imageurl():string {
    if (this.imageIdentifier)
      return ImageStorage.instance.get(this.imageIdentifier).url;
    return "";
  }
  useStand:boolean = true;
  position:number = 5;

  changeImage() {
    this.modalService.open<string>(FileSelecterComponent, { currentImageIdentifires: this.imageIdentifier }).then(value => {
      if (!value) return;
      this.imageIdentifier = value;
    });
  }

  create() {
    if (this.name == "") return;
    let character = this.gameCharacterService.create(this.name ,this.imageIdentifier)
    character.setLocation(Network.peerId);
    if (this.useStand) character.standList.add(this.imageIdentifier);
    character.standList.position = this.position;
    this.playerService.addList(character.identifier);
    this.panelService.close;
  }

  constructor(
     private gameCharacterService: GameCharacterService,
     public panelService: PanelService,
     private playerService: PlayerService,
     private modalService: ModalService
  ) { }

  ngOnInit(): void {
    Promise.resolve().then(() => this.modalService.title = this.panelService.title = 'キャラクター簡易作成');
  }

  ngAfterViewInit() {
  }


}
