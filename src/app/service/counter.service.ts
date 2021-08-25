import { Injectable } from '@angular/core';
import { Counter } from '@udonarium/counter';
import { CounterList } from '@udonarium/counter-list';
import { Round , IRound } from '@udonarium/round';

@Injectable({
  providedIn: 'root'
})
export class CounterService {
  get round(): Round {return IRound.instance;} 
  set round(_round) {IRound.instance = _round;}

  create(_name: string,_desc: string,_canDuplicate: boolean,_isPermanent: boolean,_age: number) {
   CounterList.instance.create({
      name: _name,
      desc: _desc,
      canDuplicate: _canDuplicate,
      isPermanent: _isPermanent,
      age: _age
    });
  }

  remove(identifer :string) {
  }

  list() {
    return CounterList.instance.list;
  }

  initialize() {
  }

  constructor(
  ) {
    this.initialize()
  }

}
