import http from '../../../public/js/http.js';
import api from '../../../public/js/api.js';
import utils from '../../../public/js/utils.js';
import Zan from '../../../components/zanui/index.js';
const app = new getApp();

Page(Object.assign({}, Zan.Toast, {
	data: {
		isLoaded:false,             //数据是否加载完毕
		addressId:0,				//当前收货地址id
		address:{},					//当前收货地址对象
		region: [],
		customItem:"不限"
	},
	onLoad (options) {
		var addressId = parseInt(options.addressId) || 7;
		this.setData({
			addressId
		});
		this.getAddress();
	},
	bindRegionChange (e){		
		this.setData({
			region: e.detail.value
		});
		this.setRegion();
	},
	getAddress (){
		let { addressId } = this.data;
		var _this = this;
		wx.showLoading();
		//本地获取mock数据
		http.request({
			url: api.address+"/"+addressId,
			data: {}
		}).then((res) => {
			wx.hideLoading();
			if(res.errorCode == 200){
				_this.setData({
					isLoaded:true,
					address:res.data
				});
				//筛选地址
				_this.getRegion();
			}else{
				this.showZanToast(res.moreInfo || "获取数据失败！");
			}
		});
	},
	getRegion (){				//获取region数据
		let {address} = this.data;
		var arr = [];
		arr.push(address.stateProvinceRegion,address.city,address.county);
		this.setData({
			region:arr
		});
	},
	setRegion (){				//设置region数据	
		let {region,address} = this.data;
		address.stateProvinceRegion = region[0];
		address.city = region[1];
		address.county = region[2]
		this.setData({
			address
		});
	},
	delAddress (){				//删除收货地址
		let {address} = this.data;
		var _this=this,
			addressId = address.id;
		wx.showModal({
			title: '提示',
			content: '确定删除该收货地址吗？',
			success: function(res) {
				if (res.confirm) {
					//提交formId
					var formId = e.detail.formId;
					if(formId) app.formIdSubmit(formId);
					wx.showLoading();
					http.request({
						url: api.address+"/"+addressId,
						method:"DELETE",
						data: {}
					}).then((res) => {
						console.log(res);
						wx.hideLoading();
						if(res.errorCode == 200){		//删除成功，跳转到收货地址列表
							wx.navigateTo({
								url:"../../address/list/list"
							});
						}else{
							this.showZanToast(res.moreInfo || "删除失败！");
						}
					});
				} 
			}
		});
	},
	reviseAddress (e){			//修改收货地址
		let { addressId,address } = this.data,
			_this = this,
			val = e.detail.value;
		
		var obj = {
			name:val.fullName,
			stateProvinceRegion:address.stateProvinceRegion,
			city:address.city,
			county:address.county,
			phonePrimary:val.phonePrimary,
			addressLine:val.addressLine,
			isDefault:address.default
		};
		
		try {
			if (trim(obj.name).length == 0) {
			  	throw new Error('请填写姓名！');
			}
			if (trim(obj.phonePrimary).length !==11) {
				throw new Error('联系方式为11位！');
			}
			if (obj.stateProvinceRegion == "不限" || obj.city == "不限" || obj.county == "不限") {
				throw new Error('请选择正确选择区域！');
			}
			if (trim(obj.addressLine).length == 0) {
			  	throw new Error('请填写详细地址！');
			}
		} catch (e) {
			return _this.showZanToast(e.message);
		}
		//提交formId
		var formId = e.detail.formId;
		if(formId) app.formIdSubmit(formId);
		
		wx.showLoading();
		http.request({
			url: api.address+"/"+addressId,
			method:"PUT",
			data: obj
		}).then((res) => {
			wx.hideLoading();
			if(res.errorCode == 200){		//修改成功
				wx.showToast({
					title: "修改成功！",
					icon: "success",
				});
				setTimeout(function(){
					wx.navigateTo({
						url:"../../address/list/list"
					});
				},1500);
			}else{
				_this.showZanToast(res.moreInfo || "新增地址失败！");
			}
		});
	},
}));

function trim(str){
	return str.replace(/(^\s*)|(\s*$)/g, "");
}