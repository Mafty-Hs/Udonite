import { SyncObject } from './core/synchronize-object/decorator';
import { InnerXml } from './core/synchronize-object/object-serializer';
import { SyncVar } from './core/synchronize-object/decorator';
import { ObjectNode } from './core/synchronize-object/object-node';
import { AudioFile } from './core/file-storage/audio-file';
import { AudioStorage } from './core/file-storage/audio-storage';
import { EventSystem } from './core/system';

@SyncObject('audio-setting')
export class AudioSetting extends ObjectNode implements InnerXml{
  private static _instance: AudioSetting;
  static get instance(): AudioSetting {
    return AudioSetting._instance;
  }
  static init() {
    if (!AudioSetting._instance) {
      AudioSetting._instance = new AudioSetting('AudioSetting');
      AudioSetting._instance.initialize();
    }
  }

  get audios(): AudioFile[] { return AudioStorage.instance.audios.filter(audio => !audio.isHidden); }

  get list(): AudioInfo[] { 
  return this.children as AudioInfo[]; }

  create(name :string, identifier :string) {
    if (this.list.find(audio =>
      audio.identifier === identifier
      )) return;
    let audio = new AudioInfo();
    audio.initialize();
    audio.name = name;
    audio.volume =  100;
    audio.audioIdentifier = identifier;
    this.appendChild(audio);
  }

  getName(identifier :string) :string {
    return this.list.find(audio => audio.audioIdentifier === identifier).name;
  }
  getInfo(identifier :string) :AudioInfo {
    return this.list.find(audio => audio.audioIdentifier === identifier);
  }
}

@SyncObject('audio-info')
export class AudioInfo extends ObjectNode {
  @SyncVar() name: string;
  @SyncVar() volume: number;
  @SyncVar() audioIdentifier: string;
}
