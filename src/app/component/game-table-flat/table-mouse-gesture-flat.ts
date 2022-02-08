import { TableMouseGesture , TableMouseGestureEvent } from "src/app/abstract/table-mouse-gesture";

export class TableMouseGestureFlat extends TableMouseGesture {
  onInputMove(ev: any) {
    let x = this.input.pointer.x;
    let y = this.input.pointer.y;
    let deltaX = x - this.currentPositionX;
    let deltaY = y - this.currentPositionY;

    let transformX = 0;
    let transformY = 0;
    let transformZ = 0;

    let rotateX = 0;
    let rotateY = 0;
    let rotateZ = 0;

    let event = TableMouseGestureEvent.DRAG;

    if (this.buttonCode === 2) {
      event = TableMouseGestureEvent.ROTATE;
    } else {
      transformX = deltaX;
      transformY = deltaY;
    }

    this.currentPositionX = x;
    this.currentPositionY = y;

    if (this.ontransform) this.ontransform(transformX, transformY, transformZ, rotateX, rotateY, rotateZ, event, ev);
  }
}
