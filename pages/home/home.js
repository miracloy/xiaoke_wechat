import http from '../../public/js/http.js';
import api from '../../public/js/api.js';
import utils from '../../public/js/utils.js';
import ORDER_TYPE from '../../public/js/order_type.js';
import Zan from '../../components/zanui/index';
const app = new getApp();
const SIZE = 10;				//每页显示的数量

Page(Object.assign({}, Zan.Tab, Zan.Toast, {
	data: {
		isLoaded: false,             	//数据是否加载完毕
		tabs: {							// tabs
			list: [],
			selectedId: "1",
			height: "90rpx",
			scroll: true,
			fiexd: true
		},
		hlist: [],					// 当前对应的推荐产品列表
		allList: [],					// 所有的tabs下的列表
		loading: true,				//true加载最新数据的时候显示
		nodata: false,				//true已经没有最新的数据时候显示
		tabFixed: true,				//设置页面tab是否fiexd定位
	},
	onLoad (options) {
	},
	onShow () {
		// var _this = this,
		// 	resh = app.globalData.reShow.home;
		// if(resh === true){
		// 	//重新加载数据
		// 	_this.setData({
		// 		order:[],
		// 		bill:[],
		// 		homeList:[]
		// 	});
		// 	//获取当前周
		// 	_this.getActiveDate(null,function(){
		// 		//先获取一周时间段的所有订单列表，获取完毕之后再获取一周时间段的所有清单列表
		// 		_this.getOrderList();
		// 		// 获取banner信息
		// 		_this.getBanner();
		// 		// 获取插屏广告
		// 		_this.getAppId();
		// 		app.globalData.reShow.home = false;
		// 	});
		// }
		this.getTabs().then(() => {
			this.setData({
				isLoaded: true
			}, () => {
				// 请求对应的推荐列表
				this.getHList();
			});
		});
	},
	// 下滑到底部触发
	onReachBottom () {
		let { nodata } = this.data;
		if (nodata === true) { return false; }
		this.getHList();
	},
	// 页面滚动监听
	onPageScroll (e) {
		this.setData({
			//tabFixed:e.scrollTop>50
		});
	},
	// 推荐分类点击切换
	handleZanTabChange (e) {
		const componentId = e.componentId,
			selectedId = e.selectedId,
			{ tabs, allList } = this.data,
			list = this.getCurList(allList, selectedId)[0].list;
		if (selectedId == tabs.selectedId) { return false; }
		this.setData({
			[`${componentId}.selectedId`]: selectedId
		});
		// 先判断当前列表有没有数据，如果有就不用再去请求数据了
		if (list.length <= 0) {
			this.setData({ nodata: false });
		}
		this.getHList();
	},
	// 先获取分类
	getTabs () {
		return new Promise((resolve, reject) => {
			wx.showLoading();
			http.request({
				url: api.banner,
				data: {
					type: 3					//获取banner和插屏
				}
			}).then((res) => {
				const d = res.data;
				if (res.errorCode == 200) {
					this.setData({
						[`tabs.list`]: d,
						allList: this.setAllList(d)
					});

					let tabs = this.data.tabs
					let isSelectedId = tabs.list.some(e => {
						console.info(e.id, tabs.selectedId, e.id == tabs.selectedId)
						if (e.id == tabs.selectedId) {
							this.setData({ [`tabs.selectedId`]: tabs.selectedId })
							return true
						} else {
							return false
						}
					})
					isSelectedId ? '' : this.setData({ [`tabs.selectedId`]: tabs.list[0].id })
					wx.hideLoading();
					resolve();
				} else {
					reject();
					this.showZanToast(res.moreInfo || "获取数据失败");
				}
			});
		});
	},
	// 设置tabs宽度
	setTabsWidth () {

	},
	// 实例化所有的tabs对应的列表数据
	setAllList (arr) {
		let { allList } = this.data;
		arr.forEach(e => {
			let obj = {
				"list": [],
				"id": e.id,
				"page": 0
			};
			allList.push(obj);
		});
		return allList;
	},
	// 获取当前列表是哪一个
	getCurList (arr, id) {
		return arr.filter(e => {
			return e.id == id;
		});
	},
	// 获取对应的推荐产品列表
	getHList () {
		const { tabs, hlist, allList } = this.data,
			selectedId = tabs.selectedId,
			page = this.getCurList(allList, selectedId)[0].page;
		this.setData({
			hlist: this.getCurList(allList, selectedId)[0].list,
		});
		this.setData({ loading: true });
		http.request({
			url: api.recommendList,
			data: {
				page,
				size: SIZE,
				id: selectedId
			}
		}).then((res) => {
			if (res.errorCode == 200) {
				const d = res.data;
				this.setData({
					allList: this.recombineList(allList, d, selectedId),
					hlist: this.getCurList(this.data.allList, selectedId)[0].list,
					nodata: d.length <= 0,
					loading: false
				});
			} else {
				this.showZanToast(res.moreInfo || "获取数据失败");
			}
		});
	},
	// 重组allList列表
	recombineList (arr, d, id) {
		for (let i in arr) {
			if (arr[i].id === id) {
				arr[i].list = arr[i].list.concat(d);
				arr[i].page = arr[i].page + 1;
				break;
			}
		}
		return arr;
	},
	// 跳转到推荐的详情页
	handleArtDetail (e) {
		const id = e.currentTarget.id;
		app.handle(function () {
			wx.navigateTo({ url: "../../pages/article/detail/detail?id=" + id });
		});
	}
}));