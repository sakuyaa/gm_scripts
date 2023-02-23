// ==UserScript==
// @name		grayBackgroundColor
// @namespace	https://github.com/sakuyaa/gm_scripts
// @author		sakuyaa
// @description	将网页背景色改为护眼灰
// @include		*
// @inject-into	auto
// @version		2023.2.23
// @compatible	firefox 74
// @grant		GM_addStyle
// @note		配合browser.display.background_color;#DCDCDC使用
// @run-at		document-end
// ==/UserScript==
(function() {
	let grayValue = 215;
	let sleep = time => {
		return new Promise(resolve => setTimeout(resolve, time));
	};
	
	async function grayElem(elem) {   //将元素变灰
		await sleep(0);
		let rgbaValues = window.getComputedStyle(elem)?.getPropertyValue('background-color')?.match(/\d+(\.\d+)?/g);
		if (rgbaValues) {
			let [red, green, blue, alpha] = rgbaValues;
			if (red < grayValue || green < grayValue || blue < grayValue || alpha == 0) {
				return;
			}
			//从215-255压缩到215-225
			elem.style.setProperty('background-color', (alpha ? 'rgba(' : 'rgb(') +
				Math.floor((red - grayValue) / 4 + grayValue) + ', ' +
				Math.floor((green - grayValue) / 4 + grayValue) + ', ' +
				Math.floor((blue - grayValue) / 4 + grayValue) +
				(alpha ? (', ' + alpha + ')') : ')'), 'important');
		}
	}

	function grayBackgroundColor() {
		for (let elem of document.getElementsByTagName('*')) {
			grayElem(elem);
		}
		(new MutationObserver(async mutations => {
			for (let mutation of mutations) {
				for (let elem of mutation.addedNodes) {
					if (elem.nodeType == 1) {   //元素节点
						grayElem(elem);
						for (let childNode of elem.getElementsByTagName('*')) {   //遍历所有子节点
							grayElem(childNode);
						}
					}
				}
			}
		})).observe(document.body, {
			childList: true,
			subtree: true
		});
	}

	function fixNotGray() {   //去除一些背景为空白图的网站
		switch (window.location.hostname) {
		case 'www.w3school.com.cn':
			GM_addStyle('#wrapper {background: #dcdcdc none !important;}');
			return;
		}
		let herf = window.location.href;
		if (/^https?:\/\/tieba\.baidu\.com\/f.+/i.test(herf)) {
			GM_addStyle('.forum_content {background: #dcdcdc none !important;}');
		}
	}

	setTimeout(grayBackgroundColor, 0);
	fixNotGray();
})();
