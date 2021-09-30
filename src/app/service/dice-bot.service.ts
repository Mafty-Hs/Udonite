import { Injectable } from '@angular/core';
import { DiceBot , DiceBotInfo, DiceBotInfosIndexed, DiceRollResult , api } from '@udonarium/dice-bot';
import { ChatMessage, ChatMessageContext } from '@udonarium/chat-message';
import { ChatTab } from '@udonarium/chat-tab';
import { GameObject } from '@udonarium/core/synchronize-object/game-object';
import { ObjectStore } from '@udonarium/core/synchronize-object/object-store';
import { EventSystem } from '@udonarium/core/system';
import { PromiseQueue } from '@udonarium/core/system/util/promise-queue';
import { StringUtil } from '@udonarium/core/system/util/string-util';
import { DataElement } from '@udonarium/data-element';
import { GameCharacter } from '@udonarium/game-character';
import { PeerCursor } from '@udonarium/peer-cursor';
import { StandConditionType } from '@udonarium/stand-list';
import { DiceRollTableList } from '@udonarium/dice-roll-table-list';
import { CutInList } from '@udonarium/cut-in-list';


@Injectable({
  providedIn: 'root'
})
export class DiceBotService {
  get diceBotInfos(): DiceBotInfo[] {return DiceBot.instance.diceBotInfos;} 
  set diceBotInfos(_diceBotInfos) {DiceBot.instance.diceBotInfos = _diceBotInfos;}
  get diceBotInfosIndexed(): DiceBotInfosIndexed[] {return DiceBot.instance.diceBotInfosIndexed;} 
  set diceBotInfosIndexed(_diceBotInfosIndexed) {DiceBot.instance.diceBotInfosIndexed = _diceBotInfosIndexed;}
  get api(): api {return DiceBot.instance.api;} 
  set api(_api) {DiceBot.instance.api = _api;}

  private queue: PromiseQueue = new PromiseQueue('DiceBotQueue');
  private retry:number;
  isConnect: boolean = false;

  async diceRoll(messageIdentifier: string) {
    const chatMessage = ObjectStore.instance.get<ChatMessage>(messageIdentifier);
    if (!chatMessage || !chatMessage.isSendFromSelf || chatMessage.isSystem) return;

    const text: string = StringUtil.toHalfWidth(chatMessage.text).replace("\u200b", ''); //ゼロ幅スペース削除
    let gameType: string = chatMessage.tag.replace('noface', '').trim();
    gameType = gameType ? gameType : 'DiceBot';
    const regArray = /^((srepeat|repeat|srep|rep|sx|x)?(\d+)?[ 　]+)?([^\n]*)?/ig.exec(text);
    const repCommand = regArray[2];
    const isRepSecret = repCommand && repCommand.toUpperCase().indexOf('S') === 0;
    const repeat: number = (regArray[3] != null) ? Number(regArray[3]) : 1;
    let rollText: string = (regArray[4] != null) ? regArray[4] : text;
    rollText = rollText.replace(/Ⅾ/g, 'D');
    if (!rollText || repeat <= 0) return;
    let finalResult: DiceRollResult = { result: '', isSecret: false, isDiceRollTable: false, isEmptyDice: true,
     isSuccess: false, isFailure: true, isCritical: false, isFumble: false };

    if (await this.diceRollTableMatch(rollText, repeat, chatMessage)) return;
    let isChoice = false;
    let choiceMatch;
  if (choiceMatch = /^(S?CHOICE\d*)[ 　]+([^ 　]*)/ig.exec(rollText.trim())) {
      rollText = rollText.trim().replace(/[　\s]+/g, ' ');
      isChoice = true;
  }
  if (!isChoice) {
    if ((choiceMatch = /^(S?CHOICE\d*\[[^\[\]]+\])/ig.exec(rollText.trim())) || (choiceMatch = /^(S?CHOICE\d*\([^\(\)]+\))/ig.exec(rollText.trim()))) {
      if (!DiceRollTableList.instance.diceRollTables.map(diceRollTable => diceRollTable.command).some(command => command != null && command.trim().toUpperCase() === choiceMatch[1].toUpperCase())) {
        rollText = choiceMatch[1];
        isChoice = true;
      }
    }
  } 
  if (!isChoice) {
    rollText = rollText.trim().split(/\s+/)[0]
  }
    if ( /^[a-zA-Z0-9!-/:-@¥[-`{-~\}]+$/.test(rollText)
     || isChoice ) {} 
    else
     return;
    //console.log(/choice\d*\[.*\]/i.test(rollText));
    if (repeat < 1) return;
    try {
      finalResult = await this.bcDice(rollText, gameType, repeat);
    }
    catch(e) {

    }
    finalResult.isSecret = finalResult.isSecret || isRepSecret;
    this.sendResultMessage(finalResult, chatMessage);
    return;
  }

  async diceRollTableMatch(rollText: string ,repeat ,chatMessage): Promise<boolean>{
    let diceRollTable = DiceRollTableList.instance.diceRollTables.find(
      (_diceRollTable) => 
      _diceRollTable.command.trim().toUpperCase()
       === rollText.trim().toUpperCase() ||
      'S' + _diceRollTable.command.trim().toUpperCase()
       === rollText.trim().toUpperCase()
    );
    if (!diceRollTable) return false;
    let finalResult: DiceRollResult = { result: '', isSecret: false, isDiceRollTable: false, isEmptyDice: true,
            isSuccess: false, isFailure: true, isCritical: false, isFumble: false };
    let isSecret = false;
    if ('S' + diceRollTable.command.trim().toUpperCase()
       === rollText.trim().toUpperCase()) isSecret = true;
    finalResult.isDiceRollTable = true;
    finalResult.tableName = (diceRollTable.name && diceRollTable.name.length > 0) ? diceRollTable.name : '(無名のダイスボット表)';
    finalResult.isSecret = isSecret 
    const diceRollTableRows = diceRollTable.parseText();

   for (let i = 0; i < repeat && i < 32; i++) {
     let rollResult = await this.bcDice(StringUtil.toHalfWidth(diceRollTable.dice), 'DiceBot', 1);
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
         finalResult.result += ('🎲 ' + rollResult.result + "\n" + StringUtil.cr(diceRollTableRow.result));
       isRowMatch = true;
        break;
      }
    }
    if (!isRowMatch) finalResult.result += ('🎲 ' + rollResult.result + "\n" + '(結果なし)');
      if (1 < repeat) finalResult.result += ` #${i + 1}`;
      if (i < repeat - 1) finalResult.result += "\n";
    }
    this.sendResultMessage(finalResult, chatMessage);
    return true;
  }

  bcDice(message: string, gameType: string, repeat: number = 1): Promise<DiceRollResult> {
    gameType = gameType ? gameType : 'DiceBot';
    const request = `${this.api.url}/v2/game_system/${(gameType ? encodeURIComponent(gameType) : 'DiceBot')}/roll?command=${encodeURIComponent(message)}`;
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
            console.log(JSON.stringify(json))
            return { result: (gameType) + ' ' + (json.text) + (repeat > 1 ? ` #${i}\n` : ''), isSecret: json.secret, 
            isEmptyDice: (json.rands && json.rands.length == 0),
            isSuccess: json.success, isFailure: json.failure, isCritical: json.critical, isFumble: json.fumble };
          })
          .catch(e => {
            return { result: '', isSecret: false,  isEmptyDice: true };
          })
      );
    }
      return this.queue.add(
      Promise.all(promisise)
        .then(results => { return results.reduce((ac, cv) => {
          let result = ac.result + cv.result;
          let isSecret = ac.isSecret || cv.isSecret;
          let isEmptyDice = ac.isEmptyDice && cv.isEmptyDice;
          let isSuccess = ac.isSuccess || cv.isSuccess;
          let isFailure = ac.isFailure && cv.isFailure;
          let isCritical = ac.isCritical || cv.isCritical;
          let isFumble = ac.isFumble || cv.isFumble;
          return { result: result, isSecret: isSecret, isEmptyDice: isEmptyDice, 
            isSuccess: isSuccess, isFailure: isFailure, isCritical: isCritical, isFumble: isFumble };
        }, { result: '', isSecret: false, isEmptyDice: true, isSuccess: false, isFailure: true, isCritical: false, isFumble: false }) })
      );
  }

  initialize(apiUrl:string) {
    DiceBot.instance.initialize();
    this.api.url = (apiUrl.substr(apiUrl.length - 1) === '/') ? apiUrl.substr(0, apiUrl.length - 1) : apiUrl;
    this.api.version = 2
    this.retry = 0;
    this.loadDiceInfo();
    EventSystem.register(this)
      .on('SEND_MESSAGE', event => { this.diceRoll(event.data.messageIdentifier) });
  }  

  async loadDiceInfo() {
    const controller = new AbortController();
    const timer = setTimeout(() => { controller.abort() }, 30000);

    try {
      fetch(this.api.url + '/v2/game_system', {mode: 'cors'})
        .then(response => { return response.json() })
        .then(infos => {
          this.normalizeDiceInfo(infos);
        });
    }
    catch {
      this.diceBotInfos = [];
      this.diceBotInfosIndexed = [];
      console.log("diceBot INFO Load ERROR!")
      if (this.retry <= 3) {
        this.retry += 1;
        let nexttime:number = this.retry * 30 * 1000;
        setTimeout(() => { this.loadDiceInfo() }, nexttime);
      }
    }
    finally {
      clearTimeout(timer); 
    } 
    console.log("diceBot Load END")
  }

  normalizeDiceInfo(infos :any) {
    let tempInfos = (infos.game_system)
      .filter(info => info.id != 'DiceBot')
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
         const lang = /.+\:(.+)/.exec(info.id);
         info.lang = lang ? lang[1] : 'A';
         return info;
      })
      .sort((a, b) => {
        return a.lang < b.lang ? -1 
         : a.lang > b.lang ? 1
         : a.normalize == b.normalize ? 0 
         : a.normalize < b.normalize ? -1 : 1;
    });
    this.diceBotInfos.push(...tempInfos.map(info => { return { script: (this.api.version == 1 ? info.system : info.id), game: info.name } }));
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
          this.diceBotInfosIndexed.push(group);
          group = { index: index, infos: [] };
        }
        group.infos.push({ script: (this.api.version == 1 ? info.system : info.id), game: info.name });
     }
     this.diceBotInfosIndexed.push(group);
     this.diceBotInfosIndexed.sort((a, b) => a.index == b.index ? 0 : a.index < b.index ? -1 : 1);
   }
    this.isConnect = true;
  }

  getHelpMessage(gameType: string): Promise<string|string[]> {
    gameType = gameType ? gameType : 'DiceBot';
     const promisise = [
        fetch(`${this.api.url}/v2/game_system/DiceBot`, {mode: 'cors'})
          .then(response => { return response.json() })
      ];
      if (gameType && gameType != 'DiceBot') {
        promisise.push(
          fetch(`${this.api.url}/v2/game_system/${encodeURIComponent(gameType)}`, {mode: 'cors'})
            .then(response => { return response.json() })
        );
      }
      return Promise.all(promisise)
        .then(jsons => { 
          return jsons.map(json => {
            if (json.help_message) {
              return json.help_message.replace('部屋のシステム名', 'チャットパレットなどのシステム名');
            } else {
              return 'ダイスボット情報がありません。';
            }                
          }) 
        });
    } 

   private sendResultMessage(rollResult: DiceRollResult, originalMessage: ChatMessage) {
    let result: string = rollResult.result;
    const isSecret: boolean = rollResult.isSecret;
    const isEmptyDice: boolean = rollResult.isEmptyDice;
    const isSuccess: boolean = rollResult.isSuccess;
    const isFailure: boolean = rollResult.isFailure;
    const isCritical: boolean = rollResult.isCritical;
    const isFumble: boolean = rollResult.isFumble;

    if (result.length < 1) return;
    if (!rollResult.isDiceRollTable) result = result.replace(/[＞]/g, s => '→').trim();

    let tag = 'system';
    if (isSecret) tag += ' secret';
    if (isEmptyDice) tag += ' empty';
    if (isSuccess) tag += ' success';
    if (isFailure) tag += ' failure';
    if (isCritical) tag += ' critical';
    if (isFumble) tag += ' fumble';

    let diceBotMessage: ChatMessageContext = {
      identifier: '',
      tabIdentifier: originalMessage.tabIdentifier,
      originFrom: originalMessage.from,
      from: rollResult.isDiceRollTable ? 'Dice-Roll Table' : `BCDice-API(${this.api.url})`,
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

    let matchMostLongText = '';
    // ダイスボットへのスタンドの反応
    const gameCharacter = ObjectStore.instance.get(originalMessage.characterIdentifier);
    if (gameCharacter instanceof GameCharacter) {
      const standInfo = gameCharacter.standList.matchStandInfo(result, originalMessage.imageIdentifier);
      if (!isSecret && !originalMessage.standName && originalMessage.isUseStandImage) {
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
      }
      matchMostLongText = standInfo.matchMostLongText;
    }
    
    const chatTab = ObjectStore.instance.get<ChatTab>(originalMessage.tabIdentifier);
    // ダイスによるカットイン発生
    const cutInInfo = CutInList.instance.matchCutInInfo(result);
    if (!isSecret && chatTab.isUseStandImage) {
      for (const identifier of cutInInfo.identifiers) {
        const sendObj = {
          identifier: identifier, 
          secret: originalMessage.to ? true : false,
          sender: PeerCursor.myCursor.peerId
        };
        if (sendObj.secret) {
          const targetPeer = PeerCursor.findByUserId(originalMessage.to);
          if (targetPeer) {
            if (targetPeer.peerId != PeerCursor.myCursor.peerId) EventSystem.call('PLAY_CUT_IN', sendObj, targetPeer.peerId);
            EventSystem.call('PLAY_CUT_IN', sendObj, PeerCursor.myCursor.peerId);
          }
        } else {
          EventSystem.call('PLAY_CUT_IN', sendObj);
        }
      }
    }

    // 切り取り
    if (matchMostLongText.length < cutInInfo.matchMostLongText.length) matchMostLongText = cutInInfo.matchMostLongText;
    if (matchMostLongText && diceBotMessage.text) {
      diceBotMessage.text = diceBotMessage.text.slice(0, diceBotMessage.text.length - matchMostLongText.length);
    }

    if (originalMessage.to != null && 0 < originalMessage.to.length) {
      diceBotMessage.to = originalMessage.to;
      if (originalMessage.to.indexOf(originalMessage.from) < 0) {
        diceBotMessage.to += ' ' + originalMessage.from;
      }
    }
    if (chatTab) chatTab.addMessage(diceBotMessage);
  }


  constructor() { }
}
