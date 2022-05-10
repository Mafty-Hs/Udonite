import { socketio } from "./socketio";
import { RoomContext, RoomList, ServerInfo } from "./netowrkContext";
import { StringUtil } from "../util/string-util";
import { NetworkStatus } from "./connection";
import { EventContext , PeerContext} from "./netowrkContext";
import { CatalogItem } from "@udonarium/core/synchronize-object/object-store";
import { Subject } from "rxjs";
import { ObjectContext } from "@udonarium/core/synchronize-object/game-object";
import { ImageContext } from "@udonarium/core/file-storage/image-context";
import { AudioContext } from "@udonarium/core/file-storage/audio-context";
import { RoomControl } from "@udonarium/room-admin";
import { Round } from "@udonarium/round";
import { MimeType } from "@udonarium/core/file-storage/mime-type";

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

  async open(url: string):Promise<void> {
    this.url = StringUtil.urlSanitize(url);
    if (this.url) await this.socket.open(url);
    else console.error('Not Valid Server URL');
    return;
  }

  async close():Promise<void> {
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

  async create(room: RoomContext):Promise<string> {
    let response = await this.socket.send('roomCreate', room);
    this.roomInfo = <RoomList>response;
    this.roomId = this.roomInfo.roomId
    this.roomId$.next(this.roomInfo.roomId);
    return this.roomInfo.roomId;
  }

  async join(roomId: string):Promise<string> {
    let response = await this.socket.send('roomJoin', { roomId: roomId });
    this.roomInfo = <RoomList>response;
    this.roomId = this.roomInfo.roomId
    this.roomId$.next(this.roomInfo.roomId);
    return this.roomInfo.roomId;
  }

  async getCatalog():Promise<CatalogItem[]> {
    let response = await this.socket.send('getCatalog', null);
    return <CatalogItem[]>response;
  }

  async myCursor(cursor :PeerContext):Promise<void> {
    this.socket.send('myCursor', cursor);
    return;
  }

  async otherPeers():Promise<PeerContext[]> {
    let response = await this.socket.send('otherPeers', null);
    return <PeerContext[]>response;
  }

  async objectUpdate(context: ObjectContext):Promise<void> {
    this.socket.send('objectUpdate', context);
    return;
  }

  async objectGet(identifier: string):Promise<ObjectContext|null> {
    let context = await this.socket.send('objectGet', {identifier: identifier});
    if (context) {
      return <ObjectContext>context;
    }
    return null;
  }

  async objectDelete(identifier :string):Promise<void> {
    this.socket.send('objectRemove', {identifier: identifier});
    return;
  }

  async roomUpdate(roomName?: string, password?: string):Promise<void> {
    await this.socket.send('roomUpdate', {roomName: roomName, password: password});
    return;
  }

  async roomAdminGet() {
    let control = await this.socket.send('getAdmin', {});
    return <RoomControl>control;
  }

  async roomAdminUpdate(control :RoomControl):Promise<void> {
    this.socket.send('setAdmin', control);
    return;
  }

  async roundGet():Promise<Round> {
    let round = await this.socket.send('getRound', {});
    return <Round>round;
  }

  async roundUpdate(round :Round):Promise<void> {
    this.socket.send('setRound', round);
    return;
  }

  async remove(roomId: string):Promise<void> {
    await this.socket.send('roomRemove', { roomId });
    return;
  }

  async call(event :EventContext<any>,sendTo :string = ""):Promise<void> {
    this.socket.send('call',{event: event ,sendTo: sendTo})
    return;
  }

  async imageMap():Promise<ImageContext[]> {
    let result = await this.socket.send('imageMap',{});
    return result as ImageContext[];
  }

  async imageUrl(imageUrl :string, owner :string, tags :string[]):Promise<void> {
    if (!this.checkFileType(imageUrl)) return;
    let context:ImageContext = {
      identifier: imageUrl ,
      type: "URL",
      url: imageUrl,
      thumbnail: {type: "" , url: ""},
      filesize: 0,
      isHide: false,
      owner: [owner],
      tag: tags
    }
    this.socket.send('imageUpdate', context);
    return;
  }

  async imageUpdate(context :ImageContext):Promise<void> {
    this.socket.send('imageUpdate', context);
    return;
  }

  async imageRemove(identifier :string):Promise<void> {
    this.socket.send('imageRemove', {identifier: identifier});
    return;
  }

  async audioMap():Promise<AudioContext[]> {
    let result = await this.socket.send('audioMap',{});
    return result as AudioContext[];
  }

  async audioUrl(audioUrl :string ,owner :string ,filename :string ,volume:number,tag:string):Promise<void> {
    if (!this.checkFileType(audioUrl)) return;
    let context:AudioContext = {
      identifier: audioUrl ,
      name: filename,
      type: "URL",
      url: audioUrl,
      filesize: 0,
      owner: owner,
      volume: volume,
      isHidden: false,
      tag:tag
    }
    this.socket.send('audioUpdate', context);
    return;
  }

  async audioUpdate(context :AudioContext):Promise<void> {
    this.socket.send('audioUpdate', context);
    return;
  }

  async audioRemove(identifier :string):Promise<void> {
    this.socket.send('audioRemove', {identifier: identifier});
    return;
  }

  async allData():Promise<ObjectContext[]> {
    const request = `${this.url}/_allData?roomId=${this.roomId}`;
    if (!this.roomId) await this.roomId$.toPromise();
    try {
      let response:Response = await fetch(request, {mode: 'cors'})
      if (response.ok) {
        let json = JSON.stringify(await response.json());
        let contexts = <ObjectContext[]>JSON.parse(json);
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

  async audioUpload(audioFile: File, type :string, hash :string,owner :string,tag :string ):Promise<void> {
    const request = `${this.url}/_audio`;
    const formData = new FormData();
    formData.append("roomId", this.roomId);
    formData.append("file", audioFile);
    formData.append("name", audioFile.name);
    formData.append("filesize", String(audioFile.size));
    formData.append("owner", owner);
    formData.append("type", type);
    formData.append("hash", hash);
    formData.append("tag", tag);
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

  private checkFileType(url :string):boolean {
    let filetype = MimeType.type(url.match(".+/(.+?)([\?#;].*)?$")[1]);
    return Boolean(filetype);
  }

}
