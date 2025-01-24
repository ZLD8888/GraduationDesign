const app = getApp()

Page({
  data: {
    elderlyList: [],
    searchText: '',
    isStaffOrAdmin: false,
    currentPage: 1,
    pageSize: 10,
    hasMore: true
  },

  onLoad() {
    this.checkUserRole();
    this.loadElderlyList();
  },

  onPullDownRefresh() {
    this.setData({
      currentPage: 1,
      hasMore: true
    });
    this.loadElderlyList();
  },

  onReachBottom() {
    if (this.data.hasMore) {
      this.loadMoreElderlyList();
    }
  },

  checkUserRole() {
    const userRole = wx.getStorageSync('userRole');
    this.setData({
      // isStaffOrAdmin: userRole === 'ADMIN' || userRole === 'STAFF'
      isStaffOrAdmin: userRole === 'ADMIN'
    });
  },

  loadElderlyList() {
    const token = wx.getStorageSync('token');
    wx.request({
      url: `${app.globalData.baseUrl}/api/elderly`,
      method: 'GET',
      header: {
        'Authorization': `Bearer ${token}`
      },
      success: (res) => {
        this.setData({
          elderlyList: res.data.data,
          currentPage: 1
        });
        wx.stopPullDownRefresh();
      }
    });
  },

  loadMoreElderlyList() {
    const token = wx.getStorageSync('token');
    const nextPage = this.data.currentPage + 1;
    
    wx.request({
      url: `${app.globalData.baseUrl}/api/elderly?page=${nextPage}&size=${this.data.pageSize}`,
      method: 'GET',
      header: {
        'Authorization': `Bearer ${token}`
      },
      success: (res) => {
        if (res.data && res.data.length > 0) {
          this.setData({
            elderlyList: [...this.data.elderlyList, ...res.data],
            currentPage: nextPage
          });
        } else {
          this.setData({ hasMore: false });
        }
      }
    });
  },

  handleSearchInput(e) {
    this.setData({
      searchText: e.detail.value
    });
  },

  handleSearch() {
    if (!this.data.searchText) {
      this.loadElderlyList();
      return;
    }

    const token = wx.getStorageSync('token');
    wx.request({
      url: `${app.globalData.baseUrl}/api/elderly/search?name=${this.data.searchText}`,
      method: 'GET',
      header: {
        'Authorization': `Bearer ${token}`
      },
      success: (res) => {
        this.setData({
          elderlyList: res.data
        });
      }
    });
  },

  goToDetail(e) {
    const id = e.currentTarget.dataset.id;
    wx.navigateTo({
      url: `/pages/elderly/detail/detail?id=${id}`
    });
  },

  goToAdd() {
    wx.navigateTo({
      url: '/pages/elderly/add/add'
    });
  }
}); 