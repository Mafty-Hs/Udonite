import {  AfterViewInit, Component, OnDestroy, OnInit, Input, Output, EventEmitter } from '@angular/core';
import { EventSystem, Network } from '@udonarium/core/system';
import { FileArchiver } from '@udonarium/core/file-storage/file-archiver';
import { PanelOption, PanelService } from 'service/panel.service';
import { CounterService } from 'service/counter.service';
import { SaveDataService } from 'service/save-data.service';
import { SaveHtmlService } from 'service/save-html.service';
import { PlayerPaletteComponent } from 'component/player-palette/player-palette.component';
import { CounterListComponent } from 'component/counter-list/counter-list.component';
import { ChatWindowComponent } from 'component/chat-window/chat-window.component';
import { FileStorageComponent } from 'component/file-storage/file-storage.component';
import { GameCharacterGeneratorComponent } from 'component/game-character-generator/game-character-generator.component';
import { GameCharacterSheetComponent } from 'component/game-character-sheet/game-character-sheet.component';
import { GameObjectInventoryComponent } from 'component/game-object-inventory/game-object-inventory.component';
import { GameTableSettingComponent } from 'component/game-table-setting/game-table-setting.component';
import { JukeboxComponent } from 'component/jukebox/jukebox.component';
import { EffectViewComponent } from 'component/effect-view/effect-view.component';
import { PeerMenuComponent } from 'component/peer-menu/peer-menu.component';
import { DiceRollTableSettingComponent } from 'component/dice-roll-table-setting/dice-roll-table-setting.component';
import { CutInSettingComponent } from 'component/cut-in-setting/cut-in-setting.component';


@Component({
  selector: 'sub-menu',
  templateUrl: './sub-menu.component.html',
  styleUrls: ['./sub-menu.component.css']
})
export class SubMenuComponent implements OnInit {
  @Input() selectMenu:string;
  @Output() closeMe = new EventEmitter();
  private openPanelCount: number = 0;
  isSaveing: boolean = false;
  progresPercent: number = 0;

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
        option.width = 520;
        component = PeerMenuComponent;
        break;
      case 'ChatWindowComponent':
        component = ChatWindowComponent;
        option.width = 700;
        break;
      case 'GameTableSettingComponent':
        component = GameTableSettingComponent;
        option = { width: 610, height: 400, left: 100 };
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
      case 'GameCharacterGeneratorComponent':
        component = GameCharacterGeneratorComponent;
        option = { width: 500, height: 300, left: 100 };
        break;
      case 'GameObjectInventoryComponent':
        component = GameObjectInventoryComponent;
        break;
      case 'CounterListComponent':
        component = CounterListComponent;
        option = { width:450 , height: 600 };
        break;
      case 'PlayerPaletteComponent':
        component = PlayerPaletteComponent;
        option = { width: 645, height: 400 };
        break;
      case 'DiceRollTableSettingComponent':
        component = DiceRollTableSettingComponent;
        option = { width: 645, height: 475 };
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
    private panelService: PanelService,
    private saveDataService: SaveDataService,
    private saveHtmlService: SaveHtmlService,
    private counterService: CounterService
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

    let roomName = Network.peerContext && 0 < Network.peerContext.roomName.length
      ? Network.peerContext.roomName
      : 'ルームデータ';
    await this.saveDataService.saveRoomAsync(roomName, percent => {
      this.progresPercent = percent;
    });

    setTimeout(() => {
      this.isSaveing = false;
      this.progresPercent = 0;
    }, 500);
  }

  htmlsave(){
    this.saveHtmlService.saveAllHtmlLog();
    this.closeMe.emit();
  }

  handleFileSelect(event: Event) {
    let input = <HTMLInputElement>event.target;
    let files = input.files;
    if (files.length) FileArchiver.instance.load(files);
    input.value = '';
  }

  resetRound() {
    this.counterService.round.count = 0;
    this.closeMe.emit();
  }

  diceAllOpne() {
    if (confirm('「一斉公開しない」設定ではないダイス、コインをすべて公開します。\nよろしいですか？')) {
      EventSystem.trigger('DICE_ALL_OPEN', null);
    }
    this.closeMe.emit();
  }

}
