const app = getApp()

Page({
  data: {
    elderlyId: null
  },

  onLoad(options) {
    this.setData({
      elderlyId: options.elderlyId
    });
  },

  handleSubmit(e) {
    const formData = e.detail;
    formData.elderlyId = this.data.elderlyId;
    
    const token = wx.getStorageSync('token');
    wx.request({
      url: `${app.globalData.baseUrl}/api/health-records`,
      method: 'POST',
      header: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      },
      data: formData,
      success: (res) => {
        wx.showToast({
          title: '添加成功',
          icon: 'success',
          duration: 2000
        });
        setTimeout(() => {
          wx.navigateBack();
        }, 2000);
      }
    });
  }
}); 