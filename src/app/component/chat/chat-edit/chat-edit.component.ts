import { AfterViewInit, Component, OnDestroy, OnInit, Input, Output,EventEmitter } from '@angular/core';
import { ChatMessage } from '@udonarium/chat-message';

@Component({
  selector: 'chat-edit',
  templateUrl: './chat-edit.component.html',
  styleUrls: ['../chat-input.common.css','./chat-edit.component.css','../chat-window.design.css']
})
export class ChatEditComponent implements OnInit, OnDestroy, AfterViewInit {

  constructor() { }
  text: string = "";
  @Input() chatMessage: ChatMessage;
  @Input() isBlack: boolean = true;
  @Output() toggleEdit = new EventEmitter();


  save() {
    this.chatMessage.text = this.text;
    if (!this.chatMessage.tags.includes("edit"))
      this.chatMessage.tag = this.chatMessage.tag + " edit";
    this.toggleEdit.emit();
  }
  cancel() {
    this.toggleEdit.emit()
  }

  ngOnInit(): void {
    this.text = this.chatMessage.text;
  }

  ngAfterViewInit(): void {

  }

  ngOnDestroy(): void {

  }

}
