import { SyncObject } from './core/synchronize-object/decorator';
import { InnerXml } from './core/synchronize-object/object-serializer';
import { SyncVar } from './core/synchronize-object/decorator';
import { ObjectNode } from './core/synchronize-object/object-node';
import { Counter , CounterContext } from './counter';

@SyncObject('data')
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
