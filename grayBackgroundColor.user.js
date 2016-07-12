// ==UserScript==
// ==/UserScript==
(function() {
	var grayValue = 215;
	
	function grayElem(elem) {   //将元素变灰
		var elemStyle = window.getComputedStyle(elem, null);
		if (!elemStyle) {
			return;
		}
		if (elemStyle.backgroundColor != 'transparent') {
			var RGBValues = elemStyle.backgroundColor.match(/\d+/g);
			var red = RGBValues[0];
			var green = RGBValues[1];
			var blue = RGBValues[2];

			//从215-255压缩到215-225
			if (red >= grayValue && green >= grayValue && blue >= grayValue) {
				elem.style.backgroundColor = 'rgb( ' + Math.floor((red - grayValue) / 4 + grayValue) + ', ' + Math.floor((green - grayValue) / 4 + grayValue) + ', ' + Math.floor((blue - grayValue) / 4 + grayValue) + ')';
			}
		}
	}

	function grayBackgroundColor() {
		for (var elem of document.getElementsByTagName('*')) {
			grayElem(elem);
		}
		(new window.MutationObserver(mutations => {
			for (var mutation of mutations) {
				for (var elem of mutation.addedNodes) {
					if (elem.nodeType == 1) {   //元素节点
						grayElem(elem);
						for (var childNode of elem.getElementsByTagName('*')) {   //遍历所有子节点
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
		var herf = window.location.href;
		if (/^https?:\/\/tieba\.baidu\.com\/f\?.+/i.test(herf)) {
			GM_addStyle('.forum_content {background: #dcdcdc none !important;}');
		}
	}

	grayBackgroundColor();
	fixNotGray();
})();
