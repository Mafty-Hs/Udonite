import { animate, keyframes, style, transition, trigger } from '@angular/animations';
import { Component, ElementRef, Input, OnInit, OnDestroy, AfterViewInit, ViewChild, ViewContainerRef,ChangeDetectionStrategy } from '@angular/core';
import { EventSystem } from '@udonarium/core/system';
import { PanelService , PanelSize } from 'service/panel.service';
import { PointerDeviceService } from 'service/pointer-device.service';

@Component({
  selector: 'ui-panel',
  templateUrl: './ui-panel.component.html',
  styleUrls: ['./ui-panel.component.css'],
  changeDetection: ChangeDetectionStrategy.Default,
  providers: [
    PanelService,
  ],
  animations: [
    trigger('flyInOut', [
      transition('void => *', [
        animate('100ms ease-out', keyframes([
          style({ transform: 'scale(0.8, 0.8)', opacity: '0', offset: 0 }),
          style({ transform: 'scale(1.0, 1.0)', opacity: '1', offset: 1.0 })
        ]))
      ]),
      transition('* => void', [
        animate(100, style({ transform: 'scale(0, 0)' }))
      ])
    ])
  ]
})
export class UIPanelComponent implements OnInit ,OnDestroy , AfterViewInit{
  @ViewChild('draggablePanel', { static: true }) draggablePanel: ElementRef<HTMLElement>;
  @ViewChild('scrollablePanel', { static: true }) scrollablePanel: ElementRef<HTMLDivElement>;
  @ViewChild('titleBar', { static: true }) titleBar: ElementRef<HTMLDivElement>;
  @ViewChild('content', { read: ViewContainerRef, static: true }) content: ViewContainerRef;

  @Input() set title(title: string) { this.panelService.title = title; }
  @Input() set left(left: number) { this.panelService.left = left; }
  @Input() set top(top: number) {
    this.panelService.top = top;
  }
  @Input() set width(width: number) { this.panelService.width = width; }
  @Input() set height(height: number) {
    this.panelService.height = height ;
  }
  @Input() set isAbleFullScreenButton(isAbleFullScreenButton: boolean) { this.panelService.isAbleFullScreenButton = isAbleFullScreenButton; }
  @Input() set isAbleMinimizeButton(isAbleMinimizeButton: boolean) { this.panelService.isAbleMinimizeButton = isAbleMinimizeButton; }
  @Input() set isAbleCloseButton(isAbleCloseButton: boolean) { this.panelService.isAbleCloseButton = isAbleCloseButton; }

  get fullPanelSize():PanelSize {return this.panelService.fullPanelSize}
  get title(): string { return this.panelService.title; }
  get left() { return this.panelService.left; }
  get top() { return this.panelService.top; }
  get width() { return this.panelService.width; }
  get height() { return this.panelService.height; }
  get isAbleFullScreenButton() { return this.panelService.isAbleFullScreenButton; }
  get isAbleMinimizeButton() { return this.panelService.isAbleMinimizeButton; }
  get isAbleCloseButton() { return this.panelService.isAbleCloseButton; }

  private preLeft: number = 0
  private preTop: number = 0;
  private preWidth: number = 100;
  private preHeight: number = 100;

  isFullScreen: boolean = false;
  isMinimized: boolean = false;

  moveTimer:NodeJS.Timer;
  get isPointerDragging(): boolean { return this.pointerDeviceService.isDragging; }
  observer = new MutationObserver(records => {
    if (this.moveTimer) clearTimeout(this.moveTimer);
    setTimeout(() => this.onMove(),1000)
  })

  onMove() {
    let panel = this.draggablePanel.nativeElement;
    if (panel.offsetTop < 50) {
      this.top = 50;
      panel.style.top = this.top + 'px';
      if (this.panelService.fullPanelSize.height < panel.offsetHeight) {
        this.height = this.panelService.fullPanelSize.height;
        panel.style.height = this.height + 'px';
      }
    }
  }

  constructor(
    public panelService: PanelService,
    private pointerDeviceService: PointerDeviceService
  ) {
    EventSystem.register(this)
      .on('ALL_PANEL_DIE', event => {
        this.close();
    });
  }

  ngOnInit() {
    this.panelService.scrollablePanel = this.scrollablePanel.nativeElement;
  }

  ngAfterViewInit(): void {
    setTimeout(() => {
    this.observer.observe(this.draggablePanel.nativeElement, {
      attributes: true,
      attributeFilter: ['style']
    })},500);
  }

  ngOnDestroy(): void {
    this.observer.disconnect();
  }

  toggleFullScreen() {
    if (this.isMinimized) return;
    let panel = this.draggablePanel.nativeElement;
    panel.style.transition = 'width 0.1s ease-in-out, height 0.1s ease-in-out';
    setTimeout(() => {
      panel.style.transition = null;
    }, 100);
    if (panel.offsetLeft <= 0
      && panel.offsetTop <= 50
      && panel.offsetWidth >= this.fullPanelSize.width
      && panel.offsetHeight >= this.fullPanelSize.height) {
      this.isFullScreen = false;
    } else {
      this.isFullScreen = true;
    }

    if (this.isFullScreen) {
      this.preLeft = panel.offsetLeft;
      this.preTop = panel.offsetTop;
      this.preWidth = panel.offsetWidth;
      this.preHeight = panel.offsetHeight;

      this.left = 0;
      this.top = 50;
      this.width = this.fullPanelSize.width;
      this.height = this.fullPanelSize.height;

      panel.style.left = this.left + 'px';
      panel.style.top = this.top + 'px';
      panel.style.width = this.width + 'px';
      panel.style.height = this.height + 'px';
    } else {
      this.left = this.preLeft;
      this.top = this.preTop;
      this.width = this.preWidth;
      this.height = this.preHeight;
    }
  }

  toggleMinimize() {
    if (this.isFullScreen) return;

    let body  = this.scrollablePanel.nativeElement;
    let panel = this.draggablePanel.nativeElement;
    if (this.isMinimized) {
      this.isMinimized = false;
      body.style.display = null;
      this.height = this.preHeight;
    } else {
      this.preHeight = panel.offsetHeight;

      this.isMinimized = true;
      body.style.display = 'none';
      this.height = this.titleBar.nativeElement.offsetHeight;
    }
  }


  close() {
    if (this.panelService) this.panelService.close();
  }
}
