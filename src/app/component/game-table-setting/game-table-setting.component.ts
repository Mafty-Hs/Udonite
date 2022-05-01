import { AfterViewInit, Component, OnDestroy, OnInit } from '@angular/core';
import { AudioFile } from '@udonarium/core/file-storage/audio-file';
import { AudioStorage } from '@udonarium/core/file-storage/audio-storage';

import { ImageFile } from '@udonarium/core/file-storage/image-file';
import { ObjectSerializer } from '@udonarium/core/synchronize-object/object-serializer';
import { ObjectStore } from '@udonarium/core/synchronize-object/object-store';
import { EventSystem, IONetwork } from '@udonarium/core/system';
import { CutIn } from '@udonarium/cut-in';
import { CutInList } from '@udonarium/cut-in-list';
import { FilterType, GameTable, GridType } from '@udonarium/game-table';
import { Jukebox } from '@udonarium/Jukebox';
import { TableSelecter } from '@udonarium/table-selecter';

import { FileSelecterComponent } from 'component/file-selecter/file-selecter.component';
import { ImageService } from 'service/image.service';
import { ModalService } from 'service/modal.service';
import { PanelService } from 'service/panel.service';
import { PlayerService } from 'service/player.service';
import { RoomService } from 'service/room.service';
import { SaveDataService } from 'service/save-data.service';

@Component({
  selector: 'game-table-setting',
  templateUrl: './game-table-setting.component.html',
  styleUrls: ['./game-table-setting.component.css']
})
export class GameTableSettingComponent implements OnInit, OnDestroy, AfterViewInit {
  minSize: number = 1;
  maxSize: number = 100;
  autoPlayBGM:boolean = true;
  autoPlayCutin:boolean = true;

  jukeBox: Jukebox = null;

  get tableBackgroundImage(): ImageFile {
    return this.imageService.getEmptyOr(this.selectedTable ? this.selectedTable.imageIdentifier : null);
  }

  get tableDistanceviewImage(): ImageFile {
    return this.imageService.getEmptyOr(this.selectedTable ? this.selectedTable.backgroundImageIdentifier : null);
  }

  get tableName(): string { return this.selectedTable.name; }
  set tableName(tableName: string) { if (this.isEditable) this.selectedTable.name = tableName; }

  get tableWidth(): number { return this.selectedTable.width; }
  set tableWidth(tableWidth: number) { if (this.isEditable) this.selectedTable.width = tableWidth; }

  get tableHeight(): number { return this.selectedTable.height; }
  set tableHeight(tableHeight: number) { if (this.isEditable) this.selectedTable.height = tableHeight; }

  get tableGridColor(): string { return this.selectedTable.gridColor; }
  set tableGridColor(tableGridColor: string) { if (this.isEditable) this.selectedTable.gridColor = tableGridColor; }

  get tableGridShow(): boolean { return this.tableSelecter.gridShow; }
  set tableGridShow(tableGridShow: boolean) {
    this.tableSelecter.gridShow = tableGridShow;
    EventSystem.trigger('UPDATE_GAME_OBJECT', this.tableSelecter.toContext()); // 自分にだけイベントを発行してグリッド更新を誘発
  }

  get tableGridSnap(): boolean { return this.tableSelecter.gridSnap; }
  set tableGridSnap(tableGridSnap: boolean) {
    this.tableSelecter.gridSnap = tableGridSnap;
  }

  get tableGridType(): GridType { return this.selectedTable.gridType; }
  set tableGridType(gridType: GridType) { if (this.isEditable) this.selectedTable.gridType = Number(gridType); }

  get tableDistanceviewFilter(): FilterType { return this.selectedTable.backgroundFilterType; }
  set tableDistanceviewFilter(filterType: FilterType) { if (this.isEditable) this.selectedTable.backgroundFilterType = filterType; }

  get audios():AudioFile[] {
    return AudioStorage.instance.audios
  }

  get cutIns():CutIn[] {
    return CutInList.instance.cutIns
  }

  get sceneBGM():string {
    if (this.selectedTable.bgmIdentifier === null || this.selectedTable.bgmIdentifier === undefined) {
      this.selectedTable.bgmIdentifier = '';
    }
    return this.selectedTable.bgmIdentifier
  }
  set sceneBGM(sceneBGM :string) {
    this.selectedTable.bgmIdentifier = sceneBGM;
  }
  get sceneCutin():string {
    if (this.selectedTable.cutinIdentifier === null || this.selectedTable.cutinIdentifier === undefined) {
      this.selectedTable.cutinIdentifier = '';
    }
    return this.selectedTable.cutinIdentifier;
  }
  set sceneCutin(sceneCutin :string) {
    this.selectedTable.cutinIdentifier = sceneCutin;
  }

  get tableSelecter(): TableSelecter { return TableSelecter.instance; }

  selectedTable: GameTable = null;
  selectedTableXml: string = '';

  get isEmpty(): boolean { return this.tableSelecter ? (this.tableSelecter.viewTable ? false : true) : true; }
  get isDeleted(): boolean {
    if (!this.selectedTable) return true;
    return ObjectStore.instance.get<GameTable>(this.selectedTable.identifier) == null;
  }
  get isEditable(): boolean {
    return !this.isEmpty && !this.isDeleted;
  }

  isSaveing: boolean = false;
  progresPercent: number = 0;

  constructor(
    private modalService: ModalService,
    private saveDataService: SaveDataService,
    private imageService: ImageService,
    private playerService: PlayerService,
    private panelService: PanelService,
    public roomService: RoomService,
  ) { }

  ngOnInit() {
    Promise.resolve().then(() => { this.modalService.title = this.panelService.title = 'テーブル設定' });
    this.selectedTable = this.tableSelecter.viewTable;
    EventSystem.register(this)
      .on('DELETE_GAME_OBJECT', 1000, event => {
        if (!this.selectedTable || event.data.identifier !== this.selectedTable.identifier) return;
        let object = ObjectStore.instance.get(event.data.identifier);
        if (object !== null) {
          this.selectedTableXml = object.toXml();
        }
      });
    this.jukeBox = ObjectStore.instance.get('Jukebox')
  }

  ngAfterViewInit() { }

  ngOnDestroy() {
    EventSystem.unregister(this);
  }

  upTableIndex() {
    if (!this.selectedTable) return;
    let gameTables = this.getGameTables();
    let currentTableIndex = this.selectedTable.index;
    if (currentTableIndex < 2) return;
    let beforeTable = gameTables[gameTables.indexOf(this.selectedTable) - 1]
    if (!beforeTable) return;
    let beforeTableIndex = beforeTable.index;
    this.selectedTable.index = beforeTableIndex;
    beforeTable.index = currentTableIndex;
  }

  downTableIndex() {
    if (!this.selectedTable) return;
    let gameTables = this.getGameTables();
    let currentTableIndex = this.selectedTable.index;
    if (currentTableIndex >= gameTables.length) return;
    let afterTable = gameTables[gameTables.indexOf(this.selectedTable) + 1]
    if (!afterTable) return;
    let afterTableIndex = afterTable.index;
    this.selectedTable.index = afterTableIndex;
    afterTable.index = currentTableIndex;
  }

  selectGameTable(identifier: string) {
    let gameTable  = ObjectStore.instance.get<GameTable>(identifier);
    if (this.jukeBox && this.autoPlayBGM && gameTable.bgmIdentifier) {
      let audio = AudioStorage.instance.get(gameTable.bgmIdentifier);
      if (audio) this.jukeBox.play(gameTable.bgmIdentifier,true);
    }
    if (this.autoPlayCutin && gameTable.cutinIdentifier) {
      let cutin = ObjectStore.instance.get(gameTable.cutinIdentifier)
      if (cutin && cutin instanceof CutIn) {
        const sendObj = {
          identifier: gameTable.cutinIdentifier,
          secret: false,
          sender: this.playerService.myPeer.peerId
        };
        EventSystem.call('PLAY_CUT_IN', sendObj);
      }
    }

    EventSystem.call('SELECT_GAME_TABLE', { identifier: identifier }, IONetwork.peerId);
    this.selectedTable = gameTable;
    this.selectedTableXml = '';
  }

  getGameTables(): GameTable[] {
    let gameTables = ObjectStore.instance.getObjects(GameTable);
    if (gameTables.find(gameTable => gameTable.index < 1)) this.reassignIndex(gameTables);
    return gameTables.sort((a, b) => a.index - b.index);
  }

  reassignIndex(gameTables :GameTable[]):void {
    for (let index = 1; index <= gameTables.length; index++) {
      gameTables[index - 1].index = index + Math.random();
    }
  }

  createGameTable() {
    let gameTable = new GameTable();
    gameTable.name = '白紙のテーブル';
    gameTable.imageIdentifier = 'testTableBackgroundImage_image';
    gameTable.initialize();
    this.selectGameTable(gameTable.identifier);
  }

  async save() {
    if (!this.selectedTable || this.isSaveing) return;
    this.isSaveing = true;
    this.progresPercent = 0;

    this.selectedTable.selected = true;
    await this.saveDataService.saveGameObjectAsync(this.selectedTable, 'fly_map_' + this.selectedTable.name, percent => {
      this.progresPercent = percent;
    });

    setTimeout(() => {
      this.isSaveing = false;
      this.progresPercent = 0;
    }, 500);
  }

  delete() {
    if (!this.isEmpty && this.selectedTable) {
      this.selectedTableXml = this.selectedTable.toXml();
      this.selectedTable.destroy();
    }
  }

  restore() {
    if (this.selectedTable && this.selectedTableXml) {
      let restoreTable = ObjectSerializer.instance.parseXml(this.selectedTableXml);
      this.selectGameTable(restoreTable.identifier);
      this.selectedTableXml = '';
    }
  }


  openBgImageModal() {
    if (this.isDeleted) return;
    let currentImageIdentifires: string[] = [];
    if (this.selectedTable && this.selectedTable.imageIdentifier) currentImageIdentifires = [this.selectedTable.imageIdentifier];
    this.modalService.open<string>(FileSelecterComponent, { currentImageIdentifires: currentImageIdentifires }).then(value => {
      if (!this.selectedTable || !value) return;
      this.selectedTable.imageIdentifier = value;
    });
  }

  openDistanceViewImageModal() {
    if (this.isDeleted) return;
    let currentImageIdentifires: string[] = [];
    if (this.selectedTable && this.selectedTable.backgroundImageIdentifier) currentImageIdentifires = [this.selectedTable.backgroundImageIdentifier];
    this.modalService.open<string>(FileSelecterComponent, { isAllowedEmpty: true, currentImageIdentifires: currentImageIdentifires }).then(value => {
      if (!this.selectedTable || !value) return;
      this.selectedTable.backgroundImageIdentifier = value;
    });
  }
}
