import { Injectable } from '@angular/core';
import * as THREE from 'three';
import { Observable } from 'rxjs';
import { Subject } from 'rxjs';

interface effectData {
      time: number;
      file: string;
      isEmotion: boolean;
      size: number;
}

@Injectable({
  providedIn: 'root'
})

export class EffectService {

  private _canEffect$ : Subject<boolean> = new Subject<boolean>();
  private _canEffect : boolean;
  public canEffect$ = this._canEffect$.asObservable();
  get canEffect():boolean {
    return this._canEffect;
  }
  set canEffect(canEffect: boolean) {
    this._canEffect$.next(canEffect);
    this._canEffect = canEffect; 
  }

  effectInfo:
    { [key: string]: effectData; }
    = {
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

  get effectName() {
    return Object.keys(this.effectInfo) as string[];
  }

  createContext(renderer: THREE.WebGLRenderer) :effekseer.EffekseerContext {
    let context:  effekseer.EffekseerContext;
    context = effekseer.createContext();
    context.init(renderer.getContext(), {
       instanceMaxCount: 2000,
       squareMaxCount: 8000,
    });
    context.setRestorationOfStatesFlag(false);
    return context;  
  }

  addEffectDemo(context :effekseer.EffekseerContext) {
    let effects :{[key: string]: any} = {};
    Object.keys(this.effectInfo).forEach(
      key => 
        effects[key] = context.loadEffect(this.effectInfo[key].file)
    );
    return effects;
  }

  addEffect(context :effekseer.EffekseerContext ,effectName:string) {
    let effect = context.loadEffect(this.effectInfo[effectName].file);
    return effect;
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
    let size:number = this.effectInfo[effectName].size;
    let width:number = this.validation((rect.right - rect.left) * 2 * size);
    let height:number = this.validation((rect.bottom - rect.top) * 2 * size);
    let top:number;
    if (this.effectInfo[effectName].isEmotion) { 
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

  constructor() { 
    this.canEffect = true;
  }
}
