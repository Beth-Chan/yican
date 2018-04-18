// 有时候非父子关系的组件也需要通信。在简单的场景下，使用一个空的 Vue 实例作为中央事件总线
import Vue from 'vue'
export var eventBus = new Vue()
