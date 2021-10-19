import { Counter , CounterAssign } from '@udonarium/counter';
import { GameCharacterService } from 'service/game-character.service';
import { PanelOption, PanelService } from 'service/panel.service';
import { CounterService } from 'service/counter.service';
import { Component, OnInit, ChangeDetectorRef } from '@angular/core';

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


  private _myList:inventoryContext[] = []; 

  get myList():inventoryContext[] { 
    return this._myList
  }

  updateList() {
    this._myList = this.counterService.assignedList().map(
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
  }

  character(identifier :string){
    return this.gameCharacterService.get(identifier)
  }

  isFirst(index :number) :boolean {
    if (index == 0) return true;
    let locallist = this.myList;
    if (locallist[index].characterIdentifier ==
         locallist[index - 1].characterIdentifier) {
      return false;
    }
    return true;
  }

  mergeRow(characterIdentifier:string) :number {
    let locallist = this.myList.filter(counter => counter.characterIdentifier == characterIdentifier);
    return locallist.length; 
 }

  getCounter(identifier: string): Counter {
    return this.counterService.unique(identifier);
  }

  remove(identifier: string){
    let counter = this.counterService.getAssign(identifier);
    if (counter)  counter.remove() ;
    this.updateList;
  }

  constructor(
    private counterService: CounterService,
    private gameCharacterService: GameCharacterService,
    private panelService: PanelService,
    private changeDetectorRef: ChangeDetectorRef
  ) {
  }

  ngOnInit(): void {
    this.updateList();
  }

}
