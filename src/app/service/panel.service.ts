import { ComponentFactoryResolver, ComponentRef, Injectable, ViewContainerRef } from '@angular/core';

declare var Type: FunctionConstructor;
interface Type<T> extends Function {
  new(...args: any[]): T;
}

export interface PanelOption {
  title?: string;
  left?: number;
  top?: number;
  width?: number;
  height?: number;
}

export interface PanelSize {
  width: number;
  height: number;
}

@Injectable()
export class PanelService {
  /* Todo */
  static defaultParentViewContainerRef: ViewContainerRef;
  static UIPanelComponentClass: { new(...args: any[]): any } = null;

  get fullPanelSize():PanelSize {
    return {
      width: window.innerWidth ,
      height: (window.innerHeight - 50)
    };
  }

  private panelComponentRef: ComponentRef<any>
  title: string = '無名のパネル';
  left: number = 0;
  _top: number = 50;
  get top():number {
    return this._top;
  }
  set top(_top:number) {
    this._top = _top < 50 ? 50 : _top;
  }
  width: number = 100;
  _height: number = 100;
  get height():number {
    return this._height;
  }
  set height(_height:number) {
     this._height = ( _height > this.fullPanelSize.height ) ? this.fullPanelSize.height : _height;
     setTimeout(() => this.topfix() ,500 );
  }

  topfix() {
    console.log('top:' + this.top)
    console.log('height:' + this.height)
  }

  isAbleFullScreenButton: boolean = true;
  isAbleMinimizeButton: boolean = true;
  isAbleCloseButton: boolean = true;

  scrollablePanel: HTMLDivElement = null;

  constructor(
    private componentFactoryResolver: ComponentFactoryResolver
  ) { }

  get isShow(): boolean {
    return this.panelComponentRef ? true : false;
  }

  open<T>(childComponent: Type<T>, option?: PanelOption, parentViewContainerRef?: ViewContainerRef): T {
    if (!parentViewContainerRef) {
      parentViewContainerRef = PanelService.defaultParentViewContainerRef;
    }
    let panelComponentRef: ComponentRef<any>;

    const injector = parentViewContainerRef.injector;

    const panelComponentFactory = this.componentFactoryResolver.resolveComponentFactory(PanelService.UIPanelComponentClass);
    const bodyComponentFactory = this.componentFactoryResolver.resolveComponentFactory(childComponent);

    panelComponentRef = parentViewContainerRef.createComponent(panelComponentFactory, parentViewContainerRef.length, injector);
    let bodyComponentRef: ComponentRef<any> = panelComponentRef.instance.content.createComponent(bodyComponentFactory);

    const childPanelService: PanelService = panelComponentRef.injector.get(PanelService);

    childPanelService.panelComponentRef = panelComponentRef;
    if (option) {
      if (option.title) childPanelService.title = option.title;
      if (option.top) childPanelService.top = option.top;
      if (option.left) childPanelService.left = option.left;
      if (option.width) childPanelService.width = option.width;
      if (option.height) childPanelService.height = option.height;
    }
    panelComponentRef.onDestroy(() => {
      childPanelService.panelComponentRef = null;
    });

    return <T>bodyComponentRef.instance;
  }

  close() {
    if (this.panelComponentRef) {
      this.panelComponentRef.destroy();
      this.panelComponentRef = null;
    }
  }
}
