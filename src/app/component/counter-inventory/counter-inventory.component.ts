import { Counter , CounterAssign } from '@udonarium/counter';
import { GameCharacterService } from 'service/game-character.service';
import { CounterService } from 'service/counter.service';
import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { RoomService } from 'service/room.service';

@Component({
  selector: 'counter-inventory',
  templateUrl: './counter-inventory.component.html',
  styleUrls: ['./counter-inventory.component.css','../../common/scroll-white.common.css']
})
export class CounterInventoryComponent implements OnInit {

  auth:boolean = this.roomService.adminAuth;
  disableRemove:boolean = this.roomService.disableSetCounter;

  get myList():CounterAssign[]  {
    return this.counterService.assignedList().sort(function(a,b){
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

  remove(identifier: string){
    let counter = this.counterService.getAssign(identifier);
    if (counter)  counter.remove() ;
  }

  resetAge() {
    if (confirm('全てのカウンターの寿命をリセットします。よろしいですか？')) {
      const list = this.myList;
      for (let counter of list) {
        if (!counter.isPermanent) {
          counter.age = counter.maxAge
        }
      }
    }
  }

  removeAll(isForce :boolean) {
    if (confirm('全てのカウンターを削除します。よろしいですか？')) {
      const list = this.myList;
      for (let counter of list) {
        if (counter.isPermanent && !isForce) continue;
        counter.remove() ;
      }
    }
  }

  constructor(
    private counterService: CounterService,
    private gameCharacterService: GameCharacterService,
    private roomService: RoomService
   ) {
  }

  ngOnInit(): void {
  }

}
