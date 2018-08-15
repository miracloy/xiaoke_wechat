import http from '../../../public/js/http.js';
import api from '../../../public/js/api.js';
import utils from '../../../public/js/utils.js';
import Zan from '../../../components/zanui/index.js';
let app = new getApp();

Page(Object.assign({}, Zan.Toast, {
	data: {
		isLoaded:false,             //数据是否加载完毕
		isDefault:false,			//当前地址是否为默认地址
		name:"",
		phonePrimary:"",
		address:{					//省市地
			stateProvinceRegion:"",
			city:"",
			county:"",
		},
		addressLine:"",					
		region: [],
		customItem:"不限"
	},
	onLoad (options) {
		this.setData({
			isLoaded:true
		});
	},
	bindRegionChange (e){			//修改收货地址
		this.setData({
			region: e.detail.value
		});
		this.setRegion();
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
	setDefault (){				//设为默认地址
		let {isDefault} = this.data;
		isDefault = !isDefault;
		this.setData({
			isDefault
		});
	},
	addAddress (e){			//新增收货地址，添加form标记	
		let { address,isDefault,phonePrimary,name,addressLine } = this.data,
			_this = this;
		try {
			if (trim(name).length == 0) {
			  throw new Error('请填写收货人！');
			}
			if (trim(phonePrimary).length == 0 || trim(phonePrimary).length != 11) {
			  throw new Error('联系方式为11位！');
			}
			if(utils.textTel(phonePrimary) ===  false){
				throw new Error('手机号码格式不正确！');
			}
			if (address.stateProvinceRegion == "不限" || address.city == "不限" || address.county == "不限") {
				throw new Error('请选择正确选择区域！');
			  }
			if (trim(addressLine).length == 0) {
			  throw new Error('请填写详细地址！');
			}
		  } catch (e) {
			  return _this.showZanToast(e.message);
		}
		
		//提交formId
		var formId = e.detail.formId;
		if(formId) app.formIdSubmit(formId);
		
		wx.showLoading();
		//本地获取mock数据
		http.request({
			url: api.address,
			method:"POST",
			data: {
				name:name,
				stateProvinceRegion:address.stateProvinceRegion,
				city:address.city,
				county:address.county,
				phonePrimary:phonePrimary,
				addressLine:addressLine,
				isDefault:isDefault
			}
		}).then((res) => {
			wx.hideLoading();
			if(res.errorCode == 200){		//修改成功
				wx.showToast({
					title: "新增成功！",
					icon: "success",
				});
				setTimeout(function(){
					_this.route(res.data);
				},1500);
			}else{
				this.showZanToast(res.moreInfo || "新增地址失败！");
			}
		});
	},
	route(newAddress){			//新增地址成功之后的路由
		// 跳转到下任务页面
		var type = app.globalData.chooseAddressType;     //判断是否是从task或者checkout过来的

		if(!type){
			//新增成功之后返回收货地址列表页面
			wx.navigateTo({
				url:"../../address/list/list"
			});
		}else{
			let pages = getCurrentPages(),
				targetPage = pages[pages.length-3];
			if(targetPage.setAddress){
				targetPage.setAddress(newAddress);
			}
			app.handle(function(){
				var delta = type=="task"?3:2;
				wx.navigateBack({
					delta
				});
			});
		}
	},
	//event
	nameInput (e){
		this.setData({
			name: e.detail.value
		});
	},
	phoneInput (e){
		this.setData({
			phonePrimary: e.detail.value
		});
	},
	textareaInput (e){
		this.setData({
			addressLine: e.detail.value
		});
	},
}));

function trim(str){
	return str.replace(/(^\s*)|(\s*$)/g, "");
}
