import http from '../../../public/js/http.js';
import api from '../../../public/js/api.js';
import utils from '../../../public/js/utils.js';
import Zan from '../../../components/zanui/index';
import pay from '../../../public/js/pay_type.js';
let app = new getApp();

Page(Object.assign({}, Zan.Tab, Zan.Toast,{
	data: {
		type:"ORDER",			//BILL表示清单列表，ORDER表示订单列表
		tab: {
			list: pay,
			selectedId: 'ALL',
			scroll: false
		},
		isLoaded:false,             //数据是否加载完毕
		order:[],					//所有订单的列表存放处
		bill:[],					//所有清单列表存放处
		loading:false,				//true加载最新数据的时候显示
		nodata:false,				//true已经没有最新的数据时候显示
		orderpage:0,				//叮当当前页面，点击切换从0页开始
		billpage:0,					//清单当前页
		tabFixed:false,				//设置页面tab是否fiexd定位		
	},
	onLoad (options) {
		this.getUpdateOrder();
		var type = app.globalData.obType;
		this.setData({
			type,
			isLoaded:true
		});
		if(type == 'ORDER'){
			//获取订单信息
			this.getOrderList();
		}else{
			//获取订单信息
			this.getBillList();
		}
	},
	onShow (){
		let type = app.globalData.obType,
			_this = this,
			resh = app.globalData.reShow.orderList;
		if(resh === true){
			this.clearList();
			if(type == 'ORDER'){
				//更新订单信息
				this.getUpdateOrder();
			}else{
				//更新清单信息
				this.getUpdateBill();
			}
			app.globalData.reShow.orderList = false;
		}

		this.setData({
			type
		});

		//点击清单的时候就保存这个formId
		app.formIdsSave();
	},
	onPullDownRefresh (){
		wx.stopPullDownRefresh();
		let {type} = this.data;
		if(type == 'ORDER'){
			//更新订单信息
			this.setData({
				orderpage:0
			});
			this.getOrderList();
		}else{
			//更新清单信息
			this.setData({
				billpage:0
			});
			this.getBillList();
		}
	},
	clearList() {			//清空数据
		this.setData({
			loading:false,
			nodata:false,
			order:[],
			bill:[],
			orderpage:0,
			billpage:0
		});
	},
	changeType (e){			//切换版本是bill还是order
		var type = e.currentTarget.dataset.id;
		app.globalData.obType = type;
		this.setData({
			type
		});
		//表示还没有订单数据
		if(this.data.order.length<=0){
			this.getOrderList();
		}
		//表示还没有清单数据
		if(this.data.bill.length<=0){
			this.getBillList();
		}
		this.reseatData();
	},
	onPageScroll (e){			//页面滚动监听
		this.setData({
			tabFixed:e.scrollTop>50
		});
	},
	onReachBottom (){			//页面滚动到底部触发加载更多order接口
		let {type} = this.data;
		if(type == 'ORDER'){
			this.getMoreOrder();
		}else{
			this.getMoreBill();
		}
	},
	reseatData (){				//重置数据
		this.setData({
			billpage:0
		});
	},

	//order部分
	getOrderList (){
		var _this = this;
		let { tab,orderpage } = this.data;
		var data = tab.selectedId=="ALL"? {} : {status:tab.selectedId};
		data.page = orderpage;
		wx.showLoading();
		//本地获取mock数据
		http.request({
			url: api.orderInfo,
			data,
		}).then((res) => {
			console.log(res);
			wx.hideLoading();
			if(res.errorCode == 200){
				_this.setData({
					isLoaded:true,
					orderpage:orderpage+1,
					order:res.data
				});
				//转换时间
				_this.transformTimeOrder();
			}else{
				_this.showZanToast(res.moreInfo || "获取数据失败");
			}
		});
	},	
	getMoreOrder (){			//获取更多订单
		var _this = this;
		let { loading,order,orderpage,tab,nodata } = this.data;
		if(nodata === true){return false;}
		this.setData({
			loading:true
		});
		http.request({
			url: api.orderInfo,
			data: {
				status:tab.selectedId,
				page:orderpage
			}
		}).then((res) => {
			console.log(res);
			if(res.errorCode == 200){
				_this.setData({
					loading:false,
					nodata:res.data.length<=0,
					orderpage:orderpage+1,		//分页加1
					order:order.concat(res.data)
				});
				//转换时间
				_this.transformTimeOrder();
			}else{
				_this.showZanToast(res.moreInfo || "获取数据失败");
			}
		});
	},
	handleZanTabChange(e) {				//订单下切换分支
		var componentId = e.componentId,
			selectedId = e.selectedId;

		this.setData({
			[`${componentId}.selectedId`]: selectedId,
			orderpage:0
		});
		this.getOrderList();
	},
	getUpdateOrder (){			//获取更新的订单数据
		let _this = this;
		wx.showLoading();
		//本地获取mock数据
		http.request({
			url: api.orderInfo,
			data:{},
		}).then((res) => {
			console.log(res);
			wx.hideLoading();
			if(res.errorCode == 200){
				_this.setData({
					orderpage:1,
					order:res.data
				});
				//转换时间
				_this.transformTimeOrder();
			}else{
				_this.showZanToast(res.moreInfo || "获取数据失败");
			}
		});
	},

	//bill部分
	getBillList (){
		var _this = this;
		let { tab,billpage } = this.data;
		wx.showLoading();
		//本地获取mock数据
		http.request({
			url: api.billInfo,
			data: {
				page:billpage
			}
		}).then((res) => {
			console.log(res);
			wx.hideLoading();
			if(res.errorCode == 200){
				_this.setData({
					isLoaded:true,
					billpage:1,		//分页加1
					bill:res.data
				});
				//转换时间
				_this.transformTimeBill();
			}else{
				_this.showZanToast(res.moreInfo || "获取数据失败");
			}
		});
	},
	getMoreBill (){			//获取更多清单
		var _this = this;
		let { loading,bill,billpage,tab,nodata } = this.data;
		if(nodata === true){return false;}
		this.setData({
			loading:true
		});
		http.request({
			url: api.billInfo,
			data: {
				page:billpage
			}
		}).then((res) => {
			console.log(res);
			if(res.errorCode == 200){
				_this.setData({
					loading:false,
					nodata:res.data.length<=0,
					billpage:billpage+1,		//分页加1
					bill:bill.concat(res.data)
				});
				//转换时间
				_this.transformTimeBill();
			}else{
				_this.showZanToast(res.moreInfo || "获取数据失败");
			}
		});
	},
	getUpdateBill (){			//获取更新的清单数据
		var update = app.globalData.updateBill;
		console.log(update);
		// 从新增的数据中抽出来
		let _this = this,
			{bill} = this.data,
			up = update.data;
		//然后判断type的状态是增加还是删除
		if(update.type == "add"){			//增加该清单
			var newBill = {
				createdAt:up.createdAt,
				expirationDate:up.expirationDate,
				id:up.id,
				name:up.name,
				orderNum:up.orderNum,
				orderTs:[],
				orderType:{					//由购物车创建的清单类型必为OTHER
					friendlyType:"其他",
					id:7,
					type:"OTHER"
				},
				total:up.total
			}
			bill.unshift(newBill);
		}else if(update.type == "remove"){			//删除清单中指定项
			for(var i=0;i<bill.length;i++){
				if(bill[i].id == parseInt(up.id)){
					bill.splice(i,1);
					break;
				}
			}
		}else if(update.type == "update"){
			this.getBillList();
		}
		this.setData({
			bill
		});
		//转换时间
		_this.transformTimeBill();
	},

	//tools区域
	transformTimeOrder (){			//转换时间
		let { order } = this.data;
		var arr = order;
		for(var i in order){
			arr[i].psDate = utils.formatDate(new Date(order[i].deliveryDate));
		}
		this.setData({
			order:arr
		});
	},
	transformTimeBill (){			//转换时间
		let { bill } = this.data;
		var arr = bill;
		for(var i in bill){
			var hour = parseInt(bill[i].expirationDate-Date.parse(new Date()))/(60*60*1000);
			arr[i].psDate = utils.formatDate(new Date(bill[i].createdAt));
			arr[i].surTimeDay = Math.floor(hour/24)>0?Math.floor(hour/24):0;
			arr[i].surTimeHour = Math.floor((hour/24-arr[i].surTimeDay)*24)>0?Math.floor((hour/24-arr[i].surTimeDay)*24):0;
			arr[i].surTimeMinute = Math.floor((hour-arr[i].surTimeHour)*60)>0?Math.floor((hour-arr[i].surTimeHour)*60):0;
		}
		this.setData({
			bill:arr
		});
	},

	//event
	addBill (){					//添加清单商品
		wx.navigateTo({
			url: '../../../pages/shopcart/shopcart'
		})
	},
	confirmOrder (e){   		//确定收货
		var _this = this,
			orderId = e.currentTarget.dataset.id;
		let {order} = this.data;
		wx.showModal({
			title: '提示',
			content: '您确认收货吗？',
			success: function(res) {
				if (res.confirm) {
					wx.showLoading();
					//确定收货操作
					http.request({
						url: api.orderConfirm+'/'+orderId,
						method:"PUT",
						data: {}
					}).then((res) => {
						console.log(res);
						wx.hideLoading();
						if(res.errorCode == 200){
							_this.showZanToast("确认收货成功！");
							//并修改其状态
							for(var i in order){
								if(order[i].id == orderId){
									order[i].status.friendlyType = "已完成";
									order[i].status.type = "FINISHED";
								}
							}
							_this.setData({
								order
							})
						}else{
							_this.showZanToast(res.moreInfo || "确认收货失败！");
						}
					});
				}
			}
		});
	},
	cancelOrder (e){   			//取消订单
		var _this = this,
			orderId = e.currentTarget.dataset.id;
		let {order} = this.data;
		wx.showModal({
			title: '提示',
			content: '您确认取消订单吗？',
			success: function(res) {
				if (res.confirm) {
					wx.showLoading();
					//确定收货操作
					http.request({
						url: api.order+"/"+orderId,
						method:"DELETE",
						data: {}
					}).then((res) => {
						console.log(res);
						wx.hideLoading();
						if(res.errorCode == 200){
							_this.showZanToast("取消订单成功！");
							//并修改其状态
							for(var i in order){
								if(order[i].id == orderId){
									order[i].status.friendlyType = "已取消";
									order[i].status.type = "CANCELLED";
								}
							}
							_this.setData({
								order
							})
						}else{
							_this.showZanToast(res.moreInfo || "取消失败！");
						}
					});
				}
			}
		});
	},
	payNow(e){					//立即付款
		let orderId = e.currentTarget.dataset.id;
		wx.navigateTo({
			url: '../../../pages/pay/pay?orderId='+orderId
		});
	},
	// 路由event
	billHandle (e){    //清单跳转
		const id = parseInt(e.currentTarget.id),
			  type = e.currentTarget.dataset.type,
			  pend = e.currentTarget.dataset.pend;
		var url = "";
		if(type == "TASK"){
			url = pend==0?"../../task/detail/detail?listId=":"../../bill/list/list?listId=";
		}else{
			url = "../../bill/detail/detail?listId=";
		}
		
		//任务清单
		app.handle(function(){
			wx.navigateTo({url:url+id});
		});
	},
	orderHandle (e){
		var id = parseInt(e.currentTarget.id);
		app.handle(function(){
			wx.navigateTo({url:"../detail/detail?orderid="+id});
		});    
	}
}));
