'use strict';
const toJson = require( 'xlsx' ).utils.sheet_to_json;

/**
 * 逐行分析表格，每当解析完一条数据后则调用一次 onData
 * @param sheet
 * @param {Function} onData(rowData)
 */
module.exports = function ( sheet , onData ) {
  const array = toJson( sheet );

  // 同一个分单号下可能会有多个物品，所以要更改一下数据结构
  let prevRowData;
  array.forEach( ( rowData )=> {
    const itemData = {
      '图片文件名' : rowData[ '图片文件名' ] ,
      '品名' : rowData[ '品名' ] ,
      '单价' : rowData[ '单价' ] ,
      '数量' : rowData[ '数量' ]
    };

    // 如果这行数据有分单号
    if ( rowData[ '分单号' ] ) {

      // 先将物品相关的数据转换成一个数组
      rowData.items = [ itemData ];
      delete rowData[ '图片文件名' ];
      delete rowData[ '品名' ];
      delete rowData[ '单价' ];
      delete rowData[ '数量' ];

      // 遇到一个新的分单号，则说明上一条分单号解析完成了，调用一次事件
      if ( prevRowData ) {
        onData( prevRowData );
      }

      prevRowData = rowData;
    } else {
      // 如果这行数据没有分单号，那说明是属于上一个分单号的物品，
      // 此时将物品数据保存到上一个分单号里
      prevRowData.items.push( itemData );
    }
  } );
  onData( prevRowData ); // 最后一条分单数据
};
