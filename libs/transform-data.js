'use strict';
const Translate = require( 'translation.js' );
const t = new Translate();
// todo 有道翻译不能指定目标语种，但用谷歌翻译会出错
t.create( 'GoogleCN' );
t.defaultApi = 'GoogleCN';
//t.create( 'YouDao' , {
//  apiKey : '995586483' ,
//  keyFrom : 'yi-express'
//} );
//t.defaultApi = 'YouDao';

/**
 * 对 Excel 内的一行数据做一些改变
 */

/**
 * 支持的信用卡类型
 */
const supportCardType = {
  '万事达' : 'master' ,
  'visa' : 'visa'
};

class Transform {
  constructor( data ) {
    this.data = data;
  }

  /**
   * 判断信用卡类型
   * @return {Promise}
   */
  cardType() {
    const data = this.data;
    let cardTypeChinese = data[ '信用卡类型' ];
    let cardType;

    if ( !cardTypeChinese ) {
      console.warn( '没有声明信用卡类型，默认使用 Master' );
      cardTypeChinese = '万事达';
    }
    cardTypeChinese = cardTypeChinese.toLowerCase();
    cardType = supportCardType[ cardTypeChinese ];
    if ( !cardType ) {
      console.error( '没有找到此信用卡类型：%s，默认使用万事达。' , cardTypeChinese );
      cardType = 'master';
    }

    data.cardType = cardType;
    return Promise.resolve();
  }

  /**
   * 计算总价
   * @return {Promise}
   */
  totalAmount() {
    const data = this.data;
    data[ '总价' ] = data.items.reduce( ( previousValue , currentItem )=> {
      return previousValue + Number( currentItem[ '单价' ] ) * Number( currentItem[ '数量' ] );
    } , 0 ).toFixed( 2 );
    return Promise.resolve();
  }

  /**
   * 翻译指定字段
   * @returns {Promise}
   */
  translate() {
    const data = this.data;
    const translateTo = { '英语' : 'en' , '日语' : 'ja' }[ data[ '翻译为' ] ];
    if ( !translateTo ) {
      return Promise.resolve();
    }

    const translateItemKeys = [ '品名' ];
    const promises = [];
    data.items.forEach( ( item )=> {
      translateItemKeys.forEach( ( key )=> {
        const p = t
          .translate( {
            text : item[ key ] ,
            to : translateTo
          } )
          .then( ( resultObj )=> {
            item[ key ] = resultObj.result.join( ' ' );
          } , ( error )=> {
            console.error( '翻译分单号 %s 里的 "%s" 为%s时出错：%s' , data[ '分单号' ] , item[ key ] , data[ '翻译为' ] , error );
          } );

        promises.push( p );
      } );
    } );
    return Promise.all( promises );
  }
}

/**
 * 处理数据并返回处理结果
 * @param data
 * @returns {Promise}
 */
module.exports = ( data )=> {
  const t = new Transform( data );
  return Promise.all( [
    t.cardType() ,
    t.totalAmount() ,
    t.translate()
  ] ).then( ()=> t.data );
};
