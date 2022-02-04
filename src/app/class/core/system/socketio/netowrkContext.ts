export interface ServerEvent {
  type :string;
  data: any;
} 

export interface RoomContext {
  roomName: string;
  password: string;
  isOpen: boolean;
  is2d: boolean;
}

export interface RoomList {
  roomName: string;
  roomId: string;
  password: string;
  lastAccess: number;
  isOpen: boolean;
  is2d: boolean;
  players: number;
}

export interface EventContext<T> {
  sendFrom: string;
  eventName: string;
  data: T;
}

export interface PeerContext {
  peerId :string ;
  playerIdentifier :string ;
}

export interface ServerInfo {
  version: string;
  maxRoomCount: number;
  adminPassword: string;
  imageStorageMaxSize: number;
  audioStorageMaxSize: number;
}
