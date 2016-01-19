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
  .option( '-c, --cwd <v>' , '工作目录，默认为当前程序运行的目录' )
  .option( '-f, --filename <v>' , '模板文件夹下存放模板数据的 xlsx 文件的名字，默认为 data.xlsx' )
  .option( '-p, --pictures-dir <v>' , '一个相对于 data.xlsx 的存放图片的文件夹的相对路径，默认为 ../pictures/，' )
  .option( '-z, --cn' , '默认使用的谷歌翻译只在国外能用，如果要切换为国内谷歌翻译需要带上此参数' )
  .parse( process.argv );

checkout( {
  cwd : program.cwd ,
  xlsxName : program.filename ,
  pictures : program.picturesDir ,
  useCN : program.cn
} );
