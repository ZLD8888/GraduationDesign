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
        if (res.data && res.data.data) {
          const elderlyData = res.data.data;
          
          // 如果有护工ID，获取护工信息
          if (elderlyData.caregiverId) {
            this.loadCaregiverInfo(elderlyData.caregiverId, elderlyData);
          } else {
            this.setData({
              elderlyInfo: elderlyData
            });
          }
        }
      }
    });
  },

  // 新增：加载护工信息的方法
  loadCaregiverInfo(caregiverId, elderlyData) {
    const token = wx.getStorageSync('token');
    wx.request({
      url: `${app.globalData.baseUrl}/api/users/caregiver/${caregiverId}`,
      method: 'GET',
      header: {
        'Authorization': `Bearer ${token}`
      },
      success: (res) => {
        if (res.data && res.data.data) {
          // 将护工信息添加到老人信息中
          elderlyData.caregiver = {
            id: res.data.data.id,
            name: res.data.data.name
          };
        }
        this.setData({
          elderlyInfo: elderlyData
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