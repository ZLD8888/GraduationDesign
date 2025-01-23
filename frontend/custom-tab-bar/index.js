Component({
  data: {
    selected: 0,
    color: "#999999",
    selectedColor: "#1296db",
    list: []
  },

  attached() {
    const userRole = wx.getStorageSync('userRole');
    const rolePages = {
      'ADMIN': '/pages/admin/home/index',
      'STAFF': '/pages/staff/home/index',
      'FAMILY': '/pages/family/home/index',
      'ELDERLY': '/pages/elderly/home/index'
    };

    const homePath = rolePages[userRole] || '/pages/admin/home/index';
    
    this.setData({
      list: [
        {
          pagePath: homePath,
          text: "首页",
          iconPath: "../images/home.png",
          selectedIconPath: "../images/home-active.png"
        },
        {
          pagePath: "/pages/message/index",
          text: "消息",
          iconPath: "../images/message.png",
          selectedIconPath: "../images/message-active.png"
        },
        {
          pagePath: "/pages/profile/index",
          text: "我的",
          iconPath: "../images/profile.png",
          selectedIconPath: "../images/profile-active.png"
        }
      ]
    });
  },

  methods: {
    switchTab(e) {
      const data = e.currentTarget.dataset;
      const url = data.path;
      wx.switchTab({
        url,
        success: () => {
          this.setData({
            selected: data.index
          });
        },
        fail: (err) => {
          console.error('switchTab fail:', err);
          // 如果 switchTab 失败，尝试使用 redirectTo
          wx.redirectTo({
            url,
            fail: (redirectErr) => {
              console.error('redirectTo also failed:', redirectErr);
            }
          });
        }
      });
    }
  }
}); 