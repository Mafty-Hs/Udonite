import { Component, OnInit, AfterViewInit,ChangeDetectionStrategy, ChangeDetectorRef,NgZone } from '@angular/core';
import { PresetSound, SoundEffect } from '@udonarium/sound-effect';
import { PanelService } from 'service/panel.service';

@Component({
  selector: 'app-alarm',
  templateUrl: './alarm.component.html',
  styleUrls: ['./alarm.component.css'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class AlarmComponent implements OnInit, AfterViewInit {
  public timer :number
  nodeTimer = null;

  get minute():string {
    return ('00' + Math.floor(this.timer / 60)).slice( -2 );
  }

  get second():string {
   return ('00' +(this.timer % 60)).slice( -2 );
  }

  play():void {
    clearInterval(this.nodeTimer);
    SoundEffect.play(PresetSound.alarm);
    this.panelService.close();
  }

  constructor(
    private changeDetector: ChangeDetectorRef,
    private panelService: PanelService
  ) { }

  ngOnInit(): void {
    Promise.resolve().then(() => this.updatePanelSetting());
  }

  updatePanelSetting(): void {
    this.panelService.title = "アラーム";
    this.panelService.isAbleCloseButton = false;
    this.panelService.isAbleFullScreenButton = false;
    this.panelService.isAbleMinimizeButton = false;
  }

  ngAfterViewInit(): void {

      this.nodeTimer = setInterval(()=>{
        this.timer -= 1;
        this.changeDetector.markForCheck();
        if (this.timer < 1) this.play();
      },1000)
  }

}
