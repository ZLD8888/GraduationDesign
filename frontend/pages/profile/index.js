const app = getApp()

Page({
  data: {
    userInfo: {},
    roleMap: {
      'ADMIN': '管理员',
      'STAFF': '工作人员',
      'FAMILY': '家属',
      'ELDERLY': '老人'
    }
  },

  onLoad() {
    this.loadUserInfo();
  },

  onShow() {
    if (typeof this.getTabBar === 'function' &&
      this.getTabBar()) {
      this.getTabBar().setData({
        selected: 2
      })
    }
  },

  loadUserInfo() {
    const token = wx.getStorageSync('token');
    wx.request({
      url: `${app.globalData.baseUrl}/api/users/current`,
      method: 'GET',
      header: {
        'Authorization': `Bearer ${token}`
      },
      success: (res) => {
        this.setData({
          userInfo: res.data
        });
      }
    });
  },

  handleChangePassword() {
    wx.navigateTo({
      url: '/pages/profile/change-password/index'
    });
  },

  handleAbout() {
    wx.showModal({
      title: '关于我们',
      content: '养老院管理系统 v1.0.0\n为老人提供更好的服务',
      showCancel: false
    });
  },

  handleLogout() {
    wx.showModal({
      title: '提示',
      content: '确定要退出登录吗？',
      success: (res) => {
        if (res.confirm) {
          // 清除本地存储的token和用户信息
          wx.clearStorageSync();
          // 跳转到登录页
          wx.reLaunch({
            url: '/pages/login/login'
          });
        }
      }
    });
  }
}); 