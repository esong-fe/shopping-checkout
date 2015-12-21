'use strict';
const XLSX = require( 'xlsx' );

/**
 * 将表格转换为一个数组
 * @param sheet
 * @returns {Array}
 */
module.exports = function ( sheet ) {
  const array = XLSX.utils.sheet_to_json( sheet );

  // 同一个分单号下可能会有多个物品，所以要更改一下数据结构
  let prevRowData;
  return array.filter( ( rowData )=> {
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

      prevRowData = rowData;
      return true; // 并在数组中保留此数据
    } else {
      // 如果这行数据没有分单号，那说明是属于上一个分单号的物品，
      // 此时将物品数据保存到上一个分单号里
      prevRowData.items.push( itemData );
      return false; // 在数组中移除此数据
    }
  } );
};
