import { Component, OnInit, OnDestroy, Input ,Output ,EventEmitter, ChangeDetectionStrategy, ChangeDetectorRef} from '@angular/core';
import { GameCharacter } from '@udonarium/game-character';
import { ImageFile } from '@udonarium/core/file-storage/image-file';
import { GameCharacterService } from 'service/game-character.service';
import { PlayerService } from 'service/player.service';
import { Player } from '@udonarium/player';
import { EventSystem } from '@udonarium/core/system';

@Component({
  selector: 'chat-input-sendfrom',
  templateUrl: './chat-input-sendfrom.component.html',
  styleUrls: ['./chat-input-sendfrom.component.css'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ChatInputSendfromComponent implements OnInit ,OnDestroy {

  @Input('isLock') isLock: boolean = false;
  @Input('isBlack') isBlack: boolean = true;
  private _sendFrom:string;
  @Input('sendFrom') set sendFrom(sendFrom: string) {
    this._sendFrom = sendFrom;
    this.character = this.gameCharacterService.get(sendFrom)
    this.sendFromChange.emit(sendFrom);
    this.lazyUpdate()
  }
  get sendFrom(): string { return this._sendFrom };
  @Output() sendFromChange = new EventEmitter<string>();

  @Output() chatSetting = new EventEmitter<object>();
  _chatSetting(e) {
    this.chatSetting.emit(e);
  }

  lazyUpdateTimer:NodeJS.Timer = null;

  async lazyUpdate():Promise<void> {
    if (this.lazyUpdateTimer) clearTimeout(this.lazyUpdateTimer);
    this.lazyUpdateTimer = setTimeout(() => this.lazyUpdateDo() ,200)
  }

  lazyUpdateDo():void {
    if (this.character && this.character?.location?.name === 'graveyard' ) this.sendFrom = this.playerService.myPlayer.playerId;
    this.changeDetector.detectChanges();
  }

  touched:boolean = false;
  touch() {
    this.touched = true;
    this.lazyUpdate()
  }

  isUseFaceIcon: boolean = true;
  character: GameCharacter;
  get myPlayerId():string {
    return this.playerService.myPlayer.playerId;
  }
  get player():Player {
    return this.playerService.myPlayer;
  }

  get imageFile(): ImageFile {
    let image: ImageFile = null;
    if (this.character) {
      if (this.isUseFaceIcon && this.character.faceIcon != null && this.character.faceIcon?.url.length > 0)
        image = this.character.faceIcon;
      else
        image = this.character.imageFile;
    } else if (this.playerService.myImage) {
      image = this.playerService.myImage
    }
    return image ? image : ImageFile.Empty;
  }

  get imgStyle(): object {
    if (!this.character) return {};
    return (this.isUseFaceIcon && this.character.faceIcon &&  this.character.faceIcon?.url.length > 0 ) ? {} : this.character.imgStyle ;
  }

  get auraStyle(): object {
    if (!this.character) return {};
    return (this.isUseFaceIcon && this.character.faceIcon &&  this.character.faceIcon?.url.length > 0 ) ? {} : this.character.auraStyle ;
  }

  canSelect() {
    this.touched = false;
  }

  get gameCharacters(): GameCharacter[] {
    let onlyTable:boolean = true;
    return this.gameCharacterService.list(onlyTable);
  }

  colorValication(color :string) :string {
    return (color == Player.CHAT_WHITETEXT_COLOR && !this.isBlack) ? Player.CHAT_BLACKTEXT_COLOR : color;
  }

  getColor():string {
    let color:string = Player.CHAT_WHITETEXT_COLOR;
    if(this.character) {
      color = this.gameCharacterService.color(this.sendFrom)
    }
    else color = this.myColor;
    return this.colorValication(color);
  }

  get myColor(): string {
    return this.playerService.myColor;
   }

  constructor(
    private changeDetector: ChangeDetectorRef,
    private gameCharacterService: GameCharacterService,
    private playerService: PlayerService
  ) {
    EventSystem.register(this)
    .on('UPDATE_GAME_OBJECT', -1000, event => {
      if (event.data.aliasName === 'player' || event.data.aliasName === 'character' || event.data.aliasName == 'data' ) {
        this.lazyUpdate();
      }
    })
    .on('DELETE_GAME_OBJECT', -1000, event => {
      if (event.data.identifier === this.sendFrom )
      this.lazyUpdate();
    });
  }

  ngOnInit(): void {
  }

  ngOnDestroy() {
  }

}
