const app = getApp()

Page({
  data: {},

  handleLogin(e) {
    const { phone, password } = e.detail.value
    
    if (!phone || !password) {
      wx.showToast({
        title: '请输入手机号和密码',
        icon: 'none'
      });
      return;
    }

    wx.request({
      url: `${app.globalData.baseUrl}/api/auth/login`,
      method: 'POST',
      data: {
        phone,
        password
      },
      success: (res) => {
        console.log('登录响应:', res.data);
        if (res.data.data) {
          // 保存token
          wx.setStorageSync('token', res.data.data);
          app.globalData.data = res.data.data;

          // 获取用户信息
          wx.request({
            url: `${app.globalData.baseUrl}/api/users/current`,
            method: 'GET',
            header: {
              'Authorization': `Bearer ${res.data.data}`
            },
            success: (userRes) => {
              console.log('获取用户信息响应:', userRes.data);
              console.log('用户角色:', userRes.data.data.role);
              if (userRes.statusCode === 200) {
                app.globalData.userInfo = userRes.data.data;
                // 存储用户ID
                wx.setStorageSync('userId', userRes.data.data.id);
                console.log('用户ID:', userRes.data.data.id);
                // 存储用户信息
                wx.setStorageSync('userInfo', userRes.data.data);
                // 存储用户角色
                wx.setStorageSync('userRole', userRes.data.data.role); // 确保存储用户角色
                // 根据用户角色跳转到不同的首页
                const rolePages = {
                  'ADMIN': '/pages/admin/home/index',
                  'STAFF': '/pages/staff/home/index',
                  'FAMILY': '/pages/family/home/index',
                  'ELDERLY': '/pages/elderly/home/index'
                };

                const userRole = userRes.data.data.role.toUpperCase();
                const targetUrl = rolePages[userRole];

                if (targetUrl) {
                  wx.switchTab({
                    url: targetUrl,
                    success: () => {
                      console.log('跳转成功');
                    },
                    fail: (err) => {
                      console.error('跳转失败:', err);
                      // 如果 switchTab 失败，尝试使用 reLaunch
                      wx.reLaunch({
                        url: targetUrl
                      });
                    }
                  });
                } else {
                  wx.showToast({
                    title: '角色未定义',
                    icon: 'none'
                  });
                }
              } else {
                wx.showToast({
                  title: '获取用户信息失败',
                  icon: 'none'
                });
              }
            },
            fail: (error) => {
              console.error('获取用户信息失败:', error);
              wx.showToast({
                title: '获取用户信息失败',
                icon: 'none'
              });
            }
          });
        } else {
          wx.showToast({
            title: '登录失败',
            icon: 'none'
          });
        }
      },
      fail: (error) => {
        console.error('登录请求失败:', error);
        wx.showToast({
          title: '网络错误',
          icon: 'none'
        });
      }
    });
  },

  handleWechatLogin() {
    wx.login({
      success: (res) => {
        if (res.code) {
          // 获取微信用户信息并进行登录
          wx.getUserProfile({
            desc: '用于完善用户资料',
            success: (userInfo) => {
              // 调用后端接口进行微信登录
              console.log('微信登录成功:', userInfo);
            }
          });
        }
      }
    });
  },

  goToRegister() {
    wx.navigateTo({
      url: '/pages/register/register'
    });
  }
}) 