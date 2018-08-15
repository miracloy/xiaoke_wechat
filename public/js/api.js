let api = {
  // 登录
  login: '/wx/login',
  // login: '/wx/authtest', // 测试用登录接口
  // 游客登录
  vLogin: '/wx/vLogin',
  // 自动登录
  autoLogin: '/wx/autoLogin',
  // 用户信息
  userInfo: '/info',
  // 订单详情
  orderInfo: '/order',
  // 获取子清单
  childBill: '/list/child',
  // 清单列表
  billInfo: '/list',
  // 获取首页清单
  homeBillList: '/list/home',
  // 收货地址
  address: '/address',
  // 默认收货地址
  defaultAddress: '/address/default',
  // 商品分类
  category: '/category',
  // 商品列表
  goods: '/category/products',
  // 商品搜索结果
  searchGoods: '/product/search',
  // 商品详情
  goodsDetail: '/product/',
  // sku
  sku: '/product/sku',
  // 二维码code
  code: '/list/code',
  // 获取七牛云token
  getUploadToken: '/token',
  // 提交任务
  demand: '/demand',
  // 获取任务详细
  taskInfo: '/list/task',
  // 创建订单
  order: '/order',
  // 确认收货
  orderConfirm: '/order/confirm',
  // 总收银台
  pay: '/pay',
  // 账期
  cyclepay: '/cyclepay',
  // 账期详细
  cyclepayInfo: '/cyclepay/info',
  // 清单下单
  billToOrder: '/list/submit',
  // 清单删除商品
  billDelShop: '/list/item',
  // 发送formId数据
  formIdsSave: '/formId',
  // 清单转订单（支付前）
  checkoutlist: '/list/checkoutlist',
  // 修改清单项
  reviseBill: '/list/item',
  // 获取banner和插屏
  banner: '/banner',
  // 获取推荐列表
  artList: '/banner/news',
  // 获取推荐列表
  recommendList: '/banner/recommend',
  // 邀请注册
  register: '/wx/register',
  // 获取当前用户的专属邀请码
  getInviteCode: '/welfare/getInviteCode',
  // 获取当前用户邀请用户注册及其特价优惠券的使用情况
  getInvite: '/welfare/getInvite',
  // 获取该用户 通过 邀请他人注册 而得到的优惠券
  getTicketsByInviting: '/welfare/getTicketsByInviting',
  // 获取特价商品
  getRewardProduct: '/welfare/getRewardProduct',
  // 获取当前用户的兑换商品的记录
  getConvertHistory: '/welfare/getConvertHistory',
  // 兑换商品
  convert: '/welfare/convert',
  // 获取当前用户的特价优惠券
  getTickets: '/welfare/getTickets',
  // 获取当前用户的个人奖励金
  getRewardMoney: '/welfare/getRewardMoney',
  // 手机验证码
  getPhoneValidation: '/wx/phoneValid'
}

// let devDomain = 'https://api.jinguashop.com/site';
// let devDomain = 'https://www.jinguashop.com/site';

let devDomain = 'https://www.jinguashop.com/site'
let mockDomain = 'https://result.eolinker.com/YuqxsSC007bd764f945995d4b6a3ee1161b20e0d7ffe7e4?uri='
let proDomain = 'https://api.jinguashop.com/site'
let environment = 'dev'
//let environment = 'pro'

for (var attr in api) {
  if (environment == 'dev') {
    api[attr] = devDomain + api[attr]
  } else if (environment == 'mock') {
    api[attr] = mockDomain + api[attr]
  } else {
    api[attr] = proDomain + api[attr]
  }
}

export default api
