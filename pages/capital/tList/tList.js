import http from '../../../public/js/http.js';
import api from '../../../public/js/api.js';

Page({
	data: {
		isLoaded:false,             //数据是否加载完毕
		capitalId:0,				//资金id
		capitalList:[],				//资金列表
	},
	onLoad (options) {
		var id = options.uid || 0;
		this.setData({
			capitalId:id
		});
		//获取资金账户管理信息
		this.getCapitalInfo();
	},
	getCapitalInfo (){   //获取用户信息
		var _this = this;
		//本地获取mock数据
		http.request({
			url: api.userInfo,
			data: {}
		}).then((res) => {
			//本地mock数据
			res = {
				"data":{
					"list":[
						{"id":1,"date":"10月","money":"1700.00"},
						{"id":2,"date":"9月","money":"1100.00"},
						{"id":3,"date":"8月","money":"2100.00"},
						{"id":4,"date":"7月","money":"3100.00"},
						{"id":5,"date":"6月","money":"4100.00"},
						{"id":6,"date":"4月","money":"5100.00"},
						{"id":7,"date":"3月","money":"6100.00"}
					]
				},
				errorCode:200
			}
			if(res.errorCode == 200){
				_this.setData({
					isLoaded: true,
					capitalList:res.data.list
				});
			}else{
				wx.showToast({
					title: res.moreInfo || "获取数据失败",
					image: "../../../images/close-circled.png",
				});
			}
		});
	},
});
