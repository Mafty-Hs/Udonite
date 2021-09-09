import { Injectable } from '@angular/core';
import * as THREE from 'three';

@Injectable({
  providedIn: 'root'
})
export class EffectService {

  effectName :string[] = ['光柱','光','光2','闇','炎','炎2','炎SE','冷気','水','風1','風2','土','雷','爆発','爆発2','爆発SE','出血','!','?','♪','ハート','ハート2','ハート3'];
  effectTime : {[key: string]: number } = {
    '光柱': 3000,
    '光': 2000,
    '光2': 1500,
    '闇': 1500,
    '炎': 1800,
    '炎2': 2400,
    '炎SE': 1800,
    '冷気': 2000,
    '水': 2000,
    '風1': 2000,
    '風2': 1400,
    '土': 2000,
    '雷': 2000,
    '爆発': 1500,
    '爆発2': 5000,
    '爆発SE': 1500,
    '出血': 2000,
    '!': 2000,
    '?': 2000,
    '♪': 2000,
    'ハート': 2400,
    'ハート2': 2000,
    'ハート3': 2000,
  };

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

  addEffect(context :effekseer.EffekseerContext) {
    let effects :{[key: string]: any} = {};
    effects["光柱"] = context.loadEffect("assets/effect/light.efk");
    effects["光"] = context.loadEffect("assets/effect/light2.efk");
    effects["光2"] = context.loadEffect("assets/effect/light3.efk");
    effects["闇"] = context.loadEffect("assets/effect/dark.efk");
    effects["炎"] = context.loadEffect("assets/effect/fire.efk");
    effects["炎2"] = context.loadEffect("assets/effect/fire2.efk");
    effects["炎SE"] = context.loadEffect("assets/effect/firese.efk");
    effects["冷気"] = context.loadEffect("assets/effect/cold.efk");
    effects["水"] = context.loadEffect("assets/effect/water.efk");
    effects["風1"] = context.loadEffect("assets/effect/wind.efk");
    effects["風2"] = context.loadEffect("assets/effect/wind2.efk");
    effects["土"] = context.loadEffect("assets/effect/soil.efk");
    effects["雷"] = context.loadEffect("assets/effect/lightning.efk");
    effects["爆発"] = context.loadEffect("assets/effect/bomb.efk");
    effects["爆発2"] = context.loadEffect("assets/effect/bomb2.efk");
    effects["爆発SE"] = context.loadEffect("assets/effect/bombse.efk");
    effects["出血"] = context.loadEffect("assets/effect/blood.efk");
    effects["!"] = context.loadEffect("assets/effect/ex.efk");
    effects["?"] = context.loadEffect("assets/effect/question.efk");
    effects["♪"] = context.loadEffect("assets/effect/note.efk");
    effects["ハート"] = context.loadEffect("assets/effect/heart.efk");
    effects["ハート2"] = context.loadEffect("assets/effect/heart2.efk");
    effects["ハート3"] = context.loadEffect("assets/effect/heart3.efk");
    return effects;
  }

  width(rect: DOMRect) :number {
    let value:number = (rect.right - rect.left) * 2;
    return this.validation(value);
  }
  height(rect: DOMRect):number {
    let value:number = (rect.bottom - rect.top) * 2;
    return this.validation(value);;
  }
  top(rect: DOMRect):number {
    let value:number = rect.top - (this.height(rect) / 6);
    return value;
  }
  left(rect: DOMRect):number {
    let value:number = rect.left - (this.width(rect) / 4);
    return value;
  }
  validation(number :number):number {
    if (number < 0) return 0;
    if (number > 500) return 500;
    return number;
  }

  constructor() { }
}
