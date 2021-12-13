import {
  AfterViewInit,
  ChangeDetectionStrategy,
  ChangeDetectorRef,
  Component,
  ElementRef,
  HostListener,
  Input,
  NgZone,
  OnDestroy,
  OnInit,
} from '@angular/core';
import { Popup } from '@udonarium/popup';
import { SoundEffect , PresetSound } from '@udonarium/sound-effect';
import { MovableOption } from 'directive/movable.directive';

@Component({
  selector: 'popup',
  templateUrl: './popup.component.html',
  styleUrls: ['./popup.component.css']
})
export class PopupComponent implements OnInit, OnDestroy, AfterViewInit {
  @Input() popup: Popup = null;
  @Input() is3D: boolean = false;

  get text():string {return this.popup.text}

  movableOption: MovableOption = {};

  die() {
    this.popup.destroy();
  }

  constructor() { }

  ngOnInit() {
    this.movableOption = {
      tabletopObject: this.popup,
      transformCssOffset: 'translateZ(1px)',
      colideLayers: ['terrain']
    };
  }

  ngAfterViewInit() {
    setInterval(() => {
      this.die();
    },15000);
    SoundEffect.play(PresetSound.pikon);
  }

  ngOnDestroy() {
  }

}
