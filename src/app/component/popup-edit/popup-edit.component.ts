import { Component, OnInit } from '@angular/core';
import { ModalService } from 'service/modal.service';
import { PanelService } from 'service/panel.service';
import { Popup } from '@udonarium/popup';

@Component({
  selector: 'popup-edit',
  templateUrl: './popup-edit.component.html',
  styleUrls: ['./popup-edit.component.css']
})
export class PopupEditComponent implements OnInit {

  constructor(
    private panelService: PanelService,
    private modalService: ModalService
  ) { }

  text:string = "";
  x:number = 0;
  y:number = 0;
  z:number = 0;

  submit() {
    let popup = Popup.create();
    popup.location.x = this.x - 25;
    popup.location.y = this.y - 25;
    popup.posZ = this.z;
    popup.text = this.text;
    this.modalService.resolve();
  }
  cancel() {
    this.modalService.resolve();
  }
  ngOnInit(): void {
    Promise.resolve().then(() => this.modalService.title = this.panelService.title = 'ポップアップメッセージ');
    this.x = this.modalService.option.x ? this.modalService.option.x : 0;
    this.y = this.modalService.option.y ? this.modalService.option.y : 0; 
    this.z = this.modalService.option.z ? this.modalService.option.z : 0; 
  }

}
