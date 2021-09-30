import {
  AfterViewChecked,
  AfterViewInit,
  ChangeDetectionStrategy,
  ChangeDetectorRef,
  Component,
  ElementRef,
  EventEmitter,
  Input,
  NgZone,
  OnChanges,
  OnDestroy,
  OnInit,
  Output,
  ViewChild,
} from '@angular/core';
import { ChatMessage, ChatMessageContext } from '@udonarium/chat-message';
import { ChatTab } from '@udonarium/chat-tab';
import { ObjectStore } from '@udonarium/core/synchronize-object/object-store';
import { EventSystem } from '@udonarium/core/system';
import { ResettableTimeout } from '@udonarium/core/system/util/resettable-timeout';
import { setZeroTimeout } from '@udonarium/core/system/util/zero-timeout';


@Component({
  selector: 'chat-tab-ease',
  templateUrl: './chat-tab-ease.component.html',
  styleUrls: ['./chat-tab-ease.component.css'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ChatTabEaseComponent implements OnInit {

  @Input() localFontsize: number = 14;
  @Input() isEase: boolean;
  ngOnInit(){
  }
    constructor(
    private ngZone: NgZone,
    private changeDetector: ChangeDetectorRef,
  ) { }
}
