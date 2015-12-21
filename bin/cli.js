#! /usr/bin/env node

// require(..) 里的路径是基于当前 js 的文件的，
// 但是 fs.* 的方法里的文件路径是基于 process.cwd() 也就是当前工作目录的

const xlsxFilename = 'data.xlsx';

const fs = require( 'fs-extra' ) ,
  path = require( 'path' ) ,
  XLSX = require( 'xlsx' );

const pathResolve = path.resolve ,
  workDir = process.cwd() , // 当前工作目录
  packageDir = path.resolve( __dirname , '../' ); // 此 npm 包在本地系统的路径，用于定位模板位置

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
] ).then( ( a )=> {
  const templates = a[ 0 ] , files = a[ 1 ];

  files.forEach( ( maybeTemplateName )=> {
    if ( templates.indexOf( maybeTemplateName ) >= 0 ) { // 如果文件夹的名字是其中一个模板的名字
      fs.stat( maybeTemplateName , ( err , stat )=> {
        if ( err ) {
          console.log( '查询文件状态时出错：' , err );
        } else if ( stat.isDirectory() ) {
          handle( maybeTemplateName );
        }
      } );
    }
  } );

  function handle( templateName ) {
    console.log( '找到模板：' , templateName );

    // 读取电子表格的第一张表
    const wb = XLSX.readFile( pathResolve( templateName , xlsxFilename ) );
    const firstSheet = wb.Sheets[ wb.SheetNames[ 0 ] ];
    const array = XLSX.utils.sheet_to_json( firstSheet );

    if ( array.length ) {

      // 复制模板所需的静态文件
      fs.copy(
        pathResolve( packageDir , './libs/templates/' + templateName + '/resources' ) ,
        pathResolve( workDir , './' + templateName + '/resources' ) ,
        ( err )=> err && console.log( '复制文件至目标文件夹时出错：' , err )
      );

      // 给每条数据生成一个 html
      array.forEach( function ( data ) {
        require( '../libs/templates/' + templateName + '/index.js' )( data )
          .then( ( html )=> {
            fs.writeFile( pathResolve( workDir , templateName + '/' + data[ '分单号' ] + '.html' ) , html , ( err )=> {
              if ( err ) {
                console.log( '写入文件时出错：' , err );
              } else {
                console.log( '模板' , templateName , '下生成文件：' , data[ '分单号' ] + '.html' );
              }
            } );
          } );
      } );
    }
  }
} , ( err )=> {
  console.log( '读取时发生错误：' , err );
} );
