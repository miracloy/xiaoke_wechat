import http from '../../public/js/http.js';
import api from '../../public/js/api.js';
import Zan from '../../components/zanui/index.js';
var app = getApp();

Page(Object.assign({}, Zan.Toast, {
	data: {
		isLoaded: false,             //数据是否加载完毕
		name: '',
		photo: '',
		userInfo: {},				//用户的个人信息
	},
	onLoad (options) {
		var _this = this;
		//获取用户信息
		this.getUserInfo();
		//获取用户的头像
		if (app.globalData.userInfo) {
			this.setData({
				photo: app.globalData.userInfo.avatarUrl
			});
		} else {
			wx.getUserInfo({
				success: function (res) {
					app.globalData.userInfo = res.userInfo;
					_this.setData({
						photo: res.userInfo.avatarUrl,
					});
				}
			});
		}

		//保存formId
		app.formIdsSave();
	},
	getUserInfo () {   //获取用户信息
		var _this = this;
		http.request({
			url: api.userInfo,
			data: {}
		}).then((res) => {
			console.log(res);
			if (res.errorCode == 200) {
				this.setData({
					isLoaded: true,
					userInfo: res.data
				});
			} else {
				_this.showZanToast(res.moreInfo || '获取数据失败');
			}
		});
	},
	//handle
	rwrlHandle () {
		app.handle(function () {
			wx.navigateTo({ url: '../../pages/calendar/calendar' });
		});
	},
	qyxxHandle () {
		let { userInfo } = this.data;
		app.handle(function () {
			wx.navigateTo({ url: '../../pages/company/company?userId=' + userInfo.id });
		});
	},
	zjzhHandle () {
		let { userInfo } = this.data;
		app.handle(function () {
			wx.navigateTo({ url: '../../pages/capital/index/index?company=' + userInfo.companyName });
		});
	},
	shHandle () {
		app.globalData.chooseAddressType = '';
		app.handle(function () {
			wx.navigateTo({ url: '../../pages/address/list/list' });
		});
	},
	ddHandle () {				//事件跳转到我的订单页面
		app.globalData.obType = 'ORDER';
		app.handle(function () {
			wx.switchTab({ url: '../../pages/order/list/list' });
		});
	},
	tcHandle () {				//退出直接跳转到登录界面，让用户重新登录
		wx.showModal({
			title: '提示',
			content: '确认退出吗？',
			success: function (res) {
				if (res.confirm) {
					wx.showLoading();
					app.clearCache();
					setTimeout(function () {
						wx.hideLoading();
						app.handle(function () {
							wx.navigateTo({ url: '../../pages/login/login' });
						});
					}, 1000);
				}
			}
		});
	},
	xlkfHandle () {					//联系客服
		app.handle(function () {
			wx.makePhoneCall({
				phoneNumber: app.globalData.sellPhone
			});
		});
	},
	// 邀请有礼
	intiveHandle () {
		let { userInfo } = this.data;
		console.info(userInfo)
		app.handle(function () {
			wx.navigateTo({ url: '../../pages/invite/index/index' });
		});
	},
	// 优惠券
	couponHandle () {
		let { userInfo } = this.data;
		app.handle(function () {
			wx.navigateTo({ url: '../../pages/invite/coupon/coupon' });
		});
	},
}));
