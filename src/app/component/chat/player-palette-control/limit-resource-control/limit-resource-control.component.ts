import { Component, OnInit,Input,Output ,EventEmitter,ChangeDetectionStrategy, ChangeDetectorRef } from '@angular/core';
import { DataElement } from '@udonarium/data-element';
import { EventSystem } from '@udonarium/core/system';

@Component({
  selector: 'limit-resource-control',
  templateUrl: './limit-resource-control.component.html',
  styleUrls: ['./limit-resource-control.component.css'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class LimitResourceControlComponent implements OnInit {
  @Input() dataElement:DataElement;
  @Input() characterName:string = "";
  @Output() chat = new EventEmitter<{
    text: string, gameType: string, sendFrom: string, sendTo: string
    }>();

  numberPattern:RegExp = new RegExp('^[0-9]*$');
  get isShow():boolean {
    if (!this.dataElement.type) {
      let value = <string>this.dataElement.value;
      if (value.length < 1) return false;
      return this.numberPattern.test(value);
    }
    if (['simpleNumber','numberResource','checkProperty'].includes(this.dataElement.type)) return true;
    return false;
  }

  get stock():boolean {
    if (this.dataElement.type == '' && !Number.isNaN(this.dataElement.value) && Number(this.dataElement.value) === 0) {
      return false;
    }
    else if (this.dataElement.type == 'simpleNumber' && Number(this.dataElement.value) === 0) {
      return false;
    }
    else if (this.dataElement.type == 'numberResource' && Number(this.dataElement.currentValue) === 0) {
      return false;
    }
    else if (this.dataElement.type == 'checkProperty' && !this.dataElement.value) {
      return false;
    }
    return true;
  }

  itemUse() {
    if (this.dataElement.type == '' && !Number.isNaN(this.dataElement.value)) {
      if (Number(this.dataElement.value) < 1) return;
      this.dataElement.value = Number(this.dataElement.value) - 1;
      this.sendChatNumber("(残り " + this.dataElement.value +" )");
    }
    else if (this.dataElement.type == 'simpleNumber') {
      if (Number(this.dataElement.value) < 1) return;
      this.dataElement.value = Number(this.dataElement.value) - 1;
      this.sendChatNumber("(残り " + this.dataElement.value +" )");
    }
    else if (this.dataElement.type == 'numberResource') {
      if (Number(this.dataElement.currentValue) < 1) return;
      this.dataElement.currentValue = Number(this.dataElement.currentValue) - 1;
      this.sendChatNumber("(残り " + this.dataElement.currentValue + " / " + this.dataElement.value +" )");
    }
    else if (this.dataElement.type == 'checkProperty') {
      if (!this.dataElement.value) return;
      this.dataElement.value = '';
      this.sendChatNumber("");
    }
  }

  sendChatNumber(remainString :string) {
   this.sendChat(this.characterName + 'が' + this.dataElement.name  + "を使用 " + remainString );
  }

  sendChat(resulttext :string) {
    this.chat.emit({
      text: resulttext,
      gameType: "",
      sendFrom: "System",
      sendTo: "",
    });
  }

  constructor(
    private changeDetector:ChangeDetectorRef
  ) { }

  ngOnInit(): void {
    EventSystem.register(this)
      .on('UPDATE_GAME_OBJECT', -1000, event => {
        if (this.dataElement && event.data.identifier === this.dataElement.identifier) {
          this.changeDetector.markForCheck();
        }
      })
      .on('DELETE_GAME_OBJECT', -1000, event => {
        if (this.dataElement && this.dataElement.identifier === event.data.identifier) {
          this.changeDetector.markForCheck();
        }
      });
  }

  ngAfterViewInit(): void {
  }

  ngOnDestroy(): void {
    EventSystem.unregister(this);
  }

}
