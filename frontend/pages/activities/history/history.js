const app = getApp()

Page({
  data: {
    activities: [],
    userId: null,
    statusMap: {
      'PLANNED': '未开始',
      'ONGOING': '进行中',
      'COMPLETED': '已结束',
      'CANCELLED': '已取消'
    }
  },

  onLoad(options) {
    const userId = options.userId;
    this.setData({ userId });
    this.loadHistoryActivities();
  },

  // 加载历史活动
  loadHistoryActivities() {
    const token = wx.getStorageSync('token');
    wx.request({
      url: `${app.globalData.baseUrl}/api/activity/history/${this.data.userId}`,
      method: 'GET',
      header: {
        'Authorization': `Bearer ${token}`
      },
      success: (res) => {
        if (res.data && res.data.data) {
          const activities = res.data.data.map(activity => ({
            ...activity,
            displayStartTime: this.formatDateTime(activity.startTime),
            displayEndTime: this.formatDateTime(activity.endTime)
          }));
          this.setData({ activities });
        }
      },
      fail: (error) => {
        console.error('Load history activities failed:', error);
        wx.showToast({
          title: '加载失败',
          icon: 'none'
        });
      }
    });
  },

  // 格式化日期时间
  formatDateTime(dateTime) {
    if (!dateTime) return '';
    const date = new Date(dateTime);
    const year = date.getFullYear();
    const month = (date.getMonth() + 1).toString().padStart(2, '0');
    const day = date.getDate().toString().padStart(2, '0');
    const hours = date.getHours().toString().padStart(2, '0');
    const minutes = date.getMinutes().toString().padStart(2, '0');
    return `${year}年${month}月${day}日 ${hours}:${minutes}`;
  },

  // 跳转到活动详情
  goToDetail(e) {
    const id = e.currentTarget.dataset.id;
    wx.navigateTo({
      url: `/pages/activities/detail/detail?id=${id}`
    });
  }
}); 