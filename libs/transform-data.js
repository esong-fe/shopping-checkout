'use strict';
const moment = require( 'moment' );
const t = new (require( 'translation.js' ))();
t.create( 'Google' );
t.create( 'GoogleCN' );
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

  /**
   * 数据转换的构造函数
   * @param data
   * @param options
   * @param options.useCN - 翻译时默认使用国外的谷歌翻译，但如果此参数为 true 则使用国内的谷歌翻译
   */
  constructor( data , options ) {
    this.data = data;
    this.useCN = options.useCN;
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
   * 转换日期格式
   */
  convertDate() {
    const rowData = this.data;
    switch ( rowData.templateName ) {
      case '6pm':
        [ '发货日期' , '下单日期' ].forEach( ( key )=> {
          const m = moment( new Date( rowData[ key ] ) );
          if ( m.isValid() ) {
            rowData[ key ] = m.format( 'MMM D,YYYY [at] h:mm A' );
          }
        } );
        break;

      case 'amazon-us':
      case 'amazon-jp':
        const m1 = moment( new Date( rowData[ '下单日期' ] ) );
        if ( m1.isValid() ) {
          rowData[ '下单日期' ] = m1.format( 'MMMM D, YYYY' );
        }
        const m2 = moment( new Date( rowData[ '发货日期' ] ) );
        if ( m2.isValid() ) {
          rowData[ '发货日期' ] = m2.format( 'MMM D, YYYY' );
        }
        break;
    }
    return Promise.resolve();
  }

  /**
   * 如果是亚马逊，则根据“翻译为”字段判断货币符号
   */
  currency() {
    const rowData = this.data;
    if ( 'amazon-us' === rowData.templateName || 'amazon-jp' === rowData.templateName ) {
      rowData.currency = rowData[ '翻译为' ] === '日语' ? '￥' : '$';
    }
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
            api : this.useCN ? 'GoogleCN' : 'Google' ,
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
 * @param options - 构造函数的 options 对象
 * @returns {Promise}
 */
module.exports = ( data , options )=> {
  const t = new Transform( data , options );
  return Promise.all( [
    t.cardType() ,
    t.totalAmount() ,
    t.translate() ,
    t.currency() ,
    t.convertDate()
  ] ).then( ()=> t.data );
};
