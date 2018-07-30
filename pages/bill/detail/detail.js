import http from '../../../public/js/http.js';
import api from '../../../public/js/api.js';
import utils from '../../../public/js/utils.js';
import quantity from '../../../components/zanui/quantity/index.js';
import Zan from '../../../components/zanui/index.js';
let app = new getApp();

Page(Object.assign({}, quantity, Zan.Toast,{
	data: {
		isLoaded:false,             //数据是否加载完毕
		listId:0,					//清单的id
		billId:0,					//记录过来的清单的id
		createdAt:'',				//清单的创建时间
		goods:[],					//清单中的商品列表
		chooseAllOn:false,			//是否全选的开关，false表示不全选
		totalPrice:0,				//选中的商品的价格
		detailType:"",				//当前清单状态
		eventOn:false,				// 立即下单的开关
	},
	onLoad (options) {
		var listId = options.listId || 0;
		this.setData({
			listId
		});
		if(listId == 0){			//新建清单模式
			this.setData({
				isLoaded: true
			});
		}else{						//编辑清单模式
			this.getBillDetail();
		}
	},
	onUnload() {				//卸载页面的时候保存该清单
		//*************缺少保存清单的接口************* */
		// let {goods} = this.data,
		// 	active=[];
		// for(var i=0;i<goods.length;i++){
		// 	if(goods[i].checked === true){
		// 		active.push(goods[i].cartId);
		// 	}
		// }
		// if(active.length<=0){return false;}
		// //每次删除数据之后就保存一下数据
		// this.delBillListShop(active);
		this.checkUpdate();
	},
	onShow (){
		this.checkUpdate();
		this.setData({
			eventOn:false
		})
	},
	checkUpdate (){				//检查是否有更新
		//检查有没有返回的选中商品
		let {goods} = this.data,
			_this = this,
			shopcart = app.globalData.shopcart,
			newGoods = [];
		if(shopcart.length<=0){return false;}
		//先重新分配shopcart数据
		for(var i in shopcart){
			var cur = shopcart[i].skus;
			newGoods.push({
				id:cur.id,
				checked:false,
				quantity:cur.quantity,
				name:cur.name,
				img:cur.skuMedia.primary.url,
				amount:cur.amount,
				productOption:cur.productOption
			});
		}
		//清空购物车
		app.globalData.shopcart = {};
		//并保存数据
		this.addBillListShop(newGoods);
	},
	checkHasGood (curId){			//检查一下是否有该商品id
		let {goods} = this.data;
		for(var i in goods){
			if(goods[i].id == curId){
				return i;
			}
		}
		return false;
	},
	handleZanQuantityChange(e) {
		//**********需要重新编辑*********** */
		//点击之前需要查询商品的sku信息是否满足
		let {goods} = this.data,
			_this=this,
			componentId = parseInt(e.componentId),
			quantity = e.quantity;
		for(var i in goods){
			if(goods[i].id == componentId){
				console.log(goods[i],quantity);
				goods[i].quantity.quantity = quantity;
				if(quantity == 0){
					var cartId = goods[i].cartId;
					this.delBillListShop([cartId]);
					goods.splice(i,1);
				}else{
					this.keppBillList({
						skuId:goods[i].skuId,
						num:goods[i].quantity.quantity,
						itemId:goods[i].cartId
					})
				}
			}
		}
		//**************这边需要保存，确实skuId数据，开发已经添加，重新补充****************** */
		this.setData({
			goods
		});
		//重新计算总价
		this.getTotalPrice();
	},
	getBillDetail (){				//获取清单详细信息
		var _this = this;
		let { listId,detailType } = this.data;
		//本地获取mock数据
		http.request({
			url: api.billInfo+"/"+listId,
			data: {}
		}).then((res) => {
			console.log(res);
			if(res.errorCode == 200){
				_this.setData({
					isLoaded: true,
					goods:res.data.carts,
					detailType:res.data.detailType,
					billId:res.data.parentDetailId,
					createdAt:utils.formatDate(new Date(res.createdAt),"YYYY-MM-DD HH:mm:ss")
				});
				_this.recombine();
			}else{
				_this.showZanToast(res.moreInfo || "获取数据失败");
			}
		});
	},
	recombine (){				//重组数据
		let {goods} = this.data;
		for(var i in goods){
			goods[i].checked = false;
			goods[i].id = goods[i].cartId;
			var q = goods[i].quantity;
			goods[i].quantity = {
				quantity:q
			};
			goods[i].img=goods[i].skuMedia.primary.url;
		}
		this.setData({
			goods
		});
		this.getTotalPrice();
	},
	getTotalPrice (){			//计算总价
		let {goods,totalPrice} = this.data;
		totalPrice = 0;
		for(var i in goods){
			totalPrice += goods[i].amount * goods[i].quantity.quantity;
		}
		totalPrice = totalPrice.toFixed(2);
		this.setData({
			totalPrice
		});
	},
	chooseAll (){			//全选
		let {chooseAllOn,goods} = this.data;
		var _this = this;
		this.setData({
			chooseAllOn:!chooseAllOn
		});
		for(var i in goods){
			goods[i].checked = _this.data.chooseAllOn;
		}	
		this.setData({
			goods
		})
	},
	chooseSingle (e){			//单选
		var id = e.currentTarget.id;
		let {goods} = this.data;
		for(var i in goods){
			if(goods[i].id == id){
				goods[i].checked = !goods[i].checked;
			}
		}
		this.setData({
			goods
		})
	},
	delBillShop (){				//删除清单中的商品
		let {goods} = this.data,
			active=[];
		for(var i=0;i<goods.length;i++){
			if(goods[i].checked === true){
				active.push(goods[i].cartId);
			}
		}
		if(active.length<=0){
			this.showZanToast("请先选中需要删除的商品或者清单！");
			return false;
		}
		//每次删除数据之后就保存一下数据
		this.delBillListShop(active);
	},
	addBillShop (){//添加商品到清单里
		let {listId} = this.data;
		app.globalData.chooseSource = {
			MODE:'SHOP',
			billId:listId
		}
		//前往收货地址列表选择收货地址
		wx.switchTab({
			url: '../../goods/list/list'
		});
	},
	keppBillList(good){					// 保存清单项
		let { listId } = this.data,_this=this;
		http.request({
			url: api.reviseBill+"/"+listId,
			method:"PUT",
			data:{
				skuId:good.skuId,
				num:good.num,
				itemId:good.itemId
			}
		}).then((res) => {
			if(res.errorCode == 200){

			}else{
				_this.showZanToast(res.moreInfo || "获取数据失败");
			}
		});
	},
	addBillListShop (arr){			//给清单添加商品，添加商品过来后需要走一下该接口生成一个清单项的id
		let {listId} = this.data,
			modifyArr=[],
			_this = this;
		for(var i in arr){
			modifyArr.push({
				skuId:arr[i].id,
				num:arr[i].quantity.quantity
			});
		}
		if(modifyArr.length<=0){return false;}
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
		//保存当前清单
		http.request({
			url: api.billInfo+"/"+listId,
			method:"PUT",
			data:{
				...skus
			}
		}).then((res) => {
			console.log(res);
			if(res.errorCode == 200){
				//新增商品成功，重新获取整个清单内容
				_this.getBillDetail();
			}else{
				_this.showZanToast(res.moreInfo || "获取数据失败");
			}
		});
	},
	delBillListShop (arr){			//给清单删除商品
		let {listId} = this.data,
			_this = this;
		//保存当前清单
		http.request({
			url: api.billDelShop+"/"+listId,
			method:"POST",
			data:{
				items:arr
			}
		}).then((res) => {
			console.log(res);
			if(res.errorCode == 200){
				//新增商品成功，重新获取整个清单内容
				_this.getBillDetail();
			}else{
				_this.showZanToast(res.moreInfo || "获取数据失败");
			}
		});
	},
	delBill (){					//删除清单
		let {listId,detailType,billId} = this.data,
			_this = this;
		wx.showModal({
			title: '提示',
			content: '确定删除该清单吗？',
			success: function(res) {
				if (res.confirm) {
					http.request({
						url: api.billInfo+"/"+listId,
						method:"DELETE",
						data:{}
					}).then((res) => {
						if(res.errorCode == 200){
							_this.showZanToast("清单删除成功！");
							if(detailType == "TASK" || detailType == "CHILD"){  		//清单下订单，需要跳转到子清单列表
								setTimeout(function(){
									wx.navigateTo({
										url: '../../bill/list/list?listId='+billId
									})
								},1500);
							}else{					//正常情况下删除清单，需要跳转到清单列表
								//更新订单列表的数据
								app.globalData.reShow.orderList = true;
								app.globalData.obType = "BILL";
								app.globalData.updateBill = {
									data:{id:listId},
									type:"remove"
								};

								//跳转到订单列表页
								setTimeout(function(){
									wx.switchTab({
										url:"../../../pages/order/list/list"
									});
								},1500);
							}
						}else{
							_this.showZanToast(res.moreInfo || "获取数据失败");
						}
					});
				}
			}
		});
	},
	orderNow (){				//立即下单
		let {goods,listId,detailType,eventOn} = this.data,
			_this = this,
			cartIds = [];
		//清单中没有商品不能下订单
		if(goods.length<=0){
			_this.showZanToast("清单中没有商品，无法下单！");
			return false;
		}
		if(eventOn === true){
			return false;
		}
		_this.setData({
			eventOn:true
		});
		//确认下单之前需要先保存该清单
		if(detailType == "TASK" || detailType == "CHILD"){  		//清单下订单
			//通过清单下单
			http.request({
				url: api.checkoutlist+"/"+listId,
				method:"PUT",
				data: {}
			}).then((res) => {
				console.log(res);
				if(res.errorCode == 200){
					_this.setData({
						eventOn:false
					});
					setTimeout(()=>{
						wx.navigateTo({
							url: '../../../pages/pay/pay?orderId='+res.data.id
						});
					},1000);
					//_this.pay(res.data.id);
				}else{
					_this.showZanToast(res.moreInfo || "获取数据失败");
				}
			});
		}else{				//清单转订单需要checkout
			for(var i in goods){
				cartIds.push(goods[i].cartId)
			}
			//通过清单下单
			http.request({
				url: api.billToOrder+"/"+listId,
				method:"POST",
				data: {
					items:cartIds
				}
			}).then((res) => {
				if(res.errorCode == 200){
					//添加完毕之后跳转到checkout
					wx.navigateTo({
						url: "../../order/checkout/checkout?orderId="+res.data.id
					});
				}else{
					_this.showZanToast(res.moreInfo || "获取数据失败");
				}
			});
		}
	},
	pay(id) {
		let {listId,billId} = this.data,
			_this = this;
		wx.showLoading();
		http.request({
			url: api.pay+"/"+id,
			method:"PUT",
			data: {
				type:"CYCLE_GATEWAY"
			}
		}).then((res) => {
			console.log(res);
			wx.hideLoading();
			if(res.errorCode == 200){
				_this.showZanToast("订单生成成功，记得去支付哦！");
				// 跳转到子清单列表页
				setTimeout(function(){
					wx.navigateTo({
						url: '../../bill/list/list?listId='+billId
					})
				},1500);				
			}else{
				_this.showZanToast(res.moreInfo || "订单结算失败！");
			}
		});
	}
}));
