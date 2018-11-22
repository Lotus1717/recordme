/**
 * popup-script
 * 
 * 概述：管理当前页面的记录
 * 
 * 功能：点击浏览器插件图标，可以查看新建的笔记(√)，打标记，或删除网页记录
 * 
 * @author Qiutm 2018-10-10 09:32:33
 * @version 1.0.0
 */

console.log('popup script')

import {
  updateRecordList,
  deleteMark,
  login
} from './model.js'

// 记录列表
// {
//   url: '', 
//   title: '',
//   tags: ['', ''],
//   recordList: [{markText: '', record: ''}]
// }
let pageRecord
// 用户信息
let user = JSON.parse(localStorage.getItem('recordme-info'))

// 这个通信方法不可取，会导致chrome死掉
// chrome.runtime.sendMessage({cmd: 'query-records'}, response => {
//     alert(response)
//     recordListRender(response)
// })

// 控制是否显示登录页面
let controlShowUser = () => {
  if (!user) {
    document.getElementById('content').style.display = 'none'
    document.getElementById('login_wrap').style.display = 'block' 
  } else {
    document.getElementById('content').style.display = 'block'
    document.getElementById('login_wrap').style.display = 'none'
    document.getElementById('user_name').innerHTML = '@' + user.name
  }
}

controlShowUser()

chrome.tabs.query({active: true, currentWindow: true}, tabs =>{
  chrome.tabs.sendMessage(tabs[0].id, {cmd: 'query-records'}, response => {
    if(response && response.recordList.length > 0){
      pageRecord = response
      // response 数据
      // {
      //   url: '', 
      //   title: '',
      //   recordList: [{markText: '', record: ''}]
      // }
      recordListRender(response)
      document.getElementById('save_record').style.filter = 'opacity(0.6)'
    }     
  })
})

document.getElementById('save_record').addEventListener('click', e => {
  // 如果没有用户信息，则直接返回
  if(!user){
    return
  }
  let param = {
    data: pageRecord,
    userId: user.userId
  }
  updateRecordList(param)
  let target = e.target
  target.style.filter = 'opacity(1)'
})

document.getElementById('login').addEventListener('click', e => {
  let name = document.getElementById('name').value
  let password = document.getElementById('pw').value
  let param = {name, password}
  login(param).then(res => {
    if(res.result){
      param.userId = res.data.userId
      user = param
      localStorage.setItem('recordme-info', JSON.stringify(param))
      document.getElementById('content').style.display = 'block'
      document.getElementById('login_wrap').style.display = 'none'
      document.getElementById('user_name').innerHTML = '@' + user.name
    }else{
      document.getElementById('error_tip').style.display = 'block'
    }
  }).catch(e => {
    console.log(e)
  })
})

function labelBlurFn (e) {
  let target = e.target
  let labelText = target.value
  pageRecord.tags = labelText.split(' ')
}

// document.getElementById('delete_mark').addEventListener('click', e => {
//   let target = e.target
//   let parent = target.parentNode
//   let param = {
//     data: {
//       markText: parent.innerText.splice(parent.innerText.length - 1, 1)
//     },
//     userId: user.userId
//   }
//   deleteMark(param)
// })

function recordListRender (data) {
  function fillRecordOlDom (records) {
    let dom = ''
    records.forEach(val => {
      // dom += `<li class="mark-text">${val.markText}<span class="icon-delete" id="delete_mark">×</span></li>`
      dom += `<li class="mark-text">${val.markText}</li>`
    })
    return dom
  }
  let dom = `<section class="record-section">
              <header class="record-header">
                <span class="record-header-span" href=${data.url}>${data.title}</span>
                <!-- <span class="icon-delete">×</span> -->
              </header>
              <div class="label-list">
                <input type="text" class="record-label-input" placeholder="标签以空格分隔"/>
              </div>
              <ol class="record-ol">
                ${fillRecordOlDom(data.recordList)}
              </ol>
            </section>`
  // let node = document.createElement('section')
  // node.innerHTML = dom
  // node.setAttribute('class', 'record-section')
  document.getElementById('content').innerHTML = dom

  let elems = document.getElementsByClassName('record-label-input')
  for(let i = 0; i < elems.length; i++){
    elems[i].removeEventListener('blur', labelBlurFn)
    elems[i].addEventListener('blur', labelBlurFn)
  }
}

