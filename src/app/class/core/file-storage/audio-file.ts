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

  get identifier(): string { return this.context.identifier };
  get name(): string { return this.context.name };
  set name(name :string) {this.context.name = name; IONetwork.audioUpdate(this.context)}
  get url(): string { return this.context.url };
  get owner(): string { return this.context.owner };
  get volume(): number { return this.context.volume };
  set volume(volume :number) {this.context.volume = volume; IONetwork.audioUpdate(this.context)}
  get isHidden(): boolean { return this.context.isHidden };
}