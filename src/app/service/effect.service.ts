import { Injectable } from '@angular/core';
import { WebGLRenderer } from 'three/src/renderers/WebGLRenderer.js'
import { PerspectiveCamera } from 'three/src/cameras/PerspectiveCamera.js';
import { Scene } from 'three/src/scenes/Scene.js';
import { Clock } from 'three/src/core/Clock.js';
import { Vector3 } from 'three/src/math/Vector3.js';
import { UUID } from '@udonarium/core/system/util/uuid';

interface effectData {
      time: number;
      file: string;
      isEmotion: boolean;
      size: number;
}

interface RenderData {
      identifier: string;
      canvas: HTMLCanvasElement;
      renderer: WebGLRenderer;
      camera: PerspectiveCamera;
      clock:Clock;
      scene: Scene;
      context : effekseer.EffekseerContext;
      timer?: NodeJS.Timer;
      effect: {[key: string]: effekseer.EffekseerEffect}
}

@Injectable({
  providedIn: 'root'
})

export class EffectService {

  effekseerInstance = effekseer;

  canEffect : boolean = true;
  renderers:RenderData[] = [];

  async play(top :number,left :number,width :number,height :number, effectName :string) {
    if (!this.canEffect) return;
    let identifier = UUID.generateUuid();
    let renderer:RenderData = null;
    renderer = this.generateRenderer();
    renderer.identifier = identifier;
    this.setRenderer(renderer,top,left,width,height);
    await this.setEffect(renderer ,effectName);
    this.renderers.push(renderer);
    renderer.context.play(renderer.effect[effectName],0,0,0);
    setTimeout(()=> this.stop(identifier) , EffectInfo[effectName].time + 1000 );
  }

  stop(identifier :string) {
    let renderer = this.renderers.find(renderer => renderer.identifier === identifier);
    if (renderer) {
      this.renderers = this.renderers.filter(renderer => renderer.identifier !== identifier);
      renderer.timer = null;
      renderer.identifier == "";
      renderer.renderer.dispose();
      renderer.renderer = null;
      renderer.canvas.remove();
    }
  }

  setRenderer(renderData :RenderData,top :number,left :number,width :number,height :number):void {
    let canvas = renderData.canvas;
    canvas.style.top = top + 'px';
    canvas.style.left = left + 'px';
    canvas.style.height = height + 'px';
    canvas.style.width = width + 'px';
    renderData.renderer = new WebGLRenderer({ canvas: canvas, alpha: true });
    renderData.renderer.setSize(width, height);
    renderData.camera.aspect = width / height;
    renderData.camera.updateProjectionMatrix();
  }

  get effectName() {
    return Object.keys(EffectInfo) as string[];
  }

  isValid(rect: DOMRect) :boolean {
    if
    (  rect.right < 1
    || rect.left < 1
    || rect.top < 1
    || rect.bottom < 1
    ) return false;
    return true;
  }

  calcSize(rect: DOMRect , effectName:string) :number[] {
    let size:number = EffectInfo[effectName].size;
    let width:number = this.validation((rect.right - rect.left) * 2 * size);
    let height:number = this.validation((rect.bottom - rect.top) * 2 * size);
    let top:number;
    if (EffectInfo[effectName].isEmotion) {
      top = rect.top - ((rect.bottom - rect.top) * size / 2);
    }
    else {
      top = rect.top - ((rect.bottom - rect.top) * size / 4);
    }
    let left:number = rect.left - (width - (rect.right - rect.left)) / 2;
    return [width,height,top,left]
  }
  validation(number :number):number {
    if (number < 0) return 0;
    if (number > 800) return 800;
    return number;
  }

  private async setEffect(renderData :RenderData, effectName :string):Promise<void> {
    return new Promise<void>((resolve, reject) => {
      effekseer.initRuntime("./assets/lib/effekseer.wasm",
      async () => {
        await this._setEffect(renderData ,effectName);
        resolve()
      },
      () => {
        reject()
      }
      );
    })
  }

  private async _setEffect(renderData :RenderData ,effectName :string):Promise<void> {
    renderData.context = effekseer.createContext();
    renderData.context.init(renderData.renderer.getContext(), {
      instanceMaxCount: 2000,
      squareMaxCount: 8000,
    });
    renderData.context.setRestorationOfStatesFlag(false);
    if (!renderData.effect[effectName]) {
      return new Promise<void>((resolve, reject) => {
        renderData.effect[effectName]  = renderData.context.loadEffect(EffectInfo[effectName].file,1,
          () => {
            resolve()
          },
          () => {
            reject()
          }
        );
      });
    }
    else {
      return;
    }
  }

  mainLoop = () => {
    requestAnimationFrame(this.mainLoop.bind(this));
    for (let canvas of this.renderers) {
      canvas.context.update(canvas.clock.getDelta() * 60.0);
      canvas.renderer.render(canvas.scene, canvas.camera);
      canvas.context.setProjectionMatrix(Float32Array.from(canvas.camera.projectionMatrix.elements));
      canvas.context.setCameraMatrix(Float32Array.from(canvas.camera.matrixWorldInverse.elements));
      canvas.context.draw();
      canvas.renderer.resetState();
    }
  };

  generateRenderer(): RenderData {
    let canvas = document.createElement('canvas');
    canvas.style.zIndex = "20";
    canvas.style.position = "absolute";
    document.body.appendChild(canvas);
    let camera = new PerspectiveCamera(30.0, 1, 1, 1000);
    let context = null;
    camera.position.set(20, 20, 20);
    camera.lookAt(new Vector3(0, 0, 0));
    return {identifier: "" ,canvas: canvas, renderer: null, camera: camera,clock: new Clock() ,scene: new Scene(), context: context,effect: {} };
  }

  initialize() {
    this.mainLoop();
  }

}

const EffectInfo:{[key: string]: effectData} = {
  '光柱': {time: 3000, file: "assets/effect/light.efk",size: 1,isEmotion: false},
  '光': {time: 2000, file: "assets/effect/light2.efk",size: 1,isEmotion: false},
  '光2': {time: 1500, file: "assets/effect/light3.efk",size: 1,isEmotion: false},
  '闇': {time: 2000, file: "assets/effect/dark.efk",size: 1,isEmotion: false},
  '闇球': {time: 6000, file: "assets/effect/darksphere.efk",size: 1.8,isEmotion: false},
  '炎': {time: 1800, file: "assets/effect/fire.efk",size: 1,isEmotion: false},
  '炎2': {time: 2400, file: "assets/effect/fire2.efk",size: 1,isEmotion: false},
  '青炎': {time: 2400, file: "assets/effect/bluefire.efk",size: 1,isEmotion: false},
  '炎SE': {time: 1800, file: "assets/effect/firese.efk",size: 1,isEmotion: false},
  '冷気': {time: 2000, file: "assets/effect/cold.efk",size: 1,isEmotion: false},
  '水': {time: 2000, file: "assets/effect/water.efk",size: 1,isEmotion: false},
  '氷': {time: 2000, file: "assets/effect/ice.efk",size: 1,isEmotion: false},
  '氷SE': {time: 2000, file: "assets/effect/icese.efk",size: 1,isEmotion: false},
  '風1': {time: 2000, file: "assets/effect/wind.efk",size: 1,isEmotion: false},
  '風2': {time: 1400, file: "assets/effect/wind2.efk",size: 1,isEmotion: false},
  '土': {time: 2000, file: "assets/effect/soil.efk",size: 1,isEmotion: false},
  '雷': {time: 2000, file: "assets/effect/lightning.efk",size: 1,isEmotion: false},
  '爆発': {time: 1500, file: "assets/effect/bomb.efk",size: 1,isEmotion: false},
  '爆発2': {time: 5000, file: "assets/effect/bomb2.efk",size: 1,isEmotion: false},
  '爆発SE': {time: 1500, file: "assets/effect/bombse.efk",size: 1,isEmotion: false},
  '核': {time: 6000, file: "assets/effect/nuke.efk",size: 1.8,isEmotion: false},
  '銃': {time: 1000, file: "assets/effect/gun.efk",size: 1,isEmotion: false},
  '出血': {time: 2000, file: "assets/effect/blood.efk",size: 1,isEmotion: false},
  '!': {time: 2000, file: "assets/effect/ex.efk",size: 1,isEmotion: true},
  '?': {time: 2000, file: "assets/effect/question.efk",size: 1,isEmotion: true},
  '♪': {time: 2000, file: "assets/effect/note.efk",size: 1,isEmotion: true},
  'ハート': {time: 5000, file: "assets/effect/heart.efk",size: 1,isEmotion: true},
  'ハート2': {time: 2000, file: "assets/effect/heart2.efk",size: 1,isEmotion: true},
  'ハート3': {time: 2000, file: "assets/effect/heart3.efk",size: 1,isEmotion: true},
}
