const app = getApp();

Page({
  data: {
    appointmentId: '',
    appointmentInfo: {},
    isAdmin: false,
    isStaff: false,
    isElderly: false,
    isFamily: false,
    statusMap: {
      'PENDING': '待确认',
      'CONFIRMED': '已确认',
      'COMPLETED': '已完成',
      'CANCELLED': '已取消'
    }
  },

  onLoad(options) {
    const { id } = options;
    this.setData({ appointmentId: id });
    this.checkUserRole();
    this.loadAppointmentDetail();
  },

  checkUserRole() {
    const userRole = wx.getStorageSync('userRole');
    this.setData({
      isAdmin: userRole === 'ADMIN',
      isStaff: userRole === 'STAFF',
      isElderly: userRole === 'ELDERLY',
      isFamily: userRole === 'FAMILY'
    });
  },

  loadAppointmentDetail() {
    const token = wx.getStorageSync('token');
    wx.request({
      url: `${app.globalData.baseUrl}/api/appointments/${this.data.appointmentId}`,
      method: 'GET',
      header: {
        'Authorization': `Bearer ${token}`
      },
      success: (res) => {
        if (res.data && res.data.data) {
          const appointmentInfo = res.data.data;
          // 计算是否可以取消预约（预约时间1小时前）
          const canCancel = this.checkCanCancel(appointmentInfo.appointmentTime);
          // 计算是否可以确认完成（仅管理员/护工可以确认，且状态为已确认）
          const canComplete = (this.data.isAdmin || this.data.isStaff) && 
                            appointmentInfo.status === 'CONFIRMED';
          
          this.setData({
            appointmentInfo: {
              ...appointmentInfo,
              statusText: this.data.statusMap[appointmentInfo.status],
              canCancel,
              canComplete
            }
          });
        }
      }
    });
  },

  checkCanCancel(appointmentTime) {
    if (this.data.isAdmin || this.data.isStaff) return true;
    
    const now = new Date();
    const appointmentDate = new Date(appointmentTime);
    const hoursDiff = (appointmentDate - now) / (1000 * 60 * 60);
    
    return hoursDiff > 1;
  },

  handleConfirmAppointment() {
    const token = wx.getStorageSync('token');
    wx.showModal({
      title: '确认预约',
      content: '确定要确认这个预约吗？',
      success: (res) => {
        if (res.confirm) {
          wx.request({
            url: `${app.globalData.baseUrl}/api/appointments/${this.data.appointmentId}/confirm`,
            method: 'POST',
            header: {
              'Authorization': `Bearer ${token}`
            },
            success: (res) => {
              if (res.data && res.data.success) {
                wx.showToast({
                  title: '确认成功',
                  icon: 'success'
                });
                this.loadAppointmentDetail();
              }
            }
          });
        }
      }
    });
  },

  handleCompleteAppointment() {
    const token = wx.getStorageSync('token');
    wx.showModal({
      title: '完成预约',
      content: '确定要标记这个预约为已完成吗？',
      success: (res) => {
        if (res.confirm) {
          wx.request({
            url: `${app.globalData.baseUrl}/api/appointments/${this.data.appointmentId}/complete`,
            method: 'POST',
            header: {
              'Authorization': `Bearer ${token}`
            },
            success: (res) => {
              if (res.data && res.data.success) {
                wx.showToast({
                  title: '已完成',
                  icon: 'success'
                });
                this.loadAppointmentDetail();
              }
            }
          });
        }
      }
    });
  },

  handleCancelAppointment() {
    wx.showModal({
      title: '取消预约',
      content: '确定要取消这个预约吗？',
      success: (res) => {
        if (res.confirm) {
          const token = wx.getStorageSync('token');
          wx.request({
            url: `${app.globalData.baseUrl}/api/appointments/${this.data.appointmentId}/cancel`,
            method: 'POST',
            header: {
              'Authorization': `Bearer ${token}`
            },
            success: (res) => {
              if (res.data && res.data.success) {
                wx.showToast({
                  title: '取消成功',
                  icon: 'success'
                });
                this.loadAppointmentDetail();
              }
            }
          });
        }
      }
    });
  }
}); 