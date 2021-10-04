import { Component, OnInit, OnDestroy, Input ,Output ,EventEmitter} from '@angular/core';
import { GameCharacter } from '@udonarium/game-character';
import { PeerCursor } from '@udonarium/peer-cursor';
import { ImageFile } from '@udonarium/core/file-storage/image-file';
import { GameCharacterService } from 'service/game-character.service';

@Component({
  selector: 'chat-input-sendfrom',
  templateUrl: './chat-input-sendfrom.component.html',
  styleUrls: ['./chat-input-sendfrom.component.css']
})
export class ChatInputSendfromComponent implements OnInit ,OnDestroy {

  @Input('isLock') isLock: boolean = false;;
  @Input('sendFrom') _sendFrom: string = this.myPeer ? this.myPeer.identifier : '';
  @Output() sendFromChange = new EventEmitter<string>();
  get sendFrom(): string { return this._sendFrom };
  set sendFrom(sendFrom: string) { 
    this._sendFrom = sendFrom;
    this.character = this.gameCharacterService.get(sendFrom) 
    this.sendFromChange.emit(sendFrom); 
  }

  @Output() chatSetting = new EventEmitter<object>();
  _chatSetting(e) {
    this.chatSetting.emit(e);
  }

  touched:boolean = false;
  touch() {
    this.touched = true;
  }

  get myPeer(): PeerCursor { return PeerCursor.myCursor; }

  isUseFaceIcon: boolean = true;  
  character: GameCharacter; 

  get imageFile(): ImageFile {
    let image: ImageFile = null;
    if (this.gameCharacterService.get(this.sendFrom)) {
      image = this.gameCharacterService.get(this.sendFrom).imageFile;
    } else if (this.myPeer.image) {
      image = this.myPeer.image;
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

  getColor():string {
    if(this.character) {
      return this.gameCharacterService.color(this.sendFrom);
    }
    else return this.myColor;
  }

  get myColor(): string {
    if (PeerCursor.myCursor
      && PeerCursor.myCursor.color
      && PeerCursor.myCursor.color != PeerCursor.CHAT_TRANSPARENT_COLOR) {
      return PeerCursor.myCursor.color;
    }
    return PeerCursor.CHAT_DEFAULT_COLOR;
  }

  constructor(
    private gameCharacterService: GameCharacterService
  ) {     
    
  }

  ngOnInit(): void {
  }

  ngOnDestroy() {
  }

}
