import { Component, OnInit } from '@angular/core';
import { GameCharacter } from '@udonarium/game-character';
import { PanelOption, PanelService } from 'service/panel.service';

@Component({
  selector: 'inner-note',
  templateUrl: './inner-note.component.html',
  styleUrls: ['./inner-note.component.css']
})
export class InnerNoteComponent implements OnInit {
  public character:GameCharacter = null;

  get note():string {
    if (this.character) return this.character.note;
    return ""; 
  }
  set note(note: string) {
    if (this.character) this.character.note = note;
  }

  constructor(
    public panelService: PanelService
  ) { }

  ngOnInit(): void {
  }

}
