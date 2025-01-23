const app = getApp()

Page({
  data: {
    userId: null // 存储用户ID
  },

  onLoad() {
    // 从本地存储中获取用户ID
    const userId = wx.getStorageSync('userId');
    this.setData({
        userId: userId // 将用户ID设置到页面数据中
    });
  },

  handleSubmit(e) {
    const formData = e.detail; // 获取表单数据
    formData.organizerId = this.data.userId; // 将用户ID作为组织者ID添加到表单数据中
    
    const token = wx.getStorageSync('token'); // 从本地存储获取token
    wx.request({
      url: `${app.globalData.baseUrl}/api/activity`, // 请求活动创建的API
      method: 'POST',
      header: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      },
      data: formData, // 发送的表单数据
      success: (res) => {
        wx.showToast({
          title: '创建成功',
          icon: 'success',
          duration: 2000
        });
        setTimeout(() => {
          wx.navigateBack(); // 创建成功后返回上一页
        }, 2000);
      }
    });
  }
}); 