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

@SyncObject('counter')
export class Counter extends ObjectNode {
  @SyncVar() name: string;
  @SyncVar() desc: string;
  @SyncVar() canDuplicate: boolean;
  @SyncVar() isPermanent: boolean;
  @SyncVar() age: number;
}
