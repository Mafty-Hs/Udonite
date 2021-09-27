import { Injectable } from '@angular/core';
import { EventSystem } from '@udonarium/core/system';
import { GameCharacter } from '@udonarium/game-character';
import { ObjectStore } from '@udonarium/core/synchronize-object/object-store';

@Injectable({
  providedIn: 'root'
})
export class GameCharacterService {

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
      if(gameCharacter.chatPalette && gameCharacter.chatPalette.color && gameCharacter.chatPalette.color != '#ffffff')
        return gameCharacter.chatPalette.color;
      return '#444';
    }
    return null
  }

  //リスト系
  locationCheck(gameCharacter: GameCharacter,onlyTable): boolean {
    if (!gameCharacter) return false;
    switch (gameCharacter.location.name) {
      case 'table':
        return true;
      case 'graveyard':
        return false;
      default :
        return !onlyTable;
    }
  }
  private shouldUpdateCharacterList: boolean = true;
  private _gameCharacters: GameCharacter[] = [];
  list(onlyTable: boolean) : GameCharacter[] {
    if (this.shouldUpdateCharacterList) {
      this.shouldUpdateCharacterList = false;
      this._gameCharacters = ObjectStore.instance
        .getObjects<GameCharacter>(GameCharacter)
        .filter(character => this.locationCheck(character, onlyTable));
    }
    return this._gameCharacters;
  }

  //イメージ
  aura :string[] = ["black", "blue", "green", "cyan", "red", "magenta", "yellow", "white" ]
  effectClass(identifier: string) :string[] {
    let myClass :string[] = ["aura"];
    let character = this.get(identifier);
    if(character.isInverse) myClass.push("inverse");
    if(character.isHollow) myClass.push("hollow");
    if(character.aura != -1) myClass.push(this.aura[Number(character.aura)]);
    return myClass;
  }
  
  imageUrl(identifier: string ,isUseFaceIcon :boolean): string {
    let character = this.get(identifier);
    if (isUseFaceIcon && character.faceIcon != null && 0 < character.faceIcon?.url?.length)
      return character.faceIcon?.url;
    if (character.imageFile != null && 0 < character.imageFile.url.length)
      return character.imageFile.url;
    return "";
  }

  constructor() { 
    EventSystem.register(this)
      .on('UPDATE_GAME_OBJECT', -1000, event => {
        if (event.data.aliasName !== GameCharacter.aliasName) return;
        this.shouldUpdateCharacterList = true;
      })
  }
}
