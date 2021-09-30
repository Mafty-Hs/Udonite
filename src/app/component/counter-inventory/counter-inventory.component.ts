import { Counter , CounterAssign } from '@udonarium/counter';
import { GameCharacterService } from 'service/game-character.service';
import { PanelOption, PanelService } from 'service/panel.service';
import { CounterService } from 'service/counter.service';
import { Component, OnInit } from '@angular/core';

interface inventoryContext {
  characterIdentifier: string;
  characterImage: string;
  characterName: string;
  name: string;
  desc: string;
  age: number;
  isPermanent: boolean;
  maxAge: number;
  comment: string;
  identifier: string;
}

@Component({
  selector: 'counter-inventory',
  templateUrl: './counter-inventory.component.html',
  styleUrls: ['./counter-inventory.component.css']
})
export class CounterInventoryComponent implements OnInit {

  myList:inventoryContext[] = this.counterService.assignedList().map(
    list => { 
      let character = this.character(list.characterIdentifier);
      let counter = this.getCounter(list.counterIdentifier);
      let inventory:inventoryContext =
      {
        characterIdentifier: list.characterIdentifier,
        characterImage: character ? character?.imageFile?.url : "" ,
        characterName:  character ? character?.name : "",
        name: list.name,
        desc: counter ? counter.desc : "",
        age: list.age,
        isPermanent: list.isPermanent  ,
        maxAge: counter ? counter.age : 0,
        comment: list.comment,
        identifier: list.identifier
      };
      return inventory;
    }
  ).sort(function(a,b){
      if(a.characterIdentifier > b.characterIdentifier) return -1;
      if(a.characterIdentifier < b.characterIdentifier) return 1;
      return 0;
  });

  character(identifier :string){
    return this.gameCharacterService.get(identifier)
  }

  get counterList(){
    return this.myList
  }

  isFirst(index :number) :boolean {
    if (index == 0) return true;
    let locallist = this.counterList;
    if (locallist[index].characterIdentifier ==
         locallist[index - 1].characterIdentifier) {
      return false;
    }
    return true;
  }

  mergeRow(characterIdentifier:string) :number {
    let locallist = this.counterList.filter(counter => counter.characterIdentifier == characterIdentifier);
    return locallist.length; 
 }

  getCounter(identifier: string): Counter {
    return this.counterService.unique(identifier);
  }

  remove(identifier: string){
    let counter = this.counterService.getAssign(identifier);
    if (counter)  counter.remove() ;
  }

  constructor(
    private counterService: CounterService,
    public gameCharacterService: GameCharacterService,
    private panelService: PanelService,
  ) { }

  ngOnInit(): void {
  }

}
