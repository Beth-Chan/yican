<template>
    <div>
        <div class="shopcart">
            <div class="content" @click="toggleList">
                <div class="content-left">
                    <div class="logo-wrapper">
                        <!-- 当有商品加入购物车时添加highlight样式 -->
                        <div class="logo" :class="{'highlight':totalCount>0}">
                            <span class="icon-shopping_cart" :class="{'highlight':totalCount>0}"></span>
                        </div>
                        <!-- 当有商品加入购物车时显示 -->
                        <div class="num" v-show="totalCount>0">{{totalCount}}</div>
                    </div>
                    <div class="price" :class="{'highlight':totalPrice>0}">￥{{totalPrice}}</div>
                    <div class="desc">另需配送费￥{{deliveryPrice}}元</div>
                </div>
                <!-- 阻止冒泡，点击结算的时候才不会展开购物车列表 -->
                <div class="content-right" @click.stop.prevent="pay">
                    <!-- 动态绑定一个payClass函数返回的变量 -->
                    <div class="pay" :class="payClass">
                        <!-- 绑定计算属性中的payDesc函数 -->
                        {{payDesc}}
                    </div>
                </div>
            </div>
            <div class="ball-container">
                <!-- 遍历balls数组 -->
                <div v-for="ball in balls">
                    <!-- transition的几个钩子 -->
                    <transition name="drop" @before-enter="beforeEnter" @enter="enter" @after-enter="afterEnter">
                        <div v-show="ball.show" class="ball">
                            <div class="inner inner-hook"></div>
                        </div>
                    </transition>
                </div>
            </div>
            <transition name="fold">
                <!-- 购物车列表 -->
                <div class="shopcart-list" v-show="listShow">
                    <div class="list-header">
                        <h1 class="title">购物车</h1>
                        <span class="empty" @click="empty">清空</span>
                    </div>
                    <div class="list-content" ref="listContent">
                        <!-- 列表遍历selectFoods数组 -->
                        <ul>
                            <li class="food" v-for="food in selectFoods">
                                <span class="name">{{food.name}}</span>
                                <div class="price"><span>￥{{food.price*food.count}}</span></div>
                                <div class="cartcontrol-wrapper">
                                    <cartcontrol :food="food"></cartcontrol>
                                </div>
                            </li>
                        </ul>
                    </div>
                </div>
            </transition>
        </div>
        <transition name="fade">
            <!-- 点击遮罩层也能收起购物车列表 -->
            <div @click="hideList" class="list-mask" v-show="listShow"></div>
        </transition>
    </div>
</template>

<script type="text/ecmascript-6">
    import cartcontrol from '../../components/cartcontrol/cartcontrol'
    import {eventBus} from '../eventBus.js'
    import BScroll from 'better-scroll'

    export default {
        created() {
            // 监听当前实例上的自定义事件。事件可以由$emit触发。回调函数会接收所有传入事件触发函数的额外参数。
            eventBus.$on('add', (target) => {
                this.drop(target)
            })
        },
        props: {
            // 保存一个选择商品的数组
            selectFoods: {
                type: Array,
                default() { // 在Vue中，如果是一个数组或者对象就要用函数的形式
                    return []
                }
            },
            deliveryPrice: {
                type: Number,
                default: 0
            },
            minPrice: {
                type: Number,
                default: 0
            }
        },
        data() {
            return {
                balls: [
                    {
                        // 小球初始化状态是隐藏的
                        show: false
                    },
                    {
                        show: false
                    },
                    {
                        show: false
                    },
                    {
                        show: false
                    },
                    {
                        show: false
                    }],
                dropBalls: [],
                fold: true
            }
        },
        computed: {
            totalPrice() {
                let total = 0
                // 遍历商品数组
                this.selectFoods.forEach((food) => {
                    // 用计算属性由单价乘数量得到总价
                    total += food.price * food.count
                })
                return total
            },
            totalCount() {
                let count = 0
                this.selectFoods.forEach((food) => {
                    count += food.count
                })
                return count
            },
            payDesc() {
                if (this.totalPrice === 0) {
                    return `￥${this.minPrice}元起送`
                } else if (this.totalPrice < this.minPrice) {
                    let diff = this.minPrice - this.totalPrice
                    return `还差￥${diff}元起送`
                } else {
                    return '去结算'
                }
            },
            payClass() {
                if (this.totalPrice < this.minPrice) {
                    return 'not-enough'
                } else {
                    return 'enough'
                }
            },
            listShow() {
                if (!this.totalCount) {
                    this.fold = true
                    return false
                }
                let show = !this.fold
                // 只有购物车列表显示的时候才有必要初始化better-scroll
                if (show) {
                    // 数据变了，DOM变化并没有立即生效，而better-scroll是依赖DOM，所以要写在$nextTick里
                    this.$nextTick(() => {
                        if (!this.scroll) {
                            this.scroll = new BScroll(this.$refs.listContent, {
                                click: true
                            })
                        } else {
                            this.scroll.refresh()
                        }
                    })
                }
                return show
            }
        },
        methods: {
            drop (el) {
                // console.log(target)
                for (let i = 0; i < this.balls.length; i++) {
                    let ball = this.balls[i]
                    if (!ball.show) {
                        ball.show = true
                        ball.el = el
                        this.dropBalls.push(ball)
                        return
                    }
                }
            },
            toggleList() {
                if (!this.totalCount) {
                    return
                }
                this.fold = !this.fold
            },
            hideList() {
                // 会触发listShow重新计算，因为listShow依赖this.fold
                this.fold = true
            },
            beforeEnter(el) {
                let count = this.balls.length
                while (count--) {
                    let ball = this.balls[count]
                    if (ball.show) {
                        // 获得元素的视口位置
                        let rect = ball.el.getBoundingClientRect()
                        // 获取x和y的偏移，32是ball样式的left值，22是bottom值
                        let x = rect.left - 32
                        let y = -(window.innerHeight - rect.top - 22)
                        // 因为v-show的ball.show值是false，初始会是display: none，设置为空让小球显示
                        el.style.display = ''
                        // 外层做纵向动画
                        el.style.webKitTransform = `translate3d(0,${y}px,0)`
                        el.style.transform = `translate3d(0,${y}px,0)`
                        // 选择内层元素，getElementsByClassName返回的是一个NodeList，取得第一个元素
                        let inner = el.getElementsByClassName('inner-hook')[0]
                        // 内层做横向位移
                        inner.style.webkitTransform = `translate3d(${x}px,0,0)`
                        inner.style.transform = `translate3d(${x}px,0,0)`
                    }
                }
            },
            enter(el, done) {
                // 加eslint-disable是因为rf这个变量没有用，加了就不会有eslint报错
                /* eslint-disable no-unused-vars */
                // 触发浏览器重绘，要不然小球就会在购物车里
                let rf = el.offsetHeight
                this.$nextTick(() => {
                    // 样式置回
                    el.style.webKitTransform = 'translate3d(0,0,0)'
                    el.style.transform = 'translate3d(0,0,0)'
                    let inner = el.getElementsByClassName('inner-hook')[0]
                    inner.style.webkitTransform = 'translate3d(0,0,0)'
                    inner.style.transform = 'translate3d(0,0,0)'
                    el.addEventListener('transitionend', done)
                })
            },
            afterEnter(el) {
                let ball = this.dropBalls.shift()
                if (ball) {
                    // ball重置，又可以被利用,不加的话5颗小球点完就不会有小球了
                    ball.show = false
                    el.style.display = 'none'
                }
            },
            empty() {
                this.selectFoods.forEach((food) => {
                    food.count = 0
                })
            },
            pay() {
                if (this.totalPrice < this.minPrice) {
                    return
                }
                window.alert(`支付${this.totalPrice}元`)
            }
        },
        components: {
            cartcontrol
        }
    }
</script>

<style lang="stylus" rel="stylesheet/stylus">
    @import "../../common/stylus/mixin.styl"

    .shopcart
        position: fixed
        left: 0
        bottom: 0
        z-index: 50
        width: 100%
        height: 48px
        .content
            display: flex
            background: #141d27
            // 解决inline-block间隙问题
            font-size: 0
            color: rgba(255, 255, 255, 0.4)
            .content-left
                // 左边自适应     
                flex: 1
                .logo-wrapper
                    // 和price、desc在同一行，都设为inline-block
                    display: inline-block
                    position: relative;
                    // 超出父元素
                    top: -10px
                    // 左右有margin
                    margin: 0 12px
                    // 自身有6px的padding，也就是“环”的部分6px
                    padding: 6px
                    width: 56px
                    height: 56px
                    // 盒模型为border-box，这样的话，它的宽度是包括padding在内，width包括content + padding + border的宽度
                    box-sizing: border-box
                    // display: inline-block的居中通常是顶部对齐
                    vertical-align: top
                    // 圆就是圆角是50%
                    border-radius: 50%
                    // 超出的部分是透明的，所以要加和content一样的颜色
                    background: #141d27
                    .logo
                        width: 100%
                        height: 100%
                        border-radius: 50%
                        text-align: center
                        background: #2b343c
                        // 有加入商品的时候高亮，设置高亮时的颜色
                        &.highlight
                            background: rgb(0, 160, 220)
                        .icon-shopping_cart
                            // 垂直居中
                            line-height: 44px
                            font-size: 24px
                            color: #80858a
                            // 高亮时购物车也会变色
                            &.highlight
                                color: #FFFFFF
                    .num
                        // 绝对定位在购物车的右上方
                        position: absolute
                        top: 0
                        right: 0
                        // 绝对定位要指定宽高才能被撑开
                        width: 24px
                        height: 16px
                        line-height: 16px
                        text-align: center
                        border-radius: 16px
                        font-size: 9px
                        font-weight: 700px
                        color: #FFFFFF
                        background: rgb(240, 20, 20)
                        // 给框添加阴影，属性值分别为水平阴影 垂直阴影 模糊距离 阴影尺寸 阴影颜色
                        box-shadow: 0 4px 8px 0 rgba(0, 0, 0, 0.4)
                .price
                    display: inline-block
                    vertical-align: top
                    margin-top: 12px
                    line-height: 24px
                    padding-right: 12px
                    box-sizing: border-box
                    // 右边框
                    border-right: 1px solid rgba(255, 255, 255, 0.1)
                    font-size: 16px
                    font-weight: 700px
                    // 高亮时字体也会发生变化
                    &.highlight
                        color: #FFFFFF
                .desc
                    display: inline-block
                    vertical-align: top
                    margin: 12px 0 0 12px
                    line-height: 24px
                    font-size: 10px
            .content-right
                // 右边固定
                flex: 0 0 105px
                width: 105px
                .pay
                    height: 48px
                    line-height: 48px
                    text-align: center
                    font-size: 12px
                    font-weight: 700px
                    // 商品价格小于起送价格时的样式
                    &.not-enough
                        background: #2b333b
                    &.enough
                        background: #00b43c
                        color: #fff
        .ball-container
            .ball
                // 固定布局，相对于视口做动画
                position: fixed
                left: 32px
                bottom: 22px
                z-index: 200
                // 默认是ease，用贝塞尔曲线四个点控制一条曲线
                transition: all 0.4s cubic-bezier(0.49, -0.29, 0.75, 0.41)
                .inner
                    width: 16px
                    height: 16px
                    // 圆
                    border-radius: 50%
                    background: rgb(0, 160, 220)
                    transition: all 0.4s linear
        .shopcart-list
            position: absolute
            left: 0
            top: 0
            // 购物车列表从底下窜出来
            z-index: -1
            width: 100%
            // 相对于自身的高度做一个平移
            transform: translate3d(0, -100%, 0)
            &.fold-transition
                transition: all 0.5s
            &.fold-enter, &.fold-leave-active
                transform: translate3d(0, 0, 0)
            .list-header
                height: 40px
                line-height: 40px
                padding: 0 18px
                background: #f3f5f7
                // 标题头有个下边框
                border-bottom: 1px solid rgba(7, 17, 27, 0.1)
                .title
                    float: left
                    font-size: 14px
                    color: rgb(7, 17, 27)
                .empty
                    float: right
                    font-size: 12px
                    color: rgb(0, 160, 220)
            .list-content
                padding: 0 18px
                // 控制内容区的最大高度
                max-height: 217px
                // 指定最大高度后超过要隐藏
                overflow: hidden
                background: #fff
                .food
                    position: relative
                    padding: 12px 0
                    box-sizing: border-box
                    border-1px(rgba(7, 17, 27, 0.1))
                    .name
                        line-height: 24px
                        font-size: 14px
                        color: rgb(7, 17, 27)
                    .price
                        position: absolute
                        right: 90px
                        bottom: 12px
                        line-height: 24px
                        font-size: 14px
                        font-weight: 700
                        color: rgb(240, 20, 20)
                    .cartcontrol-wrapper
                        position: absolute
                        right: 0
                        bottom: 6px

    .list-mask
        position: fixed
        top: 0
        left: 0
        width: 100%
        height: 100%
        // 与shopcart同级，要小于shopcart的z-index
        z-index: 40
        backdrop-filter: blur(10px)
        opacity: 1
        background: rgba(7, 17, 27, 0.6)
        &.fade-enter-active, &.fade-leave-active
            transition: all 0.5s
        &.fade-enter, &.fade-leave-active
            opacity: 0
            background: rgba(7, 17, 27, 0)
</style>
