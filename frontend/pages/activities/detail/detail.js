// 获取全局应用实例
const app = getApp();

Page({
  data: {
    activity: {},
    isStaff: false,
    hasJoined: false,
    elderlyId: null,
    statusMap: {
      'PLANNED': '计划中',
      'ONGOING': '进行中',
      'COMPLETED': '已完成',
      'CANCELLED': '已取消'
    }
  },

  onLoad(options) {
    const id = options.id;
    this.checkUserRole();
    this.loadActivity(id);
  },

  checkUserRole() {
    const userRole = wx.getStorageSync('userRole');
    const elderlyId = wx.getStorageSync('elderlyId');
    this.setData({
      isStaff: userRole === 'STAFF',
      elderlyId: elderlyId
    });
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
        this.setData({
          activity: {
            ...activity,
            startTime: this.formatDateTime(activity.startTime),
            endTime: this.formatDateTime(activity.endTime)
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

  goToEdit() {
    wx.navigateTo({
      url: `/pages/elderly/activity/edit?id=${this.data.activity.id}`
    });
  },

  showStatusActionSheet() {
    wx.showActionSheet({
      itemList: ['计划中', '进行中', '已完成', '已取消'],
      success: (res) => {
        const status = ['PLANNED', 'ONGOING', 'COMPLETED', 'CANCELLED'][res.tapIndex];
        this.updateStatus(status);
      }
    });
  },

  updateStatus(status) {
    const token = wx.getStorageSync('token');
    wx.request({
      url: `${app.globalData.baseUrl}/api/activity/${this.data.activity.id}/status`,
      method: 'PUT',
      header: {
        'Authorization': `Bearer ${token}`
      },
      data: {
        status: status
      },
      success: (res) => {
        this.loadActivity(this.data.activity.id);
      }
    });
  },

  handleDelete() {
    wx.showModal({
      title: '确认删除',
      content: '确定要删除该活动吗？',
      success: (res) => {
        if (res.confirm) {
          this.deleteActivity();
        }
      }
    });
  },

  deleteActivity() {
    const token = wx.getStorageSync('token');
    wx.request({
      url: `${app.globalData.baseUrl}/api/activity/${this.data.activity.id}`,
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
  },

  handleJoin() {
    const token = wx.getStorageSync('token');
    wx.request({
      url: `${app.globalData.baseUrl}/api/activity/${this.data.activity.id}/join`,
      method: 'POST',
      header: {
        'Authorization': `Bearer ${token}`
      },
      data: {
        elderlyId: this.data.elderlyId
      },
      success: (res) => {
        wx.showToast({
          title: '报名成功',
          icon: 'success'
        });
        this.loadActivity(this.data.activity.id);
      }
    });
  },

  handleQuit() {
    const token = wx.getStorageSync('token');
    wx.request({
      url: `${app.globalData.baseUrl}/api/activity/${this.data.activity.id}/quit`,
      method: 'POST',
      header: {
        'Authorization': `Bearer ${token}`
      },
      data: {
        elderlyId: this.data.elderlyId
      },
      success: (res) => {
        wx.showToast({
          title: '已取消报名',
          icon: 'success'
        });
        this.loadActivity(this.data.activity.id);
      }
    });
  }
}); 