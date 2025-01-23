App({
  globalData: {
    baseUrl: 'http://localhost:8080', // 后端接口基础URL
    userInfo: null,
    token: null,
    userRole: null
  },

  onLaunch() {
    // 获取本地存储的token
    const token = wx.getStorageSync('token');
    if (token) {
      this.globalData.token = token;
      // 验证token有效性
      this.checkToken();
    }
    const userRole = wx.getStorageSync('userRole');
    this.globalData.userRole = userRole;
    const tabBarPages = {
      'ADMIN': [
        'pages/admin/home/index',
        'pages/message/index',
        'pages/profile/index'
      ],
      'STAFF': [
        'pages/staff/home/index',
        'pages/message/index',
        'pages/profile/index'
      ],
      'FAMILY': [
        'pages/family/home/index',
        'pages/message/index',
        'pages/profile/index'
      ],
      'ELDERLY': [
        'pages/elderly/home/index',
        'pages/message/index',
        'pages/profile/index'
      ]
    };

    const pages = tabBarPages[userRole] || [];
    this.globalData.tabBarPages = pages;
  
  },

  checkToken() {
    wx.request({
      url: `${this.globalData.baseUrl}/api/users/current`,
      method: 'GET',
      header: {
        'Authorization': `Bearer ${this.globalData.token}`
      },
      success: (res) => {
        if (res.statusCode === 200) {
          this.globalData.userInfo = res.data;
          wx.setStorageSync('userInfo', res.data);
        } else {
          // token无效，清除存储并跳转到登录页
          this.clearStorageAndRedirect();
        }
      },
      fail: () => {
        this.clearStorageAndRedirect();
      }
    });
  },

  clearStorageAndRedirect() {
    wx.clearStorageSync();
    this.globalData.token = null;
    this.globalData.userInfo = null;
    wx.reLaunch({
      url: '/pages/login/login'
    });
  }
}); 