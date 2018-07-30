import http from '../../../public/js/http.js';
import api from '../../../public/js/api.js';
import utils from '../../../public/js/utils.js';
import Zan from '../../../components/zanui/index.js';

Page(Object.assign({}, Zan.Toast, {
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
			url: api.cyclepayInfo,
			data: {}
		}).then((res) => {
			console.log(res);
			//本地mock数据
			if(res.errorCode == 200){
				_this.setData({
					isLoaded: true,
					capitalList:res.data
				});
				_this.setItemDate();
			}else{
				_this.showZanToast(res.moreInfo || "获取数据失败");
			}
		});
	},
	setItemDate (){			//设置每个数据的具体时间
		let {capitalList} = this.data;
		for(var i in capitalList){
			var m = utils.formatDate(new Date(capitalList[i].createdAt),"MM");
			var d = utils.formatDate(new Date(capitalList[i].createdAt),"DD");
			capitalList[i].date = parseInt(m)+"月"+parseInt(d)+"日";
		}
		this.setData({
			capitalList
		});
	}
}));
