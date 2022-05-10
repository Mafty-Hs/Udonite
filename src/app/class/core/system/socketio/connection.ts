import { Subject } from "rxjs";


export const NetworkStatus = {
  DISCONNECT: 0,
  CONNECT: 1,
  RECONNECT: 2,
  ERROR: 3
} as const;
export type NetworkStatus = typeof NetworkStatus[keyof typeof NetworkStatus]; 

export class Connection {
  _status:NetworkStatus = NetworkStatus.DISCONNECT;
  get status():NetworkStatus { return this._status};
  set status(status :NetworkStatus) {
    this._status = status;
    this.status$.next(this._status);
  };
  status$ = new Subject<NetworkStatus>();
  statusEmit = this.status$.asObservable();

  private statusWait(status :NetworkStatus):Promise<void> {
    const controller = new AbortController();
    const timer = setTimeout(() => { controller.abort() }, 10000);
    try {
     return new Promise<void>(resolve => {
        let intTimer = setInterval(() => {
          if (this.status === status) {
            clearTimeout(timer);
            clearInterval(intTimer);
            resolve();
          } 
        },500);
      })
      .catch(() => {
        throw "anything happen in Server Connection";
      });
    }
    catch {
      console.log("Server not response;");
      return new Promise<void>(resolve => {
        resolve();
      })
    }
  }

  async onConnect():Promise<void> {
    if (this.status == NetworkStatus.CONNECT) return;
    await this.statusWait(NetworkStatus.CONNECT)
    return;
  }

  async onDisconnect():Promise<void> {
    if (this.status == NetworkStatus.DISCONNECT) return;
    await this.statusWait(NetworkStatus.DISCONNECT)
    return;
  }
}