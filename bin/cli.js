#!/usr/bin/env node

'use strict';
const program = require( 'commander' ) ,
  checkout = require( '../libs/index.js' );

const pkg = require( '../package.json' );

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

// todo 在输入不支持的 options 时会报错，阻止这个默认行为
// todo 输入不支持的 commands 时给出默认的 help 信息
// todo 将 -c 设置的路径转换为绝对路径
// todo 支持分支命令，并在没有输入分支命令时默认执行其中一个分支。可能要参考 https://github.com/tj/commander.js/issues/463
