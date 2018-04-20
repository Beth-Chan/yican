<template>
    <transition name="move">
        <div v-show="showFlag" class="food" ref="food">
            <div class="food-content">
                <div class="image-header">
                    <img :src="food.image">
                    <div @click="hide" class="back">
                        <i class="icon-arrow_lift"></i>
                    </div>
                </div>
                <div class="content">
                    <h1 class="title">{{food.name}}</h1>
                    <div class="detail">
                        <span class="sell-count">月售{{food.sellCount}}</span>
                        <span class="rating">好评率{{food.rating}}</span>
                    </div>
                    <div class="price">
                        <span class="now">￥{{food.price}}</span><span class="old" v-show="food.oldPrice">￥{{food.oldPrice}}</span>
                    </div>
                    <div class="cartcontrol-wrapper">
                        <!-- 用加减组件要把food传入 -->
                        <cartcontrol :food="food"></cartcontrol>
                    </div>
                    <transition name="fade">
                        <!-- !food.count || food.count===0这两种情况“加入购物车”都会显示 -->
                        <div @click.stop.prevent="addFirst" class="buy" v-show="!food.count || food.count===0">加入购物车
                        </div>
                    </transition>
                </div>
                <!-- 分割组件 -->
                <split v-show="food.info"></split>
            <div class="info" v-show="food.info">
                <h1 class="title">商品信息</h1>
                <p class="text">{{food.info}}</p>
            </div>
            <!-- 分割组件 -->
            <split></split>
            <div class="rating">
                <h1 class="title">商品评价</h1>
                <!-- ratingselect组件：
                    要有一个变量控制是否显示“只看有内容的评价”
                    一个变量控制选择的类型
                    一个保存所有评价的数组
                    还有描述文字（商品详情页的全部、推荐、吐槽和评价页的全部、满意、不满意） -->
                <ratingselect :selectType="selectType" :onlyContent="onlyContent" :desc="desc" :ratings="food.ratings"></ratingselect>
                <div class="rating-wrapper">
                    <ul v-show="food.ratings && food.ratings.length">
                        <li v-show="needShow(rating,rateType,rating.text)" v-for="rating in food.ratings" class="rating-item border-1px">
                            <div class="user"><span class="name">{{rating.username}}</span><img :src="rating.avatar" class="avatar" width="12" height="12"></div>
                            <div class="time">{{rating.rateTime | formatDate}}</div>
                            <p class="text">
                                <span :class="{'icon-thumb_up':rating.rateType===0,'icon-thumb_down':rateType===1}"></span>{{rating.text}}
                            </p>
                        </li>
                    </ul>
                    <div class="no-ratings" v-show="!food.ratings ||  food.ratings.length">暂无评价</div>
                </div>
            </div>
            </div>
        </div>
    </transition>
</template>

<script type="text/ecmascript-6">
    import BScroll from 'better-scroll'
    import Vue from 'vue'
    import cartcontrol from '../../components/cartcontrol/cartcontrol'
    import {eventBus} from '../eventBus.js'
    import split from '../../components/split/split'
    import ratingselect from '../../components/ratingselect/ratingselect'
    import {formatDate} from '../../common/js/date'

    const ALL = 2

    export default {
        props: {
            food: { // 从goods组件接收一个food
                type: Object
            }
        },
        data() {
            return {
                showFlag: false,
                selectType: ALL,
                onlyContent: true,
                desc: {
                  all: '全部',
                  positive: '推荐',
                  negative: '吐槽'
                },
                rateType: ''
            }
        },
        methods: {
            show() {
                this.showFlag = true
                this.selectType = ALL
                this.onlyContent = true
                this.$nextTick(() => {
                    if (!this.scroll) {
                        this.scroll = new BScroll(this.$refs.food, {
                            click: true
                        })
                    } else {
                        this.scroll.refresh()
                    }
                })
            },
            hide() {
                this.showFlag = false
            },
            addFirst(event) {
//                if (event._constructed) {
//                    return
//                }
//                console.log(event.target)
                // 触发小球动画。附加参数会传给监听器回调。
                eventBus.$emit('add', event.target)
                Vue.set(this.food, 'count', 1)
            },
            needShow(type, text) {
                // 首先判断是否显示内容
                if (this.onlyContent && !text) {
                    return false
                }
                // 然后判断选择类型
                if (this.selectType === ALL) {
                    return true
                } else {
                    return type === this.selectType
                }
            }

        },
        // 监听显示类型和是否显示没内容的文本
        events: {
            'select'(type) {
                this.selectType = type
                // $nextTick()会重构DOM，即动态处理scroll
                this.$nextTick(() => {
                    this.scroll.refresh()
                })
            },
            'toggle'(onlyContent) {
                this.onlyContent = onlyContent
                this.$nextTick(() => {
                    this.scroll.refresh()
                })
            }

        },
        filters: {
            formatDate(time) {
                let date = new Date(time)
                return formatDate(date, 'yyyy-MM-dd hh:mm')
            }
        },
        components: {
            cartcontrol,
            split,
            ratingselect
        }
    }
</script>

<style lang="stylus" rel="stylesheet/stylus">
    @import "../../common/stylus/mixin.styl"

    .food
        position: fixed
        left: 0
        top: 0
        // 底部有购物车
        bottom: 48px
        // 小于购物车，也要小于弹出的遮罩层
        z-index: 30
        width: 100%
        background: #fff
        // 从右到左的动画
        transform: translate3d(0, 0, 0)
        &.move-enter-active, &.move-leave-active
            transition: all 0.2s linear
        &.move-enter, &.move-leave-active
            transform: translate3d(100%, 0, 0)
        .image-header
            position: relative
            width: 100%
            height: 0
            // 不靠图片本身就能把容器的高度撑开，实现自适应；当margin/padding取形式为百分比的值时，无论是left/right，还是top/bottom，都是以父元素的width为参照，关键在于：容器margin/padding的百分比参照物是父元素的宽度，而容器的width的百分比参照物也是父元素的宽度，俩属性参照物一致，那这俩属性的值就统一起来
            padding-top: 100%
            img
                position: absolute
                top: 0
                left: 0
                width: 100%
                height: 100%
            .back
                position: absolute
                top: 10px
                left: 0
                .icon-arrow_lift
                    // 要加padding所以就要加display: block 
                    display: block
                    // 加padding是为了让这个按钮可点击区域变大
                    padding: 10px
                    font-size: 20px
                    color: #FFFFFF
        .content
            position: relative
            padding: 18px
            .title
                line-height: 14px
                margin-bottom: 8px
                font-size: 14px
                font-weight: 700
                color: rgb(7, 17, 27)
            .detail
                margin-bottom: 18px
                line-height: 10px
                height: 10px
                font-size: 0
                .sell-count, .rating
                    font-size: 10px
                    color: rgb(147, 153, 159)
                .sell-count
                    margin-left: 12px
            .price
                font-weight: 700
                line-height: 24px
                .now
                    margin-right: 8px
                    font-size: 14px
                    color: rgb(240, 20, 20)
                .old
                    text-decoration: line-through
                    font-size: 10px
                    color: rgb(147, 153, 159)
            .cartcontrol-wrapper
                position: absolute
                right: 12px
                bottom: 12px
            .buy
                position: absolute
                right: 18px
                bottom: 18px
                z-index: 18
                height: 24px
                line-height: 24px
                padding: 0 12px
                box-sizing: border-box
                border-radius: 10px
                font-size: 10px
                color: #FFFFFF
                background: rgb(0, 160, 220)
                opacity: 1
                &.fade-enter-active, &.fade-leave-active
                    transition: all 0.2s
                &.fade-enter, &.fade-leave-active
                    opacity: 0
                    z-index: -1
        .info
            padding: 18px
            .title
                line-height: 14px
                margin-bottom: 6px
                font-size: 14px
                color: rgb(7, 17, 27)
            .text
                line-height: 24px
                padding: 0 8px
                font-size: 12px
                color: rgb(77, 85, 93)
        .rating
            padding-top : 18px
            .title
                line-height: 14px
                margin-left: 6px
                font-size: 14px
                color: rgb(7, 17, 27)
            .rating-wrapper
                padding: 0 18px
                .rating-item
                    position : relative
                    padding: 16px 0
                    border-1px(rgba(7, 17, 27, 0.1))
                    .user
                        position : absolute
                        right: 0
                        top: 16px
                        line-height : 12px
                        font-size : 0
                        .name
                            display :inline-block
                            vertical-align : top
                            font-size : 10px
                            color: rgb(147, 153,159)
                        .avatar
                            border-radius : 50%
                    .time
                        margin-bottom : 6px
                        line-height : 12px
                        font-size : 10px
                        color: rgb(147, 153, 159)
                    .text
                        line-height : 16px
                        font-size : 12px
                        color: rgb(7, 17, 27)
                        .icon-thumb_up,.icon-thumb_down
                            margin-right : 4px
                            line-height : 16px
                            font-size : 12px
                        .icon-thumb_up
                            color: rgb(0, 160, 220)
                        .icon-thumb_down
                            color: rgb(147, 153, 159)
                .no-ratings
                    padding :16px 0
                    font-size : 12px
                    color: rgb(147, 153, 159)
</style>
