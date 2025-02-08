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
    messages: [],
    isAdmin: false,
    showNoticeModal: false,
    noticeTitle: '',
    noticeContent: ''
  },

  onLoad() {
    // 检查是否为管理员
    const userRole = wx.getStorageSync('userRole');
    console.log('当前用户角色:', userRole);
    this.setData({
      isAdmin: userRole === 'ADMIN'
    });
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

  // 显示发送通知模态框
  showSendNoticeModal() {
    this.setData({
      showNoticeModal: true,
      noticeTitle: '',
      noticeContent: ''
    });
  },

  // 隐藏模态框
  hideModal() {
    this.setData({
      showNoticeModal: false
    });
  },

  // 发送系统通知
  sendNotice() {
    if (!this.data.noticeTitle || !this.data.noticeContent) {
      wx.showToast({
        title: '请填写完整信息',
        icon: 'none'
      });
      return;
    }

    const token = wx.getStorageSync('token');
    const userId = wx.getStorageSync('userId');

    wx.request({
      url: `${app.globalData.baseUrl}/api/messages/system`,
      method: 'POST',
      data: {
        title: this.data.noticeTitle,
        content: this.data.noticeContent,
        type: 'SYSTEM',
        senderId: userId,
        // receiverId 在后端处理，发送给所有用户
        isRead: false,
        createTime: new Date().toISOString()
      },
      header: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      },
      success: (res) => {
        if (res.data.code === '200') {
          wx.showToast({
            title: '发送成功',
            icon: 'success'
          });
          this.hideModal();
          this.loadMessages();
        } else {
          wx.showToast({
            title: res.data.msg || '发送失败',
            icon: 'none'
          });
        }
      },
      fail: (error) => {
        console.error('发送系统通知失败:', error);
        wx.showToast({
          title: '发送失败',
          icon: 'none'
        });
      }
    });
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
    const userId = wx.getStorageSync('userId');

    wx.request({
      url: `${app.globalData.baseUrl}/api/messages`,
      method: 'GET',
      data: {
        type: this.data.currentType,
        receiverId: userId
      },
      header: {
        'Authorization': `Bearer ${token}`
      },
      success: (res) => {
        if (res.data.code === '200') {
          // 格式化消息数据
          const messages = res.data.data.map(msg => ({
            id: msg.id,
            title: msg.title,
            content: msg.content,
            type: msg.type,
            senderId: msg.senderId,
            receiverId: msg.receiverId,
            relatedId: msg.relatedId,
            isRead: msg.isRead,
            createTime: this.formatTime(msg.createTime)
          }));

          this.setData({
            messages: messages
          });
        }
      },
      fail: (error) => {
        console.error('加载消息列表失败:', error);
        wx.showToast({
          title: '加载失败',
          icon: 'none'
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
      success: (res) => {
        if (res.data.code === '200') {
          // 更新本地消息状态
          const messages = this.data.messages.map(msg => {
            if (msg.id === id) {
              return { ...msg, isRead: true };
            }
            return msg;
          });
          this.setData({ messages });
        }
      },
      fail: (error) => {
        console.error('标记消息已读失败:', error);
      }
    });
  },

  navigateByMessage(message) {
    switch(message.type) {
      case 'ACTIVITY':
        wx.navigateTo({
          url: `/pages/activities/detail/detail?id=${message.relatedId}`
        });
        break;
      case 'SERVICE':
        wx.navigateTo({
          url: `/pages/appointment/serviceDetail/service?id=${message.relatedId}`
        });
        break;
      default:
        // 系统通知等其他类型消息不需要跳转
        break;
    }
  },

  // 格式化时间
  formatTime(timeStr) {
    if (!timeStr) return '';
    const date = new Date(timeStr);
    const year = date.getFullYear();
    const month = (date.getMonth() + 1).toString().padStart(2, '0');
    const day = date.getDate().toString().padStart(2, '0');
    const hour = date.getHours().toString().padStart(2, '0');
    const minute = date.getMinutes().toString().padStart(2, '0');
    return `${year}-${month}-${day} ${hour}:${minute}`;
  }
}); 