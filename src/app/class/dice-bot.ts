import Loader from 'bcdice/lib/loader/loader';
import { GameSystemInfo } from 'bcdice/lib/bcdice/game_system_list.json';

import { ChatMessage, ChatMessageContext } from './chat-message';
import { ChatTab } from './chat-tab';
import { SyncObject } from './core/synchronize-object/decorator';
import { GameObject } from './core/synchronize-object/game-object';
import { ObjectStore } from './core/synchronize-object/object-store';
import { EventSystem } from './core/system';
import { PromiseQueue } from './core/system/util/promise-queue';
import { StringUtil } from './core/system/util/string-util';
import { DataElement } from './data-element';
import { GameCharacter } from './game-character';
import { PeerCursor } from './peer-cursor';
import { StandConditionType } from './stand-list';
import { DiceRollTableList } from './dice-roll-table-list';

export interface DiceBotInfo {
  script: string;
  game: string;
  lang?: string;
  sort_key?: string;
}

export interface DiceBotInfosIndexed {
  index: string;
  infos: DiceBotInfo[];
}

interface DiceRollResult {
  result: string;
  isSecret: boolean;
  isDiceRollTable?: boolean;
  tableName?: string;
  isEmptyDice?: boolean;
}

// bcdice-js custom loader class
class WebpackLoader extends Loader {
  async dynamicImport(className: string): Promise<void> {
    await import(
      /* webpackChunkName: "[request]"  */
      /* webpackInclude: /\.js$/ */
      `bcdice/lib/bcdice/game_system/${className}`
    );
  }
}

@SyncObject('dice-bot')
export class DiceBot extends GameObject {
  private static readonly loadedDiceBots: { [gameType: string]: GameSystemInfo } = {};
  private static queue: PromiseQueue = new PromiseQueue('DiceBotQueue');

  public static apiUrl: string = null;
  public static adminUrl: string = null;

  public static readonly loader = new WebpackLoader();

  public static diceBotInfos: DiceBotInfo[] = DiceBot.loader.listAvailableGameSystems().filter(gameSystemInfo => gameSystemInfo.id != 'DiceBot').map<DiceBotInfo>(gameSystemInfo => {
    const lang = /.+\:(.+)/.exec(gameSystemInfo.id);
    let langName;
    if (lang && lang[1]) {
      langName = (lang[1] == 'ChineseTraditional') ? '正體中文'
        : (lang[1] == 'Korean') ? '한국어' 
        : (lang[1] == 'English') ? 'English' : 'Other';
    }
    return {
      script: gameSystemInfo.id,
      game: gameSystemInfo.name,
      lang: langName,
      sort_key: gameSystemInfo.sortKey
    };
  });

  public static diceBotInfosIndexed: DiceBotInfosIndexed[] = [];

  public static replaceData: [string, string, string?][] = [
    ['新クトゥルフ', 'シンクトウルフシンワTRPG', '新クトゥルフ神話TRPG'],
    ['クトゥルフ神話TRPG', 'クトウルフシンワTRPG', '(旧) クトゥルフ神話TRPG'],
    ['克蘇魯神話', '克蘇魯的呼喚', '克蘇魯的呼喚'],
    ['克蘇魯神話第7版', '克蘇魯的呼喚 第七版', '克蘇魯的呼喚 第七版'],
    ['トーグ', 'トオク', 'TORG'],
    ['ワープス', 'ワアフス', 'WARPS'],
    ['トーグ1.5版', 'トオク1.5ハン', 'TORG 1.5版'],
    ['心衝想機TRPGアルトレイズ', 'シンシヨウソウキTRPGアルトレイス', '心衝想機TRPG アルトレイズ'],
    ['犯罪活劇RPGバッドライフ', 'ハンサイカツケキRPGハツトライフ', '犯罪活劇RPGバッドライフ'],
    ['晃天のイルージオ', 'コウテンノイルウシオ', '晃天のイルージオ'],
    ['歯車の塔の探空士', 'ハクルマノトウノスカイノオツ', '歯車の塔の探空士'],
    ['在りて遍くオルガレイン', 'アリテアマネクオルカレイン', '在りて遍くオルガレイン'],
    ['Pathfinder', 'ハスフアインタアRPG', 'パスファインダーRPG'],
    ['真・女神転生TRPG　覚醒編', 'シンメカミテンセイTRPGカクセイヘン', '真・女神転生TRPG 覚醒篇'],
    ['真・女神転生TRPG　覚醒篇', 'シンメカミテンセイTRPGカクセイヘン', '真・女神転生TRPG 覚醒篇'],
    ['YearZeroEngine', 'イヤアセロエンシン', 'Year Zero Engine'],
    ['Year Zero Engine', 'イヤアセロエンシン', 'Year Zero Engine'],
    ['ADVANCED FIGHTING FANTASY 2nd Edition', 'アトハンストファイテインクファンタシイタイ2ハン', 'アドバンスト・ファイティング・ファンタジー 第2版'],
    ['Vampire: The Masquerade 5th Edition', 'ウアンハイアサマスカレエトタイ5ハン', 'ヴァンパイア：ザ・マスカレード 第5版'],
    ['ワールドオブダークネス', 'ワアルトオフタアクネス', 'ワールド・オブ・ダークネス'],
    ['モノトーン・ミュージアム', 'モノトオンミユウシアム', 'モノトーンミュージアム'],
    ['剣の街の異邦人TRPG', 'ツルキノマチノイホウシンTRPG'],
    ['壊れた世界のポストマン', 'コワレタセカイノホストマン', '壊れた世界のポストマン'],
    ['紫縞のリヴラドール', 'シシマノリフラトオル', '紫縞のリヴラドール'],
    ['SRS汎用(改造版)', 'スタンタアトRPGシステムオルタナテイフハン', 'SRS汎用 オルタナティヴ'],
    ['Standard RPG System', 'スタンタアトRPGシステム', 'スタンダードRPGシステム（SRS）'],
    ['スタンダードRPGシステム', 'スタンタアトRPGシステム', 'スタンダードRPGシステム（SRS）'],
    ['NJSLYRBATTLE', 'ニンシヤスレイヤアハトル'],
    ['Record of Steam', 'レコオトオフスチイム'],
    ['詩片のアルセット', 'ウタカタノアルセツト'],
    ['Shared†Fantasia', 'シエアアトフアンタシア'],
    ['真・女神転生', 'シンメカミテンセイ'],
    ['女神転生', 'メカミテンセイ'],
    ['覚醒篇', 'カクセイヘン'],
    ['Chill', 'チル'],
    ['BBNTRPG', 'ヒイヒイエヌTRPG', 'BBNTRPG (Black Black Network TRPG)'],
    ['TORG Eternity', 'トオクエタアニテイ'],
    ['ガープス', 'カアフス', 'GURPS'],
    ['ガープスフィルトウィズ', 'カアフスフイルトウイス', 'GURPSフィルトウィズ'],
    ['絶対隷奴', 'セツタイレイト'],
    ['セラフィザイン', 'セイシユンシツカンTRPGセラフィサイン', '青春疾患TRPG セラフィザイン'],
    ['艦これ', 'カンコレ'],
    ['神我狩', 'カミカカリ'],
    ['鵺鏡', 'ヌエカカミ'],
    ['トーキョー', 'トオキヨウ'],
    ['Ｎ◎ＶＡ', 'ノウア'],
    ['初音ミク', 'ハツネミク'],
    ['朱の孤塔', 'アケノコトウ'],
    ['在りて遍く', 'アリテアマネク'],
    ['央華封神', 'オウカホウシン'],
    ['心衝想機', 'シンシヨウソウキ'],
    ['胎より想え', 'ハラヨリオモエ'],
    ['展爛会', 'テンランカイ'],
    ['壊れた', 'コワレタ'],
    ['比叡山', 'ヒエイサン'],
    ['世界樹', 'セカイシユ'],
    ['異邦人', 'イホウシン'],
    ['転攻生', 'テンコウセイ'],
    ['探空士', 'スカイノオツ'],
    ['剣の街', 'ツルキノマチ'],
    ['黒絢', 'コツケン'],
    ['紫縞', 'シシマ'],
    ['破界', 'ハカイ'],
    ['銀剣', 'キンケン'],
    ['東京', 'トウキヨウ'],
    ['片道', 'カタミチ'],
    ['勇者', 'ユウシヤ'],
    ['少女', 'シヨウシヨ'],
    ['真空', 'シンクウ'],
    ['学園', 'カクエン'],
    ['世界', 'セカイ'],
    ['青春', 'セイシユン'],
    ['疾患', 'シツカン'],
    ['迷宮', 'メイキユウ'],
    ['歯車', 'ハクルマ'],
    ['蒼天', 'ソウテン'],
    ['墜落', 'ツイラク'],
    ['特命', 'トクメイ'],
    ['晃天', 'コウテン'],
    ['叛逆', 'ハンキヤク'],
    ['犯罪', 'ハンサイ'],
    ['活劇', 'カツケキ'],
    ['碧空', 'ヘキクウ'],
    ['蓬莱', 'ホウライ'],
    ['冒険', 'ホウケン'],
    ['六門', 'ロクモン'],
    ['炎上', 'エンシヨウ'],
    ['無限', 'ムケン'],
    ['塔', 'トウ'],
    ['獣', 'ケモノ'],
    ['獸', 'ケモノ'],
    ['森', 'モリ'],
    ['&', 'アント'],
    ['＆', 'アント'],
    ['ヴァ', 'ハ'],
    ['ヴィ', 'ヒ'],
    ['ヴェ', 'ヘ'],
    ['ヴォ', 'ホ'],
    ['ヴ', 'フ'],
    ['ァ', 'ア'],
    ['ィ', 'イ'],
    ['ゥ', 'ウ'],
    ['ェ', 'エ'],
    ['ォ', 'オ'],
    ['ャ', 'ヤ'],
    ['ュ', 'ユ'],
    ['ョ', 'ヨ'],
    ['ッ', 'ツ'],  
    ['ヲ', 'オ'],
    ['ガ', 'カ'],
    ['ギ', 'キ'],
    ['グ', 'ク'],
    ['ゲ', 'ケ'],
    ['ゴ', 'コ'],
    ['ザ', 'サ'],
    ['ジ', 'シ'],
    ['ズ', 'ス'],
    ['ゼ', 'セ'],
    ['ゾ', 'ソ'],
    ['ダ', 'タ'],
    ['ヂ', 'チ'],
    ['ヅ', 'ツ'],
    ['デ', 'テ'],
    ['ド', 'ト'],
    ['バ', 'ハ'],
    ['ビ', 'ヒ'],
    ['ブ', 'フ'],
    ['ベ', 'ヘ'],
    ['ボ', 'ホ'],
    ['パ', 'ハ'],
    ['ピ', 'ヒ'],
    ['プ', 'フ'],
    ['ペ', 'ヘ'],
    ['ポ', 'ホ']
  ];
  // GameObject Lifecycle
  onStoreAdded() {
    super.onStoreAdded();
    //DiceBot.queue.add(DiceBot.loadScriptAsync('./assets/cgiDiceBot.js'));
    EventSystem.register(this)
      .on('SEND_MESSAGE', async event => {
        const chatMessage = ObjectStore.instance.get<ChatMessage>(event.data.messageIdentifier);
        if (!chatMessage || !chatMessage.isSendFromSelf || chatMessage.isSystem) return;

        const text: string = StringUtil.toHalfWidth(chatMessage.text).replace("\u200b", ''); //ゼロ幅スペース削除
        const gameType: string = chatMessage.tag.replace('noface', '').trim();

        try {
          const regArray = /^((srepeat|repeat|srep|rep|sx|x)?(\d+)?\s+)?([^\n]*)?/ig.exec(text);
          const repCommand = regArray[2];
          const isRepSecret = repCommand && repCommand.toUpperCase().indexOf('S') === 0;
          const repeat: number = (regArray[3] != null) ? Number(regArray[3]) : 1;
          let rollText: string = (regArray[4] != null) ? regArray[4] : text;

          // スペース区切りのChoiceコマンドへの対応
          let isChoice = false;
          let result;
          if (rollText) {
            //ToDO バージョン調べる
            if ((rollText.trim().toUpperCase().indexOf('SCHOICE ') == 0 || rollText.trim().toUpperCase().indexOf('CHOICE ') == 0 
                   || rollText.trim().toUpperCase().indexOf('SCHOICE　') == 0 || rollText.trim().toUpperCase().indexOf('CHOICE　') == 0)
                && (!DiceRollTableList.instance.diceRollTables.map(diceRollTable => diceRollTable.command).some(command => command != null && command.trim().toUpperCase() == 'CHOICE'))) {
              isChoice = true;
              rollText = rollText.trim().replace(/[　\s]+/g, ' ');
            } else if ((result = /^(S?CHOICE\[[^\[\]]+\])/ig.exec(rollText.trim())) || (result = /^(S?CHOICE\([^\(\)]+\))/ig.exec(rollText.trim()))) {
              isChoice = true;
              rollText = result[1];
            } else {
              rollText = rollText.trim().split(/\s+/)[0]
            }
          } else {
            return;
          }

          // すべてBCDiceに投げずに回数が1回未満かchoice[]が含まれるか英数記号以外は門前払い
          if (!isChoice && (repeat < 1 || !(/choice\[.*\]/i.test(rollText) || /^[a-zA-Z0-9!-/:-@¥[-`{-~\}]+$/.test(rollText)))) {
            return;
          }
          let finalResult: DiceRollResult = { result: '', isSecret: false, isDiceRollTable: false, isEmptyDice: true };
          
          //ダイスボット表
          let isDiceRollTableMatch = false;
          for (const diceRollTable of DiceRollTableList.instance.diceRollTables) {
            let isSecret = false;
            if (diceRollTable.command != null && rollText.trim().toUpperCase() === 'S' + diceRollTable.command.trim().toUpperCase()) {
              isDiceRollTableMatch = true;
              isSecret = true;
            } else if (diceRollTable.command != null && rollText.trim().toUpperCase() === diceRollTable.command.trim().toUpperCase()) {
              isDiceRollTableMatch = true;
            }
            if (isDiceRollTableMatch) {
              finalResult.isDiceRollTable = true;
              finalResult.tableName = (diceRollTable.name && diceRollTable.name.length > 0) ? diceRollTable.name : '(無名のダイスボット表)';
              finalResult.isSecret = isSecret || isRepSecret;
              const diceRollTableRows = diceRollTable.parseText();
              for (let i = 0; i < repeat && i < 32; i++) {
                let rollResult = await DiceBot.diceRollAsync(StringUtil.toHalfWidth(diceRollTable.dice), 'DiceBot', 1);
                finalResult.isEmptyDice = finalResult.isEmptyDice && rollResult.isEmptyDice;
                if (rollResult.result) rollResult.result = rollResult.result.replace('DiceBot : ', '').replace(/[＞]/g, s => '→').trim();
                let rollResultNumber = 0;
                let match = null;
                if (rollResult.result.length > 0 && (match = rollResult.result.match(/\s→\s(?:成功数)?(\-?\d+)$/))) {
                  rollResultNumber = +match[1];
                }
                let isRowMatch = false;
                for (const diceRollTableRow of diceRollTableRows) {
                  if ((diceRollTableRow.range.start === null || diceRollTableRow.range.start <= rollResultNumber) 
                    && (diceRollTableRow.range.end === null || rollResultNumber <= diceRollTableRow.range.end)) {
                    //finalResult.result += (`[${rollResultNumber}] ` + StringUtil.cr(diceRollTableRow.result));
                    finalResult.result += ('🎲 ' + rollResult.result + "\n" + StringUtil.cr(diceRollTableRow.result));
                    isRowMatch = true;
                    break;
                  }
                }
                if (!isRowMatch) finalResult.result += ('🎲 ' + rollResult.result + "\n" + '(結果なし)');
                if (1 < repeat) finalResult.result += ` #${i + 1}\n`;
              }
              break;
            }
          }
          if (!isDiceRollTableMatch) {
            if (DiceBot.apiUrl) {
              //BCDice-API の繰り返し機能を利用する、結果の形式が縦に長いのと、更新していないBCDice-APIサーバーもありそうなのでまだ実装しない
              //finalResult = await DiceBot.diceRollAsync(repCommand ? (repCommand + repeat + ' ' + rollText) : rollText, gameType, repCommand ? 1 : repeat);
              finalResult = await DiceBot.diceRollAsync(rollText, gameType, repeat);
              finalResult.isSecret = finalResult.isSecret || isRepSecret;
            } else {
              for (let i = 0; i < repeat && i < 32; i++) {
                let rollResult = await DiceBot.diceRollAsync(rollText, gameType, repeat);
                if (rollResult.result.length < 1) break;

                finalResult.result += rollResult.result;
                finalResult.isSecret = finalResult.isSecret || rollResult.isSecret || isRepSecret;
                finalResult.isEmptyDice = finalResult.isEmptyDice && rollResult.isEmptyDice;
                if (1 < repeat) finalResult.result += ` #${i + 1}\n`;
              }
            }
          }
          this.sendResultMessage(finalResult, chatMessage);
        } catch (e) {
          console.error(e);
        }
        return;
      });
  }

  // GameObject Lifecycle
  onStoreRemoved() {
    super.onStoreRemoved();
    EventSystem.unregister(this);
  }

  private sendResultMessage(rollResult: DiceRollResult, originalMessage: ChatMessage) {
    let result: string = rollResult.result;
    const isSecret: boolean = rollResult.isSecret;
    const isEmptyDice: boolean = rollResult.isEmptyDice;

    if (result.length < 1) return;
    if (!rollResult.isDiceRollTable) result = result.replace(/[＞]/g, s => '→').trim();

    let tag = 'system';
    if (isSecret) tag += ' secret';
    if (isEmptyDice) tag += ' empty';

    let diceBotMessage: ChatMessageContext = {
      identifier: '',
      tabIdentifier: originalMessage.tabIdentifier,
      originFrom: originalMessage.from,
      from: rollResult.isDiceRollTable ? 'Dice-Roll Table' : DiceBot.apiUrl ? `BCDice-API(${DiceBot.apiUrl})` : 'System-BCDice',
      timestamp: originalMessage.timestamp + 1,
      imageIdentifier: '',
      tag: tag,
      name: rollResult.isDiceRollTable ? 
        isSecret ? '<' + rollResult.tableName + ' (Secret)：' + originalMessage.name + '>' : '<' + rollResult.tableName + '：' + originalMessage.name + '>' :
        isSecret ? '<Secret-BCDice：' + originalMessage.name + '>' : '<BCDice：' + originalMessage.name + '>' ,
      text: result,
      color: originalMessage.color,
      isUseStandImage: originalMessage.isUseStandImage
    };

    // ダイスボットへのスタンドの反応
    if (!isSecret && !originalMessage.standName && originalMessage.isUseStandImage) {
      const gameCharacter = ObjectStore.instance.get(originalMessage.characterIdentifier);
      if (gameCharacter instanceof GameCharacter) {
        const standInfo = gameCharacter.standList.matchStandInfo(result, originalMessage.imageIdentifier);
        if (standInfo.farewell) {
          const sendObj = {
            characterIdentifier: gameCharacter.identifier
          };
          if (originalMessage.to) {
            const targetPeer = PeerCursor.findByUserId(originalMessage.to);
            if (targetPeer) {
              if (targetPeer.peerId != PeerCursor.myCursor.peerId) EventSystem.call('FAREWELL_STAND_IMAGE', sendObj, targetPeer.peerId);
              EventSystem.call('FAREWELL_STAND_IMAGE', sendObj, PeerCursor.myCursor.peerId);
            }
          } else {
            EventSystem.call('FAREWELL_STAND_IMAGE', sendObj);
          }
        } else if (standInfo && standInfo.standElementIdentifier) {
          const diceBotMatch = <DataElement>ObjectStore.instance.get(standInfo.standElementIdentifier);
          if (diceBotMatch && diceBotMatch.getFirstElementByName('conditionType')) {
            const conditionType = +diceBotMatch.getFirstElementByName('conditionType').value;
            if (conditionType == StandConditionType.Postfix || conditionType == StandConditionType.PostfixOrImage || conditionType == StandConditionType.PostfixAndImage) {
              const sendObj = {
                characterIdentifier: gameCharacter.identifier, 
                standIdentifier: standInfo.standElementIdentifier, 
                color: originalMessage.color,
                secret: originalMessage.to ? true : false
              };              
              if (sendObj.secret) {
                const targetPeer = PeerCursor.findByUserId(originalMessage.to);
                if (targetPeer) {
                  if (targetPeer.peerId != PeerCursor.myCursor.peerId) EventSystem.call('POPUP_STAND_IMAGE', sendObj, targetPeer.peerId);
                  EventSystem.call('POPUP_STAND_IMAGE', sendObj, PeerCursor.myCursor.peerId);
                }
              } else {
                EventSystem.call('POPUP_STAND_IMAGE', sendObj);
              }
            }
          }
        }
        if (standInfo.matchMostLongText && diceBotMessage.text) {
          diceBotMessage.text = diceBotMessage.text.slice(0, diceBotMessage.text.length - standInfo.matchMostLongText.length);
        }
      }
    }

    if (originalMessage.to != null && 0 < originalMessage.to.length) {
      diceBotMessage.to = originalMessage.to;
      if (originalMessage.to.indexOf(originalMessage.from) < 0) {
        diceBotMessage.to += ' ' + originalMessage.from;
      }
    }
    let chatTab = ObjectStore.instance.get<ChatTab>(originalMessage.tabIdentifier);
    if (chatTab) chatTab.addMessage(diceBotMessage);
  }

  static diceRollAsync(message: string, gameType: string, repeat: number = 1): Promise<DiceRollResult> {
    gameType = gameType ? gameType : 'DiceBot';
    if (DiceBot.apiUrl) {
      const request = DiceBot.apiUrl + '/v1/diceroll?system=' + (gameType ? encodeURIComponent(gameType) : 'DiceBot') + '&command=' + encodeURIComponent(message);
      const promisise = [];
      for (let i = 1; i <= repeat; i++) {
        promisise.push(
          fetch(request, {mode: 'cors'})
            .then(response => {
              if (response.ok) {
                return response.json();
              }
              throw new Error(response.statusText);
            })
            .then(json => {
              return { result: (gameType) + json.result + (repeat > 1 ? ` #${i}\n` : ''), isSecret: json.secret, isEmptyDice: (json.dices && json.dices.length == 0) };
            })
            .catch(e => {
              //console.error(e);
              return { result: '', isSecret: false,  isEmptyDice: true };
            })
        );
      }
      return DiceBot.queue.add(
        Promise.all(promisise)
          .then(results => { return results.reduce((ac, cv) => {
            let result = ac.result + cv.result;
            let isSecret = ac.isSecret || cv.isSecret;
            let isEmptyDice = ac.isEmptyDice && cv.isEmptyDice;
            return { result: result, isSecret: isSecret, isEmptyDice: isEmptyDice };
          }, { result: '', isSecret: false, isEmptyDice: true }) })
      );
    } else {
      return DiceBot.queue.add((async () => {
          try {
            let gameSystem;
            if (!(gameSystem = DiceBot.loadedDiceBots[gameType])) {
              gameSystem = await DiceBot.loader.dynamicLoad(gameType);
              DiceBot.loadedDiceBots[gameType] = gameSystem;
            }
            const result = gameSystem.eval(message);
            console.log('diceRoll!!!', result);
            console.log('isSecret!!!', result.secret);
            console.log('isEmptyDice!!!', !result.rands || result.rands.length == 0);
            return { result: result.text, isSecret: result.secret, isEmptyDice: !result.rands || result.rands.length == 0 };
          } catch (e) {
            console.error(e);
          }
          return { result: '', isSecret: false, isEmptyDice: true };
      })());
    }
  }

  static getHelpMessage(gameType: string): Promise<string|string[]> {
    gameType = gameType ? gameType : 'DiceBot';
    if (DiceBot.apiUrl) {
      const promisise = [
        fetch(DiceBot.apiUrl + '/v1/systeminfo?system=DiceBot', {mode: 'cors'})
          .then(response => { return response.json() })
      ];
      if (gameType && gameType != 'DiceBot') {
        promisise.push(
          fetch(DiceBot.apiUrl + '/v1/systeminfo?system=' + encodeURIComponent(gameType), {mode: 'cors'})
            .then(response => { return response.json() })
        );
      }
      return Promise.all(promisise)
        .then(jsons => { 
          return jsons.map(json => {
            if (json.systeminfo && json.systeminfo.info) {
              return json.systeminfo.info.replace('部屋のシステム名', 'チャットパレットなどのシステム名');
            } else {
              return 'ダイスボット情報がありません。';
            }                
          }) 
        });
    } else {
      return DiceBot.queue.add((async () => {
        let help = [''];
        try {
          let diceBot;
          if (!(diceBot = DiceBot.loadedDiceBots['DiceBot'])) {
            diceBot = await DiceBot.loader.dynamicLoad('DiceBot');
            DiceBot.loadedDiceBots['DiceBot'] = diceBot;
          }
          help = [diceBot.HELP_MESSAGE];
          if (gameType && gameType != '' && gameType != 'DiceBot') {
            let gameSystem;
            if (!(gameSystem = DiceBot.loadedDiceBots[gameType])) {
              gameSystem = await DiceBot.loader.dynamicLoad(gameType);
              DiceBot.loadedDiceBots[gameType] = gameSystem;
            }
            if (gameSystem.HELP_MESSAGE) help.push(gameSystem.HELP_MESSAGE.replace('部屋のシステム名', 'チャットパレットなどのシステム名'));
          }
        } catch (e) {
          console.error(e);
        }
        return help;
      })());
    }
  }
}
