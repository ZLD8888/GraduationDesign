const app = getApp()

Page({
  handleSubmit(e) {
    const formData = e.detail;
    const token = wx.getStorageSync('token');

    wx.request({
      url: `${app.globalData.baseUrl}/api/elderly`,
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