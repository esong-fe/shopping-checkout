'use strict';
const moment = require( 'moment' );
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

    switch ( templateName ) {
      case '6pm':
        [ '发货日期' , '下单日期' ].forEach( ( key )=> {
          const m = moment( new Date( rowData[ key ] ) );
          if ( m.isValid() ) {
            rowData[ key ] = m.format( 'MMM D,YYYY [at] h:mm A' );
          }
        } );
        break;

      case 'amazon-us':
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
