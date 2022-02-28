import { Injectable } from '@angular/core';
import { EventSystem } from '@udonarium/core/system';

import { load } from 'js-yaml';

export class AppConfig {
  app?: object;
  dice: DiceBot;
  server: Server;
}

class DiceBot {
  url: string;
  api: number;
}

class Server {
  url: string;
}

@Injectable()
export class AppConfigService {

  constructor() { }

  peerHistory: string[] = [];
  isOpen: boolean = false;

  static appConfig: AppConfig = {
    app: null,
    dice: {
      url: '',
      api: 2
    },
    server: {
      url: '',
    }
  }

  initialize() {
    this.initAppConfig();
  }

  private async initAppConfig() {
    try {
      console.log('YAML読み込み...');
      let yaml = await this.loadYaml();
      let config = load(yaml) as object;
      if (this.typeofConfig(config)) {
        AppConfigService.appConfig = config;
      }
      //AppConfigService.applyConfig(obj);
    } catch (e) {
      console.warn('YAMLファイルが破損しているか読み込めません')
      console.warn(e);
    }
    EventSystem.trigger('LOAD_CONFIG', AppConfigService.appConfig);
  }

  private async loadYaml(): Promise<string> {
    const config = document.querySelector('script[type$="yaml"]');
    if (!config) {
      console.warn('loadYaml element not found.');
      return '';
    }

    const url = config.getAttribute('src');

    if (url == null) {
      console.warn('loadYaml url undefined.');
      return config.textContent;
    }

    const response = await fetch(url);
    return response.text();
  }

  private typeofConfig(object :object): object is AppConfig {
    try {
      if ('app' in object && 'dice' in object && 'server' in object ) {
        let yaml = object as AppConfig;
        return ( this.typeofDicebot(yaml.dice) && this.typeofServer(yaml.server));
      }
    }
    catch(error :any) {
      throw error
    }
    return false;
  }

  private typeofDicebot(object :DiceBot): boolean {
    return (typeof object.url === 'string');
  }

  private typeofServer(object :Server): boolean {
    return (typeof object.url === 'string');
  }

}
