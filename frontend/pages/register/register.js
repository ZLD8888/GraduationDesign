const app = getApp()

Page({
  data: {
    roles: ['家属', '老人'],
    roleIndex: null,
    roleMap: {
      '家属': 'FAMILY',
      '老人': 'ELDERLY'
    }
  },

  handleRoleChange(e) {
    this.setData({
      roleIndex: e.detail.value
    })
  },

  handleRegister(e) {
    const { phone, name, password } = e.detail.value
    
    // 检查输入是否完整
    if (!phone || !name || !password) {
      wx.showToast({
        title: '请填写所有字段',
        icon: 'none'
      })
      return
    }

    wx.request({
      url: `${app.globalData.baseUrl}/api/auth/register`,
      method: 'POST',
      data: {
        phone,
        name,
        password,
        role: 'FAMILY'
      },
      success(res) {
        if (res.statusCode === 200) {
          wx.showToast({
            title: '注册成功',
            icon: 'success',
            duration: 2000
          })
          setTimeout(() => {
            wx.navigateTo({
              url: '/pages/login/login'
            })
          }, 2000)
        } else if (res.statusCode === 403) {
          wx.showToast({
            title: '手机号已注册',
            icon: 'none'
          })
        }
      },
      fail: (res) => {
        wx.showToast({
          title: '请求失败，请重试',
          icon: 'none'
        })
      }
    })
  },

  goToLogin() {
    wx.navigateTo({
      url: '/pages/login/login'
    })
  }
}) 