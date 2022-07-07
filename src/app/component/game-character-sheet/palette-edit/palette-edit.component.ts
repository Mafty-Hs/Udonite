import { AfterViewInit, Component, Input, OnDestroy, OnInit} from '@angular/core';
import { GameCharacter } from '@udonarium/game-character';
import { PlayerService } from 'service/player.service';
import { ChatPalette, SubPalette } from '@udonarium/chat-palette';
import { EventSystem } from '@udonarium/core/system';

@Component({
  selector: 'palette-edit',
  templateUrl: './palette-edit.component.html',
  styleUrls: ['./palette-edit.component.css','../../../common/scroll-white.common.css']
})
export class PaletteEditComponent implements OnInit, OnDestroy, AfterViewInit {
  @Input() character: GameCharacter = null;

  get bgColor():string {
    return this.playerService.primaryChatWindowSetting.bgColor;
  }

  setPalette(identifier :string) {
    if (this.updateTimer) {
      clearTimeout(this.updateTimer);
      this.writePallette()
    }
    this.paletteIdentifier = identifier;
    this.reloadPalette();
  }

  reloadPalette() {
    if (this.updateTimer) {
      clearTimeout(this.updateTimer);
    }
    this._palette = this.currentPalette.value + '';
  }

  get currentPalette():ChatPalette {
    if (!this.paletteIdentifier) {
      return this.character.chatPalette;
    }
    else {
      return this.character.subPalette.palette(this.paletteIdentifier)
    }
  }

  addPalette() {
    let subPalette:SubPalette = this.character.subPalette;
    let palette = new ChatPalette;
    palette.initialize();
    let initPalette:string = this.character.name + 'の追加パレット\n//1行目がタブに表示されるタイトルになります\n';
    palette.setPalette(initPalette);
    palette.getPalette();
    subPalette.appendChild(palette);
  }

  removePalette() {
    let tmp = this.paletteIdentifier;
    this.paletteIdentifier = "";
    let palette = this.character.subPalette.palette(tmp);
    if (palette) palette.destroy();
  }

  paletteIdentifier:string = "";

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

  updateTimer:NodeJS.Timer;

  private writePallette() {
    this.currentPalette.setPalette(this._palette);
  }

  update() {
    if (this.updateTimer) clearTimeout(this.updateTimer);
    this.updateTimer = setTimeout(() => {this.writePallette()} , 1000);
  }

  constructor(
    private playerService: PlayerService
  ) { }

  ngOnInit(): void {
    this.reloadPalette();
  }

  ngAfterViewInit(): void {
    EventSystem.register(this)
    .on('UPDATE_GAME_OBJECT', -1000, event => {
      if (event.data.identifier === this.paletteIdentifier) {
          this.reloadPalette();
      }
    });
  }

  ngOnDestroy(): void {
    if (this.updateTimer) {
      clearTimeout(this.updateTimer);
      this.writePallette()
    }
    EventSystem.unregister(this);
  }

}
