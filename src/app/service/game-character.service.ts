import { Injectable } from '@angular/core';
import { EventSystem } from '@udonarium/core/system';
import { GameCharacter } from '@udonarium/game-character';
import { ObjectStore } from '@udonarium/core/synchronize-object/object-store';
import { DataElement } from '@udonarium/data-element';
import { PlayerService } from 'service/player.service';
import { RoomService } from './room.service';
import { StandList } from '@udonarium/stand-list';

@Injectable({
  providedIn: 'root'
})
export class GameCharacterService {

  get CharacterTemplate():GameCharacter {
    let character = this.get(this.roomService.roomAdmin.templateCharacter);
    if (character) {
      return character;
    }
    this.roomService.roomAdmin.templateCharacter = "";
    return null;
  }

  private _gameType:string = "";
  get gameType() {
    if (!this._gameType && this.roomService.roomAdmin.gameType) {
      this._gameType = this.roomService.roomAdmin.gameType;
      EventSystem.trigger('DICEBOT_LOAD', null);
    }
    return this._gameType;
  }
  set gameType(gameType :string) { this._gameType = gameType; }

  create(name:string ,imageIdentifier:string):GameCharacter {
    let character:GameCharacter
    let template = this.CharacterTemplate;
    if (template) {
      character = template.clone();
      character.name = name;
      character.imageDataElement.getFirstElementByName('imageIdentifier').value = imageIdentifier;
      //if (character.faceIcon) character.faceIcon.destroy();
      if (character.shadowImageFile) {
        const garbages = character.imageDataElement.getElementsByName('shadowImageIdentifier');
          for (const garbage of garbages) {
            character.imageDataElement.removeChild(garbage);
          }
      }
      character.setLocation('table');
      let oldStand = character.standList;
      character.removeChild(oldStand);
      oldStand.destroy();
      let newStand = new StandList('StandList_' + character.identifier);
      newStand.initialize();
      character.appendChild(newStand);
    }
    else {
      character = GameCharacter.create(name ,imageIdentifier);
      character.createTestGameDataElement();
    }
    return character;
  }

  //基本
  get(identifier: string) :GameCharacter {
    let object = ObjectStore.instance.get(identifier);
    if (object instanceof GameCharacter) {
      return object;
    }
    return null;
  }

  color(identifier: string) :string {
    let gameCharacter = this.get(identifier);
    if(gameCharacter) {
      if(gameCharacter.chatPalette && gameCharacter.chatPalette.color)
        return gameCharacter.chatPalette.color;
      return this.playerService.CHAT_WHITETEXT_COLOR;
    }
    return null
  }

  location(identifier: string,onlyTable :boolean) :boolean {
    return this.locationCheck(this.get(identifier) ,onlyTable)
  }

  dataElements(identifier :string) :DataElement[] {
    return this.getDetail(this.get(identifier));
  }

  getDetail(character :GameCharacter):DataElement[] {
    return  character.detailDataElement?.children ? character.detailDataElement.children as DataElement[] : [];
  }

  findDataElm(identifier :string,resouce :string):DataElement|null {
    let dataElms = this.dataElements(identifier);
    for (let data of dataElms) {
      let element = this._findDataElm(data ,resouce)
      if (element) return element;
    }
    return null;
  }

  private _findDataElm(dataElm :DataElement ,resouce :string):DataElement|null {
    if (dataElm.name === resouce) return dataElm;
    if (dataElm.children.length > 0) {
      let dataElms = dataElm.children as DataElement[];
      for (let data of dataElms) {
        let element = this._findDataElm(data ,resouce)
        if (element) return element;
      }
    }
    return null;
  }

  //チャット用
  chatId :string;
  chatCharacter:GameCharacter;
  chatSet(sendFrom :string ,isUseFaceIcon: boolean, text:string, standName:string){
    let standIdentifier:string = "";
    let standInfo = null;
    if (sendFrom != this.chatId) {
      this.chatId = sendFrom;
      this.chatCharacter = this.get(this.chatId);
    }
    (isUseFaceIcon && this.chatCharacter.faceIcon) ? isUseFaceIcon = true : isUseFaceIcon = false;
    let imageIdentifier = isUseFaceIcon ?
        this.chatCharacter.faceIcon?.identifier : this.chatCharacter.imageFile?.identifier;
    if (this.chatCharacter.imageFile && this.chatCharacter.standList) {
      standInfo = this.chatCharacter.standList.matchStandInfo(text,this.chatCharacter.imageFile.identifier , standName);
      standIdentifier =  standInfo.standElementIdentifier;
    }
    return {
      name: this.chatCharacter.name ,
      imageIdentifier: imageIdentifier ? imageIdentifier : '',
      color: this.chatCharacter.chatPalette?.paletteColor ?
       this.chatCharacter.chatPalette.paletteColor : "",
      isInverse: !isUseFaceIcon ? Number(this.chatCharacter.isInverse) : 0,
      isHollow: !isUseFaceIcon ? Number(this.chatCharacter.isHollow) : 0,
      isBlackPaint: !isUseFaceIcon ? Number(this.chatCharacter.isBlackPaint) : 0,
      aura: !isUseFaceIcon ? Number(this.chatCharacter.aura) : -1,
      standInfo: standInfo,
      standIdentifier: standIdentifier,
      isUseFaceIcon: isUseFaceIcon
    };
  }

  //リスト系
  locationCheck(gameCharacter: GameCharacter,onlyTable :boolean): boolean {
    if (!gameCharacter) return false;
    switch (true) {
      case (gameCharacter.location.name === 'table'):
        return true;
      case (gameCharacter.location.name === this.playerService.myPlayer.playerId):
        return !onlyTable;
      case  Boolean(this.playerService.otherPlayers.find(player =>　gameCharacter.location.name === player.playerId)):
        return false;
      case (gameCharacter.location.name === 'graveyard'):
        return false;
      default :
        return !onlyTable;
    }
  }
  private shouldUpdateCharacterList: boolean = true;
  private _gameCharacters: GameCharacter[] = [];
  private _gameCharacters_onlyTable: GameCharacter[] = [];
  list(onlyTable: boolean) : GameCharacter[] {
    if (this.shouldUpdateCharacterList) {
      this.shouldUpdateCharacterList = false;
      let tempCharacters = ObjectStore.instance
        .getObjects<GameCharacter>(GameCharacter);

      this._gameCharacters = tempCharacters
        .filter(character => this.locationCheck(character, false));
      this._gameCharacters_onlyTable = tempCharacters
        .filter(character => this.locationCheck(character, true));
    }
    if (onlyTable) return this._gameCharacters_onlyTable;
    return this._gameCharacters;
  }

  paletteInit() {
    EventSystem.unregister(this);
    EventSystem.register(this)
      .on('UPDATE_GAME_OBJECT', -1000, event => {
        if (event.data.aliasName !== GameCharacter.aliasName) return;
        if (!this.locationCheck(this.get(event.data.identifier),false)) {
          this.playerService.removeList(event.data.identifier);
        }
        this.shouldUpdateCharacterList = true;
      })
      .on('DELETE_GAME_OBJECT', -1000, event => {
        if (this.playerService.checkList(event.data.identifier)) {
          this.playerService.removeList(event.data.identifier);
        }
      });

  }

  constructor(
     private playerService: PlayerService,
     private roomService: RoomService
  ) {
    EventSystem.register(this)
      .on('ROOM_PLAY', -1000, event => {
        this.paletteInit();
      });
  }
}
