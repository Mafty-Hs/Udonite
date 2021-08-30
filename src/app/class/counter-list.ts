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
 
  create(_counter :CounterContext) {
    let counter = new Counter();
    counter.initialize();
    for (let key in _counter) {
      if (key === 'identifier') continue;
      if (_counter[key] == null || _counter[key] === '') continue;
     counter.setAttribute(key, _counter[key]);
    }
    this.appendChild(counter);
  }


}

@SyncObject('assigned-counter-list')
export class AssignedCounterList extends ObjectNode implements InnerXml{

  add(_counter :CounterAssignContext) {
    let counter = new CounterAssign();
    counter.initialize();
    for (let key in _counter) {
      if (key === 'identifier') continue;
      if (_counter[key] == null || _counter[key] === '') continue;
     counter.setAttribute(key, _counter[key]);
    }
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
