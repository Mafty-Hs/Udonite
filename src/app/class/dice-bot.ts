import { SyncObject } from './core/synchronize-object/decorator';
import { InnerXml } from './core/synchronize-object/object-serializer';
import { ObjectNode } from './core/synchronize-object/object-node';

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

export interface DiceRollResult {
  result: string;
  isSecret: boolean;
  isDiceRollTable?: boolean;
  tableName?: string;
  isEmptyDice?: boolean;
  isSuccess?: boolean;
  isFailure?: boolean;
  isCritical?: boolean;
  isFumble?: boolean;
}

export interface api {
  url: string;
  version: number;
}

@SyncObject('dice-bot')
export class DiceBot extends ObjectNode implements InnerXml {
  
  private static _instance: DiceBot;
  static get instance(): DiceBot {
    if (!DiceBot._instance) {
      DiceBot._instance = new DiceBot('DiceBot');
      DiceBot._instance.initialize();
    }
    return DiceBot._instance;
  }

  public diceBotInfos: DiceBotInfo[] = [];
  public diceBotInfosIndexed: DiceBotInfosIndexed[] = [];
  public api: api = {url: "", version: 2};  

  public static replaceData: [string, string, string?][] = [
    ['新クトゥルフ', 'シンクトウルフシンワTRPG', '新クトゥルフ神話TRPG'],
    ['クトゥルフ神話TRPG', 'クトウルフシンワTRPG', '(旧) クトゥルフ神話TRPG'],
    ['???', '???? ?? 6?', '???? ?? 6?'],
    ['克蘇魯神話', '克蘇魯的呼喚 第六版', '克蘇魯的呼喚 第六版'],
    ['克蘇魯神話第7版', '克蘇魯的呼喚 第7版', '克蘇魯的呼喚 第七版'],
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
}
