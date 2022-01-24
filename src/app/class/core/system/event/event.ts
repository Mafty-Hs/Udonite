import { IONetwork } from "../socketio/ionetwork";

export class Event<T> implements EventContext<T>{
  readonly isSendFromSelf: boolean = false;

  constructor(
    readonly eventName: string,
    public data: T,
    readonly sendFrom: string = IONetwork.instance.peerId) {
    this.isSendFromSelf = this.sendFrom === IONetwork.instance.peerId;
  }

  toContext(): EventContext<T> {
    return {
      sendFrom: this.sendFrom,
      eventName: this.eventName,
      data: this.data,
    };
  }
}

export interface EventContext<T> {
  sendFrom: string;
  eventName: string;
  data: T;
}
