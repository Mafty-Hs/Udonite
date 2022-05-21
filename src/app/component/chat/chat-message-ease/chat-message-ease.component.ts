import { AfterViewInit, ChangeDetectionStrategy, Component, Input, OnInit } from '@angular/core';

import { ChatMessage } from '@udonarium/chat-message';
import { StickyNote } from '@udonarium/sticky-note';
import { ChatMessageService } from 'service/chat-message.service';
import { PlayerService } from 'service/player.service';

@Component({
  selector: 'chat-message-ease',
  templateUrl: './chat-message-ease.component.html',
  styleUrls: ['./chat-message-ease.component.css','../chat-message.sticky-note.css']
})
export class ChatMessageEaseComponent implements OnInit, AfterViewInit  {

  @Input() chatMessage: ChatMessage;
  @Input() localFontsize: number = 14;
  @Input() bgColor: string = "black";
  @Input() isSelected: boolean = false;

  get isBlack():boolean {
    if (this.bgColor == 'black')
      return true;
    else
      return false;
  }

  get mySticky():boolean {return this.playerService.myPlayer.stickyNote.chatMessageIdentifiers.includes(this.chatMessage.identifier)}
  toggleMySticky(e:Event) {
    e.stopPropagation();
    e.preventDefault();
    if (this.mySticky) this.playerService.myPlayer.stickyNote.removeMessage(this.chatMessage.identifier);
    else this.playerService.myPlayer.stickyNote.addMessage(this.chatMessage.identifier);
  }
  get shareSticky():boolean {return StickyNote.Shared.chatMessageIdentifiers.includes(this.chatMessage.identifier)}
  toggleShareSticky(e:Event) {
    e.stopPropagation();
    e.preventDefault();
    if (this.shareSticky) StickyNote.Shared.removeMessage(this.chatMessage.identifier);
    else StickyNote.Shared.addMessage(this.chatMessage.identifier);
  }

  constructor(
    private chatMessageService: ChatMessageService,
    private playerService: PlayerService
  ) { }

  ngOnInit() {
  }

  ngAfterViewInit() {
  }

  discloseMessage() {
    this.chatMessage.tag = this.chatMessage.tag.replace('secret', '');
  }

}
