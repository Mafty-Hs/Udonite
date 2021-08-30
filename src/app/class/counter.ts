import { SyncObject, SyncVar } from './core/synchronize-object/decorator';
import { ObjectNode } from './core/synchronize-object/object-node';

export interface CounterContext {
  identifier?: string;
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
  characterIdentifier: string; 
  isPermanent: boolean;
  age: number;
  comment: string;
}

@SyncObject('counter')
export class Counter extends ObjectNode {
  @SyncVar() name: string;
  @SyncVar() desc: string;
  @SyncVar() canDuplicate: boolean;
  @SyncVar() isPermanent: boolean;
  @SyncVar() age: number;
}

@SyncObject('counter-assign')
export class CounterAssign extends ObjectNode {
  @SyncVar() name: string;
  @SyncVar() counterIdentifier: string; 
  @SyncVar() characterIdentifier: string; 
  @SyncVar() isPermanent: boolean;
  @SyncVar() age: number;
  @SyncVar() comment: string;

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
