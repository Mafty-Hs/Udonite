import { SyncObject, SyncVar } from './core/synchronize-object/decorator';
import { ObjectNode } from './core/synchronize-object/object-node';
import { GameCharacter } from './game-character';
import { ObjectStore } from './core/synchronize-object/object-store';
import { TabletopObject } from './tabletop-object';

export interface CounterContext {
  identifier?: string;
  uniqueIdentifier?: string;
  name: string;
  desc: string;
  canDuplicate: boolean;
  isPermanent: boolean;
  age: number;
}

export interface CounterAssignContext {
  identifier?: string;
  name: string;
  counterIdentifier: string;
  isPermanent: boolean;
  age: number;
  maxAge: number;
  desc: string,
  comment: string;
}

@SyncObject('counter')
export class Counter extends ObjectNode {
  @SyncVar() name: string;
  @SyncVar() desc: string;
  @SyncVar() uniqueIdentifier: string;
  @SyncVar() _canDuplicate: number;
  @SyncVar() _isPermanent: number;
  @SyncVar() age: number;

  get canDuplicate():boolean {
    return this._canDuplicate === 1 ? true : false;
  }
  set canDuplicate(_canDuplicate :boolean) {
    this._canDuplicate = _canDuplicate ? 1 : 0;
  }

  get isPermanent():boolean {
    return this._isPermanent === 1 ? true : false;
  }
  set isPermanent(_isPermanent :boolean) {
    this._isPermanent = _isPermanent ? 1 : 0;
  }

}

@SyncObject('counter-assign')
export class CounterAssign extends ObjectNode {
  @SyncVar() name: string;
  @SyncVar() counterIdentifier: string;
  @SyncVar() _isPermanent: string;
  @SyncVar() _age: string;
  @SyncVar() _maxAge: string;
  @SyncVar() desc: string = "";
  @SyncVar() comment: string;

  get characterName():string {
    let character = this.parent.parent as GameCharacter;
    return character.name;
  }
  get characterImage():string {
    let character = this.parent.parent as GameCharacter;
    if (character.imageFile?.url?.length > 0)
     return character.imageFile.url;
    else
     return "";
  }
  get characterIdentifier():string {
    return this.parent.parent.identifier;
  }

  get isBlackPaint():boolean {
    let object = this.parent.parent as TabletopObject;
    return object.isBlackPaint;
  }

  get isPermanent():boolean {
    return this._isPermanent === "1" ? true : false;
  }
  set isPermanent(_isPermanent :boolean) {
    this._isPermanent = _isPermanent ? "1" : "0";
  }
  get age():number {
    return Number(this._age);
  }
  set age(_age :number) {
    this._age = String(_age);
  }
  get maxAge():number {
    return Number(this._maxAge);
  }
  set maxAge(_age :number) {
    this._maxAge = String(_age);
  }

  aging() {
    if (!this.isPermanent) {
      this.age -= 1;
      if (this.age < 0) {
        this.remove();
      }
    }
  }

  remove() {
    this.parent.removeChild(this);
    this.destroy();
  }

}
