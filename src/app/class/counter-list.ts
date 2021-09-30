import { SyncObject } from './core/synchronize-object/decorator';
import { InnerXml } from './core/synchronize-object/object-serializer';
import { SyncVar } from './core/synchronize-object/decorator';
import { ObjectNode } from './core/synchronize-object/object-node';
import { Counter , CounterAssign , CounterContext , CounterAssignContext} from './counter';

@SyncObject('counter-list')
export class CounterList extends ObjectNode implements InnerXml{
  private static _instance: CounterList;
  static get instance(): CounterList {
    if (!CounterList._instance) {
      CounterList._instance = new CounterList('CounterList');
      CounterList._instance.initialize();
    }
    return CounterList._instance;
  }

  get list(): Counter[] { 
  return this.children as Counter[]; }

  unique(uniqueIdentifier :string) { 
    return this.list.find(child => child.uniqueIdentifier == uniqueIdentifier);
  }

  create(_counter :CounterContext) {
    let counter = new Counter();
    counter.initialize();
    counter.name = _counter["name"];
    counter.desc =  _counter["desc"];
    counter.canDuplicate = _counter["canDuplicate"];
    counter.isPermanent = _counter["isPermanent"];
    counter.age = _counter["age"];
    counter.uniqueIdentifier = _counter["uniqueIdentifier"] ? _counter["uniqueIdentifier"] : counter.identifier
    this.appendChild(counter);
  }


}

@SyncObject('assigned-counter-list')
export class AssignedCounterList extends ObjectNode implements InnerXml{

  add(_counter :CounterAssignContext) {
    let counter = new CounterAssign();
    counter.initialize();
    counter.name = _counter["name"];
    counter.counterIdentifier =  _counter["counterIdentifier"];
    counter.isPermanent = _counter["isPermanent"];
    counter.age = _counter["age"];
    counter.comment = _counter["comment"];
    this.appendChild(counter);
  }

  remove(counter :CounterAssign) {
    this.removeChild(counter);
  }

  counter(identifier :string) :CounterAssign{
    return this.list.find(child => child.counterIdentifier == identifier);
  }

  get list(): CounterAssign[] {
  return this.children as CounterAssign[]; }

}
