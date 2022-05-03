export namespace StringUtil {

  const EMOJI_REGEXP = new RegExp([
    '\ud83c[\udf00-\udfff]',
    '\ud83d[\udc00-\ude4f]',
    '\ud83d[\ude80-\udeff]',
    '\ud7c9[\ude00-\udeff]',
    '[\u2600-\u27BF]'
  ].join('|'));

  export function toHalfWidth(str: String): string {
    return str.replace(/[！-～]/g, c => String.fromCharCode(c.charCodeAt(0) - 0xFEE0));
  }

  export function isEmote(this: any,str: string): boolean {
    if (!str) return false;
    str = this.cr(str).replace(/[\s\r\n]/g, '');
    return str.length <= 3 && (EMOJI_REGEXP.test(str) || /[$＄\\￥！？❕❢‽‼/!/?♥♪♬♩♫☺]/.test(str));
  }

  export function cr(str: string): string {
    if (!str) return '';
    let ret = '';
    let flg = '';
    [...str].forEach(c => {
      if (flg) {
        switch (c) {
          case 'n':
          case 'ｎ':
            ret += "\n";
            break;
          case '\\':
          case '￥':
            ret += c;
            break;
          default:
            ret += (flg + c);
        }
        flg = '';
      } else if (c == '\\' || c == '￥') {
        flg = c;
      } else {
        ret += c;
      }
    });
    return ret;
  }

  export function validUrl(url: string): boolean {
    if (!url) return false;
    try {
      new URL(url.trim());
    } catch (e) {
      return false;
    }
    return /^https?\:\/\//.test(url.trim());
  }

  export function urlSanitize(url :string):string {
    if (!validUrl(url)) return "";
    return url.replace(/\/$/,'');
  }

  export function sameOrigin(url: string): boolean {
    if (!url) return false;
    try {
      return (new URL(url)).origin === window.location.origin;
    } catch (e) {
      return false;
    }
  }

  export function escapeHtml(str) {
    if(typeof str !== 'string') {
      return str.toString();
    }
    return str.replace(/[&'`"<>]/g, function(match){
      return {
        '&': '&amp;',
        "'": '&#x27;',
        '`': '&#x60;',
        '"': '&quot;',
        '<': '&lt;',
        '>': '&gt;',
      }[match]
    });
  }

  export function escapeHtmlAndRuby(this: any,text :string, needFont :boolean = false):string {
    let escapeText = this.escapeHtml(text);
    if (needFont) return escapeText.replace(/[\|｜]([^\|｜\s]+?)《(.+?)》/g, '<ruby class="rubytext">$1<rt>$2</rt></ruby>').replace(/\\s/g,' ');
    return escapeText.replace(/[\|｜]([^\|｜\s]+?)《(.+?)》/g, '<ruby>$1<rt>$2</rt></ruby>').replace(/\\s/g,' ');
  }

  export function text2Byte(text :string) : string {
    let calcMap = { '＋': '+' ,'－': '-' ,'×': '*' , '÷': '/' ,
      'ー': '-' ,'＊': '*' ,'％': '%' ,'（': '(' ,'）': ')'
    };
    let calcEnc = new RegExp('(' + Object.keys(calcMap).join('|') + ')', 'g');
    let result = text
    .replace(/[Ａ-Ｚａ-ｚ０-９]/g, function(str) {
      return String.fromCharCode(str.charCodeAt(0) - 0xFEE0);
    })
    .replace(calcEnc, function (str) {
      return calcMap[str];
    })
    .replace(/[^\x20-\x7e]/g,'');

    return result;
  }

  export function calculable(text :string) :boolean {
    let calcPattern:RegExp = new RegExp('^[0-9\\+\\-\\*\\/\\%\\(\\)]+$');
     return calcPattern.test(text);
  }


}
