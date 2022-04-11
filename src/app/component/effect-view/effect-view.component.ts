import { Component, OnInit, ViewChild, AfterViewInit, OnDestroy , NgZone } from '@angular/core';
import { EventSystem } from '@udonarium/core/system';
import { PanelService } from 'service/panel.service';
import { EffectService } from 'service/effect.service';
import { WebGLRenderer, PerspectiveCamera, Scene, Clock,Vector3 } from 'three';

@Component({
  selector: 'effect-view',
  templateUrl: './effect-view.component.html',
  styleUrls: ['./effect-view.component.css']
})
export class EffectViewComponent implements OnInit, OnDestroy, AfterViewInit  {
  @ViewChild('effect') effect;

  width:number = 200;
  height:number = 200;
  effectName:string;
  get effectsName():string[] {
    return this.effectService.effectName;
  }

  private renderer;
  private camera = new PerspectiveCamera(30.0, this.width / this.height, 1, 1000);
  private scene = new Scene();
  private clock = new Clock();
  context : effekseer.EffekseerContext = null;
  effects :{[key: string]: any} = {};

  play() {
    this.context.play(this.effects[this.effectName], 0, 0, 0);
  }

  isDrag :boolean = false;

  setEffect() {
    if(!this.isDrag && this.effectName) {
      this.isDrag = true;
    }
  }

  cancel() {
    this.isDrag = false;
  }

  onSelect(characterIdentifier: string) {
     if (characterIdentifier){
       let eventstat = [this.effectName , [characterIdentifier]]
       EventSystem.call('CHARACTER_EFFECT', eventstat);
     }
     this.isDrag = false;
  }

  private setContext() {
        this.context = this.effectService.createContext(this.renderer);
        this.effects = this.effectService.addEffectDemo(this.context)
        this.ngZone.runOutsideAngular(() => {
        const mainLoop = () => {
          requestAnimationFrame(mainLoop.bind(this));
          this.animate();
        };
        mainLoop();
    });
  }

  animate() {
         this.context.update(this.clock.getDelta() * 60.0);
         this.renderer.render(this.scene, this.camera);
         this.context.setProjectionMatrix(Float32Array.from(this.camera.projectionMatrix.elements));
         this.context.setCameraMatrix(Float32Array.from(this.camera.matrixWorldInverse.elements));
         this.context.draw();
         this.renderer.resetState();
  }

  private renderingInit() {
    this.renderer = new WebGLRenderer({canvas: this.effect.nativeElement as HTMLCanvasElement , alpha: true});
    this.renderer.setSize(this.width, this.height);
    this.camera.position.set(20, 20, 20);
    this.camera.lookAt(new Vector3(0, 0, 0));
  }

  constructor(
    private panelService: PanelService,
    private effectService: EffectService,
    private ngZone: NgZone
  ) {
 }

  ngOnInit(): void {
    Promise.resolve().then(() => this.panelService.title = 'エフェクト');
    EventSystem.register(this)
     .on('SELECT_TABLETOP_OBJECT', -1000, event => {
        if (this.isDrag) {
          this.onSelect(event.data.identifier);
        }
     });
  }
  ngAfterViewInit() {
    this.effect.nativeElement.style.backgroundImage = 'url(assets/images/effect.png)';
    this.renderingInit();
    this.setContext();
  }
  ngOnDestroy() {
    EventSystem.unregister(this);
  }


}
