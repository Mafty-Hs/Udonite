import { Counter , CounterAssign } from '@udonarium/counter';
import { ObjectStore } from '@udonarium/core/synchronize-object/object-store';
import { GameCharacter } from '@udonarium/game-character';
import { PanelOption, PanelService } from 'service/panel.service';
import { CounterService } from 'service/counter.service';
import { Component, OnInit } from '@angular/core';

@Component({
  selector: 'counter-inventory',
  templateUrl: './counter-inventory.component.html',
  styleUrls: ['./counter-inventory.component.css']
})
export class CounterInventoryComponent implements OnInit {

  get counterList():CounterAssign[]{
    return this.counterService.assignedList().sort(function(a,b){
    if(a.characterIdentifier > b.characterIdentifier) return -1;
    if(a.characterIdentifier < b.characterIdentifier) return 1;
    return 0;
});
  }

  getimage(charaidentifier: string): string {
    return this.getCharacter(charaidentifier).imageFile.url as string
  }

  getCharacter(charaidentifier: string): GameCharacter {
    let object = ObjectStore.instance.get(charaidentifier);
    if (object instanceof GameCharacter) {
      return object;
    }
    return null;
  }

  isFirst(index :number) :boolean {
    if (index == 0) return true;
    let locallist: CounterAssign[] = this.counterList;
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
    return this.counterService.get(identifier);
  }

  constructor(
    private counterService: CounterService,
    private panelService: PanelService,
  ) { }

  ngOnInit(): void {
  }

}
