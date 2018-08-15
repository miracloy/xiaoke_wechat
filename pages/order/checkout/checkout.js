import http from '../../../public/js/http.js';
import api from '../../../public/js/api.js';
import utils from '../../../public/js/utils.js';
import Zan from '../../../components/zanui/index.js';
import order_type from '../../../public/js/order_type.js';
var app = getApp();

//日历部分
let choose_year = null,
	choose_month = null;
const weeks_ch = ['日', '一', '二', '三', '四', '五', '六'];

Page(Object.assign({}, Zan.Toast, {
	data: {
		isLoaded: false,             //数据是否加载完毕
		orderId: 0,					//订单的id
		address: {},					//当前收货地址
		order: {},					//订单详情

		//订单类型部分
		chooseTypeOn: false,			//选择类型操作开关
		orderType: [],				//存放所有的订单类型列表
		choosedTypeNames: [],		//存放选中的订单类型
		choosedType: "",				//选中的订单类型

		//订单日期部分
		chooseDateOn: false,			//选择日期弹窗开关
		chooseAllDate: [],			//被选中的所有的日期

		//选择配送时间部分
		choseDevTimeOn: false,		//选择配送时间的弹窗开关
		startTs: "08:00",			//配送时间起始时间
		endTs: "09:00",				//配送时间结束时间
		devTimeArray: [],			//所有需要选择的时间的数组
		devCurTime: [0, 0],			//当前选中的配送时间的数组

		// 传入购物车的金额
		totalPrice: ''
	},
	onLoad (options) {
		this.setData({
			orderId: options.orderId || 37,
			MODE: options.MODE
		});
		//设置订单类型
		this.setOrderType();
		//开启日期插件
		this.startCalendar();
		//设置配送时间段选择数据	
		this.setDevTime();
		//获取订单详细信息
		this.getOrderDetail();
		//获取用户当前的默认地址
		this.getDefaultAddress();

		// 传入购物车的金额
		options.totalPrice ? this.setData({ totalPrice: options.totalPrice }) : ''
	},
	onShow () {
		//获取存储的当前选择的收货地址
		var curAddress = app.globalData.activeAddress;
		if (curAddress) {
			this.setData({
				address: curAddress
			})
		}
	},
	//订单类型操作部分
	chooseType () {			//选择订单类型
		this.setData({
			chooseTypeOn: true
		})
	},
	setOrderType () {
		let { orderType } = this.data;
		for (var i in order_type) {
			orderType.push({
				type: order_type[i].TYPE,
				name: order_type[i].NAME,
				checked: false
			});
		}
		this.setData({
			orderType
		})
	},
	chooseOrderType (e) {
		var vals = e.detail.value;
		this.setData({
			choosedType: vals
		});
	},
	confirmOrderType () {				//确认选中的订单类型
		let { orderType, choosedType, choosedTypeNames } = this.data;
		choosedTypeNames = [];

		for (var i in orderType) {
			if (choosedType == orderType[i].type) {
				choosedTypeNames.push(orderType[i].name)
			}
		}

		this.setData({
			choosedTypeNames,
			chooseTypeOn: false
		});
	},

	//选择配送日期部分
	choseDevTime () {		//选择配送时间
		this.setData({
			choseDevTimeOn: true
		})
	},
	setDevTime () {			//设置配送时间数据
		var totalTime = 24 * 3600 * 1000;
		var spanTime = totalTime / 24;
		var startTime = new Date();
		startTime.setHours(0, 0, 0, 0);
		let { devTimeArray } = this.data;
		var currentTime = startTime.getTime();
		for (var i = 0; i < 24; i++) {
			currentTime += spanTime;
			if (i >= 7 && i <= 22) {
				var time = utils.formatDate(new Date(currentTime), 'HH:mm');
				devTimeArray.push(time);
			}
		}
		this.setData({
			devTimeArray
		});
	},

	//选择日期部分
	chooseDate () {			//选择日期
		this.setData({
			chooseDateOn: true
		})
	},
	startCalendar (time) {
		//日历部分的数据
		var date = time || new Date(),
			cur_year = date.getFullYear(),
			cur_month = date.getMonth() + 1;
		this.setData({
			cur_year,
			cur_month,
			weeks_ch
		});
		this.calculateEmptyGrids(cur_year, cur_month);
		this.calculateDays(cur_year, cur_month);
	},
	getThisMonthDays (year, month) {
		return new Date(year, month, 0).getDate();
	},
	getFirstDayOfWeek (year, month) {
		return new Date(Date.UTC(year, month - 1, 1)).getDay();
	},
	calculateEmptyGrids (year, month) {
		const firstDayOfWeek = this.getFirstDayOfWeek(year, month);
		let empytGrids = [];
		if (firstDayOfWeek > 0) {
			for (let i = 0; i < firstDayOfWeek; i++) {
				empytGrids.push(i);
			}
			this.setData({
				hasEmptyGrid: true,
				empytGrids
			});
		} else {
			this.setData({
				hasEmptyGrid: false,
				empytGrids: []
			});
		}
	},
	calculateDays (year, month) {
		let days = [];
		let { empytGrids } = this.data;
		var _this = this;

		const thisMonthDays = this.getThisMonthDays(year, month);

		for (let i = 1; i <= thisMonthDays; i++) {
			var a = Math.floor((i + empytGrids.length - 1) % 7);
			var d = _this.mergeYMD(i);
			days.push({
				day: i,
				choosed: false,
				weekDay: weeks_ch[a],
				ymd: d,
				canChoose: Date.parse(new Date(d)) + 24 * 60 * 60 * 1000 - new Date() >= 0
			});
		}

		this.setData({
			days
		});
	},
	handleCalendar (e) {
		const handle = e.currentTarget.dataset.handle;
		const cur_year = this.data.cur_year;
		const cur_month = this.data.cur_month;

		var now_year = new Date().getFullYear(),
			now_month = new Date().getMonth() + 1;

		if (handle === 'prev') {
			let newMonth = cur_month - 1;
			let newYear = cur_year;
			if (newMonth < 1) {
				newYear = cur_year - 1;
				newMonth = 12;
			}
			//过去的时间不可选择
			// if(newYear<now_year){return false;}
			// if(newYear==now_year && newMonth<now_month){return false;}

			this.setData({
				cur_year: newYear,
				cur_month: newMonth
			});
			this.calculateEmptyGrids(newYear, newMonth);
			this.calculateDays(newYear, newMonth);
		} else {
			let newMonth = cur_month + 1;
			let newYear = cur_year;
			if (newMonth > 12) {
				newYear = cur_year + 1;
				newMonth = 1;
			}

			this.setData({
				cur_year: newYear,
				cur_month: newMonth
			});

			this.calculateEmptyGrids(newYear, newMonth);
			this.calculateDays(newYear, newMonth);
		}
		//重置日期参数
		this.resectDate();
	},
	tapDayItem (e) {
		const idx = e.currentTarget.dataset.idx;
		const days = this.data.days;
		let canChoose = e.currentTarget.dataset.choose;
		if (canChoose === false) {
			return false;
		}

		for (var i in days) {
			if (parseInt(i) == parseInt(idx)) {
				days[idx].choosed = !days[idx].choosed;
			} else {
				days[i].choosed = false;
			}
		}
		this.setData({
			days,
		});
	},
	chooseYearAndMonth () {
		const cur_year = this.data.cur_year;
		const cur_month = this.data.cur_month;
		let picker_year = [],
			picker_month = [];
		for (let i = 1900; i <= 2100; i++) {
			picker_year.push(i);
		}
		for (let i = 1; i <= 12; i++) {
			picker_month.push(i);
		}
		const idx_year = picker_year.indexOf(cur_year);
		const idx_month = picker_month.indexOf(cur_month);
		this.setData({
			picker_value: [idx_year, idx_month],
			picker_year,
			picker_month,
			showPicker: true,
		});
	},
	pickerChange (e) {
		const val = e.detail.value;
		choose_year = this.data.picker_year[val[0]];
		choose_month = this.data.picker_month[val[1]];
	},
	tapPickerBtn (e) {
		const type = e.currentTarget.dataset.type;
		const o = {
			showPicker: false,
		};
		if (type === 'confirm') {
			o.cur_year = choose_year;
			o.cur_month = choose_month;
			this.calculateEmptyGrids(choose_year, choose_month);
			this.calculateDays(choose_year, choose_month);
		}

		this.setData(o);
	},
	mergeYMD (day) {			//合并年月日
		var str = "";
		let { cur_year, cur_month } = this.data;
		cur_month = cur_month.toString().length == 1 ? "0" + cur_month.toString() : cur_month;
		day = day.toString().length == 1 ? "0" + day : day;
		str = cur_year + "-" + cur_month + "-" + day;
		return str;
	},
	resectDate () {				//重置时间参数
		this.setData({
			chooseAllOn: false
		});
	},
	confirmDate () {				//确认选择时间
		let { days, chooseAllDate } = this.data;
		var arr = [];
		for (var i in days) {
			if (days[i].choosed === true) {//表示当前有选中的时间
				arr.push(days[i].ymd);
			}
		}
		if (arr.length <= 0) {
			this.showZanToast("您还没有选择日期！");
		}
		this.setData({
			chooseAllDate: arr,
			chooseDateOn: false
		});
		//重置数据
		this.resectDate();
	},

	//配送时间操作部分
	bindDevTimeChange (e) {			//修改配送时间
		var arr = e.detail.value;
		let { devCurTime } = this.data;
		this.setData({
			devCurTime: arr,
		});
	},
	confirmDevTime () {				//确认配送修改时间
		//先判断endTs是否大于startTs
		let { devCurTime, devTimeArray } = this.data;
		if (devCurTime[0] >= devCurTime[1]) {
			this.showZanToast("请正确选择配送时间！");
			return false;
		}
		this.setData({
			startTs: devTimeArray[devCurTime[0]],
			endTs: devTimeArray[devCurTime[1]],
			choseDevTimeOn: false
		});
	},

	//event
	mynotouch () {
		return false;
	},
	getDefaultAddress () {			//获取默认的收货地址
		let { address } = this.data, _this = this;
		http.request({
			url: api.defaultAddress,
			data: {}
		}).then((res) => {
			if (res.errorCode == 200) {
				_this.setData({
					address: res.data,
				});
			} else {
				_this.showZanToast(res.moreInfo || "获取数据失败");
			}
		});
	},
	getOrderDetail () {   //获取订单信息
		var _this = this;
		let { orderId } = this.data;
		//本地获取mock数据
		http.request({
			url: api.orderInfo + "/" + orderId,
			data: {}
		}).then((res) => {
			if (res.errorCode == 200) {
				_this.setData({
					isLoaded: true,
					order: res.data,
					orderDate: utils.formatDate(new Date(res.data.updatedAt)),
					deliveryDate: utils.formatDate(new Date(res.data.deliveryDate))
				});
			} else {
				this.showZanToast(res.moreInfo || "获取数据失败");
			}
		});
	},
	changeAddress () {				//切换收货地址
		//前往收货地址列表选择收货地址
		app.globalData.chooseAddressType = "checkout";
		wx.navigateTo({
			url: '../../../pages/order/address/address'
		});
	},
	settlement () {					//结算操作
		let { order, orderId, MODE,adress } = this.data;
		var _this = this,
			obj = this.checkData();
		//检查相关数据是否OK
		try {
      if (!obj.addressId){
        throw new Error('请选择配送地址！');
      }
			//检测配送时间
			if (obj.startTs.length <= 0 && obj.endTs.length <= 0) {
				throw new Error('请选择正确的配送时间！');
			}
			//检测套餐类型
			if (!obj.deliveryTs) {
				throw new Error('请选择配送日期！');
			} else {
				//如果配送日期是过去则报错
				if (Date.parse(new Date(obj.deliveryTs)) + 24 * 60 * 60 * 1000 - new Date().getTime() <= 0) {
					throw new Error('配送时间必须从当天起开始后一天！');
				}
			}
		} catch (e) {
			return _this.showZanToast(e.message);
		}

		//验证通过，开始提交数据
		wx.showLoading();
		//结算数据提交
		http.request({
			url: api.orderInfo + "/" + orderId,
			method: "PUT",
			data: obj
		}).then((res) => {
			console.log(res);
			wx.hideLoading();
			if (res.errorCode == 200) {
				_this.showZanToast("订单结算提交成功！");
				// 跳转到支付界面
				setTimeout(() => {
					wx.navigateTo({
						url: '../../../pages/pay/pay?orderId=' + orderId
					});
				}, 1000);
			} else {
				_this.showZanToast(res.moreInfo || "订单结算提交失败！");
			}
		});

	},
	checkData () {
		//检查数据之前先组合数据
		let { order, startTs, endTs, choosedType, chooseAllDate, address } = this.data;
    var addressId;
    if (!app.globalData.activeAddress  && !address){
      addressId == ""
    }else{
      addressId = app.globalData.activeAddress ? app.globalData.activeAddress.id : address.id
    }
		var sendObj = {
			startTs,
			endTs,
			orderType: choosedType || "OTHER",
			deliveryTs: new Date(chooseAllDate[0]).getTime(),
			addressId
		}
		return sendObj;
	},
	closePop () {			//关闭弹窗
		this.setData({
			chooseTypeOn: false,
			chooseDateOn: false,
			choseDevTimeOn: false
		})
	},
	jiesuan (e) {
		//提交formId
		var formId = e.detail.formId;
		if (formId) app.formIdSubmit(formId);
	},
	setAddress (address) {				//设置当前地址，给其他页面提供的接口
		this.setData({
			address
		});
	}
}));
