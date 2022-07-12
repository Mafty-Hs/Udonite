import {
  AfterViewInit,
  ChangeDetectionStrategy,
  ChangeDetectorRef,
  Component,
  Input,
  OnDestroy,
  OnInit,
} from '@angular/core';
import { EventSystem } from '@udonarium/core/system';
import { StringUtil } from '@udonarium/core/system/util/string-util';
import { DataElement } from '@udonarium/data-element';

@Component({
  selector: 'limit-resource-element',
  templateUrl: './limit-resource-element.component.html',
  styleUrls: ['./limit-resource-element.component.css'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class LimitResourceElementComponent implements OnInit, OnDestroy, AfterViewInit {
  @Input() gameDataElement: DataElement = null;

  private _name: string = '';
  get name(): string { return this._name; }
  set name(name: string) { this._name = name; this.setUpdateTimer(); }
  private _type: string = '';
  get resourceType(): string { return this._type; }
  set resourceType(resourceType: string) {
    this._type = resourceType;
    this.setUpdateTimer();
    this.changeDetector.detectChanges();
  }
  private _value: number|string = '';
  get value(): number|string { return this._value; }
  set value(value: number|string) { this._value = value; this.setUpdateTimer(); }
  private _currentValue: number|string = '';
  get currentValue(): number|string { return this._currentValue; }
  set currentValue(currentValue: number|string) { this._currentValue = currentValue; this.setUpdateTimer(); }

  removeElement() {
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

  downElement() {
    let parentElement = this.gameDataElement.parent;
    let index: number = parentElement.children.indexOf(this.gameDataElement);
    if (index < parentElement.children.length - 1) {
      let nextElement = parentElement.children[index + 1];
      parentElement.insertBefore(nextElement, this.gameDataElement);
    }
  }

  constructor(
    private changeDetector:ChangeDetectorRef
  ) { }

  ngOnInit(): void {
    if (this.gameDataElement) this.setValues(this.gameDataElement);
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

  ngAfterViewInit(): void {
  }

  ngOnDestroy(): void {
    EventSystem.unregister(this);
    if (this.updateTimer) clearTimeout(this.updateTimer);
    this.updateTimer = null;

  }

  private setValues(object: DataElement) {
    this._name = object.name;
    this._type = object.type;
    this._value = object.value;
    this._currentValue = object.currentValue;
  }

  private updateTimer:NodeJS.Timer;
  private setUpdateTimer() {
    if (this.updateTimer) clearTimeout(this.updateTimer);
    this.updateTimer = setTimeout(() => {
      if (this.gameDataElement.name !== this._name) this.gameDataElement.name = this.name;
      if (this.gameDataElement.type !== this._type) this.gameDataElement.type = this._type;
      if (this.gameDataElement.value !== this._value) this.gameDataElement.value = this._value;
      if (this.gameDataElement.currentValue !== this._currentValue) this.gameDataElement.currentValue = this._currentValue;
      this.updateTimer = null;
    }, 66);
  }

}
