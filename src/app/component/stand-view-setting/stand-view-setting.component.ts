import { Component,AfterViewInit,OnInit,OnDestroy,ViewChild, ElementRef } from '@angular/core';
import { GameCharacterService } from 'service/game-character.service';
import { StandService } from 'service/stand.service';
import { GameCharacter } from '@udonarium/game-character';
import { PanelService } from 'service/panel.service';
import { ImageFile } from '@udonarium/core/file-storage/image-file';
import { DataElement } from '@udonarium/data-element';

interface standInfo {
  image: ImageFile;
  pos: string;
}

@Component({
  selector: 'stand-view-setting',
  templateUrl: './stand-view-setting.component.html',
  styleUrls: ['./stand-view-setting.component.css']
})
export class StandViewSettingComponent implements OnInit, AfterViewInit, OnDestroy {
  @ViewChild('main') mainElm: ElementRef;
  @ViewChild('menu') menuElm: ElementRef;
  main: HTMLElement;
  menu: HTMLElement;
  timer:NodeJS.Timer

  sizeUpdate() {
    //500sごとにパネルの四方の座標をチェック。observerではパネルに対するドラッグイベントが拾えない。
    let rect = this.menu.getBoundingClientRect();
    this.standService.leftEnd = rect.left - 6;
    this.standService.width = rect.width + 18;
    let bottomrect = this.main.getBoundingClientRect();
    this.standService.bottomEnd = window.innerHeight - bottomrect.bottom -15;
  }

  scaleList : string[] = ["10","30","50","70","90"];
  get posList() :standInfo[] {
    let onlyTable:boolean = true;
    let list:standInfo[] =  this.gameCharacterService.list(onlyTable).map(
     character => {
       if (character.imageFile?.url?.length > 0 && character.standList && character.standList.position) {
         let info:standInfo;;
         if (character.standList.position == 5) {
           let standList = character.standList.standElements as DataElement[];
           let pos = this.searchPos(standList);
           info = {image: character.imageFile ,pos: pos};
         }
         else {
           info = {image: character.imageFile ,pos: String(character.standList.position)}
         }
         return info;
       }
     }).filter(v => v);
    return list;
  }

  searchPos(standList :DataElement[]) :string {
    for (let stand of standList) {
      let dataElm = this.convertNamedArray(stand);
      if ('position' in dataElm) {
        return dataElm['position'];
      }
    }
    return "5";
  }

  convertNamedArray(stand :DataElement): {[index: string]: string} {
    let dataElm :DataElement[] = stand.children as DataElement[];
    let result: {[index: string]: string} = {};
    dataElm.forEach( item => {
      if(item.name) result[String(item.name)] = String(item.value);
    });
    return result;
  }

  ngAfterViewInit() {
    this.main = this.mainElm.nativeElement;
    this.menu = this.menuElm.nativeElement;
    this.timer = setInterval(() => {this.sizeUpdate()}, 500)
  }

  ngOnDestroy() {
    clearInterval(this.timer);
  }

  constructor(
     private gameCharacterService: GameCharacterService,
     private panelService: PanelService,
     private standService: StandService
  ) {
    this.panelService.isAbleFullScreenButton = false;
    this.panelService.isAbleMinimizeButton = false;
    this.panelService.title = "立ち絵表示設定";
  }

  ngOnInit(): void {
  }

}
