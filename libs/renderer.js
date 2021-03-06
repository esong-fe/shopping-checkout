'use strict';
const parseSheetPerLine = require( './parseSheet' );
const transformData = require( './transform-data' );
const parseXLSX = require( 'xlsx' ).readFile;

/**
 * @param {String} sheetPath - Excel 表格的绝对路径
 * @param {String} templateName - 模板名称
 * @param {Object} options
 * @param {Boolean} [options.useCN] - 是否使用谷歌中文翻译
 * @param {Object} [options.locals] - 要附加在 rowData 上的通用数据
 * @param {Function} options.onParsed(rowData:Object) - 每当一个模板生成好了之后就会调用此函数
 */
module.exports = ( sheetPath , templateName , options )=> {
  // 读取电子表格的第一张表
  let wb;
  try {
    wb = parseXLSX( sheetPath );
  }
  catch ( e ) {
    console.error( '解析 %s 文件时出错：' , sheetPath );
    console.error( e );
    console.error( '请检查文件格式是否正确。' );
  }
  const sheet = wb.Sheets[ wb.SheetNames[ 0 ] ];

  // 解析表格数据，每解析一行调用一次回调函数
  parseSheetPerLine( sheet , ( rowData )=> {
    Object.assign( rowData , options.locals );
    rowData.templateName = templateName;

    // 修改或添加表格数据
    transformData( rowData , {
      useCN : options.useCN
    } ).then( options.onParsed );
  } );
};
