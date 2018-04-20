<template>
    <div class="goods">
        <!-- 左侧商品分类 ref是vue提供的，可以使得better-scroll获取到DOM对象-->
        <div class="menu-wrapper" ref="menu-wrapper">
            <ul>
                <!-- 遍历goods对象数组时会有index值；动态绑定当前索引，如果当前索引等于遍历到的索引，就会有current样式 -->
                <li v-for="(item,index) in goods" class="menu-item" :class="{'current':currentIndex===index}"
                    @click="selectMenu(index,$event)">
                    <span class="text border-1px">
                        <!-- 动态绑定classMap -->
                        <span v-show="item.type>0" class="icon" :class="classMap[item.type]"></span>{{item.name}}
                    </span>
                </li>
            </ul>
        </div>
        <!-- 右侧商品 -->
        <div class="foods-wrapper" ref="foodsWrapper">
            <ul>
                <li v-for="item in goods" class="food-list food-list-hook">
                    <h1 class="title">{{item.name}}</h1>
                    <ul>
                        <li @click="selectFood(food,$event)" v-for="food in item.foods" class="food-item border-1px">
                            <div class="icon">
                                <img width="57" height="57" :src="food.icon" alt="">
                            </div>
                            <div class="content">
                                <h2 class="name">{{food.name}}</h2>
                                <p class="desc">{{food.description}}</p>
                                <div class="extra">
                                    <span>月售{{food.sellCount}}份</span>
                                    <span>好评率{{food.rating}}%</span>
                                </div>
                                <div class="price">
                                    <span class="now">￥{{food.price}}</span>
                                    <!-- 只有降价商品才有 -->
                                    <span v-show="food.oldPrice" class="old">￥{{food.oldPrice}}</span>
                                </div>
                                <!-- 购物车加减数量控件 -->
                                <div class="cartcontrol-wrapper">
                                    <!-- cartcontrol组件接收一个food对象 -->
                                    <cartcontrol :food="food" @cart-add="_drop"></cartcontrol>
                                </div>
                            </div>
                        </li>
                    </ul>
                </li>
            </ul>
        </div>
        <!-- :select-food="selectFoods"使goods组件和cartcontrol组件联动起来 -->
        <shopcart ref="shopcart" :select-foods="selectFoods" :delivery-price="seller.deliveryPrice"
                  :min-price="seller.minPrice"></shopcart>
        <food :food="selectedFood" ref="food"></food>
    </div>
</template>


<script type="text/ecmascript-6">
    import BScroll from 'better-scroll'
    import shopcart from '../../components/shopcart/shopcart'
    import cartcontrol from '../../components/cartcontrol/cartcontrol'
    import food from '../../components/food/food'

    const ERR_OK = 0

    export default {
        props: {
            seller: {
                type: Object
            }
        },
        data () {
            return {
                // 一开始goods是空，当组件被调用时通过后端api去取数据
                goods: [],
                // 每个区间高度的数组
                listHeight: [],
                scrollY: 0,
                selectedFood: {}
            }
        },
        computed: {
            currentIndex() {
                for (let i = 0; i < this.listHeight.length; i++) {
                    // 区间的上点
                    let height1 = this.listHeight[i]
                    // 区间的下点
                    let height2 = this.listHeight[i + 1]
                    // 如果scrollY落到区间内或者在最后一个区间，返回当前索引；遍历到最后一个区间时i + 1会超出数组最大索引，是undefined
                    if (!height2 || (this.scrollY >= height1 && this.scrollY < height2)) {
                        return i
                    }
                }
                // 如果什么都没有，返回0
                return 0
            },
            selectFoods() {
                let foods = []
                // 两层遍历保存所有被选择的food，selectFoods计算属性观测的是goods对象数组
                this.goods.forEach((good) => {
                    // goods由foods组成
                    good.foods.forEach((food) => {
                        // 有count说明这个food是被选择了
                        if (food.count) {
                            foods.push(food)
                        }
                    })
                })
                return foods
            }
        },
        created () {
            this.classMap = ['decrease', 'discount', 'special', 'invoice', 'guarantee']
            this.$http.get('/api/goods').then((response) => {
                response = response.body
                if (response.errno === ERR_OK) {
                    // 数据保存在goods变量
                    this.goods = response.data
                    // vue更新DOM是异步的，在$nextTick里执行异步更新
                    this.$nextTick(() => {
                        // 要保证DOM已经渲染了，初始化，拿到ul的高度，大于外层wrapper的高度就会滚动
                        this._initScroll()
                        this._calHeight()
                    })
//                    console.log(this.goods)
                }
            })
        },
        methods: {
            _drop (target) {
                // 体验优化，异步执行下落动画
                this.$nextTick(() => {
                    this.$refs.shopcart.drop(target)
                })
            },
            _initScroll() {
                // better-scroll初始化时需要绑定DOM，第二个参数是options对象，this.$refs就相当于拿到一个原生DOM
                this.menuScroll = new BScroll(this.$refs['menu-wrapper'], {
                    // better-scroll监听的原理就是会监听touchstart和touchend事件，会preventDefault()阻止掉默认的，所以要加click: true
                    click: true
                })
                this.foodsScroll = new BScroll(this.$refs.foodsWrapper, {
                    click: true,
                    probeType: 3
                })
                // better-scroll在滚动时能实时监听鼠标所在位置
                this.foodsScroll.on('scroll', (pos) => {
                    this.scrollY = Math.abs(Math.round(pos.y))
                })
            },
            _calHeight() {
                let foodList = this.$refs.foodsWrapper.getElementsByClassName('food-list-hook')
                let height = 0
                this.listHeight.push(height)
                for (let i = 0; i < foodList.length; i++) {
                    let item = foodList[i]
                    // 通过DOM的clientHeight接口去获得每个foodList的高度，累加得到每个区间总高度
                    height += item.clientHeight
                    this.listHeight.push(height)
                }
            },
            selectMenu(index, event) {
                // 为了避免浏览器默认派发的点击事件
                if (!event._constructed) {
                    return
                }
                let foodList = this.$refs.foodsWrapper.getElementsByClassName('food-list-hook')
                let el = foodList[index]
                // scrollToElement是better-scroll的一个接口，el选项可以是选择器或者元素，300是动画时间
                this.foodsScroll.scrollToElement(el, 300)
                // console.log(index)
            },
            selectFood(food, event) {
                if (!event._constructed) {
                    return
                }
                this.selectedFood = food
                // 拿到food这个子组件，调用food组件它的show方法
                this.$refs.food.show()
            }
        },
        components: {
            shopcart,
            cartcontrol,
            food
        },
        events: {
            'add'(target) {
                this._drop(target)
            }
        }
    }
</script>

<style lang="stylus" rel="stylesheet/stylus">
    @import "../../common/stylus/mixin.styl"

    .goods
        // 整体用flex布局，绝对定位 
        display: flex
        position: absolute
        top: 174px // header加上tab的高度
        bottom: 46px // 下面购物车那一条的高度
        width: 100%
        overflow: hidden // 超过的部分隐藏
        .menu-wrapper
            flex: 0 0 80px // 占位空间为80px
            width: 80px // 不写width的话在Android浏览器上会有问题
            background: #f3f5f7
            .menu-item
                // 小技巧：一行或者两行都可以垂直居中
                display: table
                height: 54px
                width: 56px
                // 加上这个就水平居中了
                padding: 0 12px
                line-height: 14px
                &.current
                    position: relative
                    // 要盖住
                    z-index: 10
                    margin-top: -1px
                    background: #FFFFFF
                    font-weight: 700
                    .text
                        border-none()
                .icon
                    display: inline-block
                    width: 12px
                    height: 12px
                    vertical-align: top
                    margin-right: 2px
                    background-size: 12px 12px
                    background-repeat: no-repeat
                    &.decrease
                        bg-image('decrease_3')
                    &.discount
                        bg-image('discount_3')
                    &.special
                        bg-image('special_3')
                    &.invoice
                        bg-image('invoice_3')
                    &.guarantee
                        bg-image('guarantee_3')
                .text
                    // 设为menu-item中table的单元格
                    display: table-cell
                    width: 56px
                    vertical-align: middle
                    border-1px(rgba(7, 17, 27, 0.1))
                    font-size: 12px
        .foods-wrapper
            flex: 1
            .title
                padding-left: 14px
                height: 26px
                line-height: 26px
                border-left: 2px solid #d9dde1
                font-size: 12px
                color: rgb(147, 153, 159)
                background: #f3f5f7
            .food-item
                // 每个商品仍然用flex布局
                display: flex
                margin: 18px
                // 去掉margin重叠
                padding-bottom: 18px
                border-1px(rgba(7, 17, 27, 0.1))
                &:last-child
                    // 本来border-1px伪类:after的display: block变为display为none
                    border-none()
                    // 去掉margin重叠后最后一个要设为0
                    margin-bottom: 0
                .icon
                    flex: 0 0 57px
                    margin-right: 10px
                .content
                    flex: 1
                    .name
                        margin: 2px 0 8px 0
                        height: 14px
                        line-height: 14px
                        font-size: 14px
                        color: rgb(7, 17, 27)
                    .desc
                        margin-bottom: 8px
                        line-height: 12px
                        font-size: 10px
                        color: rgb(147, 153, 159)
                    .extra
                        .count
                            margin-right: 12px
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
                        // 绝对布局
                        position: absolute
                        right: 0
                        bottom: 12px

</style>
