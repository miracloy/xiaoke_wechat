import http from '../../../public/js/http.js';
import api from '../../../public/js/api.js';
import utils from '../../../public/js/utils.js';
import Zan from '../../../components/zanui/index.js';
const app = new getApp();

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
				this.showZanToast(res.moreInfo || "获取数据失败");
			}
		});
	},
	setDefalutAddress (e){			//设置默认地址
		let {eList} = this.data;
		var _this=this,
			id = e.currentTarget.dataset.id,
			arr = eList,
			activeAddress={};
		for(var i in arr){
			if(arr[i].id == id){ 		//发现了该条数据
				activeAddress = arr[i];
				if(arr[i].default === true){
					return false;
				}
			}
			arr[i].default = arr[i].id == id;
		}
		this.setData({
			eList:arr,
			activeId:id,
			activeAddress
		});
		//每次点击之后修改收货地址
		this.reviseAddress();
	},
	reviseAddress (){			//修改收货地址
		let { activeId,activeAddress } = this.data;
		var _this = this;
		wx.showLoading();
		//本地获取mock数据
		http.request({
			url: api.address+"/"+activeId,
			method:"PUT",
			data: {
				name:activeAddress.fullName,
				stateProvinceRegion:activeAddress.stateProvinceRegion,
				city:activeAddress.city,
				county:activeAddress.county,
				phonePrimary:activeAddress.phonePrimary,
				addressLine:activeAddress.addressLine,
				isDefault:activeAddress.default
			}
		}).then((res) => {
			wx.hideLoading();
			if(res.errorCode !== 200){		//修改不成功
				_this.showZanToast(res.moreInfo || "获取数据失败");
			}
		});
	},
	delAddress (e){				//删除收货地址
		let {eList} = this.data;
		var _this=this,
			addressId = e.currentTarget.dataset.id;
		wx.showModal({
			title: '提示',
			content: '确定删除该收货地址吗？',
			success: function(res) {
				if (res.confirm) {
					wx.showLoading();
					http.request({
						url: api.address+"/"+addressId,
						method:"DELETE",
						data: {}
					}).then((res) => {
						console.log(res);
						wx.hideLoading();
						if(res.errorCode == 200){		//删除成功
							for(var i in eList){
								if(eList[i].id == addressId){
									eList.splice(i, 1);
									break;
								}
							}
							_this.setData({
								eList
							});
						}else{
							_this.showZanToast(res.moreInfo || "删除失败！");
						}
					});
				} 
			}
		});
	},
	backAddress(e){
		let {eList} = this.data,
			index = e.currentTarget.id;
			
		// 跳转到下任务页面
		var pages = getCurrentPages(),
			type = app.globalData.chooseAddressType,					//获取最开始选择的页面是哪张
			targetPage = "",
			targetUrl = type=="task"?"pages/task/task/task":"pages/order/checkout/checkout",
			targetId = 0;
		for(var i in pages){
			if(pages[i].route == targetUrl){
				targetPage = pages[i];
				targetId = i;
			}
		}
		if(targetPage.setAddress){
			targetPage.setAddress(eList[index]);
		}

		app.handle(function(){
			if(type=="task"){
				wx.switchTab({url:"../../../pages/task/task/task"});
			}else{
				wx.navigateTo({url:"../../../pages/order/checkout/checkout"});
			}
		});
	}
}));
