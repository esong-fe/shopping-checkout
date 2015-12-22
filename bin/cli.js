#! /usr/bin/env node
'use strict';
// require(..) 里的路径是基于当前 js 的文件的，
// 但是 fs.* 的方法里的文件路径是基于 process.cwd() 也就是当前工作目录的

const xlsxFilename = 'data.xlsx';

const fs = require( 'fs-extra' ) ,
  path = require( 'path' ) ,
  parseXLSX = require( 'xlsx' ).readFile;

const pkg = require( '../package.json' );

const pathResolve = path.resolve ,
  workDir = process.cwd() , // 当前工作目录
  packageDir = path.resolve( __dirname , '../' ); // 此 npm 包在本地系统的路径，用于定位模板位置

log( '小票工具 v%s' , pkg.version );
log( '问题或建议请联系 %s' , pkg.author.email );

// 记录运行数据
let templateCount = 0 , // 寻找到了多少个模板
  htmlCount = 0; // 一共生成了多少个 html 文件

Promise.all( [
  new Promise( ( resolve , reject )=> {
    fs.readdir( pathResolve( packageDir , './libs/templates' ) , ( err , templates )=> {
      if ( err ) {
        reject( err );
      } else {
        resolve( templates );
      }
    } );
  } ) ,
  new Promise( ( resolve , reject )=> {
    fs.readdir( workDir , ( err , templates )=> {
      if ( err ) {
        reject( err );
      } else {
        resolve( templates );
      }
    } );
  } )
] ).then( ( args )=> {
  const templates = args[ 0 ] , files = args[ 1 ];

  log( '\n目前支持的模板有：' );
  templates.forEach( function ( tpn ) {
    log( tpn );
  } );

  log( '\n正在 %s 里寻找是否有匹配的模板……' , workDir );

  files.forEach( ( maybeTemplateName )=> {
    if ( templates.indexOf( maybeTemplateName ) >= 0 ) { // 如果文件夹的名字是其中一个模板的名字
      fs.stat( maybeTemplateName , ( err , stat )=> {
        if ( err ) {
          log( '查询文件状态时出错：' , err );
        } else if ( stat.isDirectory() ) {
          handle( maybeTemplateName );
        }
      } );
    }
  } );

  function handle( templateName ) {
    log( '找到模板：' , templateName );
    templateCount += 1;

    // 复制模板所需的静态文件
    fs.copy(
      pathResolve( packageDir , './libs/templates/' + templateName + '/resources' ) ,
      pathResolve( workDir , './' + templateName + '/resources' ) ,
      ( err )=> {
        if ( err ) {
          log( '复制文件至目标文件夹时出错：' , err );
        }
      }
    );

    // 读取电子表格的第一张表
    let wb;
    try {
      wb = parseXLSX( pathResolve( templateName , xlsxFilename ) );
    }
    catch ( e ) {
      console.error( '解析 %s 文件时出错：' , pathResolve( templateName , xlsxFilename ) );
      console.error( e );
      console.error( '将不会在 %s 里生成文件。' , templateName );
      return;
    }
    const firstSheet = wb.Sheets[ wb.SheetNames[ 0 ] ];

    const renderFunc = require( '../libs/templates/' + templateName + '/index.js' );
    renderFunc( firstSheet , function onRendered( rowData , html ) {
      const destPath = pathResolve( workDir , templateName + '/' + rowData[ '分单号' ] + '.html' );

      fs.writeFile( destPath , html , ( err )=> {
        if ( err ) {
          log( '写入文件时出错：' , err );
        } else {
          htmlCount += 1;
          log( '生成文件：' , destPath );
        }
      } );
    } );
  }
} , ( err )=> {
  log( '读取时发生错误：' + err );
} );

process.on( 'exit' , function () {
  log( '\n运行完毕，此次运行发现了 %s 个模板文件夹，共生成 %s 个 html 文件。' , templateCount , htmlCount );
} );

function log() {
  console.log.apply( console , arguments );
}
