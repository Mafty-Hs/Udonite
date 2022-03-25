import {
  AfterViewInit,
  Component,
  ElementRef,
  EventEmitter,
  ChangeDetectorRef,
  Input,
  Output,
  NgZone,
  OnDestroy,
  OnInit,
  ViewChild,
} from '@angular/core';
import { ChatMessage } from '@udonarium/chat-message';
import { ChatTab } from '@udonarium/chat-tab';
import { ObjectStore } from '@udonarium/core/synchronize-object/object-store';
import { EventSystem } from '@udonarium/core/system';
import { StringUtil } from '@udonarium/core/system/util/string-util';

interface easeMessage {
  name :string;
  html: string;
  color: string;
  identifier: string;
  isDirect :boolean;
  isSecret :boolean;
  isSendFromSelf :boolean;
}

@Component({
  selector: 'chat-tab-ease',
  templateUrl: './chat-tab-ease.component.html',
  styleUrls: ['./chat-tab-ease.component.css'],
})
export class ChatTabEaseComponent implements OnInit {
  @ViewChild('messageContainer') messageContainer: ElementRef;

  _localFontsize: number = 14;
  @Input() set localFontsize(localFontsize :number){
    this._localFontsize = localFontsize;
    this.needUpdate = true;
    this.changeDetectorRef.detectChanges();
  }
  get localFontsize(): number {return this._localFontsize;}
  _bgColor: string = "grey";
  @Input() set bgColor(bgColor :string){
    this._bgColor = bgColor;
    this.needUpdate = true;
    this.changeDetectorRef.detectChanges();
  }
  get bgColor(): string {return this._bgColor;}
  private _chatTab: ChatTab;
  @Input() set chatTab(chatTab: ChatTab){
    this._chatTab = chatTab;
    this.needUpdate = true;
  }
  get chatTab(): ChatTab {return this._chatTab;}
  get isBlack() {return (this.bgColor == "black")}
  needUpdate:boolean = true;

  @Output() onAddMessage: EventEmitter<null> = new EventEmitter();
  private addMessageEventTimer: NodeJS.Timer = null;

  private _chatMessages: easeMessage[] = [];
  get chatMessages(): easeMessage[] {
    if (!this.chatTab) return [];
    if (this.needUpdate) {
      this._chatMessages = this.chatTab ? this.chatTab.chatMessages
       .map(message => {
         let color:string = message.color;
         if (message.isDirect || message.isSecret) color = "#DDD";
         if (message.isSystem) color = "#444444";
         if (this.isBlack && color == "#444444") color = "#EEE";
         if (message.isDicebot || message.isCalculate) color = this.isBlack ? "#CCF"  : "#22F";
         let newMessage:easeMessage = {
           name: message.name,
           html: this.escapeHtmlAndRuby(message.text),
           color: color,
           identifier: message.identifier,
           isDirect: message.isDirect,
           isSecret: message.isSecret,
           isSendFromSelf: message.isSendFromSelf
         };
         return newMessage;
      }) : [];
      this.needUpdate = false;
    }
    return this._chatMessages;
  }

  escapeHtmlAndRuby(text :string):string {
   return StringUtil.escapeHtmlAndRuby(text);
  }

  ngOnInit(){
  }

  discloseMessage(index :number,identifier :string) {
    let message = this.chatTab.chatMessages[index];
    if (message.identifier != identifier) {
      message = this.chatTab.getMessage(identifier);
      if(!message) return;
    }
    message.tag = message.tag.replace('secret', '');
    this.needUpdate = true;
  }

  constructor(
    private ngZone: NgZone,
    private changeDetectorRef: ChangeDetectorRef
  ) {
    EventSystem.register(this)
      .on('MESSAGE_ADDED', event => {
        let message = ObjectStore.instance.get<ChatMessage>(event.data.messageIdentifier);
        if (!message || !this.chatTab.contains(message)) return;
        this.needUpdate = true;
        this.onMessageInit();
     })
  }

  onMessageInit() {
    if (this.addMessageEventTimer != null) return;
    this.ngZone.runOutsideAngular(() => {
      this.addMessageEventTimer = setTimeout(() => {
        this.addMessageEventTimer = null;
        this.ngZone.run(() => this.onAddMessage.emit());
      }, 0);
    });
  }

}
