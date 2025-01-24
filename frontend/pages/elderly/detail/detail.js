const app = getApp()

Page({
  data: {
    elderlyInfo: {},
    isStaffOrAdmin: false
  },

  onLoad(options) {
    const id = options.id;
    this.checkUserRole();
    this.loadElderlyInfo(id);
  },

  checkUserRole() {
    const userRole = wx.getStorageSync('userRole');
    this.setData({
      // isStaffOrAdmin: userRole === 'ADMIN' || userRole === 'STAFF'
      isStaffOrAdmin: userRole === 'ADMIN'
    });
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
          elderlyInfo: res.data.data
        });
      }
    });
  },

  handleEdit() {
    const id = this.data.elderlyInfo.id;
    wx.navigateTo({
      url: `/pages/elderly/edit/edit?id=${id}`
    });
  },

  handleDelete() {
    wx.showModal({
      title: '确认删除',
      content: '确定要删除该老人信息吗？',
      success: (res) => {
        if (res.confirm) {
          this.deleteElderlyInfo();
        }
      }
    });
  },

  deleteElderlyInfo() {
    const token = wx.getStorageSync('token');
    wx.request({
      url: `${app.globalData.baseUrl}/api/elderly/${this.data.elderlyInfo.id}`,
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