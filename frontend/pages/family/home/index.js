Page({
  data: {
    recentItems: []
  },

  onLoad() {
    this.loadRecentItems();
  },

  loadRecentItems() {
    const token = wx.getStorageSync('token');
    const elderlyId = wx.getStorageSync('elderlyId');
    wx.request({
      url: `${getApp().globalData.baseUrl}/api/elderly/${elderlyId}/recent-items`,
      method: 'GET',
      header: {
        'Authorization': `Bearer ${token}`
      },
      success: (res) => {
        this.setData({
          recentItems: res.data
        });
      }
    });
  },

  goToDetail(e) {
    const { id, type } = e.currentTarget.dataset;
    let url = '';
    switch(type) {
      case 'activity':
        url = `/pages/elderly/activities/detail?id=${id}`;
        break;
      case 'service':
        url = `/pages/service/detail?id=${id}`;
        break;
    }
    wx.navigateTo({ url });
  },
  onShow() {
    if (typeof this.getTabBar === 'function' && this.getTabBar()) {
      this.getTabBar().setData({
        selected: 0 // 首页
      });
    }
  }
}); 