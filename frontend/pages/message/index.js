const app = getApp()

Page({
  data: {
    messageTypes: [
      { label: '全部', value: 'ALL' },
      { label: '系统通知', value: 'SYSTEM' },
      { label: '活动提醒', value: 'ACTIVITY' },
      { label: '服务通知', value: 'SERVICE' }
    ],
    currentType: 'ALL',
    messages: []
  },

  onLoad() {
    this.loadMessages();
  },

  onShow() {
    if (typeof this.getTabBar === 'function' &&
      this.getTabBar()) {
      this.getTabBar().setData({
        selected: 1
      })
    }
  },

  handleTypeChange(e) {
    const type = e.currentTarget.dataset.type;
    this.setData({
      currentType: type
    });
    this.loadMessages();
  },

  loadMessages() {
    const token = wx.getStorageSync('token');
    wx.request({
      url: `${app.globalData.baseUrl}/api/messages`,
      method: 'GET',
      data: {
        type: this.data.currentType
      },
      header: {
        'Authorization': `Bearer ${token}`
      },
      success: (res) => {
        this.setData({
          messages: res.data
        });
      }
    });
  },

  handleMessageClick(e) {
    const id = e.currentTarget.dataset.id;
    // 标记消息为已读
    this.markAsRead(id);
    // 根据消息类型跳转到相应页面
    const message = this.data.messages.find(m => m.id === id);
    if (message) {
      this.navigateByMessage(message);
    }
  },

  markAsRead(id) {
    const token = wx.getStorageSync('token');
    wx.request({
      url: `${app.globalData.baseUrl}/api/messages/${id}/read`,
      method: 'PUT',
      header: {
        'Authorization': `Bearer ${token}`
      },
      success: () => {
        // 更新本地消息状态
        const messages = this.data.messages.map(msg => {
          if (msg.id === id) {
            return { ...msg, isRead: true };
          }
          return msg;
        });
        this.setData({ messages });
      }
    });
  },

  navigateByMessage(message) {
    switch(message.type) {
      case 'ACTIVITY':
        wx.navigateTo({
          url: `/pages/elderly/activities/detail?id=${message.relatedId}`
        });
        break;
      case 'SERVICE':
        wx.navigateTo({
          url: `/pages/service/detail?id=${message.relatedId}`
        });
        break;
      default:
        // 系统通知等其他类型消息不需要跳转
        break;
    }
  }
}); 