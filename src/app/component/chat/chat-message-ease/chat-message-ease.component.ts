import { AfterViewInit, ChangeDetectionStrategy, Component, Input, OnInit } from '@angular/core';

import { ChatMessage } from '@udonarium/chat-message';
import { ChatMessageService } from 'service/chat-message.service';

@Component({
  selector: 'chat-message-ease',
  templateUrl: './chat-message-ease.component.html',
  styleUrls: ['./chat-message-ease.component.css']
})
export class ChatMessageEaseComponent implements OnInit, AfterViewInit  {

  @Input() chatMessage: ChatMessage;
  @Input() localFontsize: number = 14;
  @Input() bgColor: string = "black";

  get isBlack():boolean {
    if (this.bgColor == 'black')
      return true;
    else
      return false;
  }

  constructor(
    private chatMessageService: ChatMessageService
  ) { }

  ngOnInit() {
  }

  ngAfterViewInit() {
  }

  discloseMessage() {
    this.chatMessage.tag = this.chatMessage.tag.replace('secret', '');
  }

}
