import {
  AfterViewInit,
  ChangeDetectionStrategy,
  ChangeDetectorRef,
  Component,
  Input,
  OnDestroy,
  OnInit,
} from '@angular/core';
import { ObjectStore } from '@udonarium/core/synchronize-object/object-store';
import { EventSystem } from '@udonarium/core/system';
import { StringUtil } from '@udonarium/core/system/util/string-util';
import { DataElement } from '@udonarium/data-element';
import { GameCharacter } from '@udonarium/game-character';
import { OpenUrlComponent } from 'component/open-url/open-url.component';
import { ModalService } from 'service/modal.service';

@Component({
  selector: 'game-data-element, [game-data-element]',
  templateUrl: './game-data-element.component.html',
  styleUrls: ['./game-data-element.component.css','../../../../common/range.status.css','../../../../common/input.status.css'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class GameDataElementComponent implements OnInit, OnDestroy, AfterViewInit {
  @Input() tableTopObjectName: string = null;
  @Input() characterIdentifier: string = '';
  @Input() gameDataElement: DataElement = null;
  @Input() isEdit: boolean = false;
  @Input() isCommonValue: boolean = false;
  @Input() isValueLocked: boolean = false;
  @Input() isHideText: boolean = false;

  stringUtil = StringUtil;
  commonTagName:string = "";
  commonTypeIsNumber:boolean = false;

  private _name: string = '';
  get name(): string { return this._name; }
  set name(name: string) { this._name = name; this.setUpdateTimer(); }

  private _value: number | string = 0;
  get value(): number | string { return this._value; }
  set value(value: number | string) { this._value = value; this.setUpdateTimer(); }

  private _currentValue: number | string = 0;
  get currentValue(): number | string { return this._currentValue; }
  set currentValue(currentValue: number | string) { this._currentValue = currentValue; this.setUpdateTimer(); }

  get abilityScore(): number { return this.gameDataElement.calcAbilityScore(); }

  setCommonTagName() {
    switch(this.gameDataElement.name) {
      case 'size':
        this.commonTagName = 'サイズ';
        this.commonTypeIsNumber = true;
        break;
      case 'width':
        this.commonTagName = '幅';
        this.commonTypeIsNumber = true;
        break;
      case 'viewWidth':
        this.commonTagName = 'オーバービューの幅';
        this.commonTypeIsNumber = true;
        break;
      case 'height':
        this.commonTagName = '高さ';
        this.commonTypeIsNumber = true;
        break;
      case 'depth':
        this.commonTagName = '奥行き';
        this.commonTypeIsNumber = true;
        break;
      case 'fontsize':
        this.commonTagName = 'フォントサイズ';
        this.commonTypeIsNumber = true;
        break;
      case 'altitude':
        this.commonTagName = '高度';
        this.commonTypeIsNumber = true;
        break;
      case 'title':
        this.commonTagName = 'タイトル';
        break;
      case 'text':
        this.commonTagName = 'テキスト';
        break;
      case 'color':
        this.commonTagName = '色';
        break;
      default:
        this.commonTagName = this.gameDataElement.name;
    }
  }

  get identifier(): string {
    return this.gameDataElement.identifier;
  }

  private updateTimer: NodeJS.Timer = null;

  constructor(
    private changeDetector: ChangeDetectorRef,
    private modalService: ModalService
  ) { }

  ngOnInit() {
    if (this.gameDataElement) this.setValues(this.gameDataElement);
    if (this.isCommonValue) this.setCommonTagName();

    EventSystem.register(this)
      .on('UPDATE_GAME_OBJECT', -1000, event => {
        if (this.gameDataElement && event.data.identifier === this.gameDataElement.identifier) {
          this.setValues(this.gameDataElement);
          this.changeDetector.markForCheck();
        }
      })
      .on('DELETE_GAME_OBJECT', -1000, event => {
        if (this.gameDataElement && this.gameDataElement.identifier === event.data.identifier) {
          this.changeDetector.markForCheck();
        }
      });
  }

  ngOnDestroy() {
    EventSystem.unregister(this);
  }

  ngAfterViewInit() {

  }

  addElement() {
    this.gameDataElement.appendChild(DataElement.create('タグ', '', {}));
  }

  deleteElement() {
    this.gameDataElement.destroy();
  }

  upElement() {
    let parentElement = this.gameDataElement.parent;
    let index: number = parentElement.children.indexOf(this.gameDataElement);
    if (0 < index) {
      let prevElement = parentElement.children[index - 1];
      parentElement.insertBefore(this.gameDataElement, prevElement);
    }
  }

  changeResource() {
    let character = ObjectStore.instance.get(this.characterIdentifier);
    if (character && character instanceof GameCharacter) {
      if (confirm(this.gameDataElement.name + 'をリソースに変換します。よろしいですか？')) {
        character.limitResource.castDataElement(this.gameDataElement);
      }
    }
  }

  downElement() {
    let parentElement = this.gameDataElement.parent;
    let index: number = parentElement.children.indexOf(this.gameDataElement);
    if (index < parentElement.children.length - 1) {
      let nextElement = parentElement.children[index + 1];
      parentElement.insertBefore(nextElement, this.gameDataElement);
    }
  }

  setElementType(type: string) {
    this.gameDataElement.setAttribute('type', type);
  }

  isNum(n: any): boolean {
    return isFinite(n);
  }

  openUrl(url) {
    if (StringUtil.sameOrigin(url)) {
      window.open(url.trim(), '_blank', 'noopener');
    } else {
      this.modalService.open(OpenUrlComponent, { url: url, title: this.tableTopObjectName, subTitle: this.name });
    }
  }

  private setValues(object: DataElement) {
    this._name = object.name;
    this._currentValue = object.currentValue;
    this._value = object.value;
  }

  private setUpdateTimer() {
    clearTimeout(this.updateTimer);
    this.updateTimer = setTimeout(() => {
      if (this.gameDataElement.name !== this.name) this.gameDataElement.name = this.name;
      if (this.gameDataElement.currentValue !== this.currentValue) this.gameDataElement.currentValue = this.currentValue;
      if (this.gameDataElement.value !== this.value) this.gameDataElement.value = this.value;
      this.updateTimer = null;
    }, 66);
  }
}
