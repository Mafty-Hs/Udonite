import {
  AfterViewChecked,
  AfterViewInit,
  ChangeDetectionStrategy,
  ChangeDetectorRef,
  Component,
  ElementRef,
  EventEmitter,
  Input,
  NgZone,
  OnChanges,
  OnDestroy,
  OnInit,
  Output,
  ViewChild,
} from '@angular/core';
import { ChatMessage } from '@udonarium/chat-message';
import { ChatTab } from '@udonarium/chat-tab';
import { ObjectStore } from '@udonarium/core/synchronize-object/object-store';
import { EventSystem } from '@udonarium/core/system';
import { ResettableTimeout } from '@udonarium/core/system/util/resettable-timeout';
import { setZeroTimeout } from '@udonarium/core/system/util/zero-timeout';

interface easeMessage {
  name :string;
  text: string;
  color: string;
}

@Component({
  selector: 'chat-tab-ease',
  templateUrl: './chat-tab-ease.component.html',
  styleUrls: ['./chat-tab-ease.component.css'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ChatTabEaseComponent implements OnInit {

  @Input() localFontsize: number = 14;
  @Input() bgColor: string = "grey";
  @Input() chatTab: ChatTab;

  private needUpdate:boolean = true;

  private _chatMessages: easeMessage[] = [];
  get chatMessages(): easeMessage[] {
    if (!this.chatTab) return [];
    if (this.needUpdate) {
      this.needUpdate = false;
      this._chatMessages = this.chatTab ? this.chatTab.chatMessages
       .map(message => {
         let newMessage:easeMessage = {
           name: message.name,
           text: message.text,
           color: message.color
         };
         return newMessage; 
      }) : [];
    }
    return this._chatMessages;
  }  

  ngOnInit(){
  }

  constructor(
    private ngZone: NgZone,
    private changeDetector: ChangeDetectorRef,
  ) { 
    EventSystem.register(this)
      .on('MESSAGE_ADDED', event => {
        let message = ObjectStore.instance.get<ChatMessage>(event.data.messageIdentifier);
        if (!message || !this.chatTab.contains(message)) return;
          this.changeDetector.detectChanges();
          this.needUpdate = true;
     })
  }
}
