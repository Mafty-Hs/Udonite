import { io ,Socket } from 'socket.io-client';
import { Observable } from 'rxjs';
import { Connection ,NetworkStatus} from './connection';
import { ServerEvent, ServerInfo } from './netowrkContext';

export class socketio extends  Connection {
  private url:string = "";
  private socket!:Socket;
  private _serverInfo:ServerInfo;
  get serverInfo():ServerInfo {return this._serverInfo}

  get id():string {
    return this.socket.id
  }

  async open(url):Promise<void> {
    this.url = url;
    if (this.status === NetworkStatus.CONNECT) {
      console.log("既に接続が確立されています");
      return;
    }
    try {
      this.socket = io(this.url,{
        reconnectionAttempts: 5,
        reconnectionDelay: 3000,
        timeout: 10000,
        auth: {token: "udonite"},
      });
      this.responseHandler();
    }
    catch {
      console.log("Udonite Server Connection ERROR!")
      this.status = NetworkStatus.ERROR;
    }
    return;
  }

  close() {
    this.socket.close();
    this.status = NetworkStatus.DISCONNECT;
  }

  async send(type: string, data?: object):Promise<any> {
    let response:any = -1;
    response = await this._send(type,data);
    if (Number(response) == -1) {
      console.warn("connect error :" + type );
      console.warn("retry after 1 second");
      await this.sleep(1);
      response = await this._send(type,data);
      if (Number(response) == -1) {
        console.error("connect error :" + type );
        console.error("give up. Server is something happen!!");
        return null;
      }
    }
    return response;
  }

  private async _send(type: string, data?: object):Promise<any> {
    return  new Promise<object>(resolve => {
      this.socket.emit( type, data, (response:object) => {
        resolve(response);
      });
    });
  }

  serverEvent():Observable<ServerEvent> {
    let observable = new Observable<ServerEvent>( observer => {
      this.socket.onAny((type,data) => {
        observer.next(<ServerEvent>{ type: type , data: data});
      });
      return () => { this.socket.disconnect(); };
    } );
    return observable;
  }

  responseHandler() {
    this.socket.on('ServerInfo', (data) => {
      this._serverInfo = <ServerInfo>data;
      this.status = NetworkStatus.CONNECT;
      console.log("Udonite Server Connection Successful")
    });
    this.socket.on('connect_error',  (error) => this.connectError('error',error));
    this.socket.on('connect_timeout',  (error) => this.connectError('timeout',error));
    this.socket.on('error', (error) => this.connectError('error',error));
    this.socket.on('reconnect', (attempt) => {
       this.status = NetworkStatus.RECONNECT
    });
    this.socket.on('reconnect_error',  (error) => this.connectError('error',error));
    this.socket.on('reconnect_failed', (error) => this.connectError('fail',error));
  }

  async sleep(second :number) {
    return new Promise<void>(resolve => {
      setTimeout(() => {
      resolve()
      }, second * 1000)
    })
  }

  private connectError(name :string,error?:any) {
    console.log("Udonite Server Connection " + name + "!")
    console.warn(error);
    this.status = NetworkStatus.ERROR;
  }

}
