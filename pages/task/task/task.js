import http from '../../../public/js/http.js';
import api from '../../../public/js/api.js';
import order_type from '../../../public/js/order_type.js';
import package_type from '../../../public/js/package_type.js';
import utils from '../../../public/js/utils.js';
import Zan from '../../../components/zanui/index.js';
let app = new getApp();

const qiniuUploader = require("../../../public/js/qiniuUploader");
// 总共可以上传几张图片
const UPLOAD_LENGTH = 3;

Page(Object.assign({}, Zan.Toast, {
	data: {
		isLoaded:false,             //数据是否加载完毕
		remarksOn:false,			//初始进入首页时候需要隐藏textarea

		//图片上传部分
		waitUploadImgs:[],			// 待上传图片列表
		uploadedImgs:[],			// 已上传的图片列表
		uploadToken: '',			//七牛云图片上传token
		isUpload: false,			// 图片是否正在上传中
		
		//form表单数据
		formData:{
			remarks:""
		}
	},
	onLoad (options) {
		this.setData({
			isLoaded:true
		});	
		var _this = this;
		_this.setData({
			remarksOn:true
		});
	},
	onShow (){
		//点击下任务的时候触发发送formId接口
		app.formIdsSave();
		const clearTaskOn = app.globalData.reShow.task;
		if(clearTaskOn === true){
			this.taskReset();
		}
	},


	//图片上传部分
	chooseImgs () {					//选择图片
		var _this = this;
		wx.chooseImage({
			count: UPLOAD_LENGTH, // 默认9
			// 可以指定是原图还是压缩图，默认二者都有
			sizeType: ['original', 'compressed'],
			// 可以指定来源是相册还是相机，默认二者都有
			sourceType: ['album', 'camera'],
			success: (res) => {
				let { waitUploadImgs } = _this.data;
				// 返回选定照片的本地文件路径列表，tempFilePath可以作为img标签的src属性显示图片
				let tempFilePaths = res.tempFilePaths

				let totalLength = tempFilePaths.length + waitUploadImgs.length;
				let overLength = totalLength - UPLOAD_LENGTH;
				let remainLength = tempFilePaths.length - overLength;

				// 如果图片累计的数量超过了规定的张数，则提示
				if (overLength > 0) {
					tempFilePaths = tempFilePaths.splice(0, remainLength);
					_this.showZanToast(`图片最多只能上传${UPLOAD_LENGTH}张，您已选择${totalLength}张`);
					return false;
				}
				waitUploadImgs.push(...tempFilePaths)

				_this.setData({
					waitUploadImgs
				});
				//选择好之后直接上传
				_this.upload();
			}
		})
	},	
	getUploadToken () {				// 获取七牛云上传token
		var _this = this;
		let { uploadToken } = this.data;

		let p = new Promise((resolve, reject) => {
			// 如果上传token已经获取，则直接resolve
			if (uploadToken) {
				resolve(uploadToken);
			} else {
				wx.showLoading();
				http.request({
					url: api.getUploadToken
				}).then((res) => {
					if (res.errorCode == 200) {
						this.setData({
							uploadToken: res.data
						})
						resolve(res.data);
					} else {
						wx.hideLoading();
						_this.showZanToast(res.moreInfo || '获取七牛云token失败，请重试');
						reject();
					}
				});
			}
		});
		return p;
	},
	// 移除上传了的图片
	removeUploadImg (e) {
		var index = e.currentTarget.id;
		let { waitUploadImgs, uploadedImgs } = this.data;

		waitUploadImgs.splice(index, 1);
		uploadedImgs.splice(index, 1);

		this.setData({
			waitUploadImgs,
			uploadedImgs
		});
	},
	// 重置上传相关的字段
	resetUpload () {
		this.setData({
			waitUploadImgs: [],
			uploadedImgs: []
		});
	},
	// 上传图片
	upload () {
		var _this = this;
		let { waitUploadImgs, isUpload } = this.data;

		try {
			if (waitUploadImgs.length == 0) {
				throw new Error('您还未选择图片');
			}

			if (isUpload) {
				throw new Error('正在上传中，请稍后');
			}
		} catch (e) {
			return _this.showZanToast(e.message);
		}

		this.setData({
			isUpload: true
		});

		this.getUploadToken().then((uptoken) => {
			// 每一张上传图片的进度
			let promiseArr = [];

			// 循环上传每一张图片
			waitUploadImgs.forEach((imgUrl, index) => {
				let q = new Promise((resolve, reject) => {
					qiniuUploader.upload(imgUrl, (res) => {
						// 按顺序设置每一张图片的七牛云地址
						this.setData({
							[`uploadedImgs[${index}]`]: `http://${res.imageURL}`,
						});
						resolve();
					}, (error) => {
						reject(error);
					}, {
						uptoken,
						region: 'ECN',
						domain: 'oyh65u6th.bkt.clouddn.com'
					})
				});

				promiseArr.push(q);
			});

			// 图片全部上传完毕之后，隐藏loading效果，将isUpload正在上传开关关闭
			Promise.all(promiseArr).then(() => {
				this.setData({
					isUpload: false
				});

				// 图片上传成功
				wx.showToast({
					title: '图片上传成功'
				})
			}, (res) => {
				_this.showZanToast(`上传失败，错误：${res.errMsg}`)

				this.setData({
					isUpload: false
				});
			});
		})
		.catch(() => {
		});
	},

	//event
	mynotouch (){
		return false;
	},

	//准备提交数据
	setReadyData (){
		let {uploadedImgs,formData} = this.data;

		var sendObj = {
			remarks:utils.trim(formData.remarks),
			imgs:uploadedImgs
		}
		return sendObj;
	},
	getCurrentData (e){				//获取当前数据
		var name = e.target.dataset.name;
		this.data.formData[name]=e.detail.value;
		this.setData({
			formData:this.data.formData
		});
	},
	formSubmit (e){			//提交数据
		var _this = this,
			type = parseInt(e.currentTarget.id),
			obj = this.setReadyData();
		//检查相关数据是否OK
		try {
			//检测订单类型
			// if (obj.imgs.length<=0) {
			// 	throw new Error('请上传清单图片！');
			// }

			// 检测清单留言部分
			if (utils.trim(obj.remarks).length <= 0 || obj.remarks <= 0) {
				throw new Error('请填写您的清单需求！');
			}

			if(type!==0 && type!==1){
				throw new Error('任务方式出错！');
			}
		} catch (e) {
			return _this.showZanToast(e.message);
		}
		wx.showLoading();
		//全部通过之后
		http.request({
			url: api.demand,
			method:"POST",
			data: {
				...obj,
				submitType:type
			}
		}).then((res) => {
			console.log(res);
			wx.hideLoading();
			//本地mock数据
			if(res.errorCode == 200){
				//保存formId
				app.formIdsSave();
				_this.showZanToast("创建成功！");
				//type为1的时候前往checkout界面
				//var url = type == 1?"../../order/checkout/checkout?orderId=":"../../pages/bill/detail/detail?listId=";
				var url = "../../../pages/task/detail/detail?listId=";
				//创建成功前往checkout页面
				setTimeout(function(){
					//直接跳转到checkout页结算
					wx.navigateTo({
						url:url+res.data
					});
					//创建成功之后清空数据
					_this.taskReset();
				},1000);
			}else{
				_this.showZanToast("提交任务失败！");
			}
		});
	},
	taskReset (e){			//提交数据之后需要将表单信息还原
		//清空数据，重新进入的时候
		this.setData({
			formData:{
				taskName:""
			},
			waitUploadImgs:[],
			uploadedImgs:[]
		});
	},
	closePop (){			//关闭弹窗
		this.setData({
			chooseDateOn:false,
			chooseTypeOn:false,
			choseDevTimeOn:false
		})
	},
	bindsubmit (e){
		//提交formId
		var formId = e.detail.formId;
		if(formId) app.formIdSubmit(formId);
	}
}));
