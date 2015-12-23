'use strict';
const pathResolve = require( 'path' ).resolve;
const cons = require( 'consolidate' );
const parseSheet = require( './parseSheet' );

/**
 * @param sheet
 * @param {String} templateName - 模板名称
 * @param {Object} [options]
 * @param {Object} [options.locals] - 要附加在 rowData 上的通用数据
 * @param {Function} [options.onRendered(rowData:*,html:String)] - 没当一个模板生成好了之后就会调用此函数
 */
module.exports = ( sheet , templateName , options )=> {
  const templatePath = pathResolve( __dirname , 'templates/' + templateName + '/template.html' );
  parseSheet( sheet , ( rowData )=> {
    Object.assign( rowData , options.locals );
    cons.dot( templatePath , rowData )
      .then( ( html )=> {
        options.onRendered( rowData , html );
      } );
  } );
};
