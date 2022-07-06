import { Component, OnInit,Input } from '@angular/core';
import { GameCharacter } from '@udonarium/game-character';

@Component({
  selector: 'inner-note',
  templateUrl: './inner-note.component.html',
  styleUrls: ['./inner-note.component.css']
})
export class InnerNoteComponent implements OnInit {
  @Input() character:GameCharacter = null;

  get note():string {
    if (this.character) return this.character.note;
    return ""; 
  }
  set note(note: string) {
    if (this.character) this.character.note = note;
  }

  constructor(

  ) { }

  ngOnInit(): void {
  }

}
