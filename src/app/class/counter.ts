import { SyncObject, SyncVar } from './core/synchronize-object/decorator';
import { ObjectNode } from './core/synchronize-object/object-node';

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
  @SyncVar() comment: string;

  get characterIdentifier() {
    return this.parent.parent.identifier;
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

  aging() {
    if (!this.isPermanent) {
      this.age -= 1;
      if (this.age < 0) {
        this.remove(); 
      }
    }
  }

  remove() {
    this.destroy();
  }

}
