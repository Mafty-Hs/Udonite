import { AfterViewInit, ChangeDetectorRef, Component, ElementRef, Input, NgZone, OnDestroy, OnInit, ViewChild } from '@angular/core';
import { EventSystem, IONetwork } from '@udonarium/core/system';
import { PeerCursor } from '@udonarium/peer-cursor';
import { ResettableTimeout } from '@udonarium/core/system/util/resettable-timeout';
import { BatchService } from 'service/batch.service';
import { CoordinateService } from 'service/coordinate.service';
import { ImageService } from 'service/image.service';
import { PointerCoordinate } from 'service/pointer-device.service';

@Component({
  selector: 'peer-cursor, [peer-cursor]',
  templateUrl: './peer-cursor.component.html',
  styleUrls: ['./peer-cursor.component.css']
})
export class PeerCursorComponent implements OnInit, AfterViewInit, OnDestroy {

  @ViewChild('cursor') cursorElementRef: ElementRef;
  @ViewChild('opacity') opacityElementRef: ElementRef;
  @Input() cursor: PeerCursor = PeerCursor.myCursor;
  @Input() isFlat: boolean = false;

  playerIdetifier:string = null;
  isMoving:boolean = false;
  transform:string = "";
  iconUrl: string = this.imageService.skeletonImage.url;
  name: string = "loading";
  isMine: boolean = false;
  color: string = '#f0dabd';

  update() {
    if (this.cursor.player) {
      this.playerIdetifier = this.cursor.playerIdentifier;
      this.iconUrl = this.imageService.getSkeletonOr(this.cursor.player.image).url;
      this.name = this.cursor.player.name;
      this.color = this.cursor.player.color != '#ffffff' ? this.cursor.player.color : '#f0dabd';
    }
    else {
      setTimeout(() => {this.update()}, 1000);
    }
  }

  private cursorElement: HTMLElement = null;
  private opacityElement: HTMLElement = null;
  private fadeOutTimer: ResettableTimeout = null;

  private updateInterval: NodeJS.Timer = null;
  private callcack: any = (e) => this.onMouseMove(e);

  private _x: number = 0;
  private _y: number = 0;
  private _target: HTMLElement;

  delayMs: number = 100;

  constructor(
    private changeDetector: ChangeDetectorRef,
    private batchService: BatchService,
    private coordinateService: CoordinateService,
    private imageService:ImageService,
    private ngZone: NgZone
  ) { }

  ngOnInit() {
    this.isMine = this.cursor.isMine;
    this.transform = this.isFlat ? 'translateX(-100%) translateY(-100%) rotate(45deg)' :'translateX(-100%) translateY(-100%) rotateX(-90deg) rotateZ(45deg)'
    this.update();
    if (!this.isMine) {
      EventSystem.register(this)
        .on('CURSOR_MOVE', event => {
          if (event.sendFrom !== this.cursor.peerId) return;
          this.move(event.data[0],event.data[1],event.data[2]);
        })
        .on('UPDATE_GAME_OBJECT', -1000, event => {
          if (event.data.identifier === this.playerIdetifier) {
            this.update();
          }
        });
    }
  }

  async move(x :number ,y: number ,z: number) {
    this.resetFadeOut();
    this.stopTransition();
    this.setPosition(x, y, z);
  }

  ngAfterViewInit() {
    if (this.isMine) {
      this.ngZone.runOutsideAngular(() => {
        document.body.addEventListener('mousemove', this.callcack);
        document.body.addEventListener('touchmove', this.callcack);
      });
    } else {
      this.cursorElement = this.cursorElementRef.nativeElement;
      this.opacityElement = this.opacityElementRef.nativeElement;
      this.setAnimatedTransition();
      this.setPosition(0, 0, 0);
      this.resetFadeOut();
    }
  }

  ngOnDestroy() {
    document.body.removeEventListener('mousemove', this.callcack);
    document.body.removeEventListener('touchmove', this.callcack);
    EventSystem.unregister(this);
    this.batchService.remove(this);
    if (this.fadeOutTimer) this.fadeOutTimer.clear();
  }

  private onMouseMove(e: any) {
    let x = e.touches ? e.changedTouches[0].pageX : e.pageX;
    let y = e.touches ? e.changedTouches[0].pageY : e.pageY;
    x = Math.round(x);
    y = Math.round(y);
    if (x === this._x && y === this._y) return;
    this._MouseMove(x,y,e.target)
  }

  private async _MouseMove(x :number, y :number, target:HTMLElement) {
    this._x = x;
    this._y = y;
    this._target = target;
    if (!this.updateInterval) {
      this.updateInterval = setTimeout(() => {
        this.updateInterval = null;
        this.calcLocalCoordinate(this._x, this._y, this._target);
      }, this.delayMs);
    }

  }

  private calcLocalCoordinate(x: number, y: number, target: HTMLElement) {
    //あとで対処
    if (!document.getElementById('app-table-layer').contains(target)) return;

    let coordinate: PointerCoordinate = { x: x, y: y, z: 0 };
    coordinate = this.coordinateService.calcTabletopLocalCoordinate(coordinate, target);
    coordinate =  { x: Math.round(coordinate.x) , y: Math.round(coordinate.y), z: Math.round(coordinate.z) };
    EventSystem.call('CURSOR_MOVE', [coordinate.x, coordinate.y, coordinate.z]);
  }

  fadeOutTime = null

  private resetFadeOut() {
    if (!this.isMoving) {
      this.opacityElement.style.opacity = '1.0';
      this.setAnimatedTransition();
      this.isMoving = true;
    }
    if (this.fadeOutTimer == null) {
      this.fadeOutTimer = new ResettableTimeout(() => {
        this.opacityElement.style.opacity = '0.0';
        this.isMoving = false;
      }, 3000);
    }
    this.fadeOutTimer.reset();
  }

  private stopTransition() {
    this.cursorElement.style.transform = window.getComputedStyle(this.cursorElement).transform;
  }

  private setAnimatedTransition() {
    this.cursorElement.style.transition = `transform ${this.delayMs + 33}ms linear, opacity 0.5s ease-out`;
  }

  private setPosition(x: number, y: number, z: number) {
    let css = 'translate3d(' + x + 'px,' + y + 'px,' + z + 'px) ';
    this.cursorElement.style.transform = css;
  }
}
