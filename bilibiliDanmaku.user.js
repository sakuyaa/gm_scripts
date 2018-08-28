// ==UserScript==
// @name		bilibiliDanmaku
// @name:zh-CN	哔哩哔哩弹幕姬
// @namespace	https://github.com/sakuyaa/gm_scripts
// @author		sakuyaa
// @description	在哔哩哔哩视频标题下方增加弹幕查看和下载
// @include		http*://www.bilibili.com/video/av*
// @include		http*://www.bilibili.com/watchlater/#/av*
// @include		http*://www.bilibili.com/bangumi/play/ep*
// @version		2018.8.28
// @compatible	firefox 52
// @grant		none
// @run-at		document-end
// ==/UserScript==
(function() {
	let sleep = time => {
		return new Promise(resolve => setTimeout(resolve, time));
	};
	let fetchFunc = (url, json) => {
		return fetch(url, {credentials: 'include'}).then(response => {
			if (response.ok) {
				return json ? response.json(): response.text();
			}
			throw new Error('bilibiliDanmaku，无法加载弹幕：' + url);
		});
	};
	
	let node;
	let view = document.createElement('a');
	let download = document.createElement('a');
	let downloadAll = document.createElement('a');
	view.setAttribute('target', '_blank');
	view.textContent = '查看弹幕';
	download.textContent = '下载弹幕';
	downloadAll.textContent = '全弹幕下载';
	view.style.color = '#999';
	download.style.color = '#999';
	downloadAll.style.color = '#999';
	
	let danmakuFunc = () => {
		view.setAttribute('href', `https://comment.bilibili.com/${window.cid}.xml`);

		download.removeAttribute('download');
		download.setAttribute('href', 'javascript:;');
		download.onclick = () => {
			let xhr = new XMLHttpRequest();
			xhr.responseType = 'blob';
			xhr.open('GET', `https://comment.bilibili.com/${window.cid}.xml?bilibiliDanmaku`);
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
			try {
				//加载当前弹幕池
				let danmakuMap = new Map();
				let danmaku = await fetchFunc(`https://api.bilibili.com/x/v1/dm/list.so?oid=${window.cid}&bilibiliDanmaku=1`);
				let danmakuAll = danmaku.substring(0, danmaku.indexOf('<d p='));
				let exp = new RegExp('<d p="([^,]+)[^"]+,(\\d+)">.+?</d>', 'g');
				while ((match = exp.exec(danmaku)) != null) {
					danmakuMap.set(parseInt(match[2]), [parseFloat(match[1]), match[0]]);
				}
				//获取视频发布日期
				let year = 2017, month = 8;   //新API历史弹幕只从2017年8月开始
				let dateNode = document.querySelector('.tminfo time');
				if (dateNode) {
					let videoDate = new Date(dateNode.textContent);
					if (!isNaN(videoDate)) {
						year = videoDate.getFullYear();
						month = videoDate.getMonth() + 1;
						if (year < 2017) {
							year = 2017;
							month = 8;
						} else if (year == 2017 && month < 8) {
							month = 8;
						}
					}
				}
				//计算历史月份
				let monthArray = [];
				let now = new Date();
				while (year * 100 + month <= now.getFullYear() * 100 + now.getMonth() + 1) {
					monthArray.push(`https://api.bilibili.com/x/v2/dm/history/index?type=1&oid=${window.cid}&month=${year + '-' + ('0' + month).substr(-2)}`);
					if (++month > 12) {
						month = 1;
						year++;
					}
				}
				//增加延迟
				let delay;
				if((delay = prompt('由于网站弹幕接口改版新的API限制获取速度，全弹幕下载需要有获取间隔，会导致该功能需要很长很长时间进行弹幕获取（视投稿时间而定，每天都有历史数据的话获取一个月大概需要20多秒），请输入获取间隔（若仍出现获取速度过快请适当加大间隔，单位：毫秒）', 299)) == null) {
					return;
				}
				if(isNaN(delay)) {
					alert('输入值不是数值！');
					return;
				}
				//进度条
				let progress = document.createElement('progress');
				progress.setAttribute('max', monthArray.length * 1000);
				progress.setAttribute('value', 0);
				progress.style.position = 'fixed';
				progress.style.margin = 'auto';
				progress.style.left = progress.style.right = 0;
				progress.style.top = progress.style.bottom = 0;
				progress.style.zIndex = 99;   //进度条置顶
				document.body.appendChild(progress);
				//获取历史弹幕日期
				let data;
				for (let i = 0; i < monthArray.length;) {
					data = await fetchFunc(monthArray[i], true);
					if (data.code) {
						throw new Error('bilibiliDanmaku，API接口返回错误：' + data.message);
					}
					if (data.data) {
						for (let j = 0; j < data.data.length; j++) {
							progress.setAttribute('value', i * 1000 + 1000 / data.data.length * j);
							await sleep(delay);   //避免网站API调用速度过快导致错误
							danmaku = await fetchFunc(`https://api.bilibili.com/x/v2/dm/history?type=1&oid=${window.cid}&date=${data.data[j]}&bilibiliDanmaku=1`);
							if ((match = (new RegExp('^\{"code":[^,]+,"message":"([^"]+)","ttl":[^\}]+\}$',)).exec(danmaku)) != null) {
								throw new Error('bilibiliDanmaku，API接口返回错误：' + match[1]);
							}
							exp = new RegExp('<d p="([^,]+)[^"]+,(\\d+)">.+?</d>', 'g');
							while ((match = exp.exec(danmaku)) != null) {
								if (!danmakuMap.has(parseInt(match[2]))) {   //跳过重复的项目
									danmakuMap.set(parseInt(match[2]), [parseFloat(match[1]), match[0]]);
								}
							}
						}
					}
					progress.setAttribute('value', ++i * 1000);
				}
				//按弹幕播放时间排序
				let danmakuArray = [];
				for (let value of danmakuMap.values()) {
					danmakuArray.push(value);
				}
				danmakuArray.sort((a, b) => a[0] - b[0]);
				//合成弹幕
				document.body.removeChild(progress);
				for (let pair of danmakuArray) {
					danmakuAll += pair[1];
				}
				danmakuAll += '</i>';
				//设置下载链接
				downloadAll.onclick = null;
				downloadAll.setAttribute('download', document.title.split('_')[0] + '.xml');
				downloadAll.setAttribute('href', URL.createObjectURL(new Blob([danmakuAll])));
				downloadAll.dispatchEvent(new MouseEvent('click'));
			} catch(e) {
				alert(e);
			}
		};
	};
	
	let code = setInterval(() => {
		if (/^https?:\/\/www\.bilibili\.com\/bangumi\/play\/ep.+/i.test(location.href)) {
			node = document.querySelector('.info-second');
			view.style.color = '#757575';
			download.style.color = '#757575';
			downloadAll.style.color = '#757575';
		} else {
			node = document.querySelector('.video-data');
			if (node) {
				if (node.querySelector('.view').getAttribute('title') == '总播放数--') {
					return;   //避免信息栏未加载出来时插入链接导致错误
				}
			} else {
				node = document.querySelector('.tminfo');
			}
		}
		if (node) {
			clearInterval(code);
			node.appendChild(document.createTextNode(' | '));
			node.appendChild(view);
			node.appendChild(document.createTextNode(' | '));
			node.appendChild(download);
			node.appendChild(document.createTextNode(' | '));
			node.appendChild(downloadAll);
			danmakuFunc();
			addEventListener('hashchange', danmakuFunc);
		}
	}, 1234);
})();
