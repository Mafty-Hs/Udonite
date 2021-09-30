import { Injectable } from '@angular/core';
import { Counter , CounterAssign } from '@udonarium/counter';
import { CounterList , AssignedCounterList } from '@udonarium/counter-list';
import { Round , IRound } from '@udonarium/round';
import { GameCharacter } from '@udonarium/game-character';
import { ObjectStore } from '@udonarium/core/synchronize-object/object-store';
import { GameCharacterService } from './game-character.service';

@Injectable({
  providedIn: 'root'
})
export class CounterService {
  get round(): Round {return IRound.instance;} 
  set round(_round) {IRound.instance = _round;}
  private nullCounter:Counter = new Counter;

  create( _name: string, _desc: string, _canDuplicate: boolean, _isPermanent: boolean, _age: number, _uniqueIdentifier?: string) {
    if (_uniqueIdentifier) {
      CounterList.instance.create({
        name: _name,
        desc: _desc,
        canDuplicate: _canDuplicate,
        isPermanent: _isPermanent,
        age: _age,
        uniqueIdentifier: _uniqueIdentifier
      });
    }
    else {
      CounterList.instance.create({
        name: _name,
        desc: _desc,
        canDuplicate: _canDuplicate,
        isPermanent: _isPermanent,
        age: _age
      });
    }
  }

  get(identifier :string): Counter {
    let object = ObjectStore.instance.get(identifier);
    if (object instanceof Counter) {
      return object;
    }
    return this.nullCounter;
  }

  unique(identifier :string): Counter {
    let counter = CounterList.instance.unique(identifier);
    console.log(counter);
    return counter ? counter : this.nullCounter;
  }

  getAssign(identifier :string): CounterAssign {
    let object = ObjectStore.instance.get(identifier);
    if (object instanceof CounterAssign) {
      return object;
    }
    return null;
  }

  remove(identifier :string) {
  }

  list() {
    return CounterList.instance.list;
  }

  assign(_counterIdentifier :string, _characterIdentifier :string, _comment :string) {
    let gameCharacter = this.gameCharacterService.get(_characterIdentifier)
    let list = this.getList(gameCharacter)
    let counter = this.get(_counterIdentifier)
    if (!counter.canDuplicate && list.counter(_counterIdentifier)){
      list.counter(_counterIdentifier).age = counter.age;
      list.counter(_counterIdentifier).comment = _comment;
      return;
    }
    list.add({
      name: counter.name,
      counterIdentifier: counter.uniqueIdentifier,
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
    private gameCharacterService :GameCharacterService
  ) {
    this.initialize()
  }

  loadRound(object :Round) {
    this.round.count = Number(object.count);
    this.round.isInitiative = Boolean(object.isInitiative);
    this.round.currentInitiative = Number(object.currentInitiative);
    this.round.roundState = Number(object.roundState);
    this.round.initName = String(object.initName);
  }

  loadCounter(object :CounterList){
    for (let counter of object.children as Counter[]) {
      this.create(counter.name,counter.desc,Boolean(counter.canDuplicate),Boolean(counter.isPermanent),Number(counter.age), counter.uniqueIdentifier) 
    }
  }
}
