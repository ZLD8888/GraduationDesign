const app = getApp()

Page({
  data: {
    formData: {}
  },

  onLoad(options) {
    const id = options.id;
    this.loadElderlyInfo(id);
  },

  loadElderlyInfo(id) {
    const token = wx.getStorageSync('token');
    wx.request({
      url: `${app.globalData.baseUrl}/api/elderly/${id}`,
      method: 'GET',
      header: {
        'Authorization': `Bearer ${token}`
      },
      success: (res) => {
        this.setData({
          formData: res.data.data
        });
      }
    });
  },

  handleSubmit(e) {
    const formData = e.detail;
    const token = wx.getStorageSync('token');

    wx.request({
      url: `${app.globalData.baseUrl}/api/elderly/${this.data.formData.id}`,
      method: 'PUT',
      header: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      },
      data: formData,
      success: (res) => {
        wx.showToast({
          title: '保存成功',
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