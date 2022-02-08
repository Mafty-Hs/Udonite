import { AfterViewInit, Component, ElementRef, HostListener, NgZone, OnDestroy, OnInit, ViewChild } from '@angular/core';
import { EventSystem } from '@udonarium/core/system';
import { GameTableComponentTemplate } from 'src/app/abstract/game-table.template';
import { TableMouseGestureFlat } from './table-mouse-gesture-flat';

@Component({
  selector: 'game-table-flat',
  templateUrl: './game-table-flat.component.html',
  styleUrls: ['./game-table-flat.component.css']
})
export class GameTableFlatComponent extends GameTableComponentTemplate {
  @ViewChild('root', { static: true }) rootElementRef: ElementRef<HTMLElement>;
  @ViewChild('gameTable', { static: true }) gameTable: ElementRef<HTMLElement>;
  @ViewChild('gameObjects', { static: true }) gameObjects: ElementRef<HTMLElement>;
  @ViewChild('gridCanvas', { static: true }) gridCanvas: ElementRef<HTMLCanvasElement>;


  viewPotisonX: number = 100;
  viewPotisonY: number = 0;
  viewPotisonZ: number = 0;

  viewRotateX: number = 0;
  viewRotateY: number = 0;
  viewRotateZ: number = 0;

  initializeTableMouseGesture() {
    this.mouseGesture = new TableMouseGestureFlat(this.rootElementRef.nativeElement);
    this.mouseGesture.onstart = this.onTableMouseStart.bind(this);
    this.mouseGesture.onend = this.onTableMouseEnd.bind(this);
    this.mouseGesture.ontransform = this.onTableMouseTransform.bind(this);
  }


  setTransform(transformX: number, transformY: number, transformZ: number, rotateX: number, rotateY: number, rotateZ: number, isAbsolute: boolean=false) {
    if (isAbsolute) {
      this.viewRotateX = rotateX;
      this.viewRotateY = rotateY;
      this.viewRotateZ = rotateZ;

      this.viewPotisonX = transformX;
      this.viewPotisonY = transformY;
      this.viewPotisonZ = transformZ;
    } else {
      this.viewRotateX += rotateX;
      this.viewRotateY += rotateY;
      this.viewRotateZ += rotateZ;

      this.viewPotisonX += transformX;
      this.viewPotisonY += transformY;
      this.viewPotisonZ += transformZ;
    }

    if (isAbsolute || rotateX != 0 || rotateY != 0 || rotateX != 0) {
      this.ngZone.run(() => {
        EventSystem.trigger<object>('TABLE_VIEW_ROTATE', {
          x: this.viewRotateX,
          y: this.viewRotateY,
          z: this.viewRotateZ
        });
      });
    }

    this.gameTable.nativeElement.style.transform = 'translateZ(' + this.viewPotisonZ + 'px) translateY(' + this.viewPotisonY + 'px) translateX(' + this.viewPotisonX + 'px) rotateZ(' + this.viewRotateZ + 'deg) ';
  }

}
