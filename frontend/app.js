App({
  globalData: {
    baseUrl: 'http://localhost:8080', // 后端接口基础URL
    wsUrl: 'ws://localhost:8080', // WebSocket URL
    // baseUrl: 'https://your-production-domain.com',  // 生产环境
    // wsUrl: 'wss://your-production-domain.com',      // 生产环境 WebSocket URL
    userInfo: null,
    token: null,
    userRole: null,
    // huaweiHealth: {
    //   appId: '申请到的华为应用ID',
    //   appSecret: '申请到的应用密钥'
    // }
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
  
    // 初始化华为健康服务
    this.initHuaweiHealth();
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
  },

  initHuaweiHealth() {
    const { appId, appSecret } = this.globalData.huaweiHealth;
    
    // 初始化华为健康服务
    wx.requirePlugin('huawei-health').init({
      appId: appId,
      appSecret: appSecret,
      success: () => {
        console.log('华为健康服务初始化成功');
      },
      fail: (error) => {
        console.error('华为健康服务初始化失败:', error);
      }
    });
  }
}); 