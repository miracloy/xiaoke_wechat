import http from '../../public/js/http.js';
import api from '../../public/js/api.js';
import Zan from '../../components/zanui/index';

Page(Object.assign({}, Zan.Toast, {
	data: {
		isLoaded:false,             //数据是否加载完毕
		billId:0,					//当前清单id
		codePath:"",				//二维码地址
	},
	onLoad (options) {
		let {billId} = this.data;
		if(options.scene!=undefined&&options.scene!=''){
            var _dd=decodeURIComponent(options.scene);
            var arr=_dd.split('&');
            billId=arr[0];
        }else{
            billId= options.billId || 0;
        }
        this.setData({
            billId,
        });
	},
	onShow (){
		//获取公司信息
		this.getQRCode();
	},
	getQRCode (){   //获取二维码图片
		let {billId} = this.data;
		//本地获取mock数据
		http.request({
			url: api.code+'/'+billId,
			data: {}
		}).then((res) => {
			//本地mock数据
			if(res.errorCode == 200){
				this.setData({
					isLoaded: true,
					codePath:res.data
				});
			}else{
				this.showZanToast(res.moreInfo || "获取数据失败");
			}
		});
	},
	backHome (){
		wx.switchTab({
			url:"../../pages/home/home"
		})
	}
}));
