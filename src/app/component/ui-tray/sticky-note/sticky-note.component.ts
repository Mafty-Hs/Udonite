import { Component, Input, OnInit } from '@angular/core';
import { ChatMessage } from '@udonarium/chat-message';
import { StickyNote } from '@udonarium/sticky-note';
import { PlayerService } from 'service/player.service';

@Component({
  selector: 'sticky-note',
  templateUrl: './sticky-note.component.html',
  styleUrls: ['./sticky-note.component.css']
})
export class StickyNoteComponent implements OnInit {
  @Input() stickyNote:StickyNote = null;
  localFontsize:number = 12;
  get bgColor():string {
    if (this.playerService.primaryChatWindowSetting) {
      return this.playerService.primaryChatWindowSetting.bgColor;
    }
    return 'black';
  }

  get chatMessages():ChatMessage[] {
    return this.stickyNote.getMessages();
  }

  trackByChatMessage(index: number, message: ChatMessage) {
    return message.identifier;
  }

  selectMessageIdentifier:string = "";

  selectMessage(message :ChatMessage) {
    if (this.selectMessageIdentifier === message.identifier) {
      this.selectMessageIdentifier = "";
      return;
    }
    this.selectMessageIdentifier = message.identifier;
  }

  constructor(
    private playerService:PlayerService
  ) { }

  ngOnInit(): void {
  }

}
