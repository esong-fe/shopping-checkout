'use strict';
const pathResolve = require( 'path' ).resolve;
const cons = require( 'consolidate' );
const sheet2json = require( '../../sheet2json' );

/**
 * 每个模板的 index 文件都必须是一个函数，
 * 此函数接收一个 js-xlsx 的 sheet 对象为参数；
 * 每个 sheet 对象有很多行数据，一行数据对应一个 html，
 * 每当一个 html 完成后就会调用一次 onRendered，
 * 第一个参数是这一行的 json 数据，
 * 第二个参数则是根据此行数据生成好的 html
 * @param sheet
 * @param {Function} onRendered(rowData:*,html:String)
 */
module.exports = ( sheet , onRendered )=> {
  const array = sheet2json( sheet );
  const templatePath = pathResolve( __dirname , 'template.html' );
  array.forEach( ( rowData )=> {
    // 计算总价
    rowData[ '总价' ] = rowData.items.reduce( ( previousValue , currentItem )=> {
      return previousValue + Number( currentItem[ '单价' ] ) * Number( currentItem[ '数量' ] );
    } , 0 ).toFixed( 2 );

    cons.dot( templatePath , rowData )
      .then( ( html )=> {
        onRendered( rowData , html );
      } );
  } );
};
