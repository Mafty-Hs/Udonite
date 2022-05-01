import { IONetwork } from "../system";
import { AudioContext } from "./audio-context";

export class AudioFile {
  context: AudioContext = {
    identifier: '',
    name: '',
    type: '',
    url: '',
    filesize: 0,
    owner: '',
    volume: 100,
    isHidden: false
  };

  _blob:Blob = null;


  async blob():Promise<string> {
    if (this._blob == null) {
      let response:Response;
      let isError:boolean = false;
      try {
        response = await fetch(this.context.url, {mode: 'cors'})
      }
      catch(e) {
        console.log(e);
        isError = true;
      }
      if (response && response.ok && !isError) {
        let blob = await response.blob();
        if ( blob.size > 1024 ) this._blob = blob;
      }
      else {
        console.log(response.statusText);
      }
    }
    return this._blob ? URL.createObjectURL(this._blob) : this.context.url;
  }

  get identifier(): string { return this.context.identifier };
  get name(): string { return this.context.name };
  set name(name :string) {this.context.name = name; IONetwork.audioUpdate(this.context)}
  async url(): Promise<string> { return this.context.type == "URL" ? await this.blob() : this.context.url };
  get owner(): string { return this.context.owner };
  get volume(): number { return this.context.volume };
  set volume(volume :number) {this.context.volume = volume; IONetwork.audioUpdate(this.context)}
  get isHidden(): boolean { return this.context.isHidden };
  get type():string {return this.context.type}
}
