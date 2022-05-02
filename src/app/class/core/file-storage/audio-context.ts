export interface AudioContext {
  identifier: string;
  name: string;
  type: string;
  url: string;
  filesize: number;
  owner: string;
  volume: number;
  isHidden: boolean;
}

export interface AudioUrls {
  message: string;
  soundSource:string;
  udoniteVolume:number;
}
