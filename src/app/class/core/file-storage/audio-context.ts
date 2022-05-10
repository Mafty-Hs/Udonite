export interface AudioContext {
  identifier: string;
  name: string;
  type: string;
  url: string;
  filesize: number;
  owner: string;
  volume: number;
  isHidden: boolean;
  tag?: string;
}

export interface AudioUrls {
  message: string;
  soundSource:string;
  udoniteVolume:number;
  udoniteTag:string;
}
