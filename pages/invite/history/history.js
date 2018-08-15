import http from '../../../public/js/http.js'
import api from '../../../public/js/api.js'
import utils from '../../../public/js/utils'
Page({
  data: {
    list: []
  },
  onLoad: function (options) {
    let self = this
    http.request({
      url: api.getConvertHistory,
      success: function (res) {
        let list = res.data.data
        for (var i = 0; i < list.length; i++) {
          list[i].createdAt = utils.formatDate(list[i].createdAt, 'YYYY-MM-DD HH:mm').replace(/-/g, '.')
        }
        self.setData({ list })
      }
    })
  }
})