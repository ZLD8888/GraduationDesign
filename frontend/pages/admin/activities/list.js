const app = getApp()

Page({
  data: {
    currentStatus: 'PLANNED',
    statusList: [
      { label: '未开始', value: 'PLANNED' },
      { label: '进行中', value: 'ONGOING' },
      { label: '已结束', value: 'COMPLETED' },
      { label: '已取消', value: 'CANCELLED' }
    ],
    statusMap: {
      'PLANNED': '未开始',
      'ONGOING': '进行中',
      'COMPLETED': '已结束',
      'CANCELLED': '已取消'
    },
    activities: [],
    isStaff: false
  },

  onLoad() {
    this.checkUserRole();
    this.loadActivities();
  },

  onShow() {
    this.loadActivities();
  },

  checkUserRole() {
    const userRole = wx.getStorageSync('userRole');
    console.log("userRole:",userRole);
    this.setData({
      isStaff: userRole === 'ADMIN'
    });
    console.log("isStaff:",this.data.isStaff);
  },

  handleStatusChange(e) {
    const status = e.currentTarget.dataset.status;
    this.setData({
      currentStatus: status
    });
    this.loadActivities();
  },

  loadActivities() {
    const token = wx.getStorageSync('token');
    wx.request({
      url: `${app.globalData.baseUrl}/api/activity/status/${this.data.currentStatus}`,
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
      }
    });
  },

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

  goToDetail(e) {
    const id = e.currentTarget.dataset.id;
    wx.navigateTo({
      url: `/pages/activities/detail/detail?id=${id}`
    });
  },

  goToEdit(e) {
    const id = e.currentTarget.dataset.id;
    wx.navigateTo({
      url: `/pages/activities/edit/edit?id=${id}`
    });
  },

  goToAdd() {
    wx.navigateTo({
      url: '/pages/activities/add/add'
    });
  },

  goToCalendar() {
    wx.navigateTo({
      url: '/pages/activities/calendar/calendar'
    });
  },

  handleDelete(e) {
    const id = e.currentTarget.dataset.id;
    wx.showModal({
      title: '确认删除',
      content: '确定要删除该活动吗？',
      success: (res) => {
        if (res.confirm) {
          this.deleteActivity(id);
        }
      }
    });
  },

  deleteActivity(id) {
    const token = wx.getStorageSync('token');
    wx.request({
      url: `${app.globalData.baseUrl}/api/activity/${id}`,
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
        this.loadActivities();
      }
    });
  }
}); 