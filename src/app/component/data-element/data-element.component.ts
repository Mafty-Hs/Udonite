import { Component, OnInit,Input } from '@angular/core';
import { DataElement } from '@udonarium/data-element';
import { StringUtil } from '@udonarium/core/system/util/string-util';
import { OpenUrlComponent } from 'component/open-url/open-url.component';
import { ModalService } from 'service/modal.service';

@Component({
  selector: 'data-element',
  templateUrl: './data-element.component.html',
  styleUrls: ['./data-element.component.css']
})
export class DataElementComponent implements OnInit {

  stringUtil = StringUtil;

  @Input() dataElement:DataElement;
  get name():string {
    return this.dataElement.name;
  }
  get type():string {
    return this.dataElement.type;
  }
  get value():string|number {
    return this.dataElement.value;
  }
  set value(value :string|number) {
    this.dataElement.value = value;
  }
  get currentValue():string|number {
    return this.dataElement.currentValue;
  }
  set currentValue(currentValue :string|number) {
    this.dataElement.currentValue = currentValue;
  }
  get isNumber():boolean {
    return (this.value && !Number.isNaN(this.value));
  }

  constructor(
    private modalService: ModalService,
  ) { }

  ngOnInit(): void {
  }

  openUrl(url, title=null, subTitle=null) {
    if (StringUtil.sameOrigin(url)) {
      window.open(url.trim(), '_blank', 'noopener');
    } else {
      this.modalService.open(OpenUrlComponent, { url: url, title: title, subTitle: subTitle  });
    } 
  }

}
