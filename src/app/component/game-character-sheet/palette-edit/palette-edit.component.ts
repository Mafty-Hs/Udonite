import { Component, OnInit,Input } from '@angular/core';
import { GameCharacter } from '@udonarium/game-character';
import { PlayerService } from 'service/player.service';
import { ChatPalette, SubPalette } from '@udonarium/chat-palette';

@Component({
  selector: 'palette-edit',
  templateUrl: './palette-edit.component.html',
  styleUrls: ['./palette-edit.component.css','../../../common/scroll-white.common.css']
})
export class PaletteEditComponent implements OnInit {
  @Input() character: GameCharacter = null;

  get bgColor():string {
    return this.playerService.primaryChatWindowSetting.bgColor;
  }

  get currentPalette():ChatPalette {
    if (this.paletteIndex == 0) {
      return this.character.chatPalette;
    }
    else {
      return this.character.chatPalette;
    }
  }

  paletteIndex:number = 0;

  get rows():number {
    return this.editPalette.split('\n').length;
  }
  private _palette:string = "";
  get editPalette():string {
    return this._palette;
  }
  set editPalette(palette :string) {
    this._palette = palette;
  }

  constructor(
    private playerService: PlayerService
  ) { }

  ngOnInit(): void {
    this._palette =  this.currentPalette.value + '';
  }

}
