import { AfterViewInit, Component, NgZone, OnDestroy, ViewChild, ViewContainerRef, ElementRef } from '@angular/core';

import { ChatTabList } from '@udonarium/chat-tab-list';
import { CounterList } from '@udonarium/counter-list';
import { IRound } from '@udonarium/round';
import { AudioPlayer } from '@udonarium/core/file-storage/audio-player';
import { AudioSharingSystem } from '@udonarium/core/file-storage/audio-sharing-system';
import { AudioStorage } from '@udonarium/core/file-storage/audio-storage';
import { FileArchiver } from '@udonarium/core/file-storage/file-archiver';
import { ImageFile } from '@udonarium/core/file-storage/image-file';
import { ImageSharingSystem } from '@udonarium/core/file-storage/image-sharing-system';
import { ImageStorage } from '@udonarium/core/file-storage/image-storage';
import { ObjectFactory } from '@udonarium/core/synchronize-object/object-factory';
import { ObjectSerializer } from '@udonarium/core/synchronize-object/object-serializer';
import { ObjectStore } from '@udonarium/core/synchronize-object/object-store';
import { ObjectSynchronizer } from '@udonarium/core/synchronize-object/object-synchronizer';
import { EventSystem, Network } from '@udonarium/core/system';
import { DataSummarySetting } from '@udonarium/data-summary-setting';
import { DiceBot } from '@udonarium/dice-bot';
import { Jukebox } from '@udonarium/Jukebox';
import { PeerCursor } from '@udonarium/peer-cursor';
import { PresetSound, SoundEffect } from '@udonarium/sound-effect';
import { PeerMenuComponent } from 'component/peer-menu/peer-menu.component';
import { RoundComponent } from 'component/round/round.component';
import { SubMenuComponent } from 'component/sub-menu/sub-menu.component';
import { ChatWindowComponent } from 'component/chat-window/chat-window.component';
import { NetworkStatusComponent } from 'component/network-status/network-status.component';
import { ContextMenuComponent } from 'component/context-menu/context-menu.component';
import { ModalComponent } from 'component/modal/modal.component';
import { TextViewComponent } from 'component/text-view/text-view.component';
import { UIPanelComponent } from 'component/ui-panel/ui-panel.component';
import { AppConfig, AppConfigService } from 'service/app-config.service';
import { ChatMessageService } from 'service/chat-message.service';
import { ContextMenuSeparator, ContextMenuService } from 'service/context-menu.service';
import { ModalService } from 'service/modal.service';
import { PanelOption, PanelService } from 'service/panel.service';
import { PointerDeviceService } from 'service/pointer-device.service';
import { CounterService } from 'service/counter.service';
import { EffectService } from 'service/effect.service';
import { StandImageService } from 'service/stand-image.service';
import { GameCharacter } from '@udonarium/game-character';
import { DataElement } from '@udonarium/data-element';
import { StandImageComponent } from 'component/stand-image/stand-image.component';
import { DiceRollTable } from '@udonarium/dice-roll-table';
import { DiceRollTableList } from '@udonarium/dice-roll-table-list';
import { DiceRollTableSettingComponent } from 'component/dice-roll-table-setting/dice-roll-table-setting.component';

import { ImageTag } from '@udonarium/image-tag';
import { CutInService } from 'service/cut-in.service';
import { CutIn } from '@udonarium/cut-in';
import { CutInList } from '@udonarium/cut-in-list';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css']
})
export class AppComponent implements AfterViewInit, OnDestroy {

  @ViewChild('modalLayer', { read: ViewContainerRef, static: true }) modalLayerViewContainerRef: ViewContainerRef;
  @ViewChild('subMenu') subMenu: ElementRef;
  private immediateUpdateTimer: NodeJS.Timer = null;
  private lazyUpdateTimer: NodeJS.Timer = null;
  minimumMode: boolean = false;
  selectMenu:string = "";

  constructor(
    private modalService: ModalService,
    private panelService: PanelService,
    private pointerDeviceService: PointerDeviceService,
    private chatMessageService: ChatMessageService,
    private appConfigService: AppConfigService,
    private ngZone: NgZone,
    private contextMenuService: ContextMenuService,
    private standImageService: StandImageService,
    private cutInService: CutInService,
    private counterService: CounterService,
    private effectService: EffectService
  ) {

    this.ngZone.runOutsideAngular(() => {
      EventSystem;
      Network;
      FileArchiver.instance.initialize();
      ImageSharingSystem.instance.initialize();
      ImageStorage.instance;
      AudioSharingSystem.instance.initialize();
      AudioStorage.instance;
      ObjectFactory.instance;
      ObjectSerializer.instance;
      ObjectStore.instance;
      ObjectSynchronizer.instance.initialize();
    });
    this.appConfigService.initialize();
    this.pointerDeviceService.initialize();

    IRound.init();
    CounterList.instance.initialize();
    ChatTabList.instance.initialize();
    DataSummarySetting.instance.initialize();

    let diceBot: DiceBot = new DiceBot('DiceBot');
    diceBot.initialize();

    let jukebox: Jukebox = new Jukebox('Jukebox');
    jukebox.initialize();

    let soundEffect: SoundEffect = new SoundEffect('SoundEffect');
    soundEffect.initialize();

    ChatTabList.instance.addChatTab('メインタブ', 'MainTab');
    ChatTabList.instance.addChatTab('サブタブ', 'SubTab');

    CutInList.instance.initialize();

    let sampleDiceRollTable = new DiceRollTable('SampleDiceRollTable');
    sampleDiceRollTable.initialize();
    sampleDiceRollTable.name = 'サンプルダイスボット表'
    sampleDiceRollTable.command = 'SAMPLE'
    sampleDiceRollTable.dice = '1d6';
    sampleDiceRollTable.value = "1:これはダイスボット表のサンプルです\n2:数字と対応する結果を1行に1つづつ:（コロン）で区切り\n3:数字:結果のように記述します\n4:\\\\n  \\nで改行します\n5-6:また、-（ハイフン）で区切って数字の範囲を指定可能です";
    DiceRollTableList.instance.addDiceRollTable(sampleDiceRollTable);

    let fileContext = ImageFile.createEmpty('none_icon').toContext();
    fileContext.url = './assets/images/ic_account_circle_black_24dp_2x.png';
    let noneIconImage = ImageStorage.instance.add(fileContext);
    ImageTag.create(noneIconImage.identifier).tag = '*default アイコン';

    fileContext = ImageFile.createEmpty('stand_no_image').toContext();
    fileContext.url = './assets/images/nc96424.png';
    let standNoIconImage = ImageStorage.instance.add(fileContext);
    ImageTag.create(standNoIconImage.identifier).tag = '*default スタンド';

    AudioPlayer.resumeAudioContext();
    PresetSound.dicePick = AudioStorage.instance.add('./assets/sounds/soundeffect-lab/shoulder-touch1.mp3').identifier;
    PresetSound.dicePut = AudioStorage.instance.add('./assets/sounds/soundeffect-lab/book-stack1.mp3').identifier;
    PresetSound.diceRoll1 = AudioStorage.instance.add('./assets/sounds/on-jin/spo_ge_saikoro_teburu01.mp3').identifier;
    PresetSound.diceRoll2 = AudioStorage.instance.add('./assets/sounds/on-jin/spo_ge_saikoro_teburu02.mp3').identifier;
    PresetSound.cardDraw = AudioStorage.instance.add('./assets/sounds/soundeffect-lab/card-turn-over1.mp3').identifier;
    PresetSound.cardPick = AudioStorage.instance.add('./assets/sounds/soundeffect-lab/shoulder-touch1.mp3').identifier;
    PresetSound.cardPut = AudioStorage.instance.add('./assets/sounds/soundeffect-lab/book-stack1.mp3').identifier;
    PresetSound.cardShuffle = AudioStorage.instance.add('./assets/sounds/soundeffect-lab/card-open1.mp3').identifier;
    PresetSound.piecePick = AudioStorage.instance.add('./assets/sounds/soundeffect-lab/shoulder-touch1.mp3').identifier;
    PresetSound.piecePut = AudioStorage.instance.add('./assets/sounds/soundeffect-lab/book-stack1.mp3').identifier;
    PresetSound.blockPick = AudioStorage.instance.add('./assets/sounds/tm2/tm2_pon002.wav').identifier;
    PresetSound.blockPut = AudioStorage.instance.add('./assets/sounds/tm2/tm2_pon002.wav').identifier;
    PresetSound.lock = AudioStorage.instance.add('./assets/sounds/tm2/tm2_switch001.wav').identifier;
    PresetSound.unlock = AudioStorage.instance.add('./assets/sounds/tm2/tm2_switch001.wav').identifier;
    PresetSound.sweep = AudioStorage.instance.add('./assets/sounds/tm2/tm2_swing003.wav').identifier;
    PresetSound.puyon = AudioStorage.instance.add('./assets/sounds/soundeffect-lab/puyon1.mp3').identifier;
    PresetSound.surprise = AudioStorage.instance.add('./assets/sounds/otologic/Onmtp-Surprise02-1.mp3').identifier;
    PresetSound.coinToss = AudioStorage.instance.add('./assets/sounds/niconicomons/nc146227.mp3').identifier;

    AudioStorage.instance.get(PresetSound.dicePick).isHidden = true;
    AudioStorage.instance.get(PresetSound.dicePut).isHidden = true;
    AudioStorage.instance.get(PresetSound.diceRoll1).isHidden = true;
    AudioStorage.instance.get(PresetSound.diceRoll2).isHidden = true;
    AudioStorage.instance.get(PresetSound.cardDraw).isHidden = true;
    AudioStorage.instance.get(PresetSound.cardPick).isHidden = true;
    AudioStorage.instance.get(PresetSound.cardPut).isHidden = true;
    AudioStorage.instance.get(PresetSound.cardShuffle).isHidden = true;
    AudioStorage.instance.get(PresetSound.piecePick).isHidden = true;
    AudioStorage.instance.get(PresetSound.piecePut).isHidden = true;
    AudioStorage.instance.get(PresetSound.blockPick).isHidden = true;
    AudioStorage.instance.get(PresetSound.blockPut).isHidden = true;
    AudioStorage.instance.get(PresetSound.lock).isHidden = true;
    AudioStorage.instance.get(PresetSound.unlock).isHidden = true;
    AudioStorage.instance.get(PresetSound.sweep).isHidden = true
    AudioStorage.instance.get(PresetSound.puyon).isHidden = true;
    AudioStorage.instance.get(PresetSound.surprise).isHidden = true;
    AudioStorage.instance.get(PresetSound.coinToss).isHidden = true;

    PeerCursor.createMyCursor();
    if (!PeerCursor.myCursor.name) PeerCursor.myCursor.name = 'プレイヤー';
    PeerCursor.myCursor.imageIdentifier = noneIconImage.identifier;

    EventSystem.register(this)
      .on('UPDATE_GAME_OBJECT', event => { this.lazyNgZoneUpdate(event.isSendFromSelf); })
      .on('DELETE_GAME_OBJECT', event => { this.lazyNgZoneUpdate(event.isSendFromSelf); })
      .on('SYNCHRONIZE_AUDIO_LIST', event => { if (event.isSendFromSelf) this.lazyNgZoneUpdate(false); })
      .on('SYNCHRONIZE_FILE_LIST', event => { if (event.isSendFromSelf) this.lazyNgZoneUpdate(false); })
      .on<AppConfig>('LOAD_CONFIG', event => {
        console.log('LOAD_CONFIG !!!', event.data);
        if (event.data.dice && event.data.dice.url) {
          const API_VERSION = event.data.dice.api;
          //console.log(api)
          //ToDO BCDice-API管理者情報表示の良いUI思いつかないのでペンディング
          //fetch(event.data.dice.url + '/v1/admin', {mode: 'cors'})
          //  .then(response => { return response.json() })
          //  .then(infos => { DiceBot.adminUrl = infos.url });
          fetch(event.data.dice.url + (API_VERSION == 1 ? '/v1/names' : '/v2/game_system'), {mode: 'cors'})
            .then(response => { return response.json() })
            .then(infos => {
              let apiUrl = event.data.dice.url;
              DiceBot.apiUrl = (apiUrl.substr(apiUrl.length - 1) === '/') ? apiUrl.substr(0, apiUrl.length - 1) : apiUrl;
              DiceBot.apiVersion = API_VERSION;
              DiceBot.diceBotInfos = [];
              //DiceBot.diceBotInfos.push(
              let tempInfos = (API_VERSION == 1 ? infos.names : infos.game_system)
                .filter(info => (API_VERSION == 1 ? info.system : info.id) != 'DiceBot')
                .map(info => {
                  let normalize = (info.sort_key && info.sort_key.indexOf('国際化') < 0) ? info.sort_key : info.name.normalize('NFKD');
                  for (let replaceData of DiceBot.replaceData) {
                    if (replaceData[2] && info.name === replaceData[0]) {
                      normalize = replaceData[1];
                      info.name = replaceData[2];
                    }
                    normalize = normalize.split(replaceData[0].normalize('NFKD')).join(replaceData[1].normalize('NFKD'));
                  }
                  info.normalize = normalize.replace(/[\u3041-\u3096]/g, m => String.fromCharCode(m.charCodeAt(0) + 0x60))
                    .replace(/第(.+?)版/g, 'タイ$1ハン')
                    .replace(/[・!?！？\s　:：=＝\/／（）\(\)]+/g, '')
                    .replace(/([アカサタナハマヤラワ])ー+/g, '$1ア')
                    .replace(/([イキシチニヒミリ])ー+/g, '$1イ')
                    .replace(/([ウクスツヌフムユル])ー+/g, '$1ウ')
                    .replace(/([エケセテネヘメレ])ー+/g, '$1エ')
                    .replace(/([オコソトノホモヨロ])ー+/g, '$1オ')
                    .replace(/ン+ー+/g, 'ン')
                    .replace(/ン+/g, 'ン');
                  return info;
                })
                .map(info => {
                  const lang = /.+\:(.+)/.exec((API_VERSION == 1 ? info.system : info.id));
                  info.lang = lang ? lang[1] : 'A';
                  return info;
                })
                .sort((a, b) => {
                  return a.lang < b.lang ? -1 
                    : a.lang > b.lang ? 1
                    : a.normalize == b.normalize ? 0 
                    : a.normalize < b.normalize ? -1 : 1;
                });
              DiceBot.diceBotInfos.push(...tempInfos.map(info => { return { script: (API_VERSION == 1 ? info.system : info.id), game: info.name } }));
              if (tempInfos.length > 0) {
                let sentinel = tempInfos[0].normalize.substr(0, 1);
                let group = { index: tempInfos[0].normalize.substr(0, 1), infos: [] };
                for (let info of tempInfos) {
                  let index = info.lang == 'Other' ? 'その他' 
                    : info.lang == 'ChineseTraditional' ? '正體中文'
                    : info.lang == 'Korean' ? '한국어'
                    : info.lang == 'English' ? 'English'
                    : info.lang == 'SimplifiedChinese' ? '简体中文'
                    : info.normalize.substr(0, 1);
                  if (index !== sentinel) {
                    sentinel = index;
                    DiceBot.diceBotInfosIndexed.push(group);
                    group = { index: index, infos: [] };
                  }
                  group.infos.push({ script: (API_VERSION == 1 ? info.system : info.id), game: info.name });
                }
                DiceBot.diceBotInfosIndexed.push(group);
                DiceBot.diceBotInfosIndexed.sort((a, b) => a.index == b.index ? 0 : a.index < b.index ? -1 : 1);
              }
            });
        } else {
          DiceBot.diceBotInfos.forEach((info) => {
            let normalize = info.sort_key.normalize('NFKD');
            for (let replaceData of DiceBot.replaceData) {
              if (replaceData[2] && info.game === replaceData[0]) {
                normalize = replaceData[1];
                info.game = replaceData[2];
              }
              normalize = normalize.split(replaceData[0].normalize('NFKD')).join(replaceData[1].normalize('NFKD'));
            }
            normalize = normalize.replace(/[\u3041-\u3096]/g, m => String.fromCharCode(m.charCodeAt(0) + 0x60))
              .replace(/第(.+?)版/g, 'タイ$1ハン')
              .replace(/[・!?！？\s　:：=＝\/／（）\(\)]+/g, '')
              .replace(/([アカサタナハマヤラワ])ー+/g, '$1ア')
              .replace(/([イキシチニヒミリ])ー+/g, '$1イ')
              .replace(/([ウクスツヌフムユル])ー+/g, '$1ウ')
              .replace(/([エケセテネヘメレ])ー+/g, '$1エ')
              .replace(/([オコソトノホモヨロ])ー+/g, '$1オ')
              .replace(/ン+ー+/g, 'ン')
              .replace(/ン+/g, 'ン');
            info.sort_key = info.lang ? info.lang : normalize.normalize('NFKD');
            //return info;
            //console.log(info.index + ': ' + normalize);
          });
          DiceBot.diceBotInfos.sort((a, b) => {
            if (a.sort_key == 'Other' && b.sort_key == 'Other') {
              return 0;
            } else if (a.sort_key == 'Other') {
              return 1;
            } else if (b.sort_key == 'Other') {
              return -1;
            }
            return a.sort_key == b.sort_key ? 0 
            : a.sort_key < b.sort_key ? -1 : 1;
          });
          let sentinel = DiceBot.diceBotInfos[0].sort_key[0];
          let group = { index: sentinel, infos: [] };
          for (let info of DiceBot.diceBotInfos) {
            if (info.lang == 'Other') info.lang = '简体中文'; //手抜き
            if ((info.lang ? info.lang : info.sort_key[0]) !== sentinel) {
              sentinel = info.lang ? info.lang : info.sort_key[0];
              DiceBot.diceBotInfosIndexed.push(group);
              group = { index: sentinel, infos: [] };
            }
            group.infos.push({ script: info.script, game: info.game });
          }
          DiceBot.diceBotInfosIndexed.push(group);
        }
        DiceBot.diceBotInfosIndexed.sort((a, b) => a.index == b.index ? 0 : a.index < b.index ? -1 : 1);
        Network.setApiKey(event.data.webrtc.key);
        Network.open();
      })
      .on<File>('FILE_LOADED', event => {
        this.lazyNgZoneUpdate(false);
      })
      .on('OPEN_NETWORK', event => {
        console.log('OPEN_NETWORK', event.data.peerId);
        PeerCursor.myCursor.peerId = Network.peerContext.peerId;
        PeerCursor.myCursor.userId = Network.peerContext.userId;
      })
      .on('CLOSE_NETWORK', event => {
        console.log('CLOSE_NETWORK', event.data.peerId);
        this.ngZone.run(async () => {
          if (1 < Network.peerIds.length) {
            await this.modalService.open(TextViewComponent, { title: 'ネットワークエラー', text: 'ネットワーク接続に何らかの異常が発生しました。\nこの表示以後、接続が不安定であれば、ページリロードと再接続を試みてください。' });
          } else {
            await this.modalService.open(TextViewComponent, { title: 'ネットワークエラー', text: '接続情報が破棄されました。\nこのウィンドウを閉じると再接続を試みます。' });
            Network.open();
          }
        });
      })
      .on('CONNECT_PEER', event => {
        if (event.isSendFromSelf) this.chatMessageService.calibrateTimeOffset();
        this.lazyNgZoneUpdate(event.isSendFromSelf);
      })
      .on('DISCONNECT_PEER', event => {
        this.lazyNgZoneUpdate(event.isSendFromSelf);
      })
      .on('PLAY_CUT_IN', -1000, event => {
        let cutIn = ObjectStore.instance.get<CutIn>(event.data.identifier);
        this.cutInService.play(cutIn, event.data.secret ? event.data.secret : false, event.data.test ? event.data.test : false, event.data.sender);
      })
      .on('STOP_CUT_IN', -1000, event => {
        this.cutInService.stop(event.data.identifier);
      })
      .on('POPUP_STAND_IMAGE', -1000, event => {
        let standElement = ObjectStore.instance.get<DataElement>(event.data.standIdentifier);
        let gameCharacter = ObjectStore.instance.get<GameCharacter>(event.data.characterIdentifier);
        this.standImageService.show(gameCharacter, standElement, event.data.color ? event.data.color : null, event.data.secret);
      })
      .on('FAREWELL_STAND_IMAGE', -1000, event => {
        this.standImageService.farewell(event.data.characterIdentifier);
      })
      .on('DELETE_STAND_IMAGE', -1000, event => {
        this.standImageService.destroy(event.data.characterIdentifier, event.data.identifier);
      })
      .on('DESTORY_STAND_IMAGE_ALL', -1000, event => {
        this.standImageService.destroyAll();
      });
  }

  ngAfterViewInit() {
    PanelService.defaultParentViewContainerRef = ModalService.defaultParentViewContainerRef = ContextMenuService.defaultParentViewContainerRef = StandImageService.defaultParentViewContainerRef = CutInService.defaultParentViewContainerRef = this.modalLayerViewContainerRef;
    if (window.innerWidth < 600) this.minimumMode = true;
    setTimeout(() => {
      this.panelService.open(PeerMenuComponent, { width: 520, height: 400, left: 0,top: 50 });
      this.panelService.open(ChatWindowComponent, { width: 700, height: 400, left: 0, top: 490 });
    }, 0);
  }

  ngOnDestroy() {
    EventSystem.unregister(this);
  }

  isOpen(menuName: string) {
    if (this.selectMenu == menuName)
      return "▲";
    else
      return "▼";
  }

  showViewMenu(left: number) {

    const isShowStand = StandImageComponent.isShowStand;
    const isShowNameTag = StandImageComponent.isShowNameTag;
    const isCanBeGone = StandImageComponent.isCanBeGone; 
    const canEffect = this.effectService.canEffect; 

    this.contextMenuService.open(
      { x: left, y: 50 }, [
        { name: "視点設定" },
        ContextMenuSeparator,
          { name: '初期視点に戻す', action: () => EventSystem.trigger('RESET_POINT_OF_VIEW', null) },
          { name: '真上から視る', action: () => EventSystem.trigger('RESET_POINT_OF_VIEW', 'top') },
        ContextMenuSeparator,
        { name: "スタンド設定" },
        ContextMenuSeparator,
          { name: `${ isShowStand ? '☑' : '☐' }スタンド表示`, 
            action: () => {
              StandImageComponent.isShowStand = !isShowStand;
            }
          },
          { name: `${ isShowNameTag ? '☑' : '☐' }ネームタグ表示`, 
            action: () => {
              StandImageComponent.isShowNameTag = !isShowNameTag;
            }
          },
          { name: `${ isCanBeGone ? '☑' : '☐' }透明化、自動退去`, 
            action: () => {
            StandImageComponent.isCanBeGone = !isCanBeGone;
            }
          },
          { name: '表示スタンド全消去', action: () => EventSystem.trigger('DESTORY_STAND_IMAGE_ALL', null) }, 
        ContextMenuSeparator,
        { name: "エフェクト設定" },
        ContextMenuSeparator,
          { name: `${ canEffect ? '☑' : '☐' }エフェクト表示`,
            action: () => {
              this.effectService.canEffect = !canEffect;
            }
          }
      ], 
      '自分のみ反映されます');
  }

  openSubMenu(e: Event , menuName: string) {
    if (this.selectMenu == menuName) {
      this.closeSub();
      return;
    }
    let button = e.srcElement as HTMLElement;
    let rect = button.getBoundingClientRect();
    if (menuName == "view") {
      this.selectMenu = menuName;
      this.showViewMenu(rect.left);
    }
    else {
      this.subMenu.nativeElement.style.top = "50px";
      this.subMenu.nativeElement.style.left = rect.left + 'px';
      this.selectMenu = menuName;
      this.subMenu.nativeElement.style.display = "block";
   }
  }

  closeSub() {
    this.selectMenu = "";
    this.subMenu.nativeElement.style.display = "none";
  }

  menuHelp(){
　　　let gameHelp:string[] =
      [
      'ファイル\n  画像の管理、部屋データの保存、チャットログの保存ができます。',
      'ルーム\n  接続の管理、テーブルの管理ができます。',
      '機能\n  セッション中に便利な機能があります。',
      '表示\n  自分だけ非表示にしたい項目を選択できます。',
      'ラウンド管理\n  ラウンド制またはイニシアティブ制でラウンド進行を管理できます。\n  右クリックすることで動作の設定が可能です。',
      'ネットワークインジケーター\n  データの送受信が発生しているとき、白く光ります',
      'ルーム情報\n  ルーム名、参加人数が表示されます。自分以外全員とデータ送受信できていないとき赤く点滅します'
      ];     

      let coordinate = { x: ( window.innerWidth - 650 ), y: 50 };
      let option: PanelOption = { left: coordinate.x, top: coordinate.y, width: 600, height: 450 };
      let textView = this.panelService.open(TextViewComponent, option);
      textView.title = "メニューバー説明";
      textView.text = gameHelp;
  }

  private lazyNgZoneUpdate(isImmediate: boolean) {
    if (isImmediate) {
      if (this.immediateUpdateTimer !== null) return;
      this.immediateUpdateTimer = setTimeout(() => {
        this.immediateUpdateTimer = null;
        if (this.lazyUpdateTimer != null) {
          clearTimeout(this.lazyUpdateTimer);
          this.lazyUpdateTimer = null;
        }
        this.ngZone.run(() => { });
      }, 0);
    } else {
      if (this.lazyUpdateTimer !== null) return;
      this.lazyUpdateTimer = setTimeout(() => {
        this.lazyUpdateTimer = null;
        if (this.immediateUpdateTimer != null) {
          clearTimeout(this.immediateUpdateTimer);
          this.immediateUpdateTimer = null;
        }
        this.ngZone.run(() => { });
      }, 100);
    }
  }
}

PanelService.UIPanelComponentClass = UIPanelComponent;
//ContextMenuService.UIPanelComponentClass = ContextMenuComponent;
ContextMenuService.ContextMenuComponentClass = ContextMenuComponent;
ModalService.ModalComponentClass = ModalComponent;
