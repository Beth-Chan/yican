<template>
    <div class="cartcontrol">
        <transition name="move">
            <!-- 当商品的数量大于0时减的按钮才会显示 -->
            <!-- 购物车加减控件动画（内层组件负责平移，字体也随减按钮平移，外层组件负责滚动，透明度从0到1的变化） -->
            <div class="cart-decrease" v-show="food.count>0" @click.stop.prevent="decreaseCart"><span
                class="inner icon-remove_circle_outline"></span></div>
        </transition>
        <!-- 当商品的数量大于0时中间的数量才会显示 -->
        <div class="cart-count" v-show="food.count>0">{{food.count}}</div>
        <div class="cart-add icon-add_circle" @click.stop.prevent="addCart"></div>
    </div>
</template>

<script type="text/ecmascript-6">
    import Vue from 'vue'
    import {eventBus} from '../eventBus.js'

    export default {
        props: {
            food: {
                type: Object
            }
        },
        methods: {
            // 解决PC端click事件会触发两次，给函数传入一个event对象
            addCart(event) {
                // 如果不是我们自己点击的事件，是better-scroll派生的点击事件时，就return;
                if (!event._constructed) {
                    return
                }
                // console.log('click')
                if (!this.food.count) {
                    // 当添加一个不存在的属性时不可以直接这样设，要不然Object.defineProperty检测不到
                    // this.food.count = 1
                    // 在新增或删除某个字段时要用Vue的set接口，让vue能观察到变化
                    Vue.set(this.food, 'count', 1)
                } else {
                    this.food.count++
                }
                // 触发当前实例上的事件。附加参数会传给监听器回调。
                eventBus.$emit('add', event.target)
            },
            decreaseCart(event) {
                if (!event._constructed) {
                    return
                }
                // console.log('click')
                if (this.food.count) {
                    this.food.count--
                }
            }
        }

    }
</script>

<style lang="stylus" rel="stylesheet/stylus">
    .cartcontrol
        font-size: 0
        .cart-decrease
            display: inline-block
            // 前端优化，通过padding让点击区域变宽
            padding: 6px
            // 线性缓动
            transition: all 0.4s linear
            // 动画最终的样式
            &.move-transition
                opacity: 1
                // translate3d可以开启硬件加速，动画会更流畅
                transform: translate3d(0, 0, 0)
            .inner
                display: inline-block
                line-height: 24px
                // icon是字体，所以用font-size
                font-size: 24px
                // 字体图标颜色的控制用color
                color: rgb(0, 160, 220)
                transition: all 0.4s linear
                transform: rotate(0)
            // 动画开始和结束的样式
            &.move-enter, &.move-leave
                // 透明度从0到1
                opacity: 0
                transform: translate3d(24px, 0, 0)
                .inner
                    // 旋转180度
                    transform: rotate(180deg)
        .cart-count
            display: inline-block
            vertical-align: top
            width: 12px
            padding-top: 6px
            line-height: 24px
            text-align: center
            font-size: 10px
            color: rgb(147, 153, 159)
        .cart-add
            display: inline-block
            padding: 6px
            line-height: 24px
            font-size: 24px
            color: rgb(0, 160, 220)
</style>
