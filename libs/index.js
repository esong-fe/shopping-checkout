'use strict';
const glob = require( 'glob' ) ,
  fsp = require( 'fs-promise' ) ,
  path = require( 'path' ) ,
  pathResolve = path.resolve ,
  pathDir = path.dirname;

const renderer = require( './renderer' );

exports = module.exports = main;

/**
 * 根据模板数据生成模板
 * @param {Object} [options]
 * @param {Object} [options.cwd] - 工作目录，默认为 process.cwd()
 * @param {Object} [options.xlsxName='data.xlsx'] - 模板文件夹下保存模板数据的文件名
 * @param {Object} [options.picturesDir='../pictures/'] - 图片文件夹位置，相对于 data.xlsx
 * @param {Boolean} [options.useCN] - 默认使用国外的谷歌翻译，指定此参数则使用国内的谷歌翻译
 */
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
    workDir = process.cwd();
  }

  if ( !picturesDir.endsWith( '/' ) ) {
    picturesDir += '/';
  }

  // 记录运行数据
  let templateCount = 0 , // 寻找到了多少个模板
    htmlCount = 0; // 一共生成了多少个 html 文件

  log( '\n正在 %s 里寻找是否有匹配的模板……' , workDir );

  templates()
    .then( files => {
      const globPattern = '{' + files.join( ',' ) + '}/' + xlsxFilename;
      glob( globPattern , {
        cwd : workDir
      } , function ( err , dataXLSXFiles ) {
        if ( err ) {
          console.dir( '查找文件时出错：' , err );
          return;
        }
        dataXLSXFiles.forEach( handle );
      } );
    } );

  process.on( 'exit' , function () {
    log( '\n运行完毕，此次运行发现了 %s 个模板文件夹，共生成 %s 个 html 文件。' , templateCount , htmlCount );
  } );

  /**
   * 每一个 Excel 文件的处理函数
   * @param fileRelativePath
   */
  function handle( fileRelativePath ) {
    const templateName = pathDir( fileRelativePath );

    log( '找到模板：' , templateName );
    templateCount += 1;

    // 复制模板所需的静态文件
    fsp.copy(
      pathResolve( __dirname , './templates/' + templateName + '/resources' ) ,
      pathResolve( workDir , './' + templateName + '/resources' )
    );

    renderer( pathResolve( workDir , fileRelativePath ) , templateName , {
      useCN : options.useCN ,
      locals : { picturesDir } ,
      onRendered : function ( rowData , html ) {
        const destPath = pathResolve( workDir , templateName + '/' + rowData[ '分单号' ] + '.html' );
        return fsp
          .writeFile( destPath , html )
          .then( ()=> {
            htmlCount += 1;
            log( '生成文件：' , destPath );
          } );
      }
    } );
  }

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
