#! /usr/bin/env node

const fs = require( 'fs' ) ,
  path = require( 'path' ) ,
  XLSX = require( 'xlsx' );

var cons = require( 'consolidate' );

const templates = fs.readdirSync( path.resolve( __dirname , '../templates' ) );

const files = fs.readdirSync( './' );

files.forEach( function ( filename ) {
  if ( templates.indexOf( filename ) >= 0 && fs.statSync( filename ).isDirectory() ) {
    handle( filename );
  }
} );

function handle( dirPath ) {
  // 读取电子表格的第一张表
  const wb = XLSX.readFile( path.resolve( dirPath , 'data.xlsx' ) );
  const firstSheet = wb.Sheets[ wb.SheetNames[ 0 ] ];
  const array = XLSX.utils.sheet_to_json( firstSheet );

  // 读取模板路径
  const template = path.resolve( __dirname , '../templates/' + dirPath + '/index.html' );

  array.forEach( function ( data ) {
    cons.dot( template , data ).then( function ( html ) {
      fs.writeFileSync( dirPath + '/' + data[ '分单号' ] + '.html' , html );
    } );
  } );
}
