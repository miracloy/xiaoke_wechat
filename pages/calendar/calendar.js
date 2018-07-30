import http from '../../public/js/http.js';
import api from '../../public/js/api.js';
import utils from '../../public/js/utils.js';
import ORDER_TYPE from '../../public/js/order_type.js';
import Zan from '../../components/zanui/index';
const app = new getApp();

Page(Object.assign({}, Zan.Tab, Zan.Toast,{
	data: {
		isLoaded:false,             	//数据是否加载完毕
		curDay:0,						//当前天的时间戳
		startTs:0,						//开始时间
		endTs:0,						//结束时间
		order_type:ORDER_TYPE,			//订单分类
		weekDays:['日','一','二','三','四','五','六'],						//周几
		weekDate:[],					//日期
		weekDay:[],						//日期对应的天
		curYM:"",						//当前年月
		curWeekNum:"",					//当前是第几周
		order:[],						//所有的订单列表
		bill:[],						//所有的清单列表
		homeList:[],					//首页的数据集合
		popOn:false,					//是否显示弹窗
		adPopOn:false,					//是否显示广告
		canRefresh:false,				//广告插屏幕关闭显示与否，false的时候为关闭，则不可下拉刷新
		tab: {
			list: [
				{id:'BILL',title:'当日清单'},
				{id:'ORDER',title:'当日订单'}
			],
			selectedId:'BILL',
			scroll:false
		},
		openOB:{},						//当前打开的弹窗的清单和订单
		loadOn:true,					//加载开关

		// banner部分
		bannerImgUrls: [],
		indicatorDots: true,
		autoplay: true,
		interval: 5000,
		duration: 1000,
	},
	onLoad (options) {
		var _this = this;
		//获取当前周
		_this.getActiveDate(null,function(){
			//先获取一周时间段的所有订单列表，获取完毕之后再获取一周时间段的所有清单列表
			_this.getOrderList();
		});
	},
	onShow (){
		var _this = this,
			resh = app.globalData.reShow.home;
		if(resh === true){
			//重新加载数据
			_this.setData({
				order:[],
				bill:[],
				homeList:[]
			});
			//获取当前周
			_this.getActiveDate(null,function(){
				//先获取一周时间段的所有订单列表，获取完毕之后再获取一周时间段的所有清单列表
				_this.getOrderList();
				app.globalData.reShow.home = false;
			});
		}
	},
	onPullDownRefresh (){
		// let {canRefresh} = this.data;
		// if(canRefresh === false){return false;}	
		wx.stopPullDownRefresh();
		const _this = this;
		//执行刷新操作的时候先清空清单订单列表
		_this.setData({
			order:[],
			bill:[],
			homeList:[],
			popOn:false
		})
		//获取当前周
		_this.getActiveDate(null,function(){
			//先获取一周时间段的所有订单列表，获取完毕之后再获取一周时间段的所有清单列表
			_this.getOrderList();
		});
	},
	handleToRemmend(e){
		let { bannerImgUrls } = this.data;
		const id = e.currentTarget.id;
		app.handle(()=>{
			wx.navigateTo({url:"../../pages/article/detail/detail?id="+id});
		});
	},
	otherWeek (e){			//上一周
		var arrow = e.currentTarget.dataset.arrow;
		let {curDay,loadOn} = this.data;
		var _this = this;
		var prevDay = 0;
		if(arrow=="prev"){
			prevDay = new Date(curDay.getTime() - 7*24*3600*1000);
		}else{
			prevDay = new Date(curDay.getTime() + 7*24*3600*1000);
		}
		//if(loadOn === false || prevDay>=new Date()){return false;}
		this.setData({
			curDay:prevDay,
			homeList:[],
			loadOn:false
		});
		//获取当前周
		this.getActiveDate(prevDay,function(){
			wx.showLoading();
			//先获取一周时间段的所有订单列表，获取完毕之后再获取一周时间段的所有清单列表
			_this.getOrderList();
		});
	},
	getActiveDate (time,callback){			//获取当前时间
		var _this = this;
		var now = time?new Date(time):new Date(); //当前日期 
		var nowDayOfWeek = now.getDay(); //今天本周的第几天 
		var nowDay = now.getDate(); //当前日 
		var nowMonth = now.getMonth(); //当前月 
		var nowYear = now.getYear(); //当前年 
		nowYear += (nowYear < 2000) ? 1900 : 0; //
		var startTs = new Date(nowYear, nowMonth, nowDay - nowDayOfWeek);
		var endTs = new Date(nowYear, nowMonth, nowDay + (6 - nowDayOfWeek));
		var arr = utils.getWeekArr(startTs,endTs),dayArr=[];
		for(var i in arr){
			dayArr.push(parseInt(arr[i].split("-")[2]));
		}
		this.setData({
			curDay:time || new Date(),
			startTs:Date.parse(arr[0]),
			endTs:Date.parse(arr[arr.length-1]),
			weekDate:arr,
			weekDay:dayArr,
			curYM:nowYear+"年"+(nowMonth+1)+"月",
			curWeekNum:utils.getWeekNumber(nowYear,nowMonth+1,nowDay)
		});
		if(callback){callback();}
	},
	getBillList (){				//获取当前时间段的所有清单
		var _this = this;
		let {startTs,endTs,bill} = this.data;
		http.request({
			url: api.homeBillList,
			data: {
				startTs,
				endTs,
				page:0,
				size:7
			}
		}).then((res) => {
			console.log(res);
			//清单请求完成之后再关闭loading
			wx.hideLoading();
			if(res.errorCode == 200){
				_this.setData({
					isLoaded:true,
					bill:res.data,
					loadOn:true
				});
				//重组清单数据
				_this.recombineBillData();
			}else{
				_this.showZanToast(res.moreInfo || "获取数据失败");
			}
		});
	},
	getOrderList (){			//获取当前时间段的所有订单
		var _this = this;
		let {startTs,endTs,order} = this.data;
		wx.showLoading();
		http.request({
			url: api.orderInfo,
			data: {
				startTs,
				endTs,
				page:0,
				size:7
			}
		}).then((res) => {
			console.log(res);
			if(res.errorCode == 200){
				_this.setData({
					isLoaded:true,
					order:res.data,
					loadOn:true
				});
				//重组数据
				_this.recombineOrderData();
			}else{
				_this.showZanToast(res.moreInfo || "获取数据失败");
			}
		});
	},
	recombineOrderData (){				//重组数据
		//先根据时间来循环一次
		let {order_type,order,weekDate,homeList} = this.data;
		for(var i in order_type){
			var type = order_type[i].TYPE;
			for(var j in weekDate){
				var arr=[],curD = weekDate[j];
				for(var o in order){
					var day = setDate(new Date(order[o].deliveryDate));
					if(day == curD && order[o].orderType.type == type){
						arr.push(order[o]);
					}
				}			
				homeList.push({
					type,
					date:curD,
					order:arr
				});
			}
		}
		this.setData({
			homeList
		});
		//重组好订单信息之后，再去获取清单列表
		this.getBillList();
	},
	recombineBillData (){
		let {bill,homeList} = this.data;
		var _this = this;
		for(var i in homeList){
			var arr = [];
			for(var o in bill){
				let day = setDate(new Date(bill[o].deliveryDate));
				if(day == homeList[i].date && bill[o].orderType.type == homeList[i].type){
					arr.push(bill[o]);
				}
			}
			homeList[i].bill = arr;
		}
		this.setData({
			homeList
		});
	},
	showOBInfo (e){					//点击显示详情
		var index = e.currentTarget.id,
			bill = e.currentTarget.dataset.bill,
			order = e.currentTarget.dataset.order;
		if(bill == 0 && order == 0){return false;}
		let {homeList} = this.data;
		this.setData({
			openOB:homeList[index],
			popOn:true
		});
	},
	
	handleZanTabChange(e) {				//订单下切换分支
		var componentId = e.componentId,
			selectedId = e.selectedId;

		this.setData({
			[`${componentId}.selectedId`]: selectedId
		});
	},
	closePop (){
		this.setData({
			popOn:false,
			tab: {
				list: [
					{id:'BILL',title:'当日清单'},
					{id:'ORDER',title:'当日订单'}
				],
				selectedId:'BILL',
				scroll:false
			},
			openOB:{}
		});
	},

	//event
	handleBillDetail(e) {
		const id = e.currentTarget.id;
		const type = e.currentTarget.dataset.type;
		var url = type == "TASK"?"../../pages/bill/list/list?listId=":"../../pages/bill/detail/detail?listId=";
		app.handle(function(){
			wx.navigateTo({url:url+id});
		});
	},
	handleOrderDetail(e) {
		const id = e.currentTarget.id;
		app.handle(function(){
			wx.navigateTo({url:"../../pages/order/detail/detail?orderid="+id});
		});
	}
}));

function setDate(startTime){
	var year = startTime.getFullYear();
	var rmonth = startTime.getMonth()+1;
	var month = rmonth.toString().length==1?"0"+rmonth.toString():rmonth;
	var day = startTime.getDate().toString().length==1?"0"+startTime.getDate():startTime.getDate();
	return year+"-"+month+"-"+day;
}