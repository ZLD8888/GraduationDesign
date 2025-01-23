const app = getApp()

Page({
  data: {
    record: {},
    isStaff: false
  },

  onLoad(options) {
    const id = options.id;
    this.checkUserRole();
    this.loadHealthRecord(id);
  },

  checkUserRole() {
    const userRole = wx.getStorageSync('userRole');
    this.setData({
      isStaff: userRole === 'STAFF'
    });
  },

  loadHealthRecord(id) {
    const token = wx.getStorageSync('token');
    wx.request({
      url: `${app.globalData.baseUrl}/api/health-records/${id}`,
      method: 'GET',
      header: {
        'Authorization': `Bearer ${token}`
      },
      success: (res) => {
        this.setData({
          record: res.data
        });
      }
    });
  },

  handleDelete() {
    wx.showModal({
      title: '确认删除',
      content: '确定要删除该健康记录吗？',
      success: (res) => {
        if (res.confirm) {
          this.deleteHealthRecord();
        }
      }
    });
  },

  deleteHealthRecord() {
    const token = wx.getStorageSync('token');
    wx.request({
      url: `${app.globalData.baseUrl}/api/health-records/${this.data.record.id}`,
      method: 'DELETE',
      header: {
        'Authorization': `Bearer ${token}`
      },
      success: (res) => {
        wx.showToast({
          title: '删除成功',
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