#! /usr/bin/env node

const xlsxFilename = 'data.xlsx';

const fs = require( 'fs-extra' ) ,
  path = require( 'path' ) ,
  XLSX = require( 'xlsx' ) ,
  cons = require( 'consolidate' );

const resolvePath = path.resolve;

const workDir = process.cwd() ,
  packageDir = path.resolve( __dirname , '../' );

const templates = fs.readdirSync( resolvePath( packageDir , './templates' ) );

const files = fs.readdirSync( workDir );

files.forEach( function ( filename ) {
  if ( templates.indexOf( filename ) >= 0 && fs.statSync( filename ).isDirectory() ) {
    handle( filename );
  }
} );

function handle( dirPath ) {
  // 读取电子表格的第一张表
  const wb = XLSX.readFile( resolvePath( dirPath , xlsxFilename ) );
  const firstSheet = wb.Sheets[ wb.SheetNames[ 0 ] ];
  const array = XLSX.utils.sheet_to_json( firstSheet );
  if ( array.length ) {
    // 读取模板路径
    const template = resolvePath( packageDir , './templates/' + dirPath + '/index.html' );

    // 复制模板所需的静态文件
    fs.copySync(
      resolvePath( packageDir , './templates/' + dirPath + '/resources' ) ,
      resolvePath( workDir , './' + dirPath + '/resources' )
    );

    array.forEach( function ( data ) {
      cons.dot( template , data ).then( function ( html ) {
        fs.writeFileSync( resolvePath( workDir , dirPath + '/' + data[ '分单号' ] + '.html' ) , html );
      } );
    } );
  }
}
