/**
 * content-script
 * 
 * 概述：网页文本做标注
 * 
 * 功能：
 * 1. 选中文本打标记，或者删除标记。(√)
 * 2. 选中文本创建、修改笔记
 * 3. 点击浏览器插件图标，可以查看新建的笔记(√)
 * 4. 分档归类
 * 5.保存记录
 * 
 * @author Qiutm 2018-10-10 09:32:33
 * @version 1.0.0
 */

(function () {
  // 文本节点集合
  let textNodeList = []
  // 选中的文字
  let selectedText = ''
  // 记录集合 [{markText: '', record: ''}]
  let recordList = []
  // 文本找到标识
  let findFlag = false

  // document.addEventListener('paste', () => {
  //   event.preventDefault()
  //   navigator.clipboard.readText().then(text => {
  // console.log('Pasted text: ', text)
  //     selectedText = text
  //     fetchTextNodeFromDocument(document.body)
  //     // filterSelectedTextNode(text)
  // console.log(textNodeList)
  //   })
  // })

  // 监听按下组合键shift+r事件
  document.addEventListener('keydown', (e) => {  
    let keyCode = e.keyCode || e.which || e.charCode
    let shiftKey = e.shiftKey
    if(keyCode === 82 && shiftKey) {
      e.preventDefault()
      selectedText = window.getSelection().toString()
      recordList.push({
        markText: selectedText,  // 标注的文字
        record: ''  // 文字记录
      })
      fetchTextNodeFromDocument(document.body, 'add')
      findFlag = false
    }
  })

  // 监听删除标记点击事件
  document.addEventListener('click', (e) => {
    let target = e.target
    let mark = target.getAttribute('mark')
    if(mark){
      let i
      for(i = 0; i < recordList.length; i++){
        if(recordList[i].markText === mark){
          selectedText = mark
          break
        }
      }
      fetchTextNodeFromDocument(document.body, 'delete')
      recordList.splice(i, 1)
    }
  })

  // 监听后台消息(快捷键记录文本)
  chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
    if (request.cmd === 'recordme') {
      selectedText = request.value
      recordList.push({
        markText: selectedText,  // 标注的文字
        record: null  // 文字记录
      })
      fetchTextNodeFromDocument(document.body, 'add')
      findFlag = false
    }
  })

  // 监听popup页面消息（发送当前页记录）
  chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
    if (request.cmd === 'query-records') {
      let response = {
        url: window.location.href, 
        title: document.title,
        recordList: recordList
      }
      sendResponse(response)
    }
  })

    // 监听popup页面消息（打开新页面，跳转到recordme）
    chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
      if (request.cmd === 'goto-recordme') {
        window.open('http://recordme.net.cn', '_blank')
      }
    })

  /** 
   * 从文档理获取文本节点 
   * @param [object] node [dom节点]
   * @param [string] option [操作，add | delete]
   */
  function fetchTextNodeFromDocument (node, option) {
    function nodeIterator (nodeList) {
      for (let v of nodeList) {
        fetchTextNodeFromDocument(v, option)
      }
    }
    if (node && !findFlag) {
      if (node.nodeType === 3) {
        if (option === 'add') {
          if(filterSelectedTextNode(node, selectedText)){
            textNodeList.push(node)
            return
          } 
        } else if(option === 'delete'){
          if(deleteSelectedTextNode(node, selectedText)){
            return 
          }
        }        
      }
      nodeIterator(node.childNodes)
    }
  }

  /** 从文本节点过滤出选中文本的节点,并给选中文本打标记 */
  function filterSelectedTextNode (node, text) {
    // 只适用于node节点不包含子节点的情况
    let nodeValue = node.nodeValue 
    let index = nodeValue.indexOf(text) 
    if (index > -1) {
      //由于解析和DOM操作等原因，可能会出现文本节点没有文本或出现两个连续的文本节点的情况。
      // normalize()方法会移除空的文本节点，并连接相邻的文本节点。
      // 好像没什么用诶。。(╥╯^╰╥)
      node.parentNode.normalize()
      nodeValue = node.parentNode.innerHTML
      index = nodeValue.indexOf(text)
      // lastIndexOf方法只是改变了查找的方向，但是依然返回searchValue的首字符的位置
      let lastIndex = index + text.length - 1
      // 下面用法错误
      // 字符串不能借用splice，即便使用了 Array.prototype.spilce.call ，
      // 因为在规范中字符串是不可改变的，使用splice会改变原数组，这也是为什么slice可以使用，而splice不能用
      // node.nodeValue.split('').splice(index-1, 0, '『').join('')
      //node.nodeValue.split('').splice(lastIndex+1, 0, '』').join('')  
      // let previousDom = node.previousSibling ? node.previousSibling.innerHTML : ''
      // let nextDom = node.nextSibling ? node.nextSibling.innerHTML : ''
      let dom = nodeValue.slice(0, index) + 
                  '<span class="recordme-mark-text">『' +  nodeValue.slice(index, lastIndex+1) + '』' +
                    '<span class="recordme-close-btn" title="删除记录" mark="'+ nodeValue.slice(index, lastIndex+1) +'">×</span>' +
                  '</span>' + 
                nodeValue.slice(lastIndex+1)  
      node.parentNode.innerHTML = dom
      findFlag = true
      return true
    } 
  }

  /** 
   * 删除选中的文本节点 
   * 将文本节点的颜色标记和『』去掉
   */
  function deleteSelectedTextNode (node, text){
    // 只适用于node节点不包含子节点的情况
    let nodeValue = node.nodeValue 
    let index = nodeValue.indexOf(text)
    // 这里也可用match方法，但match(str)会返回指定的值
    if (index > -1) {
      let parentNode = node.parentNode
      // let parentNode = node.parentNode.parentNode 
      // innerText属性可以只获取文本而忽略掉子元素的标签
      // let nodeText = parentNode.innerText
      // 字符串也属于简单值，通过值复制的方式来传递
      // nodeText = nodeText.replace('『', '')
      // nodeText = nodeText.replace('』', '')
      // nodeText = nodeText.replace('×', '')
      // parentNode.removeChild(node.parentNode)
      // parentNode.innerText = nodeText

      // index = nodeValue.indexOf(text)
      // let lastIndex = index + text.length - 1
      // let dom = nodeValue.slice(0, index) + nodeValue.slice(index, lastIndex+1) + nodeValue.slice(lastIndex+1) 
      // parentNode.innerHTML = dom
      // replaceChild只能用元素节点替换元素节点
      // let textNode = document.createTextNode(nodeValue.slice(1, nodeValue.length))
      // parentNode.parentNode.replaceChild(parentNode, textNode)

      // 这里使用innerHTML属性而不是nodeValue，因为这是一个元素节点
      parentNode.innerHTML = parentNode.innerHTML.replace('『', '')
      parentNode.innerHTML = parentNode.innerHTML.replace('』', '')
      parentNode.removeChild(parentNode.lastChild)
      parentNode.removeAttribute('class')
      return true
    } 
  }
})()







