// let mysql = require('mysql')
// import * as mysql from 'mysql'

import mysql from 'mysql'

console.log(mysql)
let _connection = mysql.createConnection({
  //主机
  host: '127.0.0.1',
  //用户
  user: 'root',
  //密码
  password: '80808080',
  //端口
  port: 3306,
  //数据库名
  database: 'recordme'
})

_connection.connect(err => {
  if(err){
    console.log(err)
  } else {
    console.log('connect succeed')
  }
  
})

const createRecord = () => {
  console.log('create record')
}

export {
  createRecord
}