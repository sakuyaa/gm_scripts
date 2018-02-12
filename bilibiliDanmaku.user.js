// ==UserScript==
// @name		bilibiliDanmaku
// @name:zh-CN	哔哩哔哩弹幕姬
// @namespace	https://github.com/sakuyaa/gm_scripts
// @author		sakuyaa
// @description	在哔哩哔哩视频标题下方增加弹幕查看和下载
// @include		http*://www.bilibili.com/video/av*
// @include		http*://www.bilibili.com/watchlater/#/av*
// @version		2018.2.12
// @compatible	firefox 52
// @grant		none
// @run-at		document-end
// ==/UserScript==
(function() {
	const MAX_CONNECTIONS = 50;   //最大并发连接数
	let fetchFunc = url => {
		return fetch(url).then(response => {
			if(response.ok) {
				return response.text();
			}
			throw new Error('无法加载弹幕：' + url);
		});
	};
	
	let node;
	let code = setInterval(() => {
		node = document.querySelector('.tminfo');
		if (node) {
			clearInterval(code);
			let view = document.createElement('a');
			view.setAttribute('target', '_blank');
			view.textContent = '查看弹幕';
			let download = document.createElement('a');
			download.textContent = '下载弹幕';
			let downloadAll = document.createElement('a');
			downloadAll.textContent = '全弹幕下载';
			node.appendChild(document.createTextNode(' | '));
			node.appendChild(view);
			node.appendChild(document.createTextNode(' | '));
			node.appendChild(download);
			node.appendChild(document.createTextNode(' | '));
			node.appendChild(downloadAll);
			
			let func = () => {
				view.setAttribute('href', 'https://comment.bilibili.com/' + window.cid + '.xml');
				
				download.removeAttribute('download');
				download.setAttribute('href', 'javascript:;');
				download.onclick = () => {
					let xhr = new XMLHttpRequest();
					xhr.responseType = 'blob';
					xhr.open('GET', 'https://comment.bilibili.com/' + window.cid + '.xml?bilibiliDanmaku', true);
					xhr.onload = () => {
						if (xhr.status == 200) {
							download.onclick = null;
							download.setAttribute('download', document.title.split('_')[0] + '.xml');
							download.setAttribute('href', URL.createObjectURL(xhr.response));
							download.dispatchEvent(new MouseEvent('click'));
						} else {
							console.log(new Error(xhr.statusText));
						}
					};
					xhr.send(null);
				};
				
				downloadAll.removeAttribute('download');
				downloadAll.setAttribute('href', 'javascript:;');
				downloadAll.onclick = async () => {
					if (!confirm('全弹幕下载需要占用较大的资源（CPU、网络、时间等），视频投稿时间越早需要的时间越多，是否继续？')) {
						return;
					}
					try {
						//加载历史弹幕池
						let response = await fetch('https://comment.bilibili.com/rolldate,' + window.cid);
						if(!response.ok) {
							throw new Error('无法加载历史弹幕列表');
						}
						let dates = await response.json();
						//进度条
						let progress = document.createElement('progress');
						progress.setAttribute('max', dates.length);
						progress.setAttribute('value', 0);
						progress.style.position = 'fixed';
						progress.style.margin = 'auto';
						progress.style.left = progress.style.right = 0;
						progress.style.top = progress.style.bottom = 0;
						progress.style.zIndex = 99;   //进度条置顶
						document.body.appendChild(progress);
						//并发获取
						let exp, match, danmakuAll = '', index = 0, currentIndex;
						for (let i = 0; i < dates.length; i += MAX_CONNECTIONS) {
							let array = [];
							for (let date of dates.slice(i, i + MAX_CONNECTIONS)) {
								array.push(fetchFunc('https://comment.bilibili.com/dmroll,' + date.timestamp +
									',' + window.cid + '?bilibiliDanmaku'));
							}
							for (let danmaku of await Promise.all(array)) {
								exp = new RegExp('<d p="[^"]+,(\\d+)">.+?</d>', 'g');
								while ((match = exp.exec(danmaku)) != null) {
									currentIndex = parseInt(match[1]);
									if (currentIndex > index) {   //跳过重复的项目
										index = currentIndex;
										danmakuAll += match[0] + '\n';
									}
								}
							}
							progress.setAttribute('value', i);   //最后剩下当前弹幕池
						}
						//加载当前弹幕池
						let danmaku = await fetchFunc('https://comment.bilibili.com/' + window.cid +
							'.xml?bilibiliDanmaku');
						exp = new RegExp('<d p="[^"]+,(\\d+)">.+?</d>', 'g');
						while ((match = exp.exec(danmaku)) != null) {
							currentIndex = parseInt(match[1]);
							if (currentIndex > index) {   //跳过重复的项目
								index = currentIndex;
								danmakuAll += match[0] + '\n';
							}
						}
						//合成弹幕
						document.body.removeChild(progress);
						danmakuAll = danmaku.substring(0, danmaku.indexOf('<d p=')) + danmakuAll + '</i>';
						//设置下载链接
						downloadAll.onclick = null;
						downloadAll.setAttribute('download', document.title.split('_')[0] + '.xml');
						downloadAll.setAttribute('href', URL.createObjectURL(new Blob([danmakuAll])));
						downloadAll.dispatchEvent(new MouseEvent('click'));
					} catch(e) {
						console.log(e);
					}
				};
			};
			
			func();
			addEventListener('hashchange', func, false);
		}
	}, 500);
})();
