# gm_scripts by sakuyaa

## [bilibiliDanmaku.user.js](https://github.com/sakuyaa/gm_scripts/raw/master/bilibiliDanmaku.user.js)
在哔哩哔哩视频标题下方增加弹幕查看、下载和全弹幕下载功能，提供CC字幕原生下载/转换成SRT字幕下载

**哔哩哔哩网站弹幕接口API存在以下限制：**
* 全弹幕下载需要用户登录
* 由于网站API限制，连续使用全弹幕下载可能会提示API调用过于频繁，如果出现这种情况请过一段时间后再下载

## [grayBackgroundColor.user.js](https://github.com/sakuyaa/gm_scripts/raw/master/grayBackgroundColor.user.js)
将网页背景色改为护眼灰，需要配合`browser.display.background_color;#DCDCDC`使用

* 该脚本将RGB值均高于215的网页元素的背景色改为护眼灰，分别将RGB三个值按比例压缩，使得原有不同颜色的网页背景色在改变之后可以进行区分
* 一些网站没有指定背景颜色，则需要火狐改变默认背景色（默认白色），将`browser.display.background_color`的值改为`#DCDCDC`
* 还有一些网站（如贴吧）直接将空白图作为背景颜色，fixNotGray()函数使用css将这些图片隐藏
* 似乎有些网站加载很慢（在加载很多DOM节点），这时候可能会报该脚本可能正忙,或者已停止响应，不知道怎么解决:flushed:

## [scrollWithMouseMove.user.js](https://github.com/sakuyaa/gm_scripts/raw/master/scrollWithMouseMove.user.js)
鼠标在滚动条上移动即可滚动网页（也只能是网页右侧的滚动条），移动距离即为滚动条移动距离<br />
`修改自Mozest.com社区的脚本ScrollWithMouse.uc.js`

## [tiebaSortById.user.js](https://github.com/sakuyaa/gm_scripts/raw/master/tiebaSortById.user.js)
百度贴吧按发帖时间（帖子ID）排序

* 在贴吧头部帖子数右侧添加一个`按发帖时间排序`的按钮，点击进行排序
* 只能将当前页面的帖子（置顶帖除外）按发帖时间排序
