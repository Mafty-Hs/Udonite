import { Component, OnInit, Output, EventEmitter } from '@angular/core';
import { StandImageComponent } from 'component/stand-image/stand-image.component';
import { StandViewSettingComponent } from 'component/stand-view-setting/stand-view-setting.component';
import { PlayerService } from 'service/player.service';
import { EffectService } from 'service/effect.service';
import { PanelOption, PanelService } from 'service/panel.service';
import { StandService } from 'service/stand.service';
import { EventSystem } from '@udonarium/core/system';

@Component({
  selector: 'view-setting',
  templateUrl: './view-setting.component.html',
  styleUrls: ['./view-setting.component.css']
})
export class ViewSettingComponent implements OnInit {
  @Output() closeMe = new EventEmitter();

  get isShowStand() :boolean { return StandImageComponent.isShowStand;}
  set isShowStand(isShowStand :boolean) {
    StandImageComponent.isShowStand = isShowStand;
    this.closeMe.emit();
  }
  get isShowNameTag() :boolean { return StandImageComponent.isShowNameTag;}
  set isShowNameTag(isShowNameTag :boolean) {
    StandImageComponent.isShowNameTag = isShowNameTag;
    this.closeMe.emit();
  }
  get isCanBeGone() :boolean { return StandImageComponent.isCanBeGone;}
  set isCanBeGone(isCanBeGone :boolean) {
    StandImageComponent.isCanBeGone = isCanBeGone;
    this.closeMe.emit();
  }
  get isShowStatusBar() :boolean { return this.playerService.isShowStatusBar;}
  set isShowStatusBar(isShowStatusBar :boolean) {
    this.playerService.isShowStatusBar = isShowStatusBar;
    this.closeMe.emit();
  }
  get canEffect() :boolean { return this.effectService.canEffect;}
  set canEffect(canEffect :boolean) {
    this.effectService.canEffect = canEffect;
    this.closeMe.emit();
  }

  closePanel():void {
    if (confirm('表示されているパネルを全て削除しますか？')) {
      EventSystem.trigger('ALL_PANEL_DIE', null);
      this.closeMe.emit();
    }
    return;
  }

  destroyStandImage():void {
    EventSystem.trigger('DESTORY_STAND_IMAGE_ALL', null);
    this.closeMe.emit();
  }

  showStandView():void {
    let top = window.innerHeight - (this.standService.bottomEnd + 150);
    this.panelService.open(StandViewSettingComponent, { width: this.standService.width, height: 150, left: this.standService.leftEnd , top: top });
    this.closeMe.emit();
  }

  resetViewTop():void {
    EventSystem.trigger('RESET_POINT_OF_VIEW', 'top');
    this.closeMe.emit();
  }

  resetViewDefault():void {
    EventSystem.trigger('RESET_POINT_OF_VIEW', null);
    this.closeMe.emit();
  }





  constructor(
    private effectService: EffectService,
    private playerService: PlayerService,
    private panelService: PanelService,
    private standService: StandService
  ) { }

  ngOnInit(): void {
  }

}
