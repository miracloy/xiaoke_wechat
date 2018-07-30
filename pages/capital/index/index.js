import http from '../../../public/js/http.js';
import api from '../../../public/js/api.js';
import utils from '../../../public/js/utils.js';
import Zan_Toast from '../../../components/zanui/toast/index.js';

Page(Object.assign({}, Zan_Toast, {
	data: {
		isLoaded:false,             //数据是否加载完毕
		companyName:"",				//公司名称
		settleTs:'',				//结算截止日期
		accountTs:'',				//对账截止日期
		capitalInfo:{},				//公司信息
	},
	onLoad (options) {
		var companyName = options.company;
		this.setData({
			companyName
		});
		//获取资金账户管理信息
		this.getCapitalInfo();
	},
	getCapitalInfo (){   //获取用户信息
		var _this=this;
		//本地获取mock数据
		http.request({
			url: api.cyclepay,
			data: {}
		}).then((res) => {
			console.log(res);
			if(res.errorCode == 200){
				this.setData({
					isLoaded: true,
					capitalInfo:res.data,
					settleTs:utils.formatDate(new Date(res.data.settleTs),"YYYY-MM-DD"),
					accountTs:utils.formatDate(new Date(res.data.accountTs),"YYYY-MM-DD")
				});
			}else{
				_this.showZanToast(res.moreInfo || "获取数据失败");
			}
		});
	},
}));
