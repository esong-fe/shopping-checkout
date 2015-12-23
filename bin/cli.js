#!/usr/bin/env node

'use strict';
const program = require( 'commander' ) ,
  checkout = require( '../libs/index.js' );

const pkg = require( '../package.json' );

// 覆盖抛出错误的默认行为，改为列出帮助信息
program.unknownOption = ( flag )=> {
  console.warn( '不支持此参数：%s' , flag );
  program.help();
  process.exit( 1 );
};

program
  .version( pkg.version )
  .option( '-c, --cwd [cwd]' , '工作目录，默认为当前程序运行的目录' )
  .option( '-f, --filename [filename]' , '模板文件夹下存放模板数据的 xlsx 文件的名字，默认为 data.xlsx' )
  .option( '-p, --pictures-dir [pictures-dir]' , '一个相对于 data.xlsx 的存放图片的文件夹的相对路径，默认为 ../pictures/，' )
  .parse( process.argv );

checkout( {
  cwd : program.cwd ,
  xlsxName : program.filename ,
  pictures : program.picturesDir
} );
