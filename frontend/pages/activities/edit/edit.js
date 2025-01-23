const app = getApp()

Page({
  data: {
    formData: {}
  },

  onLoad(options) {
    const id = options.id;
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
        // 处理日期时间格式
        const startDateTime = new Date(activity.startTime);
        const endDateTime = new Date(activity.endTime);
        
        this.setData({
          formData: {
            ...activity,
            startDate: this.formatDateTime(startDateTime),
            startTime: startDateTime.toTimeString().slice(0, 5),
            endDate: this.formatDateTime(endDateTime),
            endTime: endDateTime.toTimeString().slice(0, 5)
          }
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