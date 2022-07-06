import { Component, OnInit,Input } from '@angular/core';
import { CounterAssign } from '@udonarium/counter';
import { GameCharacter } from '@udonarium/game-character';
import { CounterService } from 'service/counter.service';

@Component({
  selector: 'character-counter',
  templateUrl: './character-counter.component.html',
  styleUrls: ['./character-counter.component.css']
})
export class CharacterCounterComponent implements OnInit {
  @Input() character: GameCharacter = null;

  get myList():CounterAssign[]  {
    return this.counterService.getList(this.character).children as CounterAssign[];
  }

  constructor(
    private counterService:CounterService
  ) { }

  ngOnInit(): void {
  }

}
