const app = getApp()

Page({
  data: {
    formData: {},
    userId: null
  },

  onLoad(options) {
    const id = options.id;
    // 从本地存储中获取用户ID
    const userId = wx.getStorageSync('userId');
    this.setData({
      userId: userId
    });
    this.loadActivity(id);
  },

  loadActivity(id) {
    const token = wx.getStorageSync('token');
    wx.request({
      url: `${app.globalData.baseUrl}/api/activity/${id}`,
      method: 'GET',
      header: {
        'Authorization': `Bearer ${token}`
      },
      success: (res) => {
        const activity = res.data.data;
        if (activity) {
          // 处理日期时间格式
          const startDateTime = new Date(activity.startTime);
          const endDateTime = new Date(activity.endTime);
          
          // 打印活动状态，用于调试
          console.log('Activity data from server:', activity);
          console.log('Activity status from server:', activity.activityStatus);
          
          const formData = {
            id: activity.id,
            name: activity.name,
            description: activity.description,
            location: activity.location,
            maxParticipants: activity.maxParticipants,
            activityStatus: activity.activityStatus, // 确保状态被正确设置
            startDate: this.formatDateTime(startDateTime),
            startTime: startDateTime.toTimeString().slice(0, 5),
            endDate: this.formatDateTime(endDateTime),
            endTime: endDateTime.toTimeString().slice(0, 5),
            organizerId: activity.organizerId
          };
          
          console.log('Setting form data with status:', formData.activityStatus);
          
          this.setData({ formData });
        } else {
          wx.showToast({
            title: '加载活动信息失败',
            icon: 'none'
          });
        }
      },
      fail: () => {
        wx.showToast({
          title: '加载活动信息失败',
          icon: 'none'
        });
      }
    });
  },

  formatDateTime(dateTime) {
    const date = new Date(dateTime);
    const year = date.getFullYear();
    const month = (date.getMonth() + 1).toString().padStart(2, '0');
    const day = date.getDate().toString().padStart(2, '0');
    const hours = date.getHours().toString().padStart(2, '0');
    const minutes = date.getMinutes().toString().padStart(2, '0');
    return `${year}年${month}月${day}日 ${hours}:${minutes}`;
  },

  handleSubmit(e) {
    const formData = e.detail;
    // 添加组织者ID
    formData.organizerId = this.data.userId;
    const token = wx.getStorageSync('token');
    
    wx.request({
      url: `${app.globalData.baseUrl}/api/activity/${this.data.formData.id}`,
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