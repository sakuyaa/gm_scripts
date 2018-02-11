// ==UserScript==
// @name		bilibiliDanmaku
// @name:zh-CN	哔哩哔哩弹幕姬
// @namespace	https://github.com/sakuyaa/gm_scripts
// @author		sakuyaa
// @description	在哔哩哔哩视频标题下方增加弹幕查看和下载
// @include		http*://www.bilibili.com/video/av*
// @include		http*://www.bilibili.com/watchlater/#/av*
// @version		2018.2.11
// @compatible	firefox 52
// @grant		none
// @run-at		document-end
// ==/UserScript==
(function() {
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
						//进度条
						let dates = await response.json();
						let progress = document.createElement('progress');
						progress.setAttribute('max', dates.length);
						progress.setAttribute('value', 0);
						progress.style.position = 'fixed';
						progress.style.margin = 'auto';
						progress.style.left = progress.style.right = 0;
						progress.style.top = progress.style.bottom = 0;
						progress.style.zIndex = 99;
						document.body.appendChild(progress);
						//并发获取
						let danmakuMap = new Map();
						for (let i = 0; i < dates.length; i += 50) {
							let array = [];
							for (let date of dates.slice(i, i + 50)) {
								array.push(fetchFunc('https://comment.bilibili.com/dmroll,' + date.timestamp +
									',' + window.cid + '?bilibiliDanmaku'));
							}
							let exp, match;
							for (let danmaku of await Promise.all(array)) {
								exp = new RegExp('<d p="[^"]+,(\\d+)">.+?</d>', 'g');
								while ((match = exp.exec(danmaku)) != null) {
									danmakuMap.set(match[1], match[0]);
								}
							}
							progress.setAttribute('value', i);   //最后剩下当前弹幕池
						}
						//加载当前弹幕池
						let danmaku = await fetchFunc('https://comment.bilibili.com/' + window.cid +
							'.xml?bilibiliDanmaku');
						let exp = new RegExp('<d p="[^"]+,(\\d+)">.+?</d>', 'g');
						let match;
						while ((match = exp.exec(danmaku)) != null) {
							danmakuMap.set(match[1], match[0]);
						}
						//合成弹幕
						document.body.removeChild(progress);
						let danmakuAll = danmaku.substring(0, danmaku.indexOf('<d p='));   //文件头
						danmakuMap.forEach(value => {
							danmakuAll += value + '\n';
						});
						downloadAll.onclick = null;
						downloadAll.setAttribute('download', document.title.split('_')[0] + '.xml');
						downloadAll.setAttribute('href', URL.createObjectURL(new Blob([danmakuAll + '</i>'])));
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
