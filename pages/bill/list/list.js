import http from '../../../public/js/http.js';
import api from '../../../public/js/api.js';
import utils from '../../../public/js/utils.js';
import Zan from '../../../components/zanui/index.js';
const app = new getApp();

Page(Object.assign({}, Zan.Toast, {
	data: {
		isLoaded: false,             //数据是否加载完毕
		bill: [],					//所有清单列表存放处
		billId: 0,					//当前清单的id
		taskInfo: {},				//存放当前任务数据
		taskDate: "",				//任务创建日期

		// 购物车传的数据
		totalPrice: ''
	},
	onLoad (options) {
		//先获取清单id
		this.setData({
			billId: options.listId
		})
		this.getBillList();
		this.getTaskInfo();
		options.totalPrice ? this.setData({ totalPrice: options.totalPrice }) : ''
	},
	getBillList () {
		let { tab, billId } = this.data,
			_this = this;
		wx.showLoading();
		//本地获取mock数据
		http.request({
			url: api.childBill + "/" + billId,
		}).then((res) => {
			console.log(res);
			wx.hideLoading();
			if (res.errorCode == 200) {
				_this.setData({
					isLoaded: true,
					bill: res.data
				});
				//转换时间
				_this.transformTimeBill();
			} else {
				_this.showZanToast(res.moreInfo || "获取数据失败");
			}
		});
	},
	getTaskInfo () {			//获取当前任务的信息
		let { tab, billId, taskDate } = this.data,
			_this = this;
		//本地获取mock数据
		http.request({
			url: api.taskInfo + "/" + billId,
		}).then((res) => {
			console.log(res);
			wx.hideLoading();
			if (res.errorCode == 200) {
				taskDate = utils.formatDate(new Date(res.data.createdAt));
				_this.setData({
					taskInfo: res.data,
					taskDate
				});
			} else {
				_this.showZanToast(res.moreInfo || "获取数据失败");
			}
		});
	},
	transformTimeBill () {			//转换时间
		let { bill } = this.data;
		var arr = bill;
		for (var i in bill) {
			var hour = parseInt(bill[i].expirationDate - Date.parse(new Date())) / (60 * 60 * 1000);
			arr[i].psDate = utils.formatDate(new Date(bill[i].deliveryDate));
			arr[i].surTimeDay = Math.floor(hour / 24) > 0 ? Math.floor(hour / 24) : 0;
			arr[i].surTimeHour = Math.floor((hour / 24 - arr[i].surTimeDay) * 24) > 0 ? Math.floor((hour / 24 - arr[i].surTimeDay) * 24) : 0;
			arr[i].surTimeMinute = Math.floor((hour * 60) % 60);
		}
		this.setData({
			bill: arr
		});
	},
	// 路由event
	billHandle (e) {
		let { billId } = this.data;
		const id = parseInt(e.currentTarget.id);
		app.handle(function () {
			wx.navigateTo({ url: "../../bill/detail/detail?listId=" + id });
		});
	},
	taskHandle () {
		let { billId } = this.data;
		app.handle(function () {
			wx.navigateTo({ url: "../../../pages/task/detail/detail?listId=" + billId });
		});
	},
	backToList () {
		app.globalData.reShow.orderList = true;
		app.globalData.obType = "BILL";

		//跳转到订单列表页
		app.handle(function () {
			wx.switchTab({ url: "../../../pages/order/list/list" });
		});
	}
}));
