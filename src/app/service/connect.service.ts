import { Injectable } from '@angular/core';
import { io } from 'socket.io-client';
import { EventSystem, Network } from '@udonarium/core/system';

@Injectable({
  providedIn: 'root'
})
export class ConnectService {
  url:string     = '';
  port:number    = 0;
  private isConnect:boolean  = false;
//  private socket = io(this.url);

  constructor() { 
  }

  init() {
    return;
  //  this.socket.on('connect', () => {
      console.log('connect');
      this.isConnect = true;
  //  });
  }

  room(type :string ,data :object) {
    if (!this.isConnect) return;
//    this.socket.emit( 'ROOM', {type: type ,data: data} );
  }

  chat() {
  }

}
