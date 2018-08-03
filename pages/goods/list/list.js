import http from '../../../public/js/http.js'
import api from '../../../public/js/api.js'
import utils from '../../../public/js/utils.js'
import quantity from '../../../components/zanui/quantity/index.js'
import Zan from '../../../components/zanui/index.js'
const SIZE = 10 //每个分页多少个产品数
let app = new getApp()

Page(
  Object.assign({}, quantity, Zan.Toast, {
    data: {
      isLoaded: false, //数据是否加载完毕
      MODE: '', //当前模式，如果是SHOP则表示只是添加商品，如果非SHOP表示需要结算
      billId: 0, //记录当前传过来的清单的id
      mWH: {
        //记录页面高度宽度
        width: 0,
        height: 0
      },
      category: [], //商品分类列表
      goods: [], //所有商品列表
      active: {}, //记录当前的商品分类对象
      activeGood: {}, //当前打开着的商品对象
      activeSku: {}, //当前选中规格的sku对象
      activeIndex: 0, //当前点击的规格的index
      shopcart: {}, //购物车列表
      totalPrice: 0, //商品总价

      popOn: false, //选择规格的弹窗是否开启
      showDialog: false, //是否显示购物车弹窗
      getSkuOn: 0, //请求sku数据的开关，0表示可以请求，1表示在请求中，不能再次请求
      loading: false, //true加载最新数据的时候显示
      nodata: false, //true已经没有最新的数据时候显示

      // 搜索部分
      showSearch: false, // 当前是搜索状态
      searchTxt: '', // 搜索的关键字
      searchGoods: [], // 搜索结果
      noGoods: false, // 为true时显示空态界

      // 商品详情弹窗
      isDatail: false,
      isSort: false,
      sortList: [{ id: 0, name: '综合排序' }, { id: 1, name: '按价格升序' }, { id: 2, name: '按价格降序' }],
      sort: 0
    },
    onLoad(options) {
      var _this = this
      _this.setData({
        MODE: app.globalData.chooseSource.MODE || 'BILL',
        billId: app.globalData.chooseSource.billId || 0,
        isLoaded: true
      })
      //获取商品分类
      this.getCategory()
    },
    onShow() {
      //设置页面高度
      this.setMainHigh()
      // const { MODE } = this.data
      // if (MODE === 'SHOP') {
      //   //先清空选中数据和购物车内容
      //   this.clearShopCart()
      // }
    },
    onHide() {
      // 清空购物车
      // this.clearShopCart()
    },
    setMainHigh() {
      //设置页面高度
      var _this = this
      wx.getSystemInfo({
        success(res) {
          _this.setData({
            mWH: {
              width: res.windowWidth,
              height: res.windowHeight - 50 - 60
            }
          })
        }
      })
    },
    getCategory() {
      //获取商品分类信息
      var _this = this
      http
        .request({
          url: api.category,
          data: {}
        })
        .then(res => {
          console.log(res)
          //给每个分类添加一个page值
          for (var i in res.data) {
            res.data[i].page = 0
          }
          if (res.errorCode == 200) {
            this.setData({
              isLoaded: true,
              category: res.data,
              active: res.data[0],
              loading: false
            })
            //获取商品成功之后开始获取第一个商品分类下的商品
            _this.getGoods()
          } else {
            _this.showZanToast(res.moreInfo || '获取数据失败')
          }
        })
    },
    getGoods() {
      //获取商品列表信息
      let { goods, active, sort, category } = this.data
      var _this = this,
        hasData = false

      _this.setData({
        loading: true
      })
      //没有内容则第一次请求加载
      http
        .request({
          url: api.goods + '/' + active.id,
          data: {
            page: active.page,
            size: SIZE,
            sort
          }
        })
        .then(res => {
          _this.setData({
            loading: false
          })
          //获取到数据之后给每一个商品添加一个字段cid，用于判断其是否可以展示
          for (var j in res.data) {
            res.data[j].cid = active.id
          }
          if (res.errorCode == 200) {
            for (var i in category) {
              if (category.id == active.id) {
                category.page = category.page + 1
              }
            }
            this.setData({
              category
            })

            //设置每个商品的点击加减
            _this.setGoodQuan(res.data, 'first')
          } else {
            _this.showZanToast(res.moreInfo || '获取数据失败')
          }
        })
    },
    getMoreGoods(e) {
      //加载更多数据
      var _this = this
      let { goods, active, loading, sort } = this.data
      if (loading === true) {
        return false
      }
      this.setData({
        loading: true
      })
      //没有内容则第一次请求加载
      http
        .request({
          url: api.goods + '/' + active.id,
          data: {
            page: active.page + 1,
            size: SIZE,
            sort
          }
        })
        .then(res => {
          console.log(res)
          _this.setData({
            loading: false
          })
          //获取到数据之后给每一个商品添加一个字段cid，用于判断其是否可以展示
          for (var j in res.data) {
            res.data[j].cid = active.id
          }
          if (res.errorCode == 200) {
            active.page = active.page + 1
            this.setData({
              active,
              page: active.page
            })
            //设置新增的每个商品的加减
            _this.setGoodQuan(res.data)
          } else {
            _this.showZanToast(res.moreInfo || '获取数据失败')
          }
        })
    },
    setGoodQuan(newgoods, first) {
      //设置每个商品的点击加减
      let { goods, searchGoods, showSearch } = this.data
      for (var i in newgoods) {
        newgoods[i].quantity = {
          quantity: 0,
          min: 0,
          max: newgoods[i].skus[0].quantityAvailable
        }
        var gSkus = newgoods[i].skus
        for (var j in gSkus) {
          gSkus[j].quantity = {
            quantity: 0,
            min: 0,
            max: gSkus[j].quantityAvailable
          }
        }
        //同时设置规格的选择状态
        var types = newgoods[i].skusTypes
        for (var o in types) {
          types[o].checked = -1
        }
      }
      if (first === 'first') {
        this.setData({
          goods: newgoods
        })
      } else if (showSearch === false) {
        this.setData({
          goods: goods.concat(newgoods)
        })
      } else {
        this.setData({
          searchGoods: newgoods
        })
      }
    },
    handleZanQuantityChange(e) {
      //点击之前需要查询商品的sku信息是否满足
      let { goods, searchGoods, showSearch } = this.data,
        _this = this,
        componentId = e.componentId,
        quantity = e.quantity
      if (showSearch === false) {
        for (let i in goods) {
          let gSkus = goods[i].skus,
            tQuantity = 0
          for (let j in gSkus) {
            if (gSkus[j].id == componentId) {
              gSkus[j].quantity.quantity = quantity
            }
            tQuantity += gSkus[j].quantity.quantity
          }
          goods[i].quantity.quantity = tQuantity
        }
      } else {
        for (let i in searchGoods) {
          let gSkus = searchGoods[i].skus,
            tQuantity = 0
          for (let j in gSkus) {
            if (gSkus[j].id == componentId) {
              gSkus[j].quantity.quantity = quantity
            }
            tQuantity += gSkus[j].quantity.quantity
          }
          searchGoods[i].quantity.quantity = tQuantity
        }
      }
      //添加至购物车
      _this.addShopCart()
      this.setData({
        goods,
        searchGoods
      })
    },
    choseCate(e) {
      //切换分类
      var cid = parseInt(e.currentTarget.id),
        active = {}
      let { category } = this.data
      for (var i in category) {
        if (category[i].id == cid) {
          active = category[i]
        }
      }
      this.setData({
        active,
        page: 0
      })
      //切换分类的同时去调取分类对应的商品列表信息
      this.getGoods()
    },
    addShopCart() {
      let { shopcart, activeIndex, activeSku, goods, searchGoods, showSearch } = this.data
      if (showSearch === false) {
        for (var i in goods) {
          var gSkus = goods[i].skus
          for (var j in gSkus) {
            shopcart[gSkus[j].id] = {
              good: goods[activeIndex],
              skus: gSkus[j]
            }
          }
        }
      } else {
        for (var i in searchGoods) {
          var gSkus = searchGoods[i].skus
          for (var j in gSkus) {
            shopcart[gSkus[j].id] = {
              good: searchGoods[activeIndex],
              skus: gSkus[j]
            }
          }
        }
      }

      //删除购物车中当前数量为0的商品
      for (var i in shopcart) {
        if (shopcart[i].skus.quantity.quantity <= 0) {
          delete shopcart[i]
        }
      }
      //计算购物车中还有几条数据
      var arr = Object.keys(shopcart)
      if (arr.length <= 0) {
        this.clearShopCart()
      } else {
        this.countTotal()
      }
      this.setData({
        shopcart
      })
    },
    clearShopCart() {
      //清空购物车
      let { goods, searchGoods, showSearch } = this.data
      if (showSearch === false) {
        for (var i in goods) {
          goods[i].quantity.quantity = 0
          var gSkus = goods[i].skus
          for (var j in gSkus) {
            gSkus[j].quantity.quantity = 0
          }
        }
      } else {
        for (var i in searchGoods) {
          searchGoods[i].quantity.quantity = 0
          var gSkus = searchGoods[i].skus
          for (var j in gSkus) {
            gSkus[j].quantity.quantity = 0
          }
        }
      }

      this.setData({
        shopcart: {},
        goods,
        searchGoods,
        showDialog: false
      })
      this.countTotal()
    },
    countTotal() {
      //计算购物车总价
      let { shopcart } = this.data
      var total = 0
      for (var i in shopcart) {
        total += shopcart[i].skus.quantity.quantity * shopcart[i].skus.amount
      }
      total = total.toFixed(2)
      this.setData({
        totalPrice: total
      })
    },
    getSkuInfo(id) {
      //获取商品sku
      wx.showLoading()
      let { goods, activeSku, getSkuOn } = this.data
      if (getSkuOn == 1) {
        return false
      }
      this.setData({
        getSkuOn: 1
      })
      var _this = this,
        good = {}
      //查询当前被点中的商品是哪一个
      for (var i in goods) {
        if (goods[i].id == id) {
          good = goods[i]
          break
        }
      }
      http
        .request({
          url: api.sku + '/' + id,
          data: {}
        })
        .then(res => {
          wx.hideLoading()
          //给每个数据设置是否选中
          var arr = res.data
          for (var i in arr) {
            arr[i].checked = i == 0
            activeSku = arr[0]
          }
          //设置当前最大值最小值
          good.quantity = {
            quantity: 0,
            min: 0,
            max: arr[0].q
          }
          if (res.errorCode == 200) {
            _this.setData({
              popOn: true, //打开规格操作弹窗
              activeGood: {
                list: arr,
                good
              },
              activeSku,
              getSkuOn: 0
            })
          } else {
            _this.showZanToast(res.moreInfo || '获取数据失败')
          }
        })
    },
    orderNow() {
      //立即下单
      let { shopcart, MODE, billId } = this.data,
        _this = this
      if (Object.keys(shopcart).length <= 0) {
        this.showZanToast('购物车还没有任何商品哦')
        return false
      }
      var modifyArr = []
      for (var i in shopcart) {
        modifyArr.push({
          skuId: shopcart[i].skus.id,
          num: shopcart[i].skus.quantity.quantity
        })
      }
      // 数据转化格式，然后提交
      let keys = []
      let values = []
      modifyArr.forEach((item, index) => {
        keys.push(`skus[${index}].skuId`, `skus[${index}].num`)
        values.push(item.skuId, item.num)
      })
      let skus = {}
      keys.forEach((item, index) => {
        skus[item] = values[index]
      })
      //创建下单
      let totalPrice = this.data.totalPrice
      http
        .request({
          url: api.orderInfo,
          method: 'POST',
          data: {
            ...skus
          }
        })
        .then(res => {
          if (res.errorCode == 200) {
            if (MODE == 'SHOP') {
              //shop模式下新增到清单列表中，而不直接下订单
              app.globalData.shopcart = shopcart
              //跳转到清单详情页面
              // wx.navigateBack({
              // 	delta:1
              // });
              wx.navigateTo({
                url: '../../../pages/bill/detail/detail?listId=' + billId + `&totalPrice=${totalPrice}`
              })
            } else {
              //非shop模式下直接下单
              //创建订单成功，将创建的订单信息存储到app中，跨页面获取值
              app.globalData.shopcart = shopcart
              //添加完毕之后跳转到checkout
              wx.navigateTo({
                url: '../../../pages/order/checkout/checkout?orderId=' + res.data.id + '&mode=' + MODE + `&totalPrice=${totalPrice}`
              })
            }
          } else {
            _this.showZanToast(res.moreInfo || '获取数据失败')
          }
        })
    },

    //event
    mynotouch() {
      //屏蔽
      return false
    },
    openChoseSpec(e) {
      //点开首先需要重新排列规格数据
      let { goods, activeSku, getSkuOn, activeGood, activeIndex, searchGoods, showSearch } = this.data,
        _this = this,
        good = {},
        id = parseInt(e.currentTarget.id)
      if (getSkuOn == 1) {
        return false
      }
      this.setData({
        getSkuOn: 1
      })
      //开始筛选
      if (showSearch === false) {
        for (let i in goods) {
          if (goods[i].id == id) {
            activeIndex = i
          }
        }
      } else {
        for (let i in searchGoods) {
          if (searchGoods[i].id == id) {
            activeIndex = i
          }
        }
      }

      _this.setData({
        goods,
        searchGoods,
        popOn: true, //打开规格操作弹窗
        getSkuOn: 0,
        activeIndex
      })
    },
    getActiveSku(obj) {
      var skusId = 'opt',
        aSku = {}
      for (var j in obj.skusTypes) {
        skusId += obj.skusTypes[j].checked + '_'
      }
      for (var o in obj.skus) {
        if (skusId == obj.skus[o].optKey) {
          aSku = obj.skus[o]
          if (!aSku.quantity) {
            aSku.quantity = {
              quantity: 0,
              min: 0,
              max: obj.skus[o].q
            }
          }
        }
      }
      return aSku
    },
    addShopCartBtn(e) {
      //规格弹窗需要加入购物车
      let { goods, activeSku, activeGood, activeIndex, showSearch, searchGoods } = this.data,
        id = parseInt(e.currentTarget.id),
        good = showSearch === false ? goods[activeIndex] : searchGoods[activeIndex]
      var qa = activeSku.quantity
      if (qa.quantity < qa.max) {
        qa.quantity++
        good.quantity.quantity++
        var mSkus = good.skus
        for (var i in mSkus) {
          if (activeSku.optKey == mSkus[i].optKey) {
            mSkus[i].quantity.quantity++
          }
        }
        this.setData({
          goods,
          searchGoods,
          activeSku
        })
        this.addShopCart()
      }
    },
    closePop() {
      //关闭弹窗
      this.setData({
        popOn: false
        // activeGood:{},
        // activeSku:{}
      })
    },
    chosegg(e) {
      //选择规格
      let { goods, activeIndex, activeSku, searchGoods, showSearch } = this.data,
        skuid = parseInt(e.currentTarget.id),
        fid = parseInt(e.currentTarget.dataset.fid),
        aSkus = showSearch === false ? goods[activeIndex].skusTypes : searchGoods[activeIndex].skusTypes
      //修改点击调整样式
      for (var i in aSkus) {
        if (fid == i) {
          aSkus[i].checked = skuid
        }
      }
      //查找对应的sku
      const active = showSearch === false ? goods[activeIndex] : searchGoods[activeIndex]
      activeSku = this.getActiveSku(active)
      this.setData({
        activeSku,
        goods,
        searchGoods
      })
    },
    toggleDialog() {
      //打开购物车
      let { shopcart } = this.data
      //计算购物车中还有几条数据，如果没有记录则不打开购车及诶按
      if (Object.keys(shopcart).length <= 0) {
        return false
      }
      this.setData({
        showDialog: !this.data.showDialog
      })
    },
    // 点击搜索
    searchGoods() {
      let { showSearch, searchTxt } = this.data
      if (utils.trim(searchTxt).length <= 0) {
        return false
      }
      app.handle(() => {
        this.setData({
          showSearch: true
        })
        this.getSearchGoods()
      })
    },
    searchInput(e) {
      this.setData({
        searchTxt: e.detail.value,
        noGoods: false
      })
    },
    closeSearch() {
      app.handle(() => {
        this.setData({
          showSearch: false,
          searchTxt: '',
          searchGoods: []
        })
      })
    },
    getSearchGoods() {
      //获取商品列表信息
      let { searchGoods, loading, searchTxt, active } = this.data
      this.setData({ loading: true, searchGoods: [] })
      wx.showLoading()
      // 加载搜索数据
      http
        .request({
          url: api.searchGoods,
          data: {
            key: searchTxt,
            //page:active.page,
            page: 0,
            size: SIZE
          }
        })
        .then(res => {
          console.log(res)
          wx.hideLoading()
          this.setData({ loading: false })
          if (res.errorCode == 200) {
            this.setData({
              searchGoods: res.data
            })
            this.setGoodQuan(res.data)
            if (res.data.length <= 0) {
              this.setData({
                noGoods: true
              })
            }
          } else {
            this.showZanToast(res.moreInfo || '获取数据失败')
          }
        })
    },
    // 商品详情
    goodsDetail(e) {
      const { id } = e.currentTarget.dataset
      this.setData({ isDatail: true, detailId: id })
      wx.showLoading()
      http
        .request({
          url: api.goodsDetail + id
        })
        .then(res => {
          wx.hideLoading()
          console.log(res)
          this.setData({ detail: res.data, detailSkus: res.data.skus[0] })
        })
    },
    closeDeatail(e) {
      console.log(e)
      e.currentTarget.id ? '' : this.setData({ isDatail: false })
    },
    // 设置排序
    handleSort() {
      const { isSort } = this.data
      this.setData({ isSort: !isSort })
    },
    confirmSort(e) {
      const { sort } = e.target.dataset
      this.setData({ sort, isSort: false })
      this.getGoods()
    },
    setNumber(e) {
      console.log(e)
      const number = Number(e.detail.value)
      this.setData({ number })
    },
    // 商品详情页加入购物车
    addDetailShopCart() {
      const { detailId, number, shopcart, detailSkus, detail } = this.data
      detailSkus.quantity = { quantity: number, min: 0, max: 10000000 }
      shopcart[detailSkus.id] = {
        good: detail,
        skus: detailSkus
      }
      this.countTotal()
      this.setData({ isDatail: false })
      this.setData({ shopcart })
    }
    //   // 存购物车信息
    //   saveShopcart() {
    //     const { shopcart } = this.data
    //     if (shopcart) {
    //       wx.setStorageSync('shopcart', shopcart)
    //     }
    //   },
    //   getShopcart() {
    //     const { shopcart } = wx.getStorageSync('shopcart')
    //     if (shopcart) {
    //       this.countTotal()
    //     }
    //   },
    //   onHide() {
    //     this.saveShopcart()
    //   }
  })
)
