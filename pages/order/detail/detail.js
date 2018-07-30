import http from '../../../public/js/http.js';
import api from '../../../public/js/api.js';
import utils from '../../../public/js/utils.js';
import Zan from '../../../components/zanui/index';
var app = getApp();
const PHONE = app.globalData.sellPhone;

Page(Object.assign({}, Zan.Toast, {
	data: {
		isLoaded:false,             //数据是否加载完毕
		orderId:0,					//订单的id
		deliveryDate:'',				//配送时间
		orderDate:"",				//下订单时间，由于开发给的是时间戳需要转化为时间格式
		skus:[],						//备注当前订单的sku信息，用于再来一单
		order:{},					//资金列表
	},
	onLoad (options) {
		var orderId = options.orderid || 0; 
		this.setData({
			orderId
		});
		//获取资金账户管理信息
		this.getOrderDetail();
	},
	getOrderDetail (){   //获取用户信息
		var _this = this;
		let { orderId } = this.data;
		//本地获取mock数据
		http.request({
			url: api.orderInfo+"/"+orderId,
			data: {}
		}).then((res) => {
			console.log(res);
			if(res.errorCode == 200){
				_this.setData({
					isLoaded: true,
					order:res.data,
					orderDate:utils.formatDate(new Date(res.data.updatedAt)),
					deliveryDate:utils.formatDate(new Date(res.data.deliveryDate))
				});
				this.setOrderSku();
			}else{
				this.showZanToast(res.moreInfo || "获取数据失败");
			}
		});
	},
	setOrderSku (){				//设置订单sku，用于再来一单
		let {order,skus} = this.data;
		var arr = order.orderItems;
		for(var i in arr){
			skus.push({
				skuId:arr[i].id,
				num:arr[i].quantity
			});
		}
		this.setData({skus});
	},
	oneMoreOrder (){	//再来一单
		let { skus } = this.data;
		http.request({
			url: api.order,
			method:"POST",
			data: {skus}
		}).then((res) => {
			console.log(res);
			if(res.errorCode == 200){
				this.showZanToast("订单成功！");
			}else{
				this.showZanToast(res.moreInfo || "再来一单失败！");
			}
		});
	},
	dial (){			//拨打电话
		wx.makePhoneCall({
			phoneNumber: PHONE
		})
	}
}));
