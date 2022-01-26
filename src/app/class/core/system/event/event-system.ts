import { IONetwork } from '../socketio/ionetwork';
import { NetworkStatus } from '../socketio/connection';
import { Event, EventContext } from './event';
import { Listener } from './listener';
import { Callback } from './observer';
import { Subject } from './subject';
import { ObjectNetworkContext } from '@udonarium/core/synchronize-object/object-io';
import { Subscription } from 'rxjs';
import { ImageStorage } from '@udonarium/core/file-storage/image-storage';
import { ImageContext } from '@udonarium/core/file-storage/image-context';
import { AudioStorage } from  '@udonarium/core/file-storage/audio-storage';
import { AudioContext } from '@udonarium/core/file-storage/audio-context';

type EventName = string;

export class EventSystem implements Subject {
  private static _instance: EventSystem
  static get instance(): EventSystem {
    if (!EventSystem._instance) {
      EventSystem._instance = new EventSystem();
      EventSystem._instance.initializeNetworkEvent();
    }
    return EventSystem._instance;
  }

  isOpen:boolean = false;

  subcriber:Subscription;
  private listenerMap: Map<EventName, Listener[]> = new Map();
  private constructor() {
    console.log('EventSystem ready...');
  }

  register(key: any): Listener {
    let listener: Listener = new Listener(this, key);
    return listener;
  }

  unregister(key: any): void
  unregister(key: any, eventName: string): void
  unregister(key: any, callback: Callback<any>): void
  unregister(key: any, eventName: string, callback: Callback<any>): void
  unregister(...args: any[]): void {
    if (args.length === 1) {
      this._unregister(args[0], null, null);
    } else if (args.length === 2) {
      if (typeof args[1] === 'string') {
        this._unregister(args[0], args[1], null);
      } else {
        this._unregister(args[0], null, args[1]);
      }
    } else {
      this._unregister(args[0], args[1], args[2]);
    }
  }

  private _unregister(key: any = this, eventName: string, callback: Callback<any>) {
    let listenersIterator = this.listenerMap.values();
    for (let listeners of listenersIterator) {
      for (let listener of listeners.concat()) {
        if (listener.isEqual(key, eventName, callback)) {
          listener.unregister();
        }
      }
    }
  }

  registerListener(listener: Listener): Listener {
    let listeners: Listener[] = this.getListeners(listener.eventName);

    listeners.push(listener);
    listeners.sort((a, b) => b.priority - a.priority);
    this.listenerMap.set(listener.eventName, listeners);
    return listener;
  }

  unregisterListener(listener: Listener): Listener {
    let listeners = this.getListeners(listener.eventName);
    let index = listeners.indexOf(listener);
    if (index < 0) return null;
    listeners.splice(index, 1);
    listener.unregister();
    if (listeners.length < 1) this.listenerMap.delete(listener.eventName);
    return listener;
  }

  call<T>(eventName: string, data: T, sendTo?: string): void
  call<T>(event: Event<T>, sendTo?: string): void
  call<T>(...args: any[]): void {
    if (typeof args[0] === 'string') {
      this._call(new Event(args[0], args[1]), args[2]);
    } else {
      this._call(args[0], args[1]);
    }
  }

  private _call(event: Event<any>, sendTo?: string) {
    let context = event.toContext();
    this.trigger(context);
    IONetwork.instance.call(context, sendTo)
  }

  trigger<T>(eventName: string, data: T): Event<T>
  trigger<T>(event: Event<T>): Event<T>
  trigger<T>(event: EventContext<T>): Event<T>
  trigger<T>(...args: any[]): Event<T> {
    if (args.length === 2) {
      this._trigger(new Event(args[0], args[1]));
    } else if (args[0] instanceof Event) {
      return this._trigger(args[0]);
    } else {
      return this._trigger(new Event(args[0].eventName, args[0].data, args[0].sendFrom));
    }
  }

  private _trigger<T>(event: Event<T>): Event<T> {
    let listeners = this.getListeners(event.eventName).concat(this.getListeners('*'));
    for (let listener of listeners) {
      listener.trigger(event);
    }
    return event;
  }

  private getListeners(eventName: string): Listener[] {
    return this.listenerMap.has(eventName) ? this.listenerMap.get(eventName) : [];
  }

  private initializeNetworkEvent() {
    IONetwork.instance.socket.statusEmit.subscribe((status) => {this.onNetworkChange(<NetworkStatus>status)});
    this.subcriber = IONetwork.instance.roomIdEmit.subscribe((roomId) => {
      this.trigger('ROOM_JOIN',roomId)
      this.subcriber.unsubscribe();
    });
  }

  private onNetworkChange(status :NetworkStatus) {
    let peerId :string = IONetwork.instance.peerId; 
    switch(status) {
      case NetworkStatus.CONNECT:
        console.log('Network is Open');
        this.trigger('OPEN_NETWORK', { peerId: peerId });
        this.eventListener();
        if (this.isOpen) {
          this.reconnect();
        }
        else this.isOpen = true;
        break;
      case NetworkStatus.DISCONNECT:
        this.trigger('CLOSE_NETWORK', { peerId: peerId });
        break;
      case NetworkStatus.ERROR:
        console.log("Connect Error");
        break;
      case NetworkStatus.RECONNECT:
        console.log('Network is Reconnect');
        break;
      default:
    }
  }

  private eventListener() {
    IONetwork.instance.socket.recieve("call").subscribe((event:EventContext<any>) => {
      if (event.sendFrom == IONetwork.instance.peerId) return; 
      this.trigger(event)
    });
    IONetwork.instance.socket.recieve("PeerId").subscribe(peerId => {this.trigger('PEERID_UPDATE',<string>peerId)});
    IONetwork.instance.socket.recieve("PEER_JOIN").subscribe(peerId => { IONetwork.instance.listPeer(); this.trigger('CONNECT_PEER',<string>peerId)});
    IONetwork.instance.socket.recieve("PEER_LIEVE").subscribe(peerId => { IONetwork.instance.listPeer(); this.trigger('DISCONNECT_PEER',<string>peerId)});
    IONetwork.instance.socket.recieve("UPDATE_GAME_OBJECT").subscribe(context => this.trigger('NW_UPDATE_GAME_OBJECT',<ObjectNetworkContext>context));
    IONetwork.instance.socket.recieve("DELETE_GAME_OBJECT").subscribe(identifier => this.trigger('NW_DELETE_GAME_OBJECT',<string>identifier));
    IONetwork.instance.socket.recieve("IMAGE_ADD").subscribe(context => {ImageStorage.instance.create(<ImageContext>context); this.trigger('IMAGE_SYNC',null) });
    IONetwork.instance.socket.recieve("IMAGE_UPDATE").subscribe(context => {ImageStorage.instance.update(<ImageContext>context); this.trigger('IMAGE_SYNC',null)});
    IONetwork.instance.socket.recieve("IMAGE_REMOVE").subscribe(identifier => {ImageStorage.instance.destroy(<string>identifier); this.trigger('IMAGE_SYNC',null)});
    IONetwork.instance.socket.recieve("AUDIO_ADD").subscribe(context => {AudioStorage.instance.create(<AudioContext>context); this.trigger('AUDIO_SYNC',null) });
    IONetwork.instance.socket.recieve("AUDIO_UPDATE").subscribe(context => {AudioStorage.instance.update(<AudioContext>context); this.trigger('AUDIO_SYNC',null)});
    IONetwork.instance.socket.recieve("AUDIO_REMOVE").subscribe(identifier => {AudioStorage.instance.destroy(<string>identifier); this.trigger('AUDIO_SYNC',null)});
  }

  private reconnect() {
    if (IONetwork.instance.roomId) {
      IONetwork.instance.join(IONetwork.instance.roomId).then(() => {
        this.trigger('NEED_UPDATE',null)
        ImageStorage.instance.getCatalog();
      })
    }
  }

  private sendSystemMessage(message: string) {
    console.log(message);
  }
}
