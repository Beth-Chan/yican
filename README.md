# 易餐 

### 技术栈
Vue + Vue-router + Webpack + ES6 + Stylus

### 项目运行

``` bash
# git克隆
git clone https://github.com/Beth-Chan/yican.git

# 安装依赖
npm install

# 以开发模式运行服务器，地址为localhost:8080
npm run dev
```
附：F12打开调试模式可以看到手机上的效果
<br>


### 项目描述

创建vue-cli脚手架工具： 
```
npm i vue-cli -g
```
与React的create-react-app一样，不用手工配置开发环境、运行环境和测试环境

cd进入到要创建项目的文件夹：
```
cd g:/project/vue
```
初始化一个基于webpack的新项目：
```
vue init webpack yican
```
项目名回车，description写了a take-away food web app，Author回车，Install vue-router选项选了y，ESLint也选了y，测试两个和Nightwatch都选了n，其他都直接回车了

进入新项目的文件夹，安装依赖代码库：
```
cd yican
npm install
```
试运行，启动开发环境：
```
npm run dev 
```

浏览器打开：
http://localhost:8080

看到经典vue标志图，F12打开调试模式，可以看手机效果

看下主要文件：
**index.html**：css、js会被动态插入
**main.js**：src/main.js是入口文件
**App.vue**：App大组件

安装CSS预处理器：
vue-cli默认没有安装**stylus**插件，需要先安装，
```javascript
npm i stylus stylus-loader -SD
```
vue-loader会利用**postcss**来自动补全浏览器的css差异,所以写一次css就可以支持其他浏览器差异

在<b>.eslintrc.js</b>文件中的rules最后添加：
```
// eslintrt可改规则：配为0 即不去检测它，此处是关闭Tab或空格造成的indent缩进错误
'indent': 0,

// 关闭“强制在函数的左括号之前加空格”的规则
'space-before-function-paren':0

// 也可以添加'semi': 0 关闭分号检查（本项目不加分号，eslilnt默认是不用分号结尾，所以不用加）
```

在static文件夹里新建一个css文件夹，编写Yahoo的**reset.css**，确保各浏览器表现一致


webpack会自动帮助处理每一张小图片,所以由设计图单独切出来一个个小图片,并且分别对应`2x`和`3x`的版本，在使用webpack情况下,小于一定size的图片会转化为**base64**然后放到js引入

**关于2x和3x：**
2x和3x图是为了适应不同dpr比例的,不同比例的显示是不一样的.
2x就是普通的dpr为1的屏幕使用的
对于高清屏幕就是用3x,dpr为2或者以上
2x和3x就是尺寸的大小

**关于dpr：**
window.devicePixelRatio是设备上物理像素和设备独立像素(device-independent pixels (dips))的比例。公式表示就是：window.devicePixelRatio = 物理像素 / dips
非视网膜屏幕的iphone上，屏幕物理像素320像素，独立像素也是320像素，因此，window.devicePixelRatio等于1.
在视网膜屏幕的iphone上，屏幕物理像素640像素，独立像素还是320像素，因此，window.devicePixelRatio等于2.
  
### 字体图标制作
在阿里巴巴矢量图标库iconfont网找到所需的图标，下载SVG

在iconMoon App网导入SVG文件，generate font，点击Download右边的齿轮图标改整个图标文件的名称 -> Download -> 解压 -> 在yican项目文件夹下的src新建一个common文件夹，拷贝fonts到common下，拷贝style.css到项目文件夹src下新建的stylus文件夹下，改为styl格式的文件，用替换功能快速去掉style.styl文件的花括号和分号，并修改一下url路径


#### 基于组件化设计
一个模块组件一个目录,这样方便理解和整理代码，每个文件夹也可以包含组件需要用到的图片等资源
components目录的组件拆分：
头部**header**组件；内容区**goods、ratings、seller**三个组件和**shopcart**购物车组件；详情弹出层和评价页都有星星，只是大小不一样，所以封装成一个**star**组件；其他还有**food**、**ratingselect**、**split**、**cartcontrol**组件

组件的使用：都是在\<script\>中导出，组件要使用就import，注册组件，写在template上自定义标签就可以显示在页面

common 目录放公共的模块和资源，例如js，stylus，fonts

#### mock数据
用Mock.js来Mock数据，或者chrome手机调试模式下，copy请求的link address，在浏览器中粘贴地址，即可看到json数据
项目中的Mock数据就是项目根目录的叫做data.js的json文件

#### 写后端API
在build文件夹下dev-server.js的const compiler = webpack(webpackConfig)前加上：

```javascript
const app = express() // 实例化express

const appData = require('../data.json') // 引入mock数据

const seller = appData.seller

const goods = appData.goods

const ratings = appData.ratings

const apiRouters = express.Router() // 生成express的路由实例

// 访问一个/seller链接，返回seller数据
apiRouters.get('/seller', function (req, res){
  res.json({
    errno: 0,
    data: seller
  })
})

apiRouters.get('/goods', function(req, res){
  res.json({
    errno: 0,
    data: goods
  })
})

apiRouters.get('/ratings', function(req, res){
  res.json({
    errno: 0,
    data: ratings
  })
})

app.use('/api', apiRouters); // 调用apiRoutes
```

重启dev server
```
npm run dev
```


然后访问/api/seller或者/api/goods 或者/api/ratings就能看到数据了,类似做了一个api接口服务器  

(后续操作再更新~)

#### License
GPL
