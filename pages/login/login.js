import http from '../../public/js/http.js';
import api from '../../public/js/api.js';
import Zan from '../../components/zanui/index.js';
var app = getApp();

Page(Object.assign({}, Zan.Toast, {
  data: {
    //数据是否加载完毕
    isLoaded: false,
    //登录名
    username: '',
    //登录密码
    password: '',
    // 是否正在提交数据
    isSubmit: false,
    // 激活的是哪个模块
    isActive: 'other',
    // 注册有礼
    // invite: { companyName: 'dasda', address: '1123', compannyScale: '1', name: 'qwe', phone: '18245671234', username: '213', password: '123123', inviteCode: '' },
    invite: { companyName: '', address: '', compannyScale: '', name: '', phone: '', username: '', password: '', inviteCode: '' },
    // 注册是否填写完
    isFinshed: false,
    // 是否需要提升button
    // isFocu: false,
    // 自定义选择框数据
    list: ['50人以下', '50～150人', '150～400人', '400～800人', '800人以上'],
    // 优惠券弹窗
    isTicker: false,
    // 是否有现金券
    rewardMoney: false,
    // 优惠券日期
    tickerDate: {},
    // 是否有优惠券
    isInviteCode: false,
  },
  onLoad(options) {
    var _this = this;
    this.setData({
      isLoaded: true
    });

    //获取用户信息
    wx.getUserInfo({
      success: function (res) {
        app.globalData.userInfo = res.userInfo;
      }
    });
  },
  //用户登录
  login(e) {
    var _this = this,
      username = e.detail.value.username,
      password = e.detail.value.password;
    let { isSubmit } = this.data;
    //表单前端验证
    try {
      if (isSubmit) {
        throw new Error('正在提交中...');
      }
      if (!username || username.length <= 0) {
        throw new Error('请填写账号！');
      }
      if (!password || password.length <= 0) {
        throw new Error('请填写密码！');
      }
    } catch (e) {
      return _this.showZanToast(e.message);
    }
    //提交formId
    var formId = e.detail.formId;
    if (formId) app.formIdSubmit(formId);
    // 登录跳转
    this.loginFunc("MANAGE", { username, password });
  },
  // 自动登录
  vhandleLogin() {
    app.handle(() => {
      this.loginFunc("VISITOR");
    });
  },
  // 判断role是游客还是管理者
  loginFunc(role = 'MANAGE', options) {
    let ajaxUrl = "",
      ajaxData = {};
    if (role === 'MANAGE') {
      ajaxUrl = api.login;
      ajaxData = {
        login: options.username,
        password: options.password
      }
    } else {
      ajaxUrl = api.vLogin;
    }
    wx.showLoading();
    //登录
    let _this = this
    wx.login({
      success: (res) => {
        console.info(res.code)
        http.request({
          url: ajaxUrl,
          method: "POST",
          data: {
            code: res.code,
            ...ajaxData
          }
        }).then((res) => {
          console.log(res);
          wx.hideLoading();
          if (res.errorCode == 200) {
            //登录成功之后存储seesionid
            wx.setStorageSync('sessionId', res.data);
            // 登录成功之后存储登陆者角色
            wx.setStorageSync('userRole', role);
            //准备跳转到之前的页面
            let pages = getCurrentPages();
            wx.showToast({
              title: "登录成功！",
              icon: 'success',
              complete() {
                app.formIdsSave();
                //设置刷新
                app.globalData.reShow.home = true;
                setTimeout(function () {
                  //直接强制跳转到首页
                  wx.switchTab({
                    url: "../../pages/home/home"
                  });
                }, 1500);
              }
            });
          } else {
            _this.showZanToast(res.moreInfo || "登录失败！");
          }
        });
      }
    });
  },
  // 切换banner 切换注册登录
  tabBanner(e) {
    // e.target.id == 'login' ? this.setData({ isActive: 'login' }) : this.setData({ isActive: 'other' })
    this.data.isActive != 'login' ? this.setData({ isActive: 'login' }) : this.setData({ isActive: 'other' })
  },
  // 点击login的input时 提升button
  // focuBtn () {
  // 	this.setData({ isFocu: true })
  // },
  // blurBtn () {
  // 	this.setData({ isFocu: false })
  // },
  havaInviteCode() {
    this.setData({ isInviteCode: !this.data.isInviteCode })
  },
  isFinshed() {
    this.setData({ isFinshed: true })
  },
  register(e) {
    let value = e.detail.value
    let compannyScale = this.data.invite.compannyScale
    let self = this
    let code = this.data.code
    Object.assign(value, { compannyScale, code })
    wx.request({
      url: api.register,
      data: value,
      header: { 'Content-Type': 'application/x-www-form-urlencoded' },
      method: 'POST',
      success(e) {
        try {
          if (e.data.errorCode == 200) {
            // 注册成功获取优惠券
            let tickerDate = { createdAt: e.data.data.ticketStartDate, expirationDate: e.data.data.ticketExpirationDate }
            let rewardMoney = e.data.data.rewardMoney
            self.setData({ isTicker: true, rewardMoney, tickerDate, invite: value })
            // throw new Error('注册成功，恭喜您获得优惠券')
          } else if (e.data.errorCode == -1) {
            throw new Error('帐号重复')
          } else {
            throw new Error(e.data.moreInfo)
          }
        } catch (e) {
          return self.showZanToast(e.message);
        }
      },
      fail(e) {
        console.info(e)
      }
    })
    // wx.login({
    //   success(res) {
    //     code = { code: res.code }
    //     Object.assign(value, code)

    //     // 先拿code再发消息
    //     wx.request({
    //       url: api.register,
    //       data: value,
    //       header: { 'Content-Type': 'application/x-www-form-urlencoded' },
    //       method: 'POST',
    //       success(e) {
    //         try {
    //           if (e.data.errorCode == 200) {
    //             // 注册成功获取优惠券
    //             let tickerDate = { createdAt: e.data.data.ticketStartDate, expirationDate: e.data.data.ticketExpirationDate }
    //             let rewardMoney = e.data.data.rewardMoney
    //             self.setData({ isTicker: true, rewardMoney, tickerDate, invite: value })
    //             // throw new Error('注册成功，恭喜您获得优惠券')
    //           } else if (e.data.errorCode == -1) {
    //             throw new Error('帐号重复')
    //           } else {
    //             throw new Error(e.data.moreInfo)
    //           }
    //         } catch (e) {
    //           return self.showZanToast(e.message);
    //         }
    //       },
    //       fail(e) {
    //         console.info(e)
    //       }
    //     })
    //   }
    // })
    console.log(value)

  },
  // 把组件的数值传上来
  changeValue(e) {
    let compannyScale = e.detail.index
    this.setData({ 'invite.compannyScale': compannyScale })
  },
  // 关掉弹窗
  closeTicker() {
    this.setData({ isTicker: false })
    let { username, password } = this.data.invite
    this.loginFunc("MANAGE", { username, password })
  },
  // 手机验证码
  getPhoneValidation() {
    let phone = this.data.invite.phone
    try {
      if (!/^1[0-9]{10}$/.test(phone)) {
        throw new Error('请输入正确的手机号');
      }
    } catch (e) {
      return this.showZanToast(e.message);
    }
    wx.login({
      success: (res) => {
        wx.request({
          url: api.getPhoneValidation,
          method: 'POST',
          header: { 'Content-Type': 'application/x-www-form-urlencoded' },
          data: { code: res.code, phone },
          success: (res) => {
            // 顺便把code给set
            this.setData({ code: res.code })
          },
          complete: (res) => {
            this.showZanToast(res.data.moreInfo)
          }
        })
      },
    })
  },
  setPhone(e) {
    this.setData({
      [`invite.phone`]: e.detail.value
    })
  }
}))