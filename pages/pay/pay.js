import http from '../../public/js/http.js';
import api from '../../public/js/api.js';
import Zan from '../../components/zanui/index.js';
var app = getApp();

Page(Object.assign({}, Zan.Toast, {
	data: {
		isLoaded:false,             //数据是否加载完毕
		orderId:0,					// 订单id
		payList:[],					// 支付方式
	},
	onLoad (options) {
		this.setData({
			orderId:options.orderId || 0
		});
		this.getPayList();
	},
	getPayList(){					// 获取支付方式	
		wx.showLoading();
		let {orderId} = this.data;
		http.request({
			url: api.pay+"/"+orderId,
			data: {}
		}).then((res) => {
			console.log(res);
			wx.hideLoading();
			if(res.errorCode == 200){
				this.setData({
					isLoaded: true,
					payList:res.data
				});
				// 丰富一些数据
				this.enrichData();
			}else{
				this.showZanToast(res.moreInfo || "获取数据失败");
			}
		});
	},
	enrichData(){					// 丰富数据
		let { payList } = this.data;
		for(var i in payList){
			payList[i].checked = i==0?true:false;
			payList[i].payImg = this.choosePay(payList[i].type);
		}
		this.setData({
			payList
		});
	},
	choosePay(type){			//选择支付方式
		switch(type){
			case "WXPAY_GATEWAY":
				return "../../images/pay_wx.png";
			case "CASH_GATEWAY":
				return "../../images/pay_xj.png";
			case "CYCLE_GATEWAY":
				return "../../images/pay_default.png";
			default:
				return "../../images/pay_default.png";
		}
	},
	payChange(){
		let { payList } = this.data;
		for(var i in payList){
			payList[i].checked = !payList[i].checked;
		}
	},
	//handle
	payHandle (){
		let { payList } = this.data;
		app.handle(() =>{
			// 开始支付
			for(var i in payList){
				if(payList[i].checked ===  true){
					this.payProcess(payList[i].type);
					break;
				}
			};
		});
	},
	payProcess (type){							//支付流程
		//支付的时候需要判断该用户是不是游客，如果是则返回false
		let {orderId} = this.data,_this = this,supple={};
		const role = wx.getStorageSync('userRole');
		// 如果是访客并且是账期支付的情况下返回false
		if(role === 'VISITOR' && type === 'CYCLE_GATEWAY'){
			this.showZanToast("对不起，游客无法使用账期支付！请重新选择支付方式！");
			return false;
		}
		if(type === 'WXPAY_GATEWAY'){
			supple = {trade_type:"JSAPI"};
		}
		//结算数据提交
		http.request({
			url: api.pay+"/"+orderId,
			method:"PUT",
			data: {
				type,
				...supple
			}
		}).then((res) => {
			console.log(res);
			if(res.errorCode == 200){
				if(type === 'WXPAY_GATEWAY'){
					this.wxPayedRouter(res.data);
				}else{
					this.otherPayedRoute(true);
				}	
			}else{
				_this.showZanToast(res.moreInfo || "订单结算失败！");
				// 跳转到订单列表
				_this.otherPayedRoute(false);
			}
		});
	},
	// 现金和账期支付
	otherPayedRoute(bool) {
		if(bool === true){
			this.showZanToast("恭喜，支付成功！");
		}
		//结算成功之后保存formId
		app.formIdsSave();
		app.globalData.reShow.orderList = true;
		app.globalData.obType = "ORDER";
		//checkout通过之后跳转到订单列表
		setTimeout(function(){
			wx.switchTab({
				url:'../../pages/order/list/list',
			});
		},1500);	
	},
	// 微信支付
	wxPayedRouter(obj) {					// 调用微信支付接口
		const _this = this;
		wx.requestPayment({
			'appId':obj.appId,
			'timeStamp': obj.timeStamp,
			'nonceStr': obj.nonceStr,
			'package': obj.packageValue,
			'signType': obj.signType,
			'paySign': obj.paySign,
			'success':function(res){				//支付成功跳转到订单列表页面
				_this.otherPayedRoute(true);
			},
			'fail':function(res){					// 支付失败，提示
				_this.showZanToast("支付失败！");
			}
		});
	}
}));
