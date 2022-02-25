import { Counter } from '@udonarium/counter';
import { Component, OnDestroy, OnInit,ElementRef,HostListener,AfterViewInit} from '@angular/core';
import { EventSystem } from '@udonarium/core/system';
import { ObjectStore } from '@udonarium/core/synchronize-object/object-store';
import { GameCharacter } from '@udonarium/game-character';
import { PanelOption, PanelService } from 'service/panel.service';
import { CounterService } from 'service/counter.service';
import { PointerDeviceService } from 'service/pointer-device.service';
import { ContextMenuAction, ContextMenuSeparator, ContextMenuService} from 'service/context-menu.service';
import { ChatTab } from '@udonarium/chat-tab';
import { ChatTabList } from '@udonarium/chat-tab-list';
import { ChatMessageService } from 'service/chat-message.service';
import { GameCharacterService } from 'service/game-character.service';
import { CounterInventoryComponent } from 'component/counter-inventory/counter-inventory.component';
import { HelpComponent } from 'component/help/help.component';

@Component({
  selector: 'counter-list',
  templateUrl: './counter-list.component.html',
  styleUrls: ['./counter-list.component.css'],
})

export class CounterListComponent implements OnInit,OnDestroy,AfterViewInit {

  private _inputName:string = "";
  private _inputDesc:string = "";
  private _inputAge:number = 0;
  private _inputPermanent:boolean = false;
  private _inputDuplicate:boolean = false;
  private _inputComment:string = "";
  get inputName(): string { return this._inputName };
  set inputName(inputName: string) { this._inputName = inputName };
  get inputDesc(): string { return this._inputDesc };
  set inputDesc(inputDesc: string) { this._inputDesc = inputDesc };
  get inputAge(): number { return this._inputAge };
  set inputAge(inputAge: number) { this._inputAge = inputAge };
  get inputPermanent(): boolean { return this._inputPermanent };
  set inputPermanent(inputPermanent: boolean) { this._inputPermanent = inputPermanent };
  get inputDuplicate(): boolean { return this._inputDuplicate };
  set inputDuplicate(inputDuplicate: boolean) { this._inputDuplicate = inputDuplicate };
  get inputComment(): string { return this._inputComment };
  set inputComment(inputComment: string) { this._inputComment = inputComment };

  selectedCharacter:string = 'default';
  get gameCharacters(): GameCharacter[] {
    let OnlyTable = true;
    return this.gameCharacterService.list(OnlyTable);
  };
  private selectCount:string = "";
  private selectElm: HTMLElement;
  private topStart: number;
  private leftStart: number;
  private isDrag:boolean = false;

  private chatTabidentifier:string;
  get chatTab(): ChatTab { 
    if(!this.chatTabidentifier) {
       this.chatTabidentifier = ChatTabList.instance.chatTabs[0].identifier
    }
    return ObjectStore.instance.get<ChatTab>(this.chatTabidentifier);     
  }
  
  get counterList():Counter[] {
    return this.counterService.list();
  }

  addCounter() {
    this.counterService.create(this.inputName,this.inputDesc,this.inputDuplicate,this.inputPermanent,this.inputAge);
    this.inputName = "";
    this.inputDesc = "";
    this.inputAge = 0;
    this.inputPermanent = false;
    this.inputDuplicate = false;
  }

  getCharacter(identifier: string): GameCharacter {
    return this.gameCharacterService.get(identifier);
  }
 
  getCounter(identifier: string): Counter {
    return this.counterService.get(identifier);
  }

  get isPointerDragging(): boolean { 
  return this.pointerDeviceService.isDragging; }

  makeElm(selectElm :HTMLElement) : HTMLElement {
    let element = selectElm.cloneNode(true) as HTMLElement;
    element.style.zIndex = "999999";
    element.style.position = "absolute";
//    element.style.top = this.leftStart + "";
//    element.style.left = this.topStart + "";
    document.body.appendChild(element);
    return element;
  }

  selectCounter(e: Event,_counter: Counter) {
    if(!this.isDrag) {
      this.selectCount = _counter.identifier;
      this.leftStart = this.pointerDeviceService.pointerX;
      this.topStart = this.pointerDeviceService.pointerY;
      let element : HTMLElement = document.getElementById(this.selectCount) as HTMLElement;
      this.selectElm = this.makeElm(element);
      this.isDrag = true;
    }
    e.stopPropagation();
    e.preventDefault();
  }

   onSelect(characterIdentifier: string) {
     document.body.removeChild(this.selectElm);
     if (this.getCharacter(characterIdentifier)){       
       let message :string = this.getCounter(this.selectCount).name + "を"　+ this.getCharacter(characterIdentifier).name + "に付与 :" + this.inputComment;
       this.chat(message);
       this.counterService.assign(this.selectCount, characterIdentifier, this.inputComment);
     }
     this.selectCount = "";
     this.isDrag = false; 
  }

  @HostListener("document:mousemove", ["$event"])
   public onMouseMove(e: MouseEvent) {
     if (this.isDrag && this.selectElm){
       let posX:number = e.clientX - 50;
       let posY:number = e.clientY - 50;
       this.selectElm.style.transform = 'translate(' + posX + 'px, ' + posY + 'px)';
     }
   }
  constructor(
   public element: ElementRef,
   public chatMessageService: ChatMessageService,
   private pointerDeviceService: PointerDeviceService,
   private panelService: PanelService,
   private contextMenuService: ContextMenuService,
   private counterService: CounterService,
   private gameCharacterService: GameCharacterService
  ) {
   }

  public ngAfterViewInit() {
  }

  ngOnInit(): void {
    Promise.resolve().then(() => this.panelService.title = 'カウンターリスト');
    EventSystem.register(this)
      .on('SELECT_TABLETOP_OBJECT', -1000, event => {
        if (this.isDrag) {
          this.onSelect(event.data.identifier);
        }
     });
  }

  ngOnDestroy() {
    EventSystem.unregister(this);
  }

  private chat(chattext: string) {
    let chatCharacter:GameCharacter
    let isCharacter:boolean = false;
    if (this.selectedCharacter != 'default'){
      isCharacter = true;
      chatCharacter = this.getCharacter(this.selectedCharacter);
    }
    this.chatMessageService.sendMessage
      (
      this.chatTab,
      chattext,
      "",
      isCharacter ? chatCharacter.identifier : "System",
      "",
      false,
      false,
      false,
      ""
     );
  }

  openHelp() {
    let option: PanelOption = { width: 800 , height: 600, left: 50, top: 100 };
    let component = this.panelService.open(HelpComponent,option);
    component.menu = "counter";
  }

  openInventory(){
    let coordinate = this.pointerDeviceService.pointers[0];
    let title = 'カウンターインベントリ';
    let option: PanelOption = { title: title, width: 800, height: 600 }
    let component = this.panelService.open<CounterInventoryComponent>(CounterInventoryComponent, option);
  }

    displayContextMenu(e: Event, _counter:Counter){
    e.stopPropagation();
    e.preventDefault();

    if (!this.pointerDeviceService.isAllowedToOpenContextMenu) return;
    let position = this.pointerDeviceService.pointers[0];

    let actions: ContextMenuAction[] = [];
      actions.push({
        name: "名前：" + _counter.name
      });
      actions.push({
        name: "持続：" + (_counter.isPermanent ? "永続" : (String(_counter.age) + "R"))
      });
      actions.push({
        name: "重複：" + (_counter.canDuplicate ? "可能" : "不可" )
      });

      let desc_ = this.strcut(("説明：" + _counter.desc),15);
      for (let str of desc_){
        actions.push({
        name: str
        });
      }
      actions.push(ContextMenuSeparator);
      actions.push({ name: '削除', action: () => { _counter.destroy(); } });
    this.contextMenuService.open(position, actions, 'カウンター詳細');
  }
  
  private strcut(text :string , length :number):string[] {
    let result:string[] = [];
    let start:number = 0;
    for (start; start < text.length; start += length) {
      result.push(text.substring(start, start + length));
    }
    result.push(text.substring(start, text.length));
    return result;
  }
}
