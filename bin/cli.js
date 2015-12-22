#!/usr/bin/env node

'use strict';
const program = require( 'commander' ) ,
  checkout = require( '../libs/index.js' );

const pkg = require( '../package.json' );

program
  .version( pkg.version )
  .option( '-c, --cwd [cwd]' , '工作目录，默认为当前程序运行的目录' )
  .option( '-f, --filename [filename]' , '模板文件夹下存放模板数据的 xlsx 文件的名字，默认为 data.xlsx' )
  .parse( process.argv );

checkout( {
  cwd : program.cwd ,
  xlsxName : program.filename
} );

