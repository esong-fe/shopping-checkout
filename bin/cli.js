#! /usr/bin/env node

const fs = require( 'fs' ) ,
  path = require( 'path' ) ,
  XLSX = require( 'xlsx' );

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
  console.log( XLSX.utils.sheet_to_json( firstSheet ) );
}
