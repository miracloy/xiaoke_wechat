import http from 'public/js/http.js';
import api from 'public/js/api.js';

App({
	onLaunch (){

	},
	globalData: {
		userInfo: null,
		// 全局的sessionId
		sessionId: wx.getStorageSync('sessionId') || null,
		//商户电话
		sellPhone:"0571-87153839",
		//存储所有购物车的返回信息数据
		shopcart:{},
		// 订单、清单列表页面判断是清单还是订单
		obType:"ORDER",
		// 控制每个页面是否需要重新刷新数据的开关
		reShow:{
			home:false,
			orderList:false,
			task:false
		},
		// 暂存需要更新的清单的数据
		updateBill:{},
		//  存储所有的formId
		globalFormIds:[],
		// 记录选择收货地址操作的来源
		chooseAddressType:"",
		// 当前选中的地址
		activeAddress:"",
		// 选中的商品
		chooseSource:{
			MODE:null,
			billId:null
		}
	},
	handle (callback){
		var _this = this;
		if(_this.press) return;
        _this.press=true;
		setTimeout(function(){_this.press=false},1000);
		if(callback){callback();}
	},
	formIdSubmit: function (formId) {
		let fid = formId;
		let fids = this.globalData.globalFormIds
		if(!fids)fids = []
		let data = fid+ '@@' + (new Date().getTime()+ 604800000) // ms
		fids.push(data)
		this.globalData.globalFormIds = fids;
	},
	formIdsSave: function() {
		let fids = this.globalData.globalFormIds
		if (!fids || fids.length<=0){return;}
		http.request({
			url: api.formIdsSave,
			method: 'POST',
			data: {
				formIds:fids
			}
		}).then((res) => {
			if (res.errorCode == 200) {
				this.globalData.globalFormIds = [];
			}
		});
	},
	clearCache() {					//清除本地缓存
		//清除本地localStorage
		try {  
			wx.clearStorage();
			wx.clearStorageSync();
		} catch(e) {  
		  // Do something when catch error  
		} 
		// 重置globalData
		this.globalData ={
			userInfo: null,
			sessionId: null,
			sellPhone:"0571-87153839",
			shopcart:{},
			obType:"ORDER",
			reShow:{
				home:true,
				orderList:true,
				task:true
			},
			updateBill:{},
			globalFormIds:[],
			chooseAddressType:"",
			activeAddress:"",
			chooseSource:{
				MODE:null,
				billId:null
			}
		}
	}
});