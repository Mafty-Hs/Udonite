import { animate, keyframes, style, transition, trigger } from '@angular/animations';
import { AfterViewInit, ChangeDetectionStrategy, Component, Input, OnInit } from '@angular/core';

import { ChatMessage } from '@udonarium/chat-message';
import { ImageFile } from '@udonarium/core/file-storage/image-file';
import { StickyNote } from '@udonarium/sticky-note';
import { ChatMessageService } from 'service/chat-message.service';
import { PlayerService } from 'service/player.service';

@Component({
  selector: 'chat-message',
  templateUrl: './chat-message.component.html',
  styleUrls: ['./chat-message.component.css','../chat-message.sticky-note.css'],
  animations: [
    trigger('flyInOut', [
      transition('* => active', [
        animate('200ms ease-out', keyframes([
          style({ transform: 'translateX(-100px)', opacity: '0', offset: 0 }),
          style({ transform: 'translateX(0)', opacity: '1', offset: 1.0 })
        ]))
      ]),
      transition('void => *', [
        animate('200ms ease-out', keyframes([
          style({ opacity: '0', offset: 0 }),
          style({ opacity: '1', offset: 1.0 })
        ]))
      ])
    ]),
  ],
  changeDetection: ChangeDetectionStrategy.Default
})

export class ChatMessageComponent implements OnInit, AfterViewInit {
  @Input() chatMessage: ChatMessage;
  imageFile: ImageFile = ImageFile.Empty;
  animeState: string = 'inactive';
  @Input() localFontsize: number = 14;
  @Input() bgColor: string = "black";
  @Input() isSelected: boolean = false;

  imgStyle:object = {};
  auraStyle:object = {};

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
    let file: ImageFile = this.chatMessage.image;
    if (file) this.imageFile = file;
    let time = this.chatMessageService.getTime();
    if (time - 10 * 1000 < this.chatMessage.timestamp) this.animeState = 'active';
    this.imgStyle = this.chatMessage.imgStyle;
    this.auraStyle = this.chatMessage.auraStyle;
  }

  ngAfterViewInit() {
  }

  discloseMessage() {
    this.chatMessage.tag = this.chatMessage.tag.replace('secret', '');
  }
}
