<template>
    <!-- 星星有不同尺寸，所以有不同的星星类型 -->
    <div class="star" :class="starType">
        <!-- 遍历itemClasses里的result数组 -->
        <span v-for="itemClass in itemClasses" :class="itemClass" class="star-item"></span>
    </div>
</template>

 <script type="text/ecmascript-6">
    // 总共有五颗星
    const LENGTH = 5
    const CLS_ON = 'on'
    const CLS_HALF = 'half'
    const CLS_OFF = 'off'

    export default{
        // 定义对外接口
        props: {
            size: { // 星星有尺寸
                type: Number
            },
            score: { // 星星有分数
                type: Number
            }
        },
        // vue特有的计算属性
        computed: {
            starType() {
                // 不同class有不同样式
                return 'star-' + this.size
            },
            itemClasses() {
                let result = []
                // 比如score是4.3，结果就是4，4.5以上向下取整就是9， 9除以2就是4.5
                let score = Math.floor(this.score * 2) / 2
                // score对1取余不等于0，代表有小数位，控制有半星
                let hasDecimal = score % 1 !== 0
                let integer = Math.floor(score)
                // 全星的部分
                for (let i = 0; i < integer; i++) {
                    result.push(CLS_ON)
                }
                // 如果有小数位就加上半星
                if (hasDecimal) {
                    result.push(CLS_HALF)
                }
                // 确保星星个数达到5个
                while (result.length < LENGTH) {
                    result.push(CLS_OFF)
                }
                return result
            }
        }
    }
</script>

<style lang="stylus" rel="stylesheet/stylus">
    @import "../../common/stylus/mixin.styl"

    .star
        .star-item
            display: inline-block
            background-repeat: no-repeat
        &.star-48
            .star-item
                width: 20px
                height: 20px
                margin-right: 22px
                background-size: 20px 20px
                &:last-child
                    margin-right: 0
                // 三个类分别代表全星、半星和没有星
                &.on
                    bg-image('star48_on')
                &.half
                    bg-image('star48_half')
                &.off
                    bg-image('star48_off')
        &.star-36
            .star-item
                width: 15px
                height: 15px
                margin-right: 6px
                background-size: 15px 15px
            &:last-child
                margin-right: 0
            &.on
                bg-image('star36_on')
            &.half
                bg-image('star36_half')
            &.off
                bg-image('star36_off')
        &.star-24
            .star-item
                width: 10px
                height: 10px
                margin-right: 3px
                background-size: 10px 10px
            &:last-child
                margin-right: 0
            &.on
                bg-image('star24_on')
            &.half
                bg-image('star24_half')
            &.off
                bg-image('star24_off')
</style>
