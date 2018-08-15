import http from '../../../public/js/http.js';
import api from '../../../public/js/api.js';
import utils from '../../../public/js/utils.js';
import Zan from '../../../components/zanui/index.js';
var app = getApp();

Page(Object.assign({}, Zan.Toast, {
	data: {
		isLoaded:false,             //数据是否加载完毕
		eList:[],					//所有页面列表数据存放处
		activeId:0,					//默认地址id
		activeAddress:{},			//当前默认的地址对象
	},
	onLoad (options) {
		this.getAddressList();
	},
	getAddressList (){
		var _this = this;
		wx.showLoading();
		//本地获取mock数据
		http.request({
			url: api.address,
			data: {}
		}).then((res) => {
			console.log(res);
			wx.hideLoading();
			if(res.errorCode == 200){
				_this.setData({
					isLoaded:true,
					eList:res.data
				});
			}else{
				_this.showZanToast(res.moreInfo || "获取数据失败");
			}
		});
	},
	chooseAdd (e){					//下订单前选择收货地址
		var id = e.currentTarget.id,activeAddress={};
		let {eList} = this.data;
		for(var i in eList){
			if(eList[i].id == id){
				activeAddress = eList[i];
			}
		}
		//将当前选中的收货地址存储到app中
		app.globalData.activeAddress = activeAddress;
		wx.navigateBack({
			delta:1
		});
	},
	manageAddress(){				//管理收货地址
		app.handle(function(){
			wx.navigateTo({url:"../../address/add/add"});
		});
	}
}));
