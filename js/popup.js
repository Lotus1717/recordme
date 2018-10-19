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
import {createRecord} from './model.js'
// 记录列表
let recordList = []

// 这个通信方法不可取，会导致chrome死掉
// chrome.runtime.sendMessage({cmd: 'query-records'}, response => {
//     alert(response)
//     recordListRender(response)
// })
console.log('popup script')

chrome.tabs.query({active: true, currentWindow: true}, tabs =>{
  chrome.tabs.sendMessage(tabs[0].id, {cmd: 'query-records'}, response => {
    console.log(response)
    if(response.recordList.length > 0){
      recordListRender(response)
      createRecord(response)
    }     
  })
})

function recordListRender (data) {
  function fillRecordOlDom (records) {
    let dom = ''
    records.forEach(val => {
      dom += `<li>${val.markText}</li>`
    })
    return dom
  }
  let dom = `<section class="record-section">
              <header class="record-header">
                <span class="record-header-span" href=${data.url}>${data.title}</span>
                <span class="icon-delete">×</span>
              </header>
              <div class="label-list">
                  <span class="label-item">标签：</span>
                  <span class="icon-add-label">＋</span>
              </div>
              <ol class="record-ol">
                ${fillRecordOlDom(data.recordList)}
              </ol>
            </section>`
  // let node = document.createElement('section')
  // node.innerHTML = dom
  // node.setAttribute('class', 'record-section')
  console.log(document.getElementById('content'))
  document.getElementById('content').innerHTML = dom
}
