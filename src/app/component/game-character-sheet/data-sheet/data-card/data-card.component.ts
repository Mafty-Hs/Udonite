import { AfterViewInit, Component, Input, OnDestroy, OnInit,ChangeDetectionStrategy,ChangeDetectorRef} from '@angular/core';
import { ObjectStore } from '@udonarium/core/synchronize-object/object-store';
import { EventSystem } from '@udonarium/core/system';
import { DataElement } from '@udonarium/data-element';
import { GameCharacter } from '@udonarium/game-character';

@Component({
  selector: 'data-card',
  templateUrl: './data-card.component.html',
  styleUrls: ['./data-card.component.css'],
  changeDetection:ChangeDetectionStrategy.OnPush
})
export class DataCardComponent implements OnInit, OnDestroy, AfterViewInit {
  @Input() tableTopObjectName: string = null;
  @Input() characterIdentifier: string = '';
  @Input() gameDataElement: DataElement = null;
  isEdit:boolean = false;

  private _name: string = '';
  get name(): string { return this._name; }
  set name(name: string) { this._name = name; this.setUpdateTimer(); }

  toggleEdit(){
    this.isEdit = !this.isEdit;
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

  downElement() {
    let parentElement = this.gameDataElement.parent;
    let index: number = parentElement.children.indexOf(this.gameDataElement);
    if (index < parentElement.children.length - 1) {
      let nextElement = parentElement.children[index + 1];
      parentElement.insertBefore(nextElement, this.gameDataElement);
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
  }

  private setValues(object: DataElement) {
    this._name = object.name;
  }

  private updateTimer:NodeJS.Timer;
  private setUpdateTimer() {
    clearTimeout(this.updateTimer);
    this.updateTimer = setTimeout(() => {
      if (this.gameDataElement.name !== this.name) this.gameDataElement.name = this.name;
      this.updateTimer = null;
    }, 66);
  }

}
