import http from '../../../public/js/http.js';
import api from '../../../public/js/api.js';
import Zan from '../../../components/zanui/index.js';
import WxParse from '../../../components/wxParse/wxParse.js';
const app = getApp();

Page(Object.assign({}, Zan.Toast, WxParse, {
	data: {
		isLoaded: false,             // 数据是否加载完毕
		artId: 0,					// 文章id
		content: '',					// 文章内容
		title: '',					// 文章标题
		goods: [],					// 推荐商品
	},
	onLoad (options) {
		var artId = options.id || 0;
		this.setData({
			artId
		});
		// 获取文章详情
		this.getArtDetail(artId);
	},
	getArtDetail (id) {   //获取用户信息
		let _this = this;
		wx.showLoading();
		http.request({
			url: api.banner + "/" + id,
			data: {}
		}).then((res) => {
			wx.hideLoading();
			if (res.errorCode == 200) {
				this.setData({
					isLoaded: true,
					title: res.data.name,
					goods: res.data.skuGroups
				});
				// 除去code标签引起的bug
				let content = res.data.content.replace(/<\/?code>/g, '')
				this.setDetail(content);
			} else {
				_this.showZanToast(res.moreInfo || "获取数据失败");
			}
		});
	},
	setDetail (content) {
		let article = content, that = this;
		WxParse.wxParse('article', 'html', article, that, 5);
	},
	orderNow () {			//立即下单
		let { goods } = this.data, _this = this;
		let modifyArr = [];
		for (var i in goods) {
			modifyArr.push({
				skuId: goods[i].id,
				num: goods[i].quantity
			})
		}
		// 数据转化格式，然后提交 
		let keys = [];
		let values = [];
		modifyArr.forEach((item, index) => {
			keys.push(`skus[${index}].skuId`, `skus[${index}].num`);
			values.push(item.skuId, item.num);
		});
		let skus = {};
		keys.forEach((item, index) => {
			skus[item] = values[index];
		});
		//创建下单
		http.request({
			url: api.billInfo,
			method: "POST",
			data: {
				...skus
			}
		}).then((res) => {
			console.log(res);
			if (res.errorCode == 200) {
				// _this.showZanToast("下单成功！");
				// 跳转到清单列表
				// app.globalData.reShow.billList = true;
				// app.globalData.obType = "BILL";
				//checkout通过之后跳转到订单列表
				setTimeout(function () {
					wx.navigateTo({
						url: '../../../pages/bill/detail/detail?listId=' + res.data.id,
					});
				}, 0);
			} else {
				_this.showZanToast(res.moreInfo || "获取数据失败");
			}
		});
	},

}));
