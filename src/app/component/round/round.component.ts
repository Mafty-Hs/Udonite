import { CounterAssign } from '@udonarium/counter';
import { ChatTab } from '@udonarium/chat-tab';
import { ChatTabList } from '@udonarium/chat-tab-list';
import { Component, OnInit} from '@angular/core';
import { CounterService } from 'service/counter.service';
import { ChatMessageService } from 'service/chat-message.service';
import { ContextMenuAction, ContextMenuService } from 'service/context-menu.service';
import { PointerDeviceService } from 'service/pointer-device.service';


@Component({
  selector: 'round',
  templateUrl: './round.component.html',
  styleUrls: ['./round.component.css']
})
export class RoundComponent implements OnInit {

  constructor(
    public chatMessageService: ChatMessageService,
    private counterService: CounterService,
    private contextMenuService: ContextMenuService,
    private pointerDeviceService: PointerDeviceService,
  ) { }

  get chatTabs(): ChatTab[] {
    return ChatTabList.instance.chatTabs;
  } 

  get chatTab(): ChatTab { return this.counterService.round.tab };
  set chatTab(tab: ChatTab) {
    this.counterService.round.tab = tab;
  };
  get round(): number { return this.counterService.round.count };
  set round(count: number) {
    this.counterService.round.count = count;
  };

  ngOnInit(): void {
  }

   addRound() {
    this.round = this.round + 1;
    let message:string = "第" + this.round + "ラウンド";
    this.chat(message);
    this.counterService.assignedList().forEach(function (value) {
      value.aging();
    });
  }

  resetRound() {
    this.round = 0;
  }

  displayContextMenu(e: Event){
    e.stopPropagation();
    e.preventDefault();

    if (!this.pointerDeviceService.isAllowedToOpenContextMenu) return;
    let position = this.pointerDeviceService.pointers[0];

    let actions: ContextMenuAction[] = [];

    for (const Tab of this.chatTabs) {
      actions.push({
        name: Tab.name , action: () => {
          this.setChatTab(Tab)
        },
      });
    };
    this.contextMenuService.open(position, actions, '出力先チャットタブ選択');
  }

  private setChatTab(tab :ChatTab) {
    this.chatTab = tab;
  }

  private chat(chattext: string) {
    if (!this.chatTabs.includes(this.chatTab)) {
      this.chatTab = this.chatTabs[0];  
    }

    this.chatMessageService.sendMessage
      (
      this.chatTab,
      chattext,
      "",
      "System",
      "",
      "",
      false,
      false,
      false,
      -1,
      false,
      null,
      null,
      "",
      false
     );
  }

}
