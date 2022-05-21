import { Component, Input, OnInit } from '@angular/core';
import { ChatMessage } from '@udonarium/chat-message';
import { StickyNote } from '@udonarium/sticky-note';

@Component({
  selector: 'sticky-note',
  templateUrl: './sticky-note.component.html',
  styleUrls: ['./sticky-note.component.css']
})
export class StickyNoteComponent implements OnInit {
  @Input() stickyNote:StickyNote = null;
  localFontsize:number = 12;
  bgColor:string = 'black';

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

  constructor() { }

  ngOnInit(): void {
  }

}
