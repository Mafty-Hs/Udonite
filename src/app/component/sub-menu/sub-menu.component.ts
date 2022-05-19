import {  AfterViewInit, Component, OnDestroy, OnInit, Input, Output, EventEmitter, ChangeDetectionStrategy, ChangeDetectorRef } from '@angular/core';
import { EventSystem } from '@udonarium/core/system';
import { FileArchiver } from '@udonarium/core/file-storage/file-archiver';
import { PanelOption, PanelService } from 'service/panel.service';
import { ChatMessageService } from 'service/chat-message.service';
import { CounterService } from 'service/counter.service';
import { ModalService } from 'service/modal.service';
import { SaveDataService } from 'service/save-data.service';
import { RoomService } from 'service/room.service';
import { RoundService } from 'service/round.service';
import { PlayerPaletteComponent } from 'component/chat/player-palette/player-palette.component';
import { CounterListComponent } from 'component/counter-list/counter-list.component';
import { CounterInventoryComponent } from 'component/counter-inventory/counter-inventory.component';
import { ChatWindowComponent } from 'component/chat/chat-window/chat-window.component';
import { FileStorageComponent } from 'component/file-storage/file-storage.component';
import { GameCharacterSheetComponent } from 'component/game-character-sheet/game-character-sheet.component';
import { GameObjectInventoryComponent } from 'component/game-object-inventory/game-object-inventory.component';
import { GameTableSettingComponent } from 'component/game-table-setting/game-table-setting.component';
import { LogSaveComponent } from 'component/log-save/log-save.component';
import { JukeboxComponent } from 'component/jukebox/jukebox.component';
import { EffectViewComponent } from 'component/effect-view/effect-view.component';
import { PeerMenuComponent } from 'component/peer-menu/peer-menu.component';
import { RoomControlComponent } from 'component/room-control/room-control.component';
import { SimpleInventoryComponent } from 'component/simple-inventory/simple-inventory.component';
import { DiceRollTableSettingComponent } from 'component/dice-roll-table-setting/dice-roll-table-setting.component';
import { CutInSettingComponent } from 'component/cut-in-setting/cut-in-setting.component';


@Component({
  selector: 'sub-menu',
  templateUrl: './sub-menu.component.html',
  styleUrls: ['./sub-menu.component.css'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class SubMenuComponent implements OnInit,OnDestroy {
  @Input() selectMenu:string;
  @Output() closeMe = new EventEmitter();
  private openPanelCount: number = 0;
  isSaveing: boolean = false;
  progresPercent: number = 0;

  get adminAuth():boolean {
    return this.roomService.adminAuth
  }

  get disableAllDataSave():boolean {
    return this.roomService.disableAllDataSave;
  }

  get disableTableSetting():boolean {
    return this.roomService.disableTableSetting;
  }

  get disableSetCounter():boolean {
    return this.roomService.disableSetCounter;
  }

  get disableCutinSetting():boolean {
    return this.roomService.disableCutinSetting;
  }

  get disableDiceRollSetting():boolean {
    return this.roomService.disableDiceRollSetting;
  }

  get disableRoundControl():boolean {
    return this.roomService.disableRoundControl;
  }

  get is2d():boolean {
    return this.roomService.roomData.is2d
  }

  isOpen(itemType :string):boolean {
    if (itemType == this.selectMenu)
      return true;
    else
      return false;
  }

  open(componentName: string) {
    let component: { new(...args: any[]): any } = null;
    let option: PanelOption = { width: 450, height: 600, left: 100 }
    switch (componentName) {
      case 'PeerMenuComponent':
        option.width = 400;
        component = PeerMenuComponent;
        break;
      case 'RoomControlComponent':
        option.width = 400;
        component = RoomControlComponent;
        break;
      case 'ChatWindowComponent':
        component = ChatWindowComponent;
        option.width = 700;
        break;
      case 'GameTableSettingComponent':
        component = GameTableSettingComponent;
        option = { width: 650, height: 450, left: 100 };
        break;
      case 'FileStorageComponent':
        component = FileStorageComponent;
        option.width = 700;
        break;
      case 'GameCharacterSheetComponent':
        component = GameCharacterSheetComponent;
        break;
      case 'JukeboxComponent':
        component = JukeboxComponent;
        break;
      case 'GameObjectInventoryComponent':
        component = GameObjectInventoryComponent;
        break;
      case 'CounterListComponent':
        component = CounterListComponent;
        option = { width:450 , height: 700 };
        break;
      case 'CounterInventoryComponent':
        component = CounterInventoryComponent;
        option =  { title: 'カウンター一覧', width: 800, height: 600 };
        break;
      case 'PlayerPaletteComponent':
        component = PlayerPaletteComponent;
        option = { width: 645, height: 400 };
        break;
      case 'DiceRollTableSettingComponent':
        component = DiceRollTableSettingComponent;
        option = { width: 645, height: 475 };
        break;
      case 'SimpleInventoryComponent':
        component = SimpleInventoryComponent;
        option = { title: "イニシアティブリスト", width: 650, height: 100 };
        break;
      case 'EffectViewComponent':
        component = EffectViewComponent;
        option = { width: 400, height: 370 };
        break;
      case 'CutInSettingComponent':
        component = CutInSettingComponent;
        option = { width: 700, height: 600 };
        break;
    }
    if (component) {
      if ((window.innerHeight - 50) < option.height ) option.height = window.innerHeight - 50;
      option.top = 50 + (this.openPanelCount % 10 + 1) * 20;
      option.left = 100 + (this.openPanelCount % 20 + 1) * 5;
      this.openPanelCount = this.openPanelCount + 1;
      this.panelService.open(component, option);
      this.closeMe.emit();
    }
  }

  constructor(
    private modalService: ModalService,
    private panelService: PanelService,
    private roomService: RoomService,
    private roundService: RoundService,
    private saveDataService: SaveDataService,
    private counterService: CounterService,
    private chatMessageService: ChatMessageService,
    private changeDetector: ChangeDetectorRef
  ) { }

  ngOnDestroy() {
    EventSystem.unregister(this);
  }

  ngOnInit(): void {
  }

  async save() {
    if (this.isSaveing) return;
    this.isSaveing = true;
    this.progresPercent = 0;

    let roomName = this.roomService.roomData.roomName
    ? this.roomService.roomData.roomName
    : 'chatlog';
      await this.saveDataService.saveRoomAsync(roomName, percent => {
      this.changeDetector.detectChanges();
      this.progresPercent = percent;
    });
    setTimeout(() => {
      this.isSaveing = false;
      this.progresPercent = 0;
      this.changeDetector.detectChanges();
    }, 500);
  }

  htmlsave(){
    this.modalService.open<string>(LogSaveComponent, { chatTabIdentifier: "" });

    this.closeMe.emit();
  }

  handleFileSelect(event: Event) {
    let input = <HTMLInputElement>event.target;
    let files = input.files;
    if (files.length) FileArchiver.instance.load(files);
    input.value = '';
  }

  resetRound() {
    this.roundService.reset();
    this.closeMe.emit();
  }

  diceAllOpne() {
    if (confirm('「一斉公開しない」設定ではないダイス、コインをすべて公開します。\nよろしいですか？')) {
      EventSystem.trigger('DICE_ALL_OPEN', null);
      this.chatMessageService.sendOperationLog("ダイス一斉公開","dice")
    }
    this.closeMe.emit();
  }

}
