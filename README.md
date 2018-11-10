[clay](https://gitq.com/yelloxing/clay) - Provide more flexible data visualization solutions
==================================================

[![travis](https://github.com/yelloxing/clay/blob/master/travis.svg)](https://www.travis-ci.org/yelloxing/clay)
[![license](https://github.com/yelloxing/clay/blob/master/license.svg)](https://github.com/yelloxing/clay/blob/master/LICENSE)
[![chat](https://github.com/yelloxing/clay/blob/master/chat.svg)](https://gitq.com/yelloxing/clay)

我们的目标是：提供更友好的数据可视化（2D和3D）解决方案。

<img align="right" height="100" src="https://github.com/yelloxing/clay/blob/master/clay.png">

****
### 作者:心叶
### 邮箱:yelloxing@gmail.com
****

[关注的问题](https://yelloxing.github.io/clay/doc/)
--------------------------------------
首先，本项目是为了Web端数据可视化而建立的，如果用更通俗的话说，就是为了方便使用HTML + CSS + ES绘制各种2D和3D图形来反映统计的数据，并且绘制的图形是可交互的。

和别的库不同的是，clay关注的重点是绘图过程中繁琐的操作和复杂的计算部分，通过提供更友好的操作接口和丰富而基础的计算接口来加速绘图。除此之外，不会也不喜欢强迫使用者改变自己的代码习惯，或者说在尽可能的情况下，保证灵活性。

[![](https://github.com/yelloxing/clay/blob/master/doc/images/clay-readme.jpg)](https://yelloxing.github.io/clay/doc/)

贡献代码和参与讨论？
--------------------------------------
始终秉承着开源的初衷，任何有益的建议或设计都是被鼓励作为新的代码贡献进来的。加入我们前，请先阅读[相关基本说明](https://github.com/yelloxing/clay/blob/master/.github/CONTRIBUTING.md)和[接口文档API](https://yelloxing.github.io/clay/doc)了解基本情况。如果仍有疑惑，可以发送作者邮箱询问细节。

如何在本地搭建开发环境？
--------------------------------------

把代码Clone到本地：

```bash
git clone git://github.com/yelloxing/clay.git
```

进入项目目录，安装打包文件：

```bash
cd clay && npm install
```

安装好以后就可以进行开发了，修改代码以后，应该启动打包程序：

```bash
npm run release
```

除非特殊情况，每一个新开发的功能都应该添加单元测试和基准测试，无法提供单元测试的应该添加用例。

单元测试位于test/unit,基准测试位于test/benchmark，用例位于test/use-case。

对于单元测试，如果是新添加的html页面，应该在Gruntfile.js里最后部分添加引用，然后启动下面测试命令：

```bash
npm run test
```

### 项目结构

设计的初衷是方便绘制2D和3D的图形，让数据以交互的图片形式展示。

部分零碎的模块被展示在下面：

- **clay对象**：包括结点的查找、修改等操作，提供了针对不同namespaceURI的标签和属性提供兼容性操作。
- **clay对象/数据绑定**：结点和数据绑定操作，主要是data、datum、enter和exit方法等。
- **轮播**：轮播方法animation。
- **图形对象**：canvas2D和webgl，包括区域对象等，方便绘图操作的自定义对象。
- **工具类**：一些实用的小工具

绘图中，除了特定语法外，最麻烦的计算一大堆复杂的计算，你可以调用计算模块里面的方法帮助你：

- **插值计算**：给点一些数据，补足中间数据，比如Cardinal插值法等。
- **映射计算**：现实的数据变成绘图的格式需要建立一种映射关系，比如绘制地图。

布局模块：

- **Tree**：无论是旋转的树还是正常的树等，包括结点的增删改查。

动画或交互时图形变换采用矩阵计算，包括对3D绘图的支持：

- **Matrix4**：支持旋转、移动和缩放的单一或组合矩阵求解，也支持坐标求解。

### 单元测试

采用QUnit，下面是可以选择的测试方法：

```js
ok( value, [message] );
equal( actual, expected, [message] );
notEqual( actual, expected, [message] );
deepEqual( actual, expected, [message] );
notDeepEqual( actual, expected, [message] );
strictEqual( actual, expected, [message] );
notStrictEqual( actual, expected, [message] );
throws( block, [expected], [message] );
```

### 免责声明

*   项目中部分数据（如图片等）来自互联网，如果侵犯到对应权益者请联系我们，方便我们及时删除！
*   本项目保留贡献者全部权利，发生的任何纠纷，本项目作者和维护人概不负责，如有侵权，请及时和我们取得联系。
