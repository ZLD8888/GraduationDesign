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
    wx.showLoading({
      title: '加载中...',
    });

    wx.request({
      url: `${app.globalData.baseUrl}/api/elderly/${id}`,
      method: 'GET',
      header: {
        'Authorization': `Bearer ${token}`
      },
      success: (res) => {
        if (res.data && res.data.data) {
          // 确保数据正确设置到 formData 中
          this.setData({
            formData: res.data.data
          });
        } else {
          wx.showToast({
            title: '加载失败',
            icon: 'none'
          });
        }
      },
      fail: () => {
        wx.showToast({
          title: '请求失败',
          icon: 'none'
        });
      },
      complete: () => {
        wx.hideLoading();
      }
    });
  },

  handleSubmit(e) {
    const formData = e.detail;
    const token = wx.getStorageSync('token');

    wx.showLoading({
      title: '保存中...',
    });

    wx.request({
      url: `${app.globalData.baseUrl}/api/elderly/${this.data.formData.id}`,
      method: 'PUT',
      header: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      },
      data: formData,
      success: (res) => {
        if (res.statusCode === 200) {
          wx.showToast({
            title: '保存成功',
            icon: 'success',
            duration: 2000
          });

          // 获取页面栈
          const pages = getCurrentPages();
          // 获取上一页（详情页）
          const detailPage = pages[pages.length - 2];
          
          // 如果存在上一页
          if (detailPage) {
            // 调用详情页的刷新方法
            detailPage.loadElderlyInfo(this.data.formData.id);
          }

          // 延迟返回，确保 Toast 显示完成
          setTimeout(() => {
            wx.navigateBack({
              delta: 1  // 返回上一页
            });
          }, 1500);
        } else {
          wx.showToast({
            title: '保存失败',
            icon: 'none'
          });
        }
      },
      fail: () => {
        wx.showToast({
          title: '请求失败',
          icon: 'none'
        });
      },
      complete: () => {
        wx.hideLoading();
      }
    });
  }
}); 