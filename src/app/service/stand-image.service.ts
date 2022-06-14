import { ComponentRef, Injectable, ViewContainerRef } from '@angular/core';
import { DataElement } from '@udonarium/data-element';
import { GameCharacter } from '@udonarium/game-character';
import { StandImageComponent } from 'component/stand-image/stand-image.component';

@Injectable({
  providedIn: 'root'
})
export class StandImageService {

  static defaultParentViewContainerRef: ViewContainerRef;
  static currentStandImageShowing = new Map<string, ComponentRef<StandImageComponent>>();

  constructor(
  ) { }

  show(gameCharacter: GameCharacter, standElement: DataElement=null , color: string=null, isSecret=false, effectName: string = '') {
    let isNewbee = true;
    for (const pair of StandImageService.currentStandImageShowing) {
      // 型を厳密にやりつつkey, valueをもう少し楽にイテレートできないか？
      const identifier = pair[0];
      const standImageComponentRef = pair[1];
      if (!standImageComponentRef) continue;
      const instance = standImageComponentRef.instance;
      if (instance.isVisible && gameCharacter.identifier != identifier) {
        instance.toGhostly();
      } else if (gameCharacter.identifier == identifier && gameCharacter.location.name != 'graveyard') {
        if (standElement) instance.standElement = standElement;
        instance.color = color ? color : gameCharacter.chatPalette.color;
        instance.isSecret = isSecret;
        instance.toFront();
        if (effectName) instance.playEffect(effectName);
        isNewbee = false;
      } else if (instance.isFarewell || StandImageComponent.isCanBeGone) {
        standImageComponentRef.destroy();
        StandImageService.currentStandImageShowing.delete(identifier);
      }
    }
    if (isNewbee && gameCharacter.location.name != 'graveyard') {
      const standImageComponentRef = StandImageService.defaultParentViewContainerRef.createComponent(StandImageComponent);
      standImageComponentRef.instance.gameCharacter = gameCharacter;
      if (!standElement) {
        let stand = gameCharacter.standList.getDefault();
        if (stand) {
          standElement = stand;
        }
        else return;
      }
      standImageComponentRef.instance.standElement = standElement;
      standImageComponentRef.instance.color = color ? color : gameCharacter.chatPalette.color;
      standImageComponentRef.instance.isSecret = isSecret;
      standImageComponentRef.instance.toFront();
      if (effectName) standImageComponentRef.instance.playEffect(effectName);
      StandImageService.currentStandImageShowing.set(gameCharacter.identifier, standImageComponentRef);
    }
  }

  farewell(characterIdentifier: GameCharacter | string) {
    if (characterIdentifier instanceof GameCharacter) characterIdentifier = characterIdentifier.identifier;
    const standImageComponentRef = StandImageService.currentStandImageShowing.get(characterIdentifier);
    if (standImageComponentRef && standImageComponentRef.instance) {
      standImageComponentRef.instance.toFarewell();
    }
  }

  destroy(characterIdentifier: GameCharacter | string, identifier: DataElement | string) {
    if (characterIdentifier instanceof GameCharacter) characterIdentifier = characterIdentifier.identifier;
    if (identifier instanceof DataElement) identifier = identifier.identifier;
    for (const pair of StandImageService.currentStandImageShowing) {
      const standImageComponentRef = pair[1];
      if (!standImageComponentRef) continue;
      if (!standImageComponentRef.instance || !standImageComponentRef.instance.standElement || standImageComponentRef.instance.standElement.identifier == identifier) {
        standImageComponentRef.destroy();
        StandImageService.currentStandImageShowing.delete(characterIdentifier);
      }
    }
  }

  destroyAll() {
    for (const pair of StandImageService.currentStandImageShowing) {
      // 型を厳密にやりつつkey, valueをもう少し楽にイテレートできないか？
      const identifier = pair[0];
      const standImageComponentRef = pair[1];
      if (!standImageComponentRef) continue;
      standImageComponentRef.destroy();
      StandImageService.currentStandImageShowing.delete(identifier);
    }
  }
}

