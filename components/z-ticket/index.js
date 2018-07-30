import utils from '../../public/js/utils'
Component({
  properties: {
    // 种类
    kind: {
      type: String,
      value: 'person',
    },
    // 是否需要按钮
    isBtn: {
      type: Boolean,
      value: true
    },
    // 图标
    imgSrc: {
      type: String,
      value: './img/ticket-icon.png'
    },
    // 传入的数据
    params: Object,
    // 是否已使用
    isUsed: {
      type: Boolean,
      value: false
    },
    // 是否过期
    isPast: Boolean,
    date: String,
    toUrl: String
  },
  data: {
    // 这里是一些组件内部数据
    startTime: '2010.01.01',
    endTime: '2010.01.01'
  },
  methods: {
    // 这里是一个自定义方法
    tapFunc: function (e) {
      this.triggerEvent('toUse')
      this.triggerEvent('toConvert', e)
    },
    toUse () {
      wx.switchTab({
        url: '../../pages/goods/list/list'
      })
    }
  },
  ready () {
    // 格式化日期
    let createdAt, expirationDate
    if (this.data.params) {
      ({ createdAt, expirationDate } = this.data.params)
    }
    let startTime = utils.formatDate(createdAt, 'YYYY-MM-DD').replace(/-/g, '.')
    let endTime = utils.formatDate(expirationDate, 'YYYY-MM-DD').replace(/-/g, '.')
    this.setData({ startTime, endTime })
  }
})