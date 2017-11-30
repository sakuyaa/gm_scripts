// ==UserScript==
// @name		bilibiliDanmaku
// @name:zh-CN	哔哩哔哩弹幕姬
// @namespace	https://github.com/sakuyaa/gm_scripts
// @author		sakuyaa
// @description	在哔哩哔哩视频标题下方增加弹幕查看和下载
// @include		http*://www.bilibili.com/video/av*
// @include		http*://www.bilibili.com/watchlater/#/av*
// @version		2017.11.30
// @grant		none
// @run-at		document-end
// ==/UserScript==
(function() {
	let node;
	let code = setInterval(() => {
		node = document.querySelector('.tminfo');
		if (node) {
			clearInterval(code);
			let view = document.createElement('a');
			view.setAttribute('target', '_blank');
			view.style.marginLeft = '44px';   //与前面链接间隔保持一致
			view.textContent = '查看弹幕';
			let download = document.createElement('a');
			download.textContent = '下载弹幕';
			node.appendChild(view);
			node.appendChild(document.createTextNode(' | '));
			node.appendChild(download);
			
			let func = () => {
				view.setAttribute('href', 'https://comment.bilibili.com/' + window.cid + '.xml');
				download.removeAttribute('download');
				download.setAttribute('href', 'javascript:;');
				download.addEventListener('click', function getDanmaku() {
					let xhr = new XMLHttpRequest();
					xhr.responseType = 'blob';
					xhr.open('GET', 'https://comment.bilibili.com/' + window.cid + '.xml?bilibiliDanmaku', true);
					xhr.onload = () => {
						if (xhr.status == 200) {
							download.removeEventListener('click', getDanmaku, false);
							download.setAttribute('download', document.title.split('_')[0] + '.xml');
							download.setAttribute('href', URL.createObjectURL(xhr.response));
							download.dispatchEvent(new MouseEvent('click'));
						} else {
							console.log(new Error(xhr.statusText));
						}
					};
					xhr.send(null);
				}, false);
			};
			
			func();
			addEventListener('hashchange', func, false);
		}
	}, 500);
})();
