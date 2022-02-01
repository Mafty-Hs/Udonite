
import { socketio } from "./socketio";
import { RoomContext, RoomList, ServerInfo } from "./netowrkContext";
import { NetworkStatus } from "./connection";
import { EventContext , PeerContext} from "./netowrkContext";
import { CatalogItem } from "@udonarium/core/synchronize-object/object-store";
import { Subject } from "rxjs";
import { ObjectNetworkContext } from "@udonarium/core/synchronize-object/object-synchronizer";
import { ImageContext } from "@udonarium/core/file-storage/image-context";
import { AudioContext } from "@udonarium/core/file-storage/audio-context";
import { RoomControl } from "@udonarium/room-admin";
import { Round } from "@udonarium/round";

export class IONetwork {
  private static _instance: IONetwork
  static get instance(): IONetwork {
    if (!IONetwork._instance) IONetwork._instance = new IONetwork();
    return IONetwork._instance;
  }

  private url:string;

  get peerId():string {
    if (this.socket.status != NetworkStatus.CONNECT) return "";
    return this.socket.id;
  }
  private _peerIds:string[] = []
  get peerIds():string[] {
    return this._peerIds;
  }
  roomId:string = "";
  roomId$ = new Subject<string>();
  roomIdEmit = this.roomId$.asObservable();
  roomInfo:RoomList;

  private constructor() {
    this.socket = new socketio();
    console.log('Socket IO ready...');
  }

  socket: socketio;

  async open(url: string) {
    this.url = url;
    await this.socket.open(url);
    return;
  }

  async close() {
    this.socket.close();
    return ;
  }

  get server():ServerInfo {
    return this.socket.serverInfo;
  }

  async listRoom():Promise<RoomList[]> {
    let response = await this.socket.send('roomList');
    return response as RoomList[];
  }

  async listPeer():Promise<void> {
   let peers = await this.socket.send('listPeers');
   if (peers) this._peerIds = peers as string[]
  }

  async create(room: RoomContext) {
    let response = await this.socket.send('roomCreate', room);
    this.roomInfo = <RoomList>response;
    this.roomId = this.roomInfo.roomId 
    this.roomId$.next(this.roomInfo.roomId);
    return this.roomInfo.roomId;
  }

  async join(roomId: string) {
    let response = await this.socket.send('roomJoin', { roomId: roomId });
    this.roomInfo = <RoomList>response;
    this.roomId = this.roomInfo.roomId 
    this.roomId$.next(this.roomInfo.roomId);
    return this.roomInfo.roomId;
  }

  async getCatalog():Promise<CatalogItem[]> {
    if (!this.roomId) await this.roomId$.toPromise();
    let response = await this.socket.send('getCatalog', null);
    return <CatalogItem[]>response;
  }

  async myCursor(cursor :PeerContext) {
    if (!this.roomId) await this.roomId$.toPromise();
    this.socket.send('myCursor', cursor);
  }

  async otherPeers():Promise<PeerContext[]> {
    if (!this.roomId) await this.roomId$.toPromise();
    let response = await this.socket.send('otherPeers', null);
    return <PeerContext[]>response;
  }

  async objectUpdate(context: ObjectNetworkContext) {
    if (!this.roomId) await this.roomId$.toPromise();
    this.socket.send('objectUpdate', context);
  }

  async objectGet(identifier: string):Promise<ObjectNetworkContext|null> {
    let context = await this.socket.send('objectGet', {identifier: identifier});
    if (context) {
      return <ObjectNetworkContext>context;
    }
    return null;
  }

  async objectDelete(identifier :string) {
    this.socket.send('objectRemove', {identifier: identifier});
  }

  async roomAdminGet() {
    let control = await this.socket.send('getAdmin', {});
    return <RoomControl>control;
  }

  async roomAdminUpdate(control :RoomControl) {
    this.socket.send('setAdmin', control);
  }

  async roundGet() {
    let control = await this.socket.send('getRound', {});
    return <Round>control;
  }

  async roundUpdate(round :Round) {
    this.socket.send('setRound', round);
  }

  async remove(roomId: string) {
    await this.socket.send('roomRemove', { roomId });
    return;
  }

  async call(event :EventContext<any>,sendTo :string = "") {
    this.socket.send('call',{event: event ,sendTo: sendTo})
  }

  async imageMap() {
    let result = await this.socket.send('imageMap',{});
    return result as ImageContext[];
  }

  async imageUpdate(context :ImageContext) {
    this.socket.send('imageUpdate', context);
  }

  async imageRemove(identifier :string) {
    this.socket.send('imageRemove', {identifier: identifier});
  }

  async audioMap() {
    let result = await this.socket.send('audioMap',{});
    return result as AudioContext[];
  }

  async audioUpdate(context :AudioContext) {
    this.socket.send('audioUpdate', context);
  }

  async audioRemove(identifier :string) {
    this.socket.send('audioRemove', {identifier: identifier});
  }

  async allData():Promise<ObjectNetworkContext[]> {
    const request = `${this.url}/_allData?roomId=${this.roomId}`;
    if (!this.roomId) await this.roomId$.toPromise();
    try {
      let response:Response = await fetch(request, {mode: 'cors'})
      if (response.ok) {
        let json = JSON.stringify(await response.json());
        let contexts = <ObjectNetworkContext[]>JSON.parse(json);
        return contexts;
      }
      else {
        console.log(response.statusText);
      }
    }
    catch(error) {
      console.log(error);
    }
    return []
  }

  async imageUpload(imageFile: File, type :string, hash :string,owner :string):Promise<void> {
    const request = `${this.url}/_image`;
    const formData = new FormData();
    formData.append("roomId", this.roomId);
    formData.append("file", imageFile);
    formData.append("filesize", String(imageFile.size));
    formData.append("owner", owner); 
    formData.append("type", type);
    formData.append("hash", hash);
    try {
      let response:Response = await fetch(request, {method: 'POST', body: formData , mode: 'cors'})
      if (response.ok) {
        return ;
      }
      else {
        console.log(response.statusText);
      }
    }
    catch(error) {
      console.log(error);
    }
    return ;
  }

  async audioUpload(audioFile: File, type :string, hash :string,owner :string):Promise<void> {
    const request = `${this.url}/_audio`;
    const formData = new FormData();
    formData.append("roomId", this.roomId);
    formData.append("file", audioFile);
    formData.append("name", audioFile.name);
    formData.append("filesize", String(audioFile.size));
    formData.append("owner", owner); 
    formData.append("type", type);
    formData.append("hash", hash);
    try {
      let response:Response = await fetch(request, {method: 'POST', body: formData , mode: 'cors'})
      if (response.ok) {
        return ;
      }
      else {
        console.log(response.statusText);
      }
    }
    catch(error) {
      console.log(error);
    }
    return;
  }

}
