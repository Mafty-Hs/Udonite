import { Injectable } from '@angular/core';
import { WebGLRenderer } from 'three/src/renderers/WebGLRenderer.js'
import { PerspectiveCamera } from 'three/src/cameras/PerspectiveCamera.js';
import { Scene } from 'three/src/scenes/Scene.js';
import { Clock } from 'three/src/core/Clock.js';
import { Vector3 } from 'three/src/math/Vector3.js';
import { UUID } from '@udonarium/core/system/util/uuid';
import { AudioPlayer, VolumeType } from '@udonarium//core/file-storage/audio-player';


interface EffectData {
      time: number;
      file: string;
      audio?: string;
      audioWait?: number;
      position: string;
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

  canEffect : boolean = true;
  renderers:RenderData[] = [];
  sePLayer:AudioPlayer = new AudioPlayer();

  async playDemo(rect :DOMRect, effectName :string) {
    if (!this.canEffect) return;
    let width = rect.width;
    let height = rect.height;
    let top = rect.top;
    let left = rect.left;
    let identifier = UUID.generateUuid();
    let renderer:RenderData = null;
    renderer = this.generateRenderer(renderer,top,left,width,height, true);
    renderer.identifier = identifier;
    await this.setEffect(renderer ,effectName);
    this.renderers.push(renderer);
    let position = Position[EffectInfo[effectName].position];
    if (EffectInfo[effectName].audio) {
      if (EffectInfo[effectName].audioWait) {
        setTimeout(()=> { this.sePLayer.directPlay(EffectInfo[effectName].audio); } ,EffectInfo[effectName].audioWait)
      }
      else this.sePLayer.directPlay(EffectInfo[effectName].audio);
    }
    renderer.context.play(renderer.effect[effectName],position.x,position.y,position.z);
    setTimeout(()=> this.stop(identifier) , EffectInfo[effectName].time + 1000 );
  }

  async play(rect :DOMRect, effectName :string, is3d :boolean,playSE: boolean = true) {
    if (!this.canEffect || (is3d && !this.isValid(rect))) return;
    let width,height,top,left: number;
    [width,height,top,left] = is3d ? this.calcSize3d(rect,effectName) : this.calcSize2d(rect,effectName);
    let identifier = UUID.generateUuid();
    let renderer:RenderData = null;
    renderer = this.generateRenderer(renderer,top,left,width,height, is3d);
    renderer.identifier = identifier;
    await this.setEffect(renderer ,effectName);
    this.renderers.push(renderer);
    let position = Position[EffectInfo[effectName].position];
    if (playSE && EffectInfo[effectName].audio) {
      if (EffectInfo[effectName].audioWait) {
        setTimeout(()=> { this.sePLayer.directPlay(EffectInfo[effectName].audio); } ,EffectInfo[effectName].audioWait)
      }
      else this.sePLayer.directPlay(EffectInfo[effectName].audio);
    }
    renderer.context.play(renderer.effect[effectName],position.x,position.y,position.z);
    setTimeout(()=> this.stop(identifier) , EffectInfo[effectName].time + 1000 );
  }

  stop(identifier :string) {
    let renderer = this.renderers.find(renderer => renderer.identifier === identifier);
    if (renderer) {
      this.renderers = this.renderers.filter(renderer => renderer.identifier !== identifier);
      renderer.canvas.style.display = 'none';
      renderer.timer = null;
      renderer.identifier == "";
      document.body.removeChild(renderer.canvas);
      setTimeout(() => this.clear(renderer) ,500);
    }
  }

  clear(renderer :RenderData) {
    renderer.renderer.dispose();
    renderer.camera = null;
    renderer.clock = null;
    renderer.scene = null;
    renderer.context = null;
    renderer.effect = null;
    renderer.renderer.forceContextLoss();
    renderer.renderer.domElement = null;
    renderer.renderer = null;
    renderer.canvas.remove();
    renderer.canvas = null;
  }

  generateRenderer(renderData :RenderData,top :number,left :number,width :number,height :number, is3d:boolean):RenderData {
    let canvas = document.createElement('canvas');
    canvas.style.pointerEvents = 'none';
    canvas.style.top = top + 'px';
    canvas.style.left = left + 'px';
    canvas.style.height = height + 'px';
    canvas.style.width = width + 'px';
    canvas.style.zIndex = is3d ? "20" : "1000002";
    canvas.style.position = "absolute";
    document.body.appendChild(canvas);
    let camera = new PerspectiveCamera(30.0, 1, 1, 1000);
    let context = null;
    if (is3d) {
      camera.position.set(20, 20, 20);
      camera.lookAt(new Vector3(0, 3, 0));
    }
    else {
      camera.position.set(0, 0, 20);
      camera.lookAt(new Vector3(0, 0, 0));
    }
    camera.aspect = width / height;
    camera.updateProjectionMatrix();
    let renderer = new WebGLRenderer({ canvas: canvas, alpha: true });
    renderer.setSize(width, height);
    return {identifier: "" ,canvas: canvas, renderer: renderer, camera: camera,clock: new Clock() ,scene: new Scene(), context: context,effect: {} };
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

  calcSize3d(rect: DOMRect , effectName:string) :number[] {
    let size:number = EffectInfo[effectName].size;
    let baseWidth = (rect.bottom - rect.top);
    let baseHeight = (rect.right - rect.left);
    let width:number = this.validation(baseWidth * 2 * size);
    let height:number = this.validation(baseHeight * 2 * size);
    let top:number = rect.top - (height - baseHeight) / 2;
    let left:number = rect.left - (width - baseWidth) / 2;
    return [width,height,top,left]
  }

  calcSize2d(rect: DOMRect , effectName:string) :number[] {
    let size:number = EffectInfo[effectName].size;
    let baseWidth = Math.floor(rect.width);
    let baseHeight = Math.floor(rect.height);
    let width:number = baseHeight > baseWidth ? baseHeight * 1.2 : baseWidth * 1.2;
    let height:number = baseWidth > baseHeight ? baseWidth * 1.2 : baseHeight * 1.2;
    if (EffectInfo[effectName].position === 'area') {
      width *= 2.5;
      height *= 2.5;
    }
    let top:number = Math.floor(rect.top) - (height - baseHeight) / 2;
    let left:number = Math.floor(rect.left) - (width - baseWidth) / 2;
    return [width,height,top,left]
  }

  validation(number :number):number {
    if (number < 0) return 0;
    if (number > 800) return 800;
    return number;
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

  private async setEffect(renderData :RenderData ,effectName :string):Promise<void> {
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

  setEffectSE() {

  }

  initialize() {
    this.sePLayer.volumeType = VolumeType.SE;
    effekseer.initRuntime("./assets/lib/effekseer.wasm",
    () => {
      this.mainLoop();
    },
    () => {
    }
    );
  }

}

const Position:{[key: string]: {x:number ,y:number , z: number }} = {
  'head': {x: 0,y: 2,z: 0},
  'center': {x: 0,y: 1,z: 0} ,
  'foot': {x: 0,y: -2,z: 0},
  'area': {x: 0,y: -2,z: 0},
}

const EffectInfo:{[key: string]: EffectData} = {
  '光柱': {time: 3000, file: "assets/effect/light.efk",audio: 'assets/sounds/effect/light.mp3',size: 1,position: 'foot'},
  '光': {time: 2000, file: "assets/effect/light2.efk",audio: 'assets/sounds/effect/light2.mp3',size: 1,position: 'center'},
  '光2': {time: 1500, file: "assets/effect/light3.efk",audio: 'assets/sounds/effect/light3.mp3',size: 1,position: 'center'},
  '闇': {time: 2000, file: "assets/effect/dark.efk",audio: 'assets/sounds/effect/dark.mp3',size: 1,position: 'center'},
  '闇球': {time: 6000, file: "assets/effect/darksphere.efk",audio: 'assets/sounds/effect/gravity.mp3',size: 1.8,position: 'area'},
  '炎': {time: 1800, file: "assets/effect/fire.efk",audio: 'assets/sounds/effect/fire.mp3',size: 1,position: 'foot'},
  '青炎': {time: 2400, file: "assets/effect/bluefire.efk",audio: 'assets/sounds/effect/fire2.mp3',size: 1,position: 'foot'},
  '黒炎': {time: 2400, file: "assets/effect/blackfire.efk",audio: 'assets/sounds/effect/fire3.mp3',size: 1,position: 'foot'},
  '冷気': {time: 2000, file: "assets/effect/cold.efk",audio: 'assets/sounds/effect/snow.mp3',size: 1,position: 'foot'},
  '水': {time: 2000, file: "assets/effect/water.efk",audio: 'assets/sounds/effect/water.mp3',size: 1,position: 'center'},
  '氷': {time: 2000, file: "assets/effect/ice.efk",audio: 'assets/sounds/effect/ice.mp3',size: 1,position: 'foot'},
  '風1': {time: 2000, file: "assets/effect/wind.efk",audio: 'assets/sounds/effect/wind1.mp3',size: 1,position: 'foot'},
  '風2': {time: 1400, file: "assets/effect/wind2.efk",audio: 'assets/sounds/effect/wind2.mp3',size: 1,position: 'center'},
  '土': {time: 2000, file: "assets/effect/soil.efk",audio: 'assets/sounds/effect/stone.mp3',audioWait: 600,size: 1,position: 'center'},
  '雷': {time: 2000, file: "assets/effect/lightning.efk",audio: 'assets/sounds/effect/thunder.mp3',size: 1,position: 'center'},
  '爆発': {time: 1500, file: "assets/effect/bomb.efk",audio: 'assets/sounds/effect/bomb.mp3',size: 1,position: 'center'},
  '爆発2': {time: 5000, file: "assets/effect/bomb2.efk",audio: 'assets/sounds/effect/bomb2.mp3',audioWait: 2000,size: 1,position: 'center'},
  '核': {time: 6000, file: "assets/effect/nuke.efk",audio: 'assets/sounds/effect/nuke.mp3',audioWait: 2200,size: 1.8,position: 'area'},
  '銃': {time: 1000, file: "assets/effect/gun.efk",audio: 'assets/sounds/effect/gun.mp3',size: 1,position: 'head'},
  '連射': {time: 1000, file: "assets/effect/gun2.efk",audio: 'assets/sounds/effect/gun2.mp3',size: 1,position: 'head'},
  '出血': {time: 2000, file: "assets/effect/blood.efk",audio: 'assets/sounds/effect/blood.mp3',size: 1,position: 'center'},
  '!': {time: 2000, file: "assets/effect/ex.efk",size: 1,position: 'head'},
  '?': {time: 2000, file: "assets/effect/question.efk",size: 1,position: 'head'},
  '♪': {time: 2000, file: "assets/effect/note.efk",size: 1,position: 'head'},
  'ハート': {time: 5000, file: "assets/effect/heart.efk",size: 1,position: 'head'},
  'ハート2': {time: 2000, file: "assets/effect/heart2.efk",size: 1,position: 'head'},
  'ハート3': {time: 2000, file: "assets/effect/heart3.efk",size: 1,position: 'head'},
}
