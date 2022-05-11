import { Component, OnInit } from '@angular/core';
import { PanelOption, PanelService } from 'service/panel.service';

@Component({
  selector: 'help',
  templateUrl: './help.component.html',
  styleUrls: ['./help.component.css','../../common/tag-menu.common.css','../../common/scroll-black.common.css']
})
export class HelpComponent implements OnInit {

  menu:string = "main";

  constructor(
    private panelService: PanelService,
  ) { }

  ngOnInit(): void {
    Promise.resolve().then(() => this.panelService.title = 'ヘルプ');
  }

}
