import http from '../../public/js/http.js';
import api from '../../public/js/api.js';
import Zan from '../../components/zanui/index.js';

Page(Object.assign({}, Zan.Toast, {
	data: {
		isLoaded:false,             //数据是否加载完毕
		userId:0,					//用户id
		componyInfo:{},				//公司信息
	},
	onLoad (options) {
		var userId = options.userId || 0;
		this.setData({
			userId
		});
		//获取公司信息
		this.getCompanyInfo();
	},
	getCompanyInfo (){   //获取用户信息
		//本地获取mock数据
		http.request({
			url: api.userInfo,
			data: {}
		}).then((res) => {
			console.log(res);
			if(res.errorCode == 200){
				this.setData({
					isLoaded: true,
					componyInfo:res.data
				});
			}else{
				_this.showZanToast(res.moreInfo || "获取数据失败");
			}
		});
	},
}));
