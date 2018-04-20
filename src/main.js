// The Vue build version to load with the `import` command
// (runtime-only or standalone) has been set in webpack.base.conf with an alias.
import Vue from 'vue'
import App from './App'
import VueRouter from 'vue-router' // 导入vue-router
import VueResource from 'vue-resource' // 导入vue-resource
// import Vuex from 'vuex'
import goods from './components/goods/goods' // 导入goods组件
import ratings from './components/ratings/ratings' // 导入ratings组件
import seller from './components/seller/seller' // 导入seller组件

import './common/stylus/index.styl' // 导入stylus文件夹下的index.styl，这个文件结合了icon.styl，base.styl，mixin.styl

Vue.use(VueRouter) // 使用路由
Vue.use(VueResource)
Vue.config.productionTip = false

// 路由配置
let router = new VueRouter({
    mode: 'history',
    linkActiveClass: 'active', // 当链接激活的时候设置激活的class
    routes: [
        {
            path: '/goods',
            component: goods
        },
        {
            path: '/ratings',
            component: ratings
        },
        {
            path: '/seller',
            component: seller
        }
    ]
})

// 是eslint特殊规则的另外一种写，意思是可以单独new而不用赋值，是为了适应vue的初始化vue实例的写法
/* eslint-disable no-new */
new Vue({
    el: '#app', // 挂载点
    router, // 初始化路由
    template: '<App/>',
    components: {App} // App是ES6的简化写法
})
router.push('/goods') // 设置默认路由
