import { Component, OnInit, OnDestroy, Input ,Output ,EventEmitter} from '@angular/core';
import { GameCharacter } from '@udonarium/game-character';
import { ImageFile } from '@udonarium/core/file-storage/image-file';
import { GameCharacterService } from 'service/game-character.service';
import { PlayerService } from 'service/player.service';
import { Player } from '@udonarium/player';

@Component({
  selector: 'chat-input-sendfrom',
  templateUrl: './chat-input-sendfrom.component.html',
  styleUrls: ['./chat-input-sendfrom.component.css']
})
export class ChatInputSendfromComponent implements OnInit ,OnDestroy {

  @Input('isLock') isLock: boolean = false;
  @Input('isBlack') isBlack: boolean = true;
  private _sendFrom:string;
  @Input('sendFrom') set sendFrom(sendFrom: string) {
    this._sendFrom = sendFrom;
    this.character = this.gameCharacterService.get(sendFrom) 
    this.sendFromChange.emit(sendFrom); 
  }
  get sendFrom(): string { return this._sendFrom };
  @Output() sendFromChange = new EventEmitter<string>();

  @Output() chatSetting = new EventEmitter<object>();
  _chatSetting(e) {
    this.chatSetting.emit(e);
  }

  touched:boolean = false;
  touch() {
    this.touched = true;
  }

  isUseFaceIcon: boolean = true;  
  character: GameCharacter; 
  get player():Player {
    return this.playerService.myPlayer;
  }

  get imageFile(): ImageFile {
    let image: ImageFile = null;
    if (this.character) {
      image = this.character.imageFile;
    } else if (this.playerService.myImage) {
      image = this.playerService.myImage
    }
    return image ? image : ImageFile.Empty;
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
    private gameCharacterService: GameCharacterService,
    private playerService: PlayerService
  ) {     
    
  }

  ngOnInit(): void {
  }

  ngOnDestroy() {
  }

}
