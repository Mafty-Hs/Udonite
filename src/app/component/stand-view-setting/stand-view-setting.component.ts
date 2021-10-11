import { Component,AfterViewInit,OnInit,OnDestroy,ViewChild, ElementRef } from '@angular/core';
import { GameCharacterService } from 'service/game-character.service';
import { StandService } from 'service/stand.service';
import { GameCharacter } from '@udonarium/game-character';
import { PanelOption, PanelService } from 'service/panel.service';
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
export class StandViewSettingComponent implements OnInit {
  @ViewChild('menu') menuElm: ElementRef;
  menu: HTMLElement;
  count:number = 2;
  observer = new ResizeObserver(change => {
    setTimeout(() => {this.sizeUpdate(),1000});
  });

  sizeUpdate() {
    let rect = this.menu.getBoundingClientRect();
    this.standService.leftEnd = rect.left - 9;
    this.standService.width = rect.width + 20;
    this.count -= 1;
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
    this.menu = this.menuElm.nativeElement;
    setTimeout(() => {this.observer.observe(this.menu),5000});
  }

  ngOnDestroy() {
    if (this.count > 0) {
      //開いた時に取得するDOMがおかしいので暫定対応
      this.standService.leftEnd = this.panelService.left;
      this.standService.width = this.panelService.width;
    }
    this.observer.disconnect();
  }

  constructor(
     private gameCharacterService: GameCharacterService,
     private panelService: PanelService,
     private standService: StandService
  ) { 
    this.panelService.isAbleFullScreenButton = false;
    this.panelService.title = "立ち絵表示設定";
  }

  ngOnInit(): void {
  }

}
