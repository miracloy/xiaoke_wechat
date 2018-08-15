import api from './api.js';

// 权限类
class Auth {
// 登录接口
	login () {
		let p = new Promise((resolve, reject) => {
			wx.login({
				success: (res) => {
					if (res.code) {
						wx.request({
							url: api.autoLogin,
							data: {
								code: res.code
							},
							success: (res) => {
								if (res.data.errorCode === 200) {
									// 登录成功，则设置sessionId
									let data = res.data.data;
									wx.setStorageSync('sessionId', data);
								}
								resolve();
							}
						});
					} else {
						// 登录出错
						wx.showToast({
							title: '自动登录出错',
							icon: "loading"
						})
						reject(res);
					}
				}
			});
		})

		return p;
	}
}

export default Auth;