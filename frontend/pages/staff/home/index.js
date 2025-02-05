const app = getApp()

Page({
  data: {
    recentItems: [], // 存储最近项目的数组
    activities: [] // 存储活动数据
  },

  // 页面加载时调用
  onLoad() {
    this.loadRecentItems(); // 加载最近项目
    this.loadRecentActivities(); // 加载最近活动
  },

  // 加载最近项目的函数
  loadRecentItems() {
    const token = wx.getStorageSync('token'); // 从本地存储获取token
    wx.request({
        url: `${getApp().globalData.baseUrl}/api/activity/recent-items`, // 请求最近项目的API
        method: 'GET',
        header: {
            'Authorization': `Bearer ${token}` // 设置请求头，包含token
        },
        success: (res) => {
            // 检查返回的数据结构
            if (res.data && Array.isArray(res.data.data)) {
                this.setData({
                    recentItems: res.data.data // 将返回的数据设置到recentItems中
                });
                console.log(res.data.data);  
                console.log(this.data.recentItems); 
                if (this.data.recentItems.length === 0) {
                    // wx.showToast({
                    //     title: '最近没有活动或者服务', 
                    //     icon: 'none'
                    // });
                }
            } else {
                console.error('返回的数据格式不正确:', res.data);
                wx.showToast({
                    title: '数据格式错误', 
                    icon: 'none'
                });
            }
        }, 
        fail: (error) => { 
            console.error('加载最近项目失败:', error); // 处理请求失败的情况
            wx.showToast({
                title: '加载失败，请重试',
                icon: 'none'
            });
        }
    });
},

  // 加载最近活动的函数
  loadRecentActivities() {
    const token = wx.getStorageSync('token');
    wx.request({
      url: `${app.globalData.baseUrl}/api/activity/recent-items`, // 请求最近活动的API
      method: 'GET',
      header: {
        'Authorization': `Bearer ${token}`
      },
      success: (res) => {
        const recentItems = res.data.data.map(item => ({
          ...item,
          startTime: this.formatDateTime(item.startTime),
          endTime: this.formatDateTime(item.endTime)
        }));
        this.setData({
          recentItems: recentItems
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

  // 搜索功能的占位函数
  handleSearch(e) {
    // 实现搜索功能
    // 这里可以添加搜索逻辑，例如过滤recentItems数组
    console.log('搜索功能尚未实现');
  },

  // 查看更多功能的占位函数
  viewMore() {
    // 查看更多的逻辑
    wx.navigateTo({
      url: '/pages/activities/calendar/calendar' // 跳转到活动日历页面
    });
  },

  // 跳转到详细信息页面
  goToDetail(e) {
    const { id, type } = e.currentTarget.dataset; // 获取点击项的id和类型
    let url = '';
    switch(type) {
      case 'activity':
        url = `/pages/elderly/activities/detail?id=${id}`; // 跳转到活动详情
        break;
      case 'service':
        url = `/pages/service/detail?id=${id}`; // 跳转到服务详情
        break;
      default:
        wx.showToast({
          title: '未知类型',
          icon: 'none'
        });
        return; // 如果类型未知，直接返回
    }
    wx.navigateTo({ url }); // 执行跳转
  },
  onShow() {
    if (typeof this.getTabBar === 'function' && this.getTabBar()) {
      this.getTabBar().setData({
        selected: 0 // 首页
      });
    }
  }
}); 