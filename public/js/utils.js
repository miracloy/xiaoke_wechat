const utils = {
  /**
   * 将时间戳格式化为时间 '2017-05-26 09:06:03'
   * @param time 日期，默认为今天
   * @param format 格式化后的排版
   * @returns {string}
   */
  formatDate (time = new Date(), format = 'YYYY-MM-DD HH:mm:ss') {
    time ? time = new Date(time) : time = new Date()
    var obj = {
      YYYY: time.getFullYear(),
      MM: ('0' + (time.getMonth() + 1)).slice(-2),
      DD: ('0' + time.getDate()).slice(-2),
      HH: ('0' + time.getHours()).slice(-2),
      mm: ('0' + time.getMinutes()).slice(-2),
      ss: ('0' + time.getSeconds()).slice(-2),
      w: ['日', '一', '二', '三', '四', '五', '六'][time.getDay()],
      YY: ('' + time.getFullYear()).slice(-2),
      M: time.getMonth() + 1,
      D: time.getDate(),
      H: time.getHours(),
      m: time.getMinutes(),
      s: time.getSeconds()
    };

    // 循环错误对象的键组成的数组
    Object.keys(obj).forEach((value) => {
      format = format.replace(value, obj[value]);
    });

    return format;
  },
  //获取一周的具体时间（天）
  getWeekArr (startTs, endTs) {
    var startTime = startTs,
      endTime = endTs,
      arr = [];
    while ((endTime.getTime() - startTime.getTime()) >= 0) {
      var year = startTime.getFullYear();
      var rmonth = startTime.getMonth() + 1;
      var month = rmonth.toString().length == 1 ? "0" + rmonth.toString() : rmonth;
      var day = startTime.getDate().toString().length == 1 ? "0" + startTime.getDate() : startTime.getDate();
      arr.push(year + "-" + month + "-" + day);
      startTime.setDate(startTime.getDate() + 1);
    }
    return arr;
  },

  //获取当前周是第几周
  getWeekNumber (a, b, c) {
    var date = new Date(a, parseInt(b) - 1, c),
      w = date.getDay(),
      d = date.getDate();
    return Math.ceil((d + 6 - w) / 7);
  },
  //清空字符串两端的空白
  trim (str) {
    return str.replace(/(^\s*)|(\s*$)/g, "");
  },
  textTel (tel) {
    tel = this.trim(tel);
    var reg = /^0?1[3|4|5|8|7][0-9]\d{8}$/;
    return reg.test(tel);
  }

}

export default utils;
