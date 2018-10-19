console.log('background script')
//-------------------- 右键菜单演示 ------------------------//

chrome.contextMenus.create({
	id: 'record',
	type: 'normal',
	contexts: ['selection'],
	title: '记录所选文字',
	onclick: (param) => {
		// 1.这种方法需要选中一个标签再执行copy命令
		// document.execCommand("Copy")
		// 2.获取选中文字,同样需要是一个标签(markTicle插件大概就是这个原因导致经常获取不了文字)
		// let text = window.getSelection().toString()
		// console.log(text)
		console.log(param.selectionText)
		let message = {
			cmd: 'recordme',
			value: param.selectionText
		}
		chrome.tabs.query({active: true, currentWindow: true}, tabs =>{
      chrome.tabs.sendMessage(tabs[0].id, message, response => {});
    });

	}
})

