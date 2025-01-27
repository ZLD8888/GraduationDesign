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
        if (res.statusCode === 200) {
          wx.showToast({
            title: '添加成功',
            icon: 'success',
            duration: 2000
          });
          
          setTimeout(() => {
            const pages = getCurrentPages();
            const prevPage = pages[pages.length - 2];
            
            wx.navigateBack({
              delta: 1
            });
          }, 2000);
        } else {
          wx.showToast({
            title: '添加失败',
            icon: 'none'
          });
        }
      },
      fail: () => {
        wx.showToast({
          title: '请求失败，请重试',
          icon: 'none'
        });
      }
    });
  }
}); 