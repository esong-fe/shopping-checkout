'use strict';
const sheetToJson = require( 'xlsx' ).utils.sheet_to_json;

/**
 * 保存属于商品的字段
 * @type {string[]}
 */
const itemKey = [ '图片文件名' , '品名' , '单价' , '数量' , '品牌' , '颜色' , '型号' ];

/**
 * 逐行分析表格，每当解析完一条数据后则调用一次 onData
 * @param sheet
 * @param {Function} onData(rowData)
 */
module.exports = function ( sheet , onData ) {
  const array = sheetToJson( sheet );

  // 同一个分单号下可能会有多个物品，所以要更改一下数据结构
  let prevRowData;
  array.forEach( ( rowData )=> {
    const itemData = {};
    itemKey.forEach( ( key )=> {
      itemData[ key ] = rowData[ key ];
    } );

    // 如果这行数据有分单号
    if ( rowData[ '分单号' ] ) {

      // 先将物品相关的数据转换成一个数组
      rowData.items = [ itemData ];
      itemKey.forEach( ( key )=> {
        delete rowData[ key ];
      } );

      // 遇到一个新的分单号，则说明上一条分单号解析完成了，调用一次事件
      if ( prevRowData ) {
        parseData( prevRowData );
      }

      prevRowData = rowData;
    } else {
      // 如果这行数据没有分单号，那说明是属于上一个分单号的物品，
      // 此时将物品数据保存到上一个分单号里
      prevRowData.items.push( itemData );
    }
  } );
  parseData( prevRowData ); // 最后一条分单数据

  function parseData( rowData ) {

    // 计算总价
    rowData[ '总价' ] = rowData.items.reduce( ( previousValue , currentItem )=> {
      return previousValue + Number( currentItem[ '单价' ] ) * Number( currentItem[ '数量' ] );
    } , 0 ).toFixed( 2 );

    onData( rowData );
  }
};
