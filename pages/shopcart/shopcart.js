import http from '../../public/js/http.js';
import api from '../../public/js/api.js';
import utils from '../../public/js/utils.js';
import quantity from '../../components/zanui/quantity/index.js';
import Zan from '../../components/zanui/index.js';
let app = new getApp();

Page(Object.assign({}, quantity, Zan.Toast,{
	data: {
		isLoaded:false,             //数据是否加载完毕
		listId:0,					//清单的id
		createdAt:'',				//清单的创建时间
		goods:[],					//清单中的商品列表
		chooseAllOn:false,			//是否全选的开关，false表示不全选
		totalPrice:0,				//选中的商品的价格
	},
	onLoad (options) {
		var listId = options.listId || 3;
		this.setData({
			listId,
			isLoaded: true
		});
		app.globalData.shopcart = {};
	},
	onShow (){			
		//检查有没有返回的选中商品
		let {goods} = this.data,
			_this = this,
			shopcart = app.globalData.shopcart,
			newGoods = [];
		if(shopcart.length<=0){return false;}
		//先重新分配shopcart数据
		for(var i in shopcart){
			var cur = shopcart[i].skus,
				res = _this.checkHasGood(cur.id);
			//先判断该项是否已经在goods中了
			if(res === false){  		//不在goods中，可以直接添加
				goods.push({
					id:cur.id,
					checked:false,
					quantity:cur.quantity,
					name:cur.name,
					img:cur.skuMedia.primary.url,
					amount:cur.amount,
					productOption:cur.productOption
				});
			}else{				//在goods中，此时res是当前goods中的下标
				goods[res].quantity.quantity += cur.quantity.quantity;
			}
		}
		//清空购物车
		app.globalData.shopcart = {};
		this.setData({
			goods
		});
		//重新计算合价
		this.getTotalPrice();
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
	recombine (){				//重组数据
		let {goods} = this.data;
		for(var i in goods){
			goods[i].checked = false;
			goods[i].quantitys = {
				quantity:goods[i].quantity,
				min:0,
				max:1000
			}
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
	handleZanQuantityChange(e) {
		//点击之前需要查询商品的sku信息是否满足
		let {goods} = this.data,
			_this=this,
			componentId = parseInt(e.componentId),
			quantity = e.quantity;
		for(var i in goods){
			if(goods[i].id == componentId){
				if(quantity == 0){
					goods.splice(i,1);
				}else{
					goods[i].quantity.quantity = quantity;
				}
				
			}
		}
		this.setData({
			goods
		});
		//重新计算总价
		this.getTotalPrice();
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
		let {goods} = this.data,active=[],delOn=true;
		for(var i=0;i<goods.length;i++){
			if(goods[i].checked === true){
				delOn = false;
				goods.splice(i,1);
				i--;
			}
		}
		this.setData({
			goods
		});
		if(delOn === false){
			//重新计价
			this.getTotalPrice();
		}	
	},
	addBillShop (){				//添加商品到清单里
		//前往收货地址列表选择收货地址
		app.globalData.chooseSource = {
			MODE:'SHOP'
		}
		wx.switchTab({
			url: '../../pages/goods/list/list'
		});
	},
	addNewBill (){				//新建清单
		let {goods,listId} = this.data,
		modifyArr=[],
			_this = this;
		if(goods.length<=0){			//没有商品则不能新建清单
			_this.showZanToast("清单中还没有商品，暂不能保存");
			return false;
		}
		for(var i in goods){
			modifyArr.push({
				skuId:goods[i].id,
				num:goods[i].quantity.quantity
			});
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
		http.request({
			url: api.billInfo,
			method:"POST",
			data:{
				...skus,
				orderType:"OTHER"
			}
		}).then((res) => {
			console.log(res);
			if(res.errorCode == 200){
				//保存成功之后跳转到清单列表页面
				_this.showZanToast("清单保存成功");
				//设置刷新
				app.globalData.reShow.orderList = true;
				app.globalData.updateBill = {
					data:res.data,
					type:"add"
				};
				//设置为清单数据
				app.globalData.obType = "BILL";
				setTimeout(function(){
					//直接强制跳转到首页
					wx.switchTab({
						url:"../../pages/order/list/list"
					});
				},1500);
			}else{
				_this.showZanToast(res.moreInfo || "获取数据失败");
			}
		});
	},
	orderNow (){				//立即下单，调取创建订单接口，将返回的订单id传入到checkout页面
		let {goods,listId} = this.data,
			_this = this,
			modifyArr = [];
		if(goods.length<=0){			//没有商品则不能新建清单
			this.showZanToast("清单中还没有商品，暂不能下单");
			return false;
		}
		for(var i in goods){
			modifyArr.push({
				skuId:goods[i].id,
				num:goods[i].quantity.quantity
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
		//通过清单下单
		http.request({
			url: api.order,
			method:"POST",
			data: {
				...skus
			}
		}).then((res) => {
			if(res.errorCode == 200){
				//创建成功之后，将创建成功的订单id带入到checkout页面
				wx.navigateTo({
					url: "../../pages/order/checkout/checkout?orderId="+res.data.id
				});
			}else{
				_this.showZanToast(res.moreInfo || "获取数据失败");
			}
		});
	}
}));
