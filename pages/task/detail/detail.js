import http from '../../../public/js/http.js';
import api from '../../../public/js/api.js';
import utils from '../../../public/js/utils.js';
import Zan from '../../../components/zanui/index.js';
let app = new getApp();

Page(Object.assign({}, Zan.Toast, {
	data: {
		isLoaded:false,             //数据是否加载完毕
		taskId:0,					//当前的任务id
		taskInfo:{},				//当前任务信息
		address:{}					//收货地址
	},
	onLoad (options) {
		var _this = this;
		_this.setData({
			taskId:options.listId
		});
		this.getTaskInfo();
	},
	onShow (){
		//获取存储的当前选择的收货地址
		var curAddress = app.globalData.activeAddress;
		if(curAddress){
			this.setData({
				address:curAddress
			})
		}
	},
	getTaskInfo (){			//获取任务信息
		let {taskId} = this.data,
			_this=this;
		wx.showLoading();
		http.request({
			url: api.taskInfo+"/"+taskId,
			data: {}
		}).then((res) => {
			console.log(res);
			wx.hideLoading();
			if(res.errorCode == 200){
				_this.setData({
					isLoaded:true,
					taskInfo:res.data
				});
				_this.changeData();
			}else{
				_this.showZanToast(res.moreInfo || "获取数据失败");
			}
		});
	},
	changeData() {			//转换数据
		let {taskInfo} = this.data;
		for(var i in taskInfo.orderTs){
			taskInfo.orderTs[i] = utils.formatDate(new Date(taskInfo.orderTs[i]),"YYYY-MM-DD");
		}
		taskInfo.createdAt = utils.formatDate(new Date(taskInfo.createdAt),"YYYY-MM-DD HH:mm:ss");
		taskInfo.startTs = utils.formatDate(new Date(taskInfo.startTs),"HH:mm");
		taskInfo.endTs = utils.formatDate(new Date(taskInfo.endTs),"HH:mm");
		this.setData({
			taskInfo
		});
		this.getAddress();
	},
	getAddress (){			//获取默认的收货地址
		let {address,taskInfo} = this.data,_this = this;
		http.request({
			url: api.address+"/"+taskInfo.addressId,
			data: {}
		}).then((res) => {
			console.log(res);
			if(res.errorCode == 200){
				_this.setData({
					address:res.data,
				});
			}else{
				_this.showZanToast(res.moreInfo || "获取数据失败");
			}
		});
	},
	goToBillList(){
		const {taskId} = this.data;
		app.globalData.reShow.orderList = true;
		app.globalData.obType = "BILL";
		app.globalData.updateBill = {
			data:{id:taskId},
			type:"update"
		};
		//跳转到订单列表页
		app.handle(function(){
			wx.switchTab({url:"../../../pages/order/list/list"});
		});
	}
}));
