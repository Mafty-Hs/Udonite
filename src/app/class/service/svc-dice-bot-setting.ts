import { DiceBot, api, DiceBotInfo, DiceBotInfosIndexed } from '@udonarium/dice-bot';

export class SvcDiceBotSetting {

  private api:api = DiceBot.instance.api;
  private diceBotInfos = DiceBot.instance.diceBotInfos;
  private diceBotInfosIndexed = DiceBot.instance.diceBotInfosIndexed;

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
      console.log("diceBot INFO Load ERROR!")
      if (this.api.retry <= 3) {
        this.api.retry += 1;
        let nexttime:number = this.api.retry * 30 * 1000;
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
        for (let replaceData of this.replaceData) {
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
         : info.lang == 'SimplifiedChinese' ? '簡体中文'
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
    this.api.isConnect = true;
  }

  private replaceData: [string, string, string?][] = [
    ['新クトゥルフ', 'シンクトウルフシンワTRPG', '新クトゥルフ神話TRPG'],
    ['クトゥルフ神話TRPG', 'クトウルフシンワTRPG', '(旧) クトゥルフ神話TRPG'],
    ['크툴루', '크툴루의 부름 6판', '크툴루의 부름 6판'],
    ['克蘇魯神話', '克蘇魯的呼喚 第六版', '克蘇魯的呼喚 第六版'],
    ['克蘇魯神話第7版', '克蘇魯的呼喚 第7版', '克蘇魯的呼喚 第七版'],
    ['トーグ', 'トオク', 'トーグ（TORG）'],
    ['ワープス', 'ワアフス', 'WARPS'],
    ['トーグ1.5版', 'トオク1.5ハン', 'トーグ（TORG） 1.5版'],
    ['トーグ エタニティ', 'トオクエタニテイ', 'トーグ（TORG） エタニティ'],
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

}
