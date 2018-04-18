<template>
    <div id="app">
        <!-- 用ajax拿到seller数据对象，然后把seller数据对象传给Header组件（通过v-bind传seller数据对象给Header组件，v-bind可以简写为冒号），让Header组件去渲染就可以了  -->
        <v-header :seller="seller"></v-header>
        <div class="tab border-1px">
            <div class="tab-item">
                <router-link to="/goods">商品</router-link>
            </div>
            <div class="tab-item">
                <router-link to="/ratings">评论</router-link>
            </div>
            <div class="tab-item">
                <router-link to="/seller">商家</router-link>
            </div>
        </div>
        <keep-alive>
            <router-view :seller="seller"></router-view>
        </keep-alive>
    </div>
</template>

<script type="text/ecmascript-6">
    import header from './components/header/header.vue'

    // 设置一个常量,避免过度耦合代码
    const ERR_OK = 0

    export default {
        data() {
          return {
              seller: {
                  id: (() => {
                    //  let queryParm = urlParse()
                    //  return queryParm.id
                  })()
              }
          }
        },
        created() { // Vue生命周期的created是在初始化Vue实例时执行
            // 这里使用了v-resource,其实就是封装了es6的promise来处理异步请求
            this.$http.get('/api/seller').then((response) => {
                response = response.body // 查看官网文档知道body是vue-resource返回的数据内容对象
                if (response.errno === ERR_OK) {
                    this.seller = response.data // 根据json数据的结构赋值给vue的seller变量
                //    console.log(this.seller)
                }
            })
        },
        components: { // 局部注册子组件
            'v-header': header
        }
    }
</script>

<style lang="stylus" rel="stylesheet/stylus">
    @import "common/stylus/mixin.styl"

        .tab
            // flex布局，父容器写display: flex，子容器写flex: 1，兼容是利用vue-loader里面的postcss插件解决css兼容问题 
            display: flex 
            width: 100%
            height: 40px
            line-height: 40px
            // border-bottom: 1px solid rgba(7,17,27,0.1)
            border-1px(rgba(7,17,27,0.1))
            .tab-item
                flex: 1 // flex 布局的子容器平均分配空间
                text-align: center
                & > a // stylus语法：&代表父级
                    display : block
                    font-size : 14px
                    color : rgb(77, 85, 93)
                    &.active // stylus的写法，相当于a.active,就是class为active的a标签
                        color: rgb(240, 20, 20)

</style>



