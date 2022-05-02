import { Injectable, NgZone } from '@angular/core';
import { ChatTab } from '@udonarium/chat-tab';
import { ChatMessage, ChatMessageContext } from '@udonarium/chat-message';
import { ChatMessageService } from 'service/chat-message.service';
import { FileArchiver } from '@udonarium/core/file-storage/file-archiver';
import { RoomService } from './room.service';
import { StringUtil } from '@udonarium/core/system/util/string-util';
import { PlayerService } from './player.service';

@Injectable({
  providedIn: 'root'
})
export class SaveHtmlService {

  constructor(
    private playerService: PlayerService,
    private chatMessageService: ChatMessageService,
    private roomService: RoomService,
  ) { }


  htmlHead1: string =
  "<?xml version=\'1.0\' encoding=\'UTF-8\'?>\r\n" +
  "<!DOCTYPE html PUBLIC \'-//W3C//DTD XHTML 1.0 Transitional//EN\' \'http://www.w3.org/TR/xhtml1/DTD/xhtml1-transitional.dtd\'>\r\n" +
  "<html xmlns=\'http://www.w3.org/1999/xhtml\' lang=\'ja\'>\r\n" +
  "<head>\r\n" +
  "<meta http-equiv=\'Content-Type\' content=\'text/html; charset=UTF-8\' />\r\n";
  htmlHeadWhite: string =
  "</head>\r\n" +
  "<body>\r\n" +
  '<div id="chatLog">\r\n';
  htmlHeadBlack: string =
  "</head>\r\n" +
  "<body>\r\n" +
  '<div id="chatLog" style="background-color:#212121; color: #FFF">\r\n';
  htmlFoot: string = '</div>\r\n</body>\r\n</HTML>\r\n';

  saveLog(logType :string ,targetTab: ChatTab|null,bgColor? :string) {
    let roomName:string = this.roomService.roomData.roomName
      ? this.roomService.roomData.roomName
      : 'chatlog';
    let chatTabList :ChatTab[] = [];
    let fileName:string = "";
    if (targetTab) {
      chatTabList.push(targetTab);
      fileName = roomName + "_" + targetTab.name  + "_" + this.timestamp();
    }
    else {
      chatTabList = this.chatMessageService.chatTabs;
      fileName = roomName + "_"  + this.timestamp();
    }
    let files: File[] = [];
    for (let chatTab of chatTabList) {
      let targetFilename:string = "";
      let logfile:File = null;
      if (!chatTab.isAllowed) continue;
      switch(logType) {
        case 'text':
          targetFilename = roomName + "_" + chatTab.name  + "_" + this.timestamp() + ".txt";
          logfile = this.makeText(targetFilename,chatTab)
          break;
        case 'html':
          targetFilename = roomName + "_" + chatTab.name  + "_" + this.timestamp() + ".html";
          logfile = this.makeHtml(targetFilename,chatTab,bgColor)
          break;
        case 'csv':
          targetFilename = roomName + "_" + chatTab.name  + "_" + this.timestamp() + ".csv";
          logfile = this.makeCsv(targetFilename,chatTab)
          break;
      }
      files.push(logfile)
    }
    if ( files.length > 0 ) FileArchiver.instance.saveAsync(files, fileName);
  }

  private makeText(fileName: string ,targetTab: ChatTab):File {
    let logdata: string = this.convertToText(targetTab);
    let textfile: File = new File([logdata], fileName, { type: 'text/plain' });
    return textfile;
  }

  private makeHtml(fileName: string ,targetTab: ChatTab,bgColor :string ):File {
    let logdata: string = this.convertToHtml(targetTab ,bgColor);
    let htmlfile: File = new File([logdata], fileName, { type: 'text/plain' });
    return htmlfile;
  }

  private makeCsv(fileName: string ,targetTab: ChatTab):File {
    let logdata: string = this.convertToCsv(targetTab);
    let textfile: File = new File([logdata], fileName, { type: 'text/plain' });
    return textfile;
  }

  private convertToText(targetTab: ChatTab): string {
    let text:string = "";
    let chatMessages = targetTab.chatMessages;
    for (const _chatMessage of chatMessages) {
      text = text + this.addText(_chatMessage, targetTab.name);
    }
    return text;
  }

  private convertToHtml(targetTab: ChatTab,bgColor :string): string {
    let htmlText:string;
    let chatMessages = targetTab.chatMessages;
    htmlText = this.htmlHead1;
    htmlText = htmlText + '<title>' + 'チャットログ：' + targetTab.name + '</title>\r\n';
    htmlText = bgColor == 'white' ? htmlText + this.htmlHeadWhite : htmlText + this.htmlHeadBlack;
    for (const _chatMessage of chatMessages) {
      htmlText = htmlText + this.addHtml(_chatMessage, targetTab.name, bgColor);
    }
    htmlText = htmlText + this.htmlFoot;
    return htmlText;
  }

  private convertToCsv(targetTab: ChatTab): string {
    let csv:string = "";
    //csv = this.csvTitle;
    let chatMessages = targetTab.chatMessages;
    for (const _chatMessage of chatMessages) {
      csv = csv + this.addCsv(_chatMessage, targetTab.name);
    }
    return csv;
  }

  private addText(_chatMessage:  ChatMessageContext ,tabName :string): string {
    let chatText:string;
    let chatTabName:string = "[" + tabName + "]";
    let text:string =  this.rubyToText(StringUtil.escapeHtmlAndRuby(_chatMessage.text));
    chatText = chatTabName;
    chatText = chatText + _chatMessage.name + " : ";
    chatText = chatText + text + '\r\n';
    return chatText;
  }

  private addHtml(_chatMessage:  ChatMessageContext ,tabName :string ,bgColor :string): string{
    let chatText:string;
    let chatTabName:string = "[" + tabName + "]";
    let text:string =  StringUtil.escapeHtmlAndRuby(_chatMessage.text).replace(/\n/g, '<br>');
    let color = bgColor == 'white' ?
    (_chatMessage.color === this.playerService.CHAT_WHITETEXT_COLOR ? this.playerService.CHAT_BLACKTEXT_COLOR : _chatMessage.color) :
    (_chatMessage.color === this.playerService.CHAT_BLACKTEXT_COLOR ? this.playerService.CHAT_WHITETEXT_COLOR : _chatMessage.color) ;
    chatText = chatTabName;
    chatText = chatText + '<font color="' + color + '">';
    chatText = chatText + "<b>" + _chatMessage.name + "</b>";
    chatText = chatText + "</font>" + ":" +
     ' <font color="' + _chatMessage.color + '">';
    chatText = chatText + text + '</font><br>\r\n';
    return chatText;
  }

  private addCsv(_chatMessage:  ChatMessageContext ,tabName :string): string {
    let text:string =  this.rubyToText(StringUtil.escapeHtmlAndRuby(_chatMessage.text).replace(/\n/g, ' '));
    let csvData:string[] = [ tabName , this.castTimestamp(_chatMessage.timestamp) , _chatMessage.color , _chatMessage.name , text ]
    let csvText:string = "";
    for (let data of csvData) {
      csvText += '"' + data.replace(/\"/g, '\"\"') + '",';
    }
    return csvText + '\r\n';
  }

  rubyToText(rubiedText :string):string {
    if (rubiedText.match(/<ruby>/g)) {
      return rubiedText
      .replace(/<ruby>/g,'')
      .replace(/<\/ruby>/g,'')
      .replace(/<rt>/g,'(')
      .replace(/<\/rt>/g,')');
    }
    return rubiedText;
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
}
