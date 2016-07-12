# gm_scripts by sakuyaa

## grayBackgroundColor.user.js

将网页背景色改为护眼灰，需要配合`browser.display.background_color;#DCDCDC`使用

脚本安装地址：[Greasy Fork](https://greasyfork.org/zh-CN/scripts/21321)、[GitHub](https://github.com/sakuyaa/gm_scripts/raw/master/grayBackgroundColor.user.js)

### 具体说明
* 该脚本将RGB值均高于215的网页元素的背景色改为护眼灰，分别将RGB三个值按比例压缩，使得原有不同颜色的网页背景色在改变之后可以进行区分
* 一些网站没有指定背景颜色，则需要火狐改变默认背景色（默认白色），将`browser.display.background_color`的值改为`#DCDCDC`
* 还有一些网站（如贴吧）直接将空白图作为背景颜色，fixNotGray()函数使用css将这些图片隐藏
* 似乎有些网站加载很慢（在加载很多DOM节点），这时候可能会报该脚本可能正忙,或者已停止响应，不知道怎么解决:flushed:
