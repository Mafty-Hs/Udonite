import { Component, OnInit, AfterViewInit } from '@angular/core';
import { ModalService } from 'service/modal.service';
import { ObjectStore } from '@udonarium/core/synchronize-object/object-store';
import { ChatTab } from '@udonarium/chat-tab';
import { SaveHtmlService } from 'service/save-html.service';
import { PlayerService } from 'service/player.service';

@Component({
  selector: 'log-save',
  templateUrl: './log-save.component.html',
  styleUrls: ['./log-save.component.css']
})
export class LogSaveComponent implements OnInit, AfterViewInit {

  chatTabIdentifier:string = ""
  logType:string = "html";
  bgColor:string = "white";
  timeStamp:boolean = false;
  mergeLog:boolean = false;

  get chatTab():ChatTab|null {
    if (!this.chatTabIdentifier) return null;
    return ObjectStore.instance.get<ChatTab>(this.chatTabIdentifier);
  }
  get chatTabName():string {
    if (!this.chatTab) return "全てのタブ"
    return this.chatTab.name
  }

  constructor(
    private modalService: ModalService,
    private playerService: PlayerService,
    private saveHtmlService: SaveHtmlService
  ) {
  }

  ngOnInit(): void {
  }

  ngAfterViewInit(): void {
    Promise.resolve().then(() => {
      if (this.modalService.option && this.modalService.option?.chatTabIdentifier)
      this.chatTabIdentifier = this.modalService.option?.chatTabIdentifier;
      this.modalService.title =  'ログ保存 - ' + this.chatTabName;
      this.modalService.width = 400;
      if (this.playerService.primaryChatWindowSetting) {
        this.bgColor = this.playerService.primaryChatWindowSetting.bgColor == 'black' ? 'black' : 'white';
      }
    });
  }

  saveLog() {
    this.saveHtmlService.saveLog(this.logType,this.chatTab,this.bgColor,this.timeStamp,this.mergeLog)
    this.modalService.resolve();
  }

}
