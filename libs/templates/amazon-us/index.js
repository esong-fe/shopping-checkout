/**
 * 每个模板的 index 文件都必须是一个函数，
 * 此函数接收一个数据对象为参数，
 * 返回一个 Promise，Promise 的值为生成好的 html 字符串。
 */

const pathResolve = require( 'path' ).resolve;
const cons = require( 'consolidate' );

module.exports = function ( data ) {
  return cons.dot( pathResolve( __dirname , './index.html' ) , data );
};
