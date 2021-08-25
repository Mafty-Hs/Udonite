import { Injectable } from '@angular/core';
import { Counter } from '@udonarium/counter';
import { CounterList } from '@udonarium/counter-list';
import { Round } from '@udonarium/round';

@Injectable({
  providedIn: 'root'
})
export class CounterService {
  get round(): Round {return Round.instance;} 
  set round(_round) {Round.instance = _round;}

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
