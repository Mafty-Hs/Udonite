import { Injectable } from '@angular/core';
import { Counter , CounterAssign } from '@udonarium/counter';
import { CounterList , AssignedCounterList } from '@udonarium/counter-list';
import { Round , IRound } from '@udonarium/round';
import { GameCharacter } from '@udonarium/game-character';
import { ObjectStore } from '@udonarium/core/synchronize-object/object-store';

@Injectable({
  providedIn: 'root'
})
export class CounterService {
  get round(): Round {return IRound.instance;} 
  set round(_round) {IRound.instance = _round;}
  private nullCounter:Counter = new Counter;

  create(_name: string,_desc: string,_canDuplicate: boolean,_isPermanent: boolean,_age: number) {
   CounterList.instance.create({
      name: _name,
      desc: _desc,
      canDuplicate: _canDuplicate,
      isPermanent: _isPermanent,
      age: _age
    });
  }

  get(identifier :string): Counter {
    let object = ObjectStore.instance.get(identifier);
    if (object instanceof Counter) {
      return object;
    }
    return this.nullCounter;
  }

  remove(identifier :string) {
  }

  list() {
    return CounterList.instance.list;
  }

  assign(_counterIdentifier :string, _characterIdentifier :string, _comment :string) {
    let gameCharacter = this.getCharacter(_characterIdentifier)
    let list = this.getList(gameCharacter)
    let counter = this.get(_counterIdentifier)
    if (!counter.canDuplicate && list.counter(_counterIdentifier)){
      list.counter(_counterIdentifier).age = counter.age;
      list.counter(_counterIdentifier).comment = _comment;
      return;
    }
    list.add({
      name: counter.name,
      counterIdentifier: _counterIdentifier,
      characterIdentifier: _characterIdentifier,
      isPermanent: counter.isPermanent,
      age: counter.age,
      comment: _comment
    }); 
  }

  getList(gameCharacter :GameCharacter): AssignedCounterList {
    for (let child of gameCharacter.children) {
      if (child instanceof AssignedCounterList) return child;
    }
    let assignedCounterList = new AssignedCounterList;
    assignedCounterList.initialize();
    gameCharacter.appendChild(assignedCounterList);
    return assignedCounterList;
  }

  initialize() {
  }

  assignedList(): CounterAssign[] {
    return ObjectStore.instance.getObjects(CounterAssign);
  }

  constructor(
  ) {
    this.initialize()
  }

  private getCharacter(charaidentifier: string): GameCharacter {
    let object = ObjectStore.instance.get(charaidentifier);
    if (object instanceof GameCharacter) {
      return object;
    }
    return null;
  }

}
