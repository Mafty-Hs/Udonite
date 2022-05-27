import { Component, OnInit, ViewChild, AfterViewInit, OnDestroy , NgZone } from '@angular/core';
import { EventSystem } from '@udonarium/core/system';
import { PanelService } from 'service/panel.service';
import { EffectService } from 'service/effect.service';

@Component({
  selector: 'effect-view',
  templateUrl: './effect-view.component.html',
  styleUrls: ['./effect-view.component.css']
})
export class EffectViewComponent implements OnInit, OnDestroy, AfterViewInit  {
  @ViewChild('effect') effect;

  width:number = 200;
  height:number = 200;
  canvas:HTMLCanvasElement = null;
  effectName:string;
  get effectsName():string[] {
    return this.effectService.effectName;
  }

  play() {
    let rect = this.canvas.getBoundingClientRect();
    this.effectService.playDemo(rect,this.effectName)
  }

  isDrag :boolean = false;

  setEffect() {
    if(!this.isDrag && this.effectName) {
      this.isDrag = true;
    }
  }

  cancel() {
    this.isDrag = false;
  }

  onSelect(characterIdentifier: string) {
     if (characterIdentifier){
       let eventstat = [this.effectName , [characterIdentifier]]
       EventSystem.call('CHARACTER_EFFECT', eventstat);
     }
     this.isDrag = false;
  }

  constructor(
    private panelService: PanelService,
    private effectService: EffectService,
  ) {
 }

  ngOnInit(): void {
    Promise.resolve().then(() => this.panelService.title = 'エフェクト');
    EventSystem.register(this)
     .on('SELECT_TABLETOP_OBJECT', -1000, event => {
        if (this.isDrag) {
          this.onSelect(event.data.identifier);
        }
     });

  }
  ngAfterViewInit() {
    this.canvas = this.effect.nativeElement as HTMLCanvasElement;
  }
  ngOnDestroy() {
    EventSystem.unregister(this);
  }


}
