import http from '../../../public/js/http.js';
import api from '../../../public/js/api.js';
import Zan from '../../../components/zanui/index.js';
const app = getApp();
const pageSize = 10;				//每页显示的数量

Page(Object.assign({}, Zan.Toast, {
	data: {
		isLoaded:false,             // 数据是否加载完毕
		loading:false,				// 为true时表示正在刷新，并显示正在刷新ui
		nodata:false,				// 为true表示数据已经加载完毕
		page:0,						// 当前文章的分页
		artList:[],					// 文章列表
	},
	onLoad (options) {
		// 获取文章列表
		let { page } = this.data;
		this.getArticle(page);
	},
	onShow() {

	},
	onReachBottom() {					//探底刷新
		let { nodata } = this.data;
		if(nodata === true){return false;}
		this.getMoreArts();
	},
	getArticle(page){						// 获取文章信息
		let { artList } = this.data;
		wx.showLoading();
		http.request({
			url: api.artList,
			data: {
				page,
				size:pageSize
			}
		}).then((res) => {
			console.log(res);
			wx.hideLoading();
			if(res.errorCode == 200){
				if(page === 0){
					this.setData({
						isLoaded: true,
						artList:res.data,
						page:page+1
					});
				}else{
					this.setData({
						artList:artList.concat(res.data),
						page:page+1,
						nodata:res.data.length<=0,
						loading:false
					});
				}
			}else{
				this.showZanToast(res.moreInfo || "获取数据失败");
			}
		});
	},
	handleArtDetail(e) {				// 点击前往文章详细
		app.handle(()=>{
			const artId = e.currentTarget.id;
			wx.navigateTo({url:"../detail/detail?id="+artId});
		});
	},
	getMoreArts (){				//加载更多数据
		let _this= this,{ loading,artList,page } = this.data;
		if(loading === true){return false;}
		this.setData({
			loading:true
		});
		this.getArticle(page);
	},
}));
