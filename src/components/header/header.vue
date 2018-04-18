<template>
    <div class="header">
        <div class="content-wrapper">
            <div class="avatar">
                <!-- 得是动态绑定v-bind，即:src，不能是src，要不然会直接解析src，直接解析时不会有seller，会报错 -->
                <!-- 下面的avatar，name，description，deliveryTime，supports等都是根据返回的json数据的结构去取出相应数据 -->
                <img :src="seller.avatar" alt="this is an avatar" width="64" height="64">
            </div>

            <div class="content">
                <div class="title">
                    <span class="brand"></span>
                    <span class="name">{{seller.name}}</span>
                </div>
                <div class="description">
                    {{seller.description}} / {{seller.deliveryTime}}分钟送达
                </div>
                <div v-if="seller.supports" class="supports">
                    <!-- 动态绑定一个class，seller.supports[0].type里是0,1,2,3,4，所以在created的hook中定义classMap数组对应字符串 -->
                    <span class="icon" :class="classMap[seller.supports[0].type]"></span>
                    <span class="text">{{seller.supports[0].description}}</span>
                </div>
            </div>
            <!-- 加click事件控制显示详情弹出层，@是v-on的缩写 -->
            <div v-if="seller.supports" class="supports-count" @click="showDetail">
                <span class="count">{{seller.supports.length}}个</span>
                <!-- 应用字体图标，很多工程师都习惯用i标签 -->
                <i class="icon-keyboard_arrow_right"></i>
            </div>
        </div>
        <div class="bulletin-wrapper" @click="showDetail">
            <!-- 两个span写在一起，防止空白字符带来的间隙 -->
            <span class="bulletin-title"></span><span class="bulletin-text">{{seller.bulletin}}</span>
            <i class="icon-keyboard_arrow_right"></i>
        </div>
        <div class="background">
            <!-- 背景是图片加blur效果 -->
            <img :src="seller.avatar" alt="this is the background" width="100%" height="100%">
        </div>
        <!-- 详情弹出层 -->
        <transition name="fade">
            <!-- 通过v-show去控制详情弹出层是否显示 -->
            <div v-show="detailShow" class="detail">
                <!-- 外层容器清除浮动 -->
                <div class="detail-wrapper clearfix">
                    <div class="detail-main">
                        <h1 class="name">{{seller.name}}</h1>
                        <div class="star-wrapper">
                            <!-- 接收两个参数，size和score -->
                            <star :size="48" :score="seller.score"></star>
                        </div>
                        <div class="title">
                            <div class="line"></div>
                            <div class="text">优惠信息</div>
                            <div class="line"></div>
                        </div>
                        <ul v-if="seller.supports" class="supports">
                            <!-- 遍历supports -->
                            <li class="support-item" v-for="(item,index) in seller.supports">
                                <span class="icon" :class="classMap[seller.supports[index].type]"></span>
                                <span class="text">{{seller.supports[index].description}}</span>
                            </li>
                        </ul>
                        <div class="title">
                            <div class="line"></div>
                            <div class="text">商家公告</div>
                            <div class="line"></div>
                        </div>
                        <div class="bulletin">
                            <p class="content">{{seller.bulletin}}</p>
                        </div>
                    </div>
                </div>
                <!-- 与detail-close平级 -->
                <div class="detail-close" @click="hideDetail">
                    <i class="icon-close"></i>
                </div>
            </div>
        </transition>
    </div>
</template>

<script type="text/ecmascript-6">
    import star from '../../components/star/star'

    export default {
        // props属性去接收传过来的seller对象，它的类型是Object
        props: {
            seller: {
                type: Object
            }
        },
        data() {
          return {
            // 默认是不显示详情弹出层
              detailShow: false
          }
        },
        methods: {
            showDetail() {
                this.detailShow = true
            },
            hideDetail() {
                this.detailShow = false
            }
        },
        created() {
            // 顺序是根据data.json中的supports顺序
            this.classMap = ['decrease', 'discount', 'special', 'invoice', 'guarantee']
        },
        components: {
            star
        }
    }
</script>

<style lang="stylus" rel="stylesheet/stylus">
    // 不能用alias配置，因为引入js文件才可以
    @import "../../common/stylus/mixin.styl"

    .header
        position: relative
        // 为了消除blur阴影
        overflow: hidden
        color: #fff
        // 半透明才能看到底部的图片
        background : rgba(7, 17, 27, 0.5)
        .content-wrapper
            position: relative
            padding: 24px 12px 18px 24px
            // avatar和content之间有间隙，因为存在空白字符，所以在父元素用font-size: 0消除
            font-size: 0 
            .avatar
                // 使avatar和content并排
                display: inline-block
                vertical-align : top
                img
                    border-radius : 2px
            .content
                display: inline-block
                // 父元素font-size等于0，font-size存在继承性，所以要加font-size: 14px
                font-size: 14px
                margin-left: 16px
                .title
                    margin: 2px 0 8px 0
                    .brand
                        // span行内元素设置宽高
                        display: inline-block
                        // 顶部对齐
                        vertical-align :top
                        width: 30px
                        height: 18px
                        // 普通情况下用2x，dpr为3时用3x
                        bg-image('brand')
                        background-size: 30px 18px
                        background-repeat: no-repeat
                        .name
                            margin-left : 6px
                            font-size :16px
                            line-height :18px
                            font-weight :bold
                .description
                    margin-bottom : 10px
                    line-height : 12px
                    font-size : 12px
                .supports
                    .icon
                        display: inline-block
                        width : 12px
                        height: 12px
                        vertical-align: top
                        margin-right: 4px
                        background-size : 12px 12px
                        background-repeat: no-repeat
                        // 不同的class对应不同的图标
                        &.decrease
                        	bg-image('decrease_1')
                        &.discount
                        	bg-image('discount_1')
                        &.special
                            bg-image('special_1')
                        &.invoice
                        	bg-image('invoice_1')
                        &.guarantee
                            bg-image('guarantee_1')
                    .text
                        line-height : 12px
                        // Chrome上最小是12px，但是在手机上可以明显看到字体变小了
                        font-size : 10px
            .supports-count
                // content-wrapper加相对定位
                position: absolute
                right: 12px
                bottom: 14px
                padding: 0 8px
                width: 35px
                height: 24px
                line-height: 24px
                border-radius: 14px
                background: rgba(0, 0, 0, 0.2)
                // 水平居中
                text-align: center
                .count
                    font-size: 10px
                .icon-keyboard_arrow_right
                    font-size: 10px
                    // 使图标垂直居中
                    line-height: 24px
                    margin-left : 2px
        .bulletin-wrapper
            position: relative
            height: 28px
            line-height: 28px
            padding:0 22px 0 12px
            // 下面三个组合属性使其有...的效果
            white-space: nowrap
            overflow: hidden
            text-overflow : ellipsis
            // 半透明效果
            background: rgba(7, 17, 27, 0.2)
            .bulletin-title
                display: inline-block
                vertical-align : top
                margin-top : 8px
                width: 22px
                height: 12px
                bg-image('bulletin')
                background-size : 22px 12px
                background-repeat : no-repeat
            .bulletin-text
                margin-left: 4px
                vertical-align : top
                font-size : 10px
            .icon-keyboard_arrow_right
                // bulletin-wrapper加相对定位
                position: absolute
                font-size:10px
                right: 12px
                top: 8px
        .background
            // 绝对定位，header是相对定位，宽高撑满父级容器header
            position : absolute
            top: 0px
            left: 0px
            width: 100%
            height: 100%
            // 关键还要加z-index
            z-index: -1
            // 加个blur滤镜
            filter: blur(10px)
        .detail
            position: fixed
            // 浮层
            z-index: 100
            // 设置top和left全屏
            top: 0
            left: 0
            width: 100%
            height: 100%
            // 用hidden的话内容超过屏幕高度就不能滚动
            overflow: auto
            // 半透明加模糊效果
            background: rgba(7, 17, 27, 0.8)
            // 这个模糊只有在ios系统上才能实现，安卓没实现也没事，保持透明效果也就可以了，不是个主要功能
            backdrop-filter: blur(10px)
            opacity: 1
            &.fade-enter-active,&.fade-leave-active
                // 过渡
                transition: all .5s
            // 动画进入时的样式
            &.fade-enter, &.fade-leave-active
                opacity: 0
                background: rgba(7, 17, 27, 0)
            .detail-wrapper
                width: 100%
                // 最小高度要撑满整个屏幕，要不然叉图标按钮在内容不够多时不会固定在底部那个位置
                min-height: 100%
                .detail-main
                    margin-top: 64px
                    // padding-bottom就是下面detail-close的高度，很关键，要不然叉图标会盖住文字
                    padding-bottom: 64px
                    .name
                        line-height: 16px
                        text-align: center
                        font-size: 16px
                        font-weight: 700px
                    .star-wrapper
                        margin-top: 18px
                        padding: 2px 0
                        text-align: center
                    .title
                        // 自适应
                        display: flex
                        width: 80%
                        margin: 28px auto 24px auto
                        .line
                            flex: 1
                            position: relative;
                            top: -6px
                            // 线是通过border-bottom
                            border-bottom:1px solid rgba(255, 255, 255, 0.2)
                        .text
                            padding: 0 12px
                            font-weight: 700
                            font-size :13px

                    .supports
                        width: 80%
                        margin: 0 auto
                        .support-item
                            padding: 0 12px
                            margin-bottom: 12px
                            font-size: 0
                            &:last-child
                                margin-bottom: 0
                            .icon
                                display: inline-block
                                width: 16px
                                height: 16px
                                vertical-align: top
                                margin-right: 6px
                                background-size: 16px 16px
                                background-repeat : no-repeat
                                // 跟首页的公告里的一样,只是图片尺寸变化
                                &.decrease
                                    bg-image('decrease_2')
                                &.discount
                                    bg-image('discount_2')
                                &.special
                                    bg-image('special_2')
                                &.invoice
                                    bg-image('invoice_2')
                                &.guarantee
                                    bg-image('guarantee_2')
                            .text
                                line-height: 16px
                                font-size:12px
                    .bulletin
                        width: 80%
                        margin: 0 auto
                        .content
                            padding: 0 12px
                            // 使内容垂直居中
                            line-height: 24px
                            font-size: 12px
            .detail-close
                position: relative
                width: 32px
                height: 32px
                // 如果detail-wrapper中内容满屏的话，detail-close不会显示，所以要用向上的负margin
                margin: -64px auto 0 auto
                clear: both
                font-size: 32px

</style>
