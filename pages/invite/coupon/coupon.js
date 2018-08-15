import http from '../../../public/js/http.js';
import api from '../../../public/js/api.js';
Page({
  data: {
    isEmpty: true,
    size: 1,
    num: 10,
    // 可用
    ticketUsing: [],
    // 已用
    ticketUsed: [],
    // 过期
    ticketPast: []
  },
  onLoad () {
    let { size, num } = this.data
    let self = this
    // 可用
    http.request({
      url: api.getTickets,
      data: {
        size,
        num,
        type: 1
      },
      success (res) {
        if (res.data.data.length != 0) {
          self.setData({ isEmpty: false })
          self.setData({ ticketUsing: res.data.data })
        }
      }
    })
    // 已用
    http.request({
      url: api.getTickets,
      data: {
        size,
        num,
        type: 0
      },
      success (res) {
        if (res.data.data.length != 0) {
          self.setData({ isEmpty: false })
          self.setData({ ticketUsed: res.data.data })
        }
      }
    })
    // 过期
    http.request({
      url: api.getTickets,
      data: {
        size,
        num,
        type: -1
      },
      success (res) {
        if (res.data.data.length != 0) {
          self.setData({ isEmpty: false })
          self.setData({ ticketPast: res.data.data })
        }
      }
    })
  },
  toUse () {
    wx.switchTab({
      url: '../../goods/list/list',
    })
  }
})