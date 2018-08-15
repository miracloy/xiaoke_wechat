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
		this.setData({
			isLoaded: true
		});
	},
	onShow (){			
		//检查有没有返回的选中商品
		let {goods} = this.data;
		var choosedShop = app.globalData.orders,
			newGoods = [];
		for(var i in choosedShop){
			var sku = choosedShop[i].skus[0];
			newGoods.push({
				amount:sku.amount,
				cartId:sku.id,
				checked:false,
				name:sku.name,
				productOption:sku.productOption,
				quantity:choosedShop[i].quantity.quantity,
				skuMedia:sku.skuMedia
			});
		}
		if(newGoods.length<=0){return false;}
		//newGoods添加到goods中
		for(var i in newGoods){
			for(var j in goods){
				if(goods[j].cartId == newGoods[i].cartId){
					goods[j].quantity = goods[j].quantity + newGoods[i].quantity;
					newGoods.splice(i,1);
					i--;
				}
			}
			//先判断goods里面是否有该商品，有则合并该商品。没有则合并数组
			goods.unshift(newGoods[i]);
		}
		this.setData({
			goods
		})
		//重新计算合价
		this.getTotalPrice();
	},
	handleZanQuantityChange(e) {
		var componentId = e.componentId;
		var quantity = e.quantity;

		this.setData({
			[`${componentId}.quantity`]: quantity
		});
	},
	getBillDetail (){				//获取清单详细信息
		var _this = this;
		let { listId } = this.data;
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
		}
		this.setData({
			goods
		})
		this.getTotalPrice();
	},
	getTotalPrice (){			//计算总价
		let {goods,totalPrice} = this.data;
		totalPrice = 0;
		for(var i in goods){
			totalPrice += goods[i].amount * goods[i].quantity;
		}
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
			if(goods[i].cartId == id){
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
			//每次删除数据之后就保存一下数据
			this.keepBill();
		}	
	},
	addBillShop (){				//添加商品到清单里
		let {listId} = this.data;
		//前往收货地址列表选择收货地址
		app.globalData.chooseSource = {
			MODE:'SHOP'
		}
		wx.switchTab({
			url: '../goods/list/list'
		});
	},
	keepBill (){				//新建清单
		let {goods,listId} = this.data,
			modifyArr=[],
			_this = this;
		for(var i in goods){
			modifyArr.push({
				skuId:goods[i].cartId,
				num:goods[i].quantity
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
		//保存当前清单
		http.request({
			url: api.billInfo+"/"+listId,
			method:"PUT",
			data:{
				...skus
			}
		}).then((res) => {
			if(res.errorCode == 200){
				//保存清单成功
			}else{
				_this.showZanToast(res.moreInfo || "获取数据失败");
			}
		});
	},
}));
