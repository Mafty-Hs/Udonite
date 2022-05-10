import { Component, OnInit } from '@angular/core';
import { ModalService } from 'service/modal.service';
import { OpenUrlComponent } from 'component/open-url/open-url.component';

@Component({
  selector: 'help-diceroll',
  templateUrl: './help-diceroll.component.html',
  styleUrls: ['../help.content.css']
})
export class HelpDicerollComponent implements OnInit {

  constructor(
    private modalService:ModalService
  ) { }

  ngOnInit(): void {
  }

  onLinkClick($event) {
    $event.preventDefault();
    this.modalService.open(OpenUrlComponent, { url: 'https://docs.bcdice.org/original_table.html' });
    return true;
  }

}
