'use strict';

const fsp = require( 'fs-promise' ) ,
  pathResolve = require( 'path' ).resolve ,
  parseXLSX = require( 'xlsx' ).readFile;

const packageDir = pathResolve( __dirname , '../' ); // 此 npm 包在本地系统的路径，用于定位模板位置

exports = module.exports = main;

function main( options ) {
  if ( !options ) {
    options = {};
  }

  let workDir = options.cwd ,
    xlsxFilename = options.xlsxName || 'data.xlsx' ,
    picturesDir = options.picturesDir || '../pictures/';

  if ( workDir ) {
    workDir = pathResolve( workDir );
  } else {
    workDir = process.cwd()
  }

  if ( !picturesDir.endsWith( '/' ) ) {
    picturesDir += '/';
  }

  // 记录运行数据
  let templateCount = 0 , // 寻找到了多少个模板
    htmlCount = 0; // 一共生成了多少个 html 文件

  Promise.all( [
    templates() ,
    fsp.readdir( workDir )
  ] ).then( ( args )=> {
    const templates = args[ 0 ] , files = args[ 1 ];

    log( '\n正在 %s 里寻找是否有匹配的模板……' , workDir );

    files.forEach( ( maybeTemplateName )=> {
      if ( templates.indexOf( maybeTemplateName ) >= 0 ) { // 如果文件夹的名字是其中一个模板的名字
        fsp
          .stat( pathResolve( workDir , maybeTemplateName ) )
          .then( ( stat )=> {
            if ( stat.isDirectory() ) {
              handle( maybeTemplateName );
            }
          } );
      }
    } );

    function handle( templateName ) {
      log( '找到模板：' , templateName );
      templateCount += 1;

      // 复制模板所需的静态文件
      fsp.copy(
        pathResolve( packageDir , './libs/templates/' + templateName + '/resources' ) ,
        pathResolve( workDir , './' + templateName + '/resources' )
      );

      // 读取电子表格的第一张表
      let wb;
      try {
        wb = parseXLSX( pathResolve( workDir , templateName , xlsxFilename ) );
      }
      catch ( e ) {
        console.error( '解析 %s 文件时出错：' , pathResolve( workDir , templateName , xlsxFilename ) );
        console.error( e );
        console.error( '将不会在 %s 里生成文件。' , templateName );
        return Promise.resolve();
      }
      const firstSheet = wb.Sheets[ wb.SheetNames[ 0 ] ];

      const renderFunc = require( './templates/' + templateName + '/index.js' );
      renderFunc( firstSheet , function onRendered( rowData , html ) {
        const destPath = pathResolve( workDir , templateName + '/' + rowData[ '分单号' ] + '.html' );
        return fsp
          .writeFile( destPath , html )
          .then( ()=> {
            htmlCount += 1;
            log( '生成文件：' , destPath );
          } );
      } , {
        picturesDir
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

}

/**
 * 列出目前支持的模板类型
 * @return {Promise}
 */
function templates() {
  return fsp.readdir( pathResolve( __dirname , './templates' ) );
}
