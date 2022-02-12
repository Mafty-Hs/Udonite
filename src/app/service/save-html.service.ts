import { Injectable, NgZone } from '@angular/core';
import { ChatTab } from '@udonarium/chat-tab';
import { ChatMessage, ChatMessageContext } from '@udonarium/chat-message';
import { ChatMessageService } from 'service/chat-message.service';
import { FileArchiver } from '@udonarium/core/file-storage/file-archiver';
import { RoomService } from './room.service';
import { StringUtil } from '@udonarium/core/system/util/string-util';

@Injectable({
  providedIn: 'root'
})
export class SaveHtmlService {

  constructor(
    private chatMessageService: ChatMessageService,
    private roomService: RoomService,
    private ngZone: NgZone
  ) { }

  allTabs: ChatTab[]; 

  htmlHead1: string = 
  "<?xml version=\'1.0\' encoding=\'UTF-8\'?>\r\n" +
  "<!DOCTYPE html PUBLIC \'-//W3C//DTD XHTML 1.0 Transitional//EN\' \'http://www.w3.org/TR/xhtml1/DTD/xhtml1-transitional.dtd\'>\r\n" +
  "<html xmlns=\'http://www.w3.org/1999/xhtml\' lang=\'ja\'>\r\n" +
  "<head>\r\n" +
  "<meta http-equiv=\'Content-Type\' content=\'text/html; charset=UTF-8\' />\r\n";
  htmlHead2: string =
  "</head>\r\n" +
  "<body>\r\n" +
  '<div id="chatLog">\r\n';
  htmlFoot: string = '</div>\r\n</body>\r\n</HTML>\r\n';

  saveAllHtmlLog() {
    let thisRoomName:string = this.roomService.roomData.roomName
      ? this.roomService.roomData.roomName
      : 'chatlog';
    let fileName:string;
    this.allTabs = this.chatMessageService.chatTabs;
    let files: File[] = [];

    for (const targetTab of this.allTabs) {
      fileName = thisRoomName + "_" + targetTab.name  + "_" + this.timestamp();
      files.push(this.makeHtml(targetTab, fileName));
    }
      fileName = thisRoomName + "_"  + this.timestamp();
    FileArchiver.instance.saveAsync(files, fileName);
  }  

  saveHtmlLog(targetTab: ChatTab) {
    let thisRoomName:string = this.roomService.roomData.roomName
    ? this.roomService.roomData.roomName
    : 'chatlog';
    let fileName:string = thisRoomName + "_" + targetTab.name  + "_" + this.timestamp();
    let files: File[] = [];

    files.push(this.makeHtml(targetTab, fileName));
    FileArchiver.instance.saveAsync(files, fileName);
  }

  private makeHtml(targetTab: ChatTab, fileName: string):File {
    let logdata: string = this.convertToHtml(targetTab);
    let dataName: string = fileName + ".html"; 
    let htmlfile: File = new File([logdata], dataName, { type: 'text/plain' });
    return htmlfile;
  }

  private convertToHtml(targetTab: ChatTab): string {
    let htmlText:string;
    let chatMessages = targetTab.chatMessages;
    htmlText = this.htmlHead1;
    htmlText = htmlText + '<title>' + 'チャットログ：' + targetTab.name + '</title>\r\n';
    htmlText = htmlText + this.htmlHead2;
    for (const _chatMessage of chatMessages) {
      htmlText = htmlText + this.addHtml(_chatMessage);
    }
    htmlText = htmlText + this.htmlFoot;
    return htmlText;
  }

  private addHtml(_chatMessage:  ChatMessageContext){
    let chatText:string;    
    let chatTabName:string = "[" + this.getTabName(_chatMessage.tabIdentifier) + "]"; 
    let text:string =  StringUtil.escapeHtmlAndRuby(_chatMessage.text).replace(/\n/g, '<br>');   
    chatText = chatTabName;
    chatText = chatText + '<font color="' + _chatMessage.color + '">';
    chatText = chatText + "<b>" + _chatMessage.name + "</b>"
    chatText = chatText + "</font>" + ":" +
     ' <font color="' + _chatMessage.color + '">';
    chatText = chatText + text + '</font><br>\r\n'
    return chatText;
  }

  private timestamp(): string {
    let date = new Date();
    let year = date.getFullYear();
    let month = ('00' + (date.getMonth() + 1)).slice(-2);
    let day = ('00' + date.getDate()).slice(-2);
    let hours = ('00' + date.getHours()).slice(-2);
    let minutes = ('00' + date.getMinutes()).slice(-2);
    
    return `_${year}-${month}-${day}_${hours}${minutes}`;
  }

  private castTimestamp(_date: number): string {
    let date = new Date(_date)
    let year = date.getFullYear();
    let month = ('00' + (date.getMonth() + 1)).slice(-2);
    let day = ('00' + date.getDate()).slice(-2);
    let hours = ('00' + date.getHours()).slice(-2);
    let minutes = ('00' + date.getMinutes()).slice(-2);
    let seconds = ('00' + date.getSeconds()).slice(-2);
    
    return `${year}/${month}/${day} ${hours}:${minutes}:${seconds}`;
  }
  private getTabName(tabIdentifier:string):string {
    this.allTabs = this.chatMessageService.chatTabs;
    for (const tabName of this.allTabs) {
      if (tabName.identifier == tabIdentifier) {
        return tabName.name;
      }
    }
    return "";
  }
}
