import http from '../../../public/js/http.js';
import api from '../../../public/js/api.js';
import utils from '../../../public/js/utils'
import Zan from '../../../components/zanui/index'
Page(Object.assign({}, Zan.Toast, {
  data: {
    // 激活的banner 0-邀请记录 1-个人奖励中心 2-个人奖励 3-公司奖励
    bannerNum: 0,
    // 现金券不足时的弹窗 true 隐藏 false显示
    toaskLack: true,
    // 兑换成功的弹窗 true 隐藏 false显示
    toastSuccess: true,
    // 专属邀请码
    inviteCode: '',
    size: 20,
    page: 0,
    // 个人奖励金
    rewardMoney: 0,
    list0: [],
    list1: [],
    list2: [],
  },
  onLoad: function (options) {
    self = this
    // 获取专属邀请码
    http.request({
      url: api.getInviteCode,
      method: 'GET',
      success: function (res) {
        let inviteCode = res.data.data.inviteCode
        self.setData({ inviteCode })
      },
    })
    this.tabBanner(0)
  },
  tabBanner (e, more) {
    let bannerNum
    isNaN(e) ? bannerNum = e.target.dataset.num : bannerNum = e
    this.setData({ bannerNum })

    let size, page
    ({ size, page } = this.data)

    let self = this
    // 获取当前用户邀请用户注册及其特价优惠券的使用情况
    if (bannerNum == 0) {
      http.request({
        url: api.getInvite,
        data: { size, page },
        success: function (res) {
          let list0 = res.data.data
          for (let i = 0; i < list0.length; i++) {
            let date = list0[i].group.createdAt
            list0[i].group.createdAt = utils.formatDate(date, 'YYYY-MM-DD HH:mm').replace(/-/g, '.')
          }
          self.setData({ list0 })
        }
      })
    } else if (bannerNum == 1) {
      // 特价商品
      http.request({
        url: api.getRewardProduct,
        data: { size, page },
        success: function (res) {
          let list1 = res.data.data
          // more ? list1 += res.data.data : list1 = res.data.data
          self.setData({ list1 })
        }
      })
      // 个人奖励金
      http.request({
        url: api.getRewardMoney,
        success: function (res) {
          let rewardMoney = res.data.data.rewardMoney
          self.setData({ rewardMoney })
        }
      })
    } else if (bannerNum == 2) {
      // 获取该用户 通过 邀请他人注册 而得到的优惠券
      http.request({
        url: api.getTicketsByInviting,
        data: { size, page },
        success: function (res) {
          let list2 = res.data.data.tickets
          self.setData({ list2 })
        }
      })
    }
  },
  toHistory () {
    wx.navigateTo({
      url: '../history/history',
    })
  },
  toUse () {
    wx.switchTab({
      url: '../../goods/list/list',
    })
  },
  toConvert (e) {
    let productId = e.currentTarget.dataset.id
    let self = this
    http.request({
      url: api.convert,
      data: { productId },
      method: 'POST',
      success (res) {
        if (res.data.errorCode == '200') {
          self.setData({ toastSuccess: false })
        } else {
          self.setData({ toaskLack: false })
        }
      }
    })
  },
  close () {
    this.setData({ toastSuccess: true, toaskLack: true })
  },
  loadmore () {

  },
  toRule () {
    wx.navigateTo({
      url: '../rule/rule',
    })
  },
  setClipInviteCode () {
    let self = this
    wx.setClipboardData({
      data: self.data.inviteCode,
      success: function (res) {
        self.showZanToast('邀请码复制成功')
      }
    })
  },
  setClipWx () {
    let self = this
    wx.setClipboardData({
      data: 'keke19970804',
      success: function (res) {
        self.showZanToast('小可微信号复制成功')
      }
    })
  }
}))