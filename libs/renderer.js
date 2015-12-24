'use strict';
const moment = require( 'moment' );
const pathResolve = require( 'path' ).resolve;
const cons = require( 'consolidate' );
const parseSheet = require( './parseSheet' );

const dateFields = [ '发货日期' , '下单日期' ];

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

    if ( templateName === '6pm' ) {
      dateFields.forEach( ( key )=> {
        const m = moment( new Date( rowData[ key ] ) );
        if ( m.isValid() ) {
          rowData[ key ] = m.format( 'MMM D,YYYY [at] h:mm A' );
        }
      } );
    }

    Object.assign( rowData , options.locals );
    cons.dot( templatePath , rowData )
      .then( ( html )=> {
        options.onRendered( rowData , html );
      } );
  } );
};

/**
 * 将日期转换成某一形式
 */
function covertDate( date ) {}
