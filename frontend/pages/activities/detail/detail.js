// 获取全局应用实例
const app = getApp();

Page({
  data: {
    activity: {}, // 存储活动信息
    isStaff: false, // 判断用户是否为工作人员
    hasJoined: false, // 判断用户是否已报名活动
    elderlyId: null, // 存储老人的ID
    statusMap: {
      'PLANNED': '未开始',
      'ONGOING': '进行中',
      'COMPLETED': '已结束',
      'CANCELLED': '已取消'
    },
    elderlyInfo: {}, // 存储老人的详细信息
    isStaffOrAdmin: false // 判断用户角色是否为工作人员或管理员
  },

  onLoad(options) {
    const id = options.id;
    // 检查用户角色
    this.checkUserRole();
    // 加载活动信息
    this.loadActivity(id);
  },

  // 检查用户角色
  checkUserRole() {
    const userRole = wx.getStorageSync('userRole');
    const elderlyId = wx.getStorageSync('elderlyId');
    this.setData({
      isStaff: userRole === 'ADMIN',
      elderlyId: elderlyId,
      isStaffOrAdmin: userRole === 'ADMIN' || 'STAFF', // 判断是否为管理员
      isElderly: userRole === 'ELDERLY'
    });
  },

  // 格式化日期时间（用于后端通信）
  formatDateTime(dateTime) {
    const date = new Date(dateTime);
    const year = date.getFullYear();
    const month = (date.getMonth() + 1).toString().padStart(2, '0');
    const day = date.getDate().toString().padStart(2, '0');
    const hours = date.getHours().toString().padStart(2, '0');
    const minutes = date.getMinutes().toString().padStart(2, '0');
    const seconds = date.getSeconds().toString().padStart(2, '0');
    return `${year}-${month}-${day}T${hours}:${minutes}:${seconds}`;
  },

  // 格式化日期时间（用于显示）
  formatDateTimeForDisplay(dateTime) {
    const date = new Date(dateTime);
    const year = date.getFullYear();
    const month = (date.getMonth() + 1).toString().padStart(2, '0');
    const day = date.getDate().toString().padStart(2, '0');
    const hours = date.getHours().toString().padStart(2, '0');
    const minutes = date.getMinutes().toString().padStart(2, '0');
    return `${year}年${month}月${day}日 ${hours}:${minutes}`;
  },

  // 加载活动信息
  loadActivity(id) {
    const token = wx.getStorageSync('token');
    const userId = wx.getStorageSync('userId');
    console.log('Loading activity with userId:', userId);

    wx.request({
      url: `${app.globalData.baseUrl}/api/activity/${id}`,
      method: 'GET',
      header: {
        'Authorization': `Bearer ${token}`
      },
      success: (res) => {
        console.log('Received activity data:', res.data);
        const activity = res.data.data;

        if (activity) {
          const activityData = {
            id: activity.id,
            name: activity.name,
            description: activity.description,
            location: activity.location,
            maxParticipants: activity.maxParticipants,
            currentParticipants: activity.currentParticipants,
            organizerName: activity.organizerName,
            status: activity.activityStatus,
            startTime: activity.startTime,
            endTime: activity.endTime,
            displayStartTime: this.formatDateTimeForDisplay(activity.startTime),
            displayEndTime: this.formatDateTimeForDisplay(activity.endTime),
            participants: []
          };

          this.setData({
            activity: activityData
          });

          // 检查用户是否已报名
          this.checkParticipation(id, userId);
          // 加载参与人员列表
          this.loadParticipants(id);
        } else {
          wx.showToast({
            title: '活动信息加载失败',
            icon: 'none'
          });
        }
      },
      fail: (error) => {
        console.error('Load activity failed:', error);
        wx.showToast({
          title: '请求失败，请重试',
          icon: 'none'
        });
      }
    });
  },

  // 检查用户是否已报名
  checkParticipation(activityId, userId) {
    const token = wx.getStorageSync('token');
    wx.request({
      url: `${app.globalData.baseUrl}/api/activity/check/${activityId}/${userId}`,
      method: 'GET',
      header: {
        'Authorization': `Bearer ${token}`
      },
      success: (res) => {
        console.log('Check participation response:', res.data);
        if (res.statusCode === 200) {
          this.setData({
            hasJoined: res.data.data
          });
        }
      },
      fail: (error) => {
        console.error('Check participation failed:', error);
      }
    });
  },

  // 加载参与人员列表
  loadParticipants(activityId) {
    const token = wx.getStorageSync('token');
    wx.request({
      url: `${app.globalData.baseUrl}/api/activity/joinpeople/${activityId}`,
      method: 'GET',
      header: {
        'Authorization': `Bearer ${token}`
      },
      success: (res) => {
        console.log('Load participants response:', res.data);
        if (res.statusCode === 200 && res.data.data) {
          this.setData({
            'activity.participants': res.data.data
          });
        }
      },
      fail: (error) => {
        console.error('Load participants failed:', error);
      }
    });
  },

  // 跳转到编辑页面
  goToEdit() {
    wx.navigateTo({
      url: `/pages/activities/edit/edit?id=${this.data.activity.id}`
    });
  },

  // 显示活动状态操作菜单
  showStatusActionSheet() {
    wx.showActionSheet({
      itemList: ['未开始', '进行中', '已结束', '已取消'],
      success: (res) => {
        const status = ['PLANNED', 'ONGOING', 'COMPLETED', 'CANCELLED'][res.tapIndex];
        // 检查新状态是否与当前状态相同
        if (status === this.data.activity.status) {
          wx.showToast({
            title: '当前已经是该状态',
            icon: 'none',
            duration: 2000
          });
          return;
        }
        this.updateStatus(status);
      }
    });
  },

  // 更新活动状态
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
        wx.showToast({
          title: '状态更新成功',
          icon: 'success',
          duration: 2000
        });
        this.loadActivity(this.data.activity.id);
      },
      fail: () => {
        wx.showToast({
          title: '状态更新失败',
          icon: 'none',
          duration: 2000
        });
      }
    });
  },

  // 处理编辑老人信息
  handleEdit() {
    const id = this.data.elderlyInfo.id;
    wx.navigateTo({
      url: `/pages/elderly/edit/edit?id=${id}`
    });
  },

  // 处理删除活动
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

  // 删除活动
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

  // 检查活动是否可以报名
  checkActivityJoinable() {
    const activity = this.data.activity;
    const now = new Date();
    const endTime = new Date(activity.endTime);
    const remainingMinutes = (endTime - now) / (1000 * 60); // 转换为分钟

    // 检查活动状态
    if (activity.status === 'COMPLETED') {
      wx.showToast({
        title: '活动已结束',
        icon: 'none',
        duration: 2000
      });
      return false;
    }

    if (activity.status === 'CANCELLED') {
      wx.showToast({
        title: '活动已取消',
        icon: 'none',
        duration: 2000
      });
      return false;
    }

    // 检查进行中的活动是否接近结束
    if (activity.status === 'ONGOING' && remainingMinutes <= 10) {
      wx.showToast({
        title: '活动即将结束，无法报名',
        icon: 'none',
        duration: 2000
      });
      return false;
    }

    return true;
  },

  // 处理报名活动
  handleJoin() {
    const token = wx.getStorageSync('token');
    const userId = wx.getStorageSync('userId');
    
    if (!userId) {
      wx.showToast({
        title: '请先登录',
        icon: 'none',
        duration: 2000
      });
      return;
    }

    // 检查活动是否可以报名
    if (!this.checkActivityJoinable()) {
      return;
    }

    // 先检查是否已达到最大参与人数
    if (this.data.activity.maxParticipants && 
        this.data.activity.currentParticipants >= this.data.activity.maxParticipants) {
      wx.showToast({
        title: '活动已达到最大参与人数',
        icon: 'none',
        duration: 2000
      });
      return;
    }

    console.log('Joining activity:', {
      activityId: this.data.activity.id,
      userId: userId
    });

    wx.request({
      url: `${app.globalData.baseUrl}/api/activity/${this.data.activity.id}/join`,
      method: 'POST',
      header: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      },
      data: {
        activityId: this.data.activity.id,
        elderlyId: userId
      },
      success: (res) => {
        console.log('Join activity response:', res.data);
        
        if (res.statusCode === 200 && res.data.code === '200') {
          wx.showToast({
            title: '报名成功',
            icon: 'success',
            duration: 2000
          });

          // 立即更新本地状态
          this.setData({
            hasJoined: true,
            'activity.currentParticipants': this.data.activity.currentParticipants + 1
          });

          // 重新加载参与人员列表
          this.loadParticipants(this.data.activity.id);
        } else {
          wx.showToast({
            title: res.data.msg || '报名失败',
            icon: 'none',
            duration: 2000
          });
        }
      },
      fail: (error) => {
        console.error('Join activity failed:', error);
        wx.showToast({
          title: '请求失败，请重试',
          icon: 'none',
          duration: 2000
        });
      }
    });
  },

  // 处理取消报名活动
  handleQuit() {
    const token = wx.getStorageSync('token');
    const userId = wx.getStorageSync('userId');
    wx.request({
      url: `${app.globalData.baseUrl}/api/activity/${this.data.activity.id}/quit`,
      method: 'POST',
      header: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      },
      data: {
        activityId: this.data.activity.id,
        elderlyId: userId
      },
      success: (res) => {
        console.log("activityID:", this.data.activity.id)
        if(res.statusCode === 200 && res.data.code === '200'){
          wx.showToast({
            title: '已取消报名',
            icon: 'success'
          });
        }else{
          wx.showToast({
            title: res.data.msg || "退出失败",
            icon:'none'
          })
        }
        
        this.loadActivity(this.data.activity.id);
        // 重新加载参与人员列表
        this.loadParticipants(this.data.activity.id);
      }
    });
  }
});
