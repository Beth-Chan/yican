<template>
    <div class="ratingselect">
        <div class="ratingType border-1px">
            <span @click="select(2,$event)" class="block positive" :class="{'active':selectType===2}">{{desc.all}}<span class="count">{{ratings.length}}</span></span>
            <span @click="select(0,$event)" class="block positive" :class="{'active':selectType===0}">{{desc.positive}}<span class="count">{{positives.length}}</span></span>
            <span @click="select(1,$event)" class="block negative" :class="{'active':selectType===1}">{{desc.negative}}<span class="count">{{negatives.length}}</span></span>
        </div>
        <div @click="toggleContent" class="switch" :class="{'on':onlyContent}">
            <span class="icon-check_circle"></span>
            <span class="text">只看内容的评价</span>
        </div>
    </div>
</template>

<script type="text/ecmascript-6">
    const POSITIVE = 0
    const NEGATIVE = 1
    const ALL = 2

    export default {
        props: { // 要有一个变量控制是否显示“只看有内容的评价”；一个变量控制选择的类型；一个保存所有评价的数组；还有描述文字（商品详情页的全部、推荐、吐槽和评价页的全部、满意、不满意）
            ratings: {
                type: Array,
                default() {
                    return []
                }
            },
            selectType: {
                type: Number,
                default: ALL
            },
            onlyContent: {
                type: Boolean,
                default: false
            },
            desc: {
                type: Object,
                default() {
                    return {
                        all: '全部',
                        positive: '满意',
                        negative: '不满意'
                    }
                }
            }
        },
        computed: {
            positives() {
                return this.ratings.filter((rating) => {
                    return rating.rateType === POSITIVE
                })
            },
            negatives() {
                return this.ratings.filter((rating) => {
                    return rating.rateType === NEGATIVE
                })
            }
        },
        methods: {
            select(type, event) {
                if (!event._constructed) {
                    return
                }
                this.selectType = type
                // 触发父组件food组件的select事件
                this.$emit('select', type)
            },
            toggleContent(event) {
                if (!event._constructed) {
                    return
                }
                this.onlyContent = !this.onlyContent
                this.$emit('toggle')
            }
        }
    }
</script>

<style lang="stylus" rel="stylesheet/stylus">
    @import "../../common/stylus/mixin.styl"
    
    .ratingselect
        .ratingType
            padding: 18px 0
            margin: 0 18px
            border-1px(rgba(7,17,27,0.1))
            font-size : 0
            .block
                display: inline-block
                padding: 8px 12px
                margin-right : 8px
                border-radius : 1px
                font-size : 12px
                color: rgb(77, 85, 93)
                &.active
                    color: #fff
                line-height : 16px  
                .count
                    margin-left : 2px
                    font-size : 8px
                &.positive
                    background: rgba(0, 160, 220, 0.2)
                    &.active
                        background: rgb(0, 160, 220)
                &.negative
                    background: rgba(77, 85, 93, 0.2)
                    &.active
                        background: rgb(77, 85, 93)
    .switch
        padding: 12px 18px
        line-height : 24px
        border-bottom: 1px solid rgba(7,17,27,0.1)
        color: rgb(147, 153, 159)
        font-size : 0
        &.on
            .icon-check_circle
                color: #00c850
        .icon-check_circle
            display: inline-block
            vertical-align : top
            margin-right : 4px
            font-size : 24px
        .text
            display: inline-block
            vertical-align : top    
            font-size : 12px
            
</style>
