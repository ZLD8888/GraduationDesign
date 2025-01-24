const app = getApp();

Page({
  data: {
    oldPassword: '',
    newPassword: '',
    confirmPassword: ''
  },

  handleInput(e) {
    const { value } = e.detail;
    const { name } = e.currentTarget.dataset; // 获取输入框的名称

    // 根据输入框的名称更新相应的状态
    this.setData({
      [name]: value
    });
  },

  handleChangePassword(e) {
    const { oldPassword, newPassword, confirmPassword } = this.data;

    // 检查新密码和确认密码是否匹配
    if (newPassword !== confirmPassword) {
      wx.showToast({
        title: '新密码与确认密码不匹配',
        icon: 'none'
      });
      return;
    }

    const token = wx.getStorageSync('token');
    wx.request({
      url: `${app.globalData.baseUrl}/api/users/change-password`,
      method: 'POST',
      header: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      },
      data: {
        oldPassword,
        newPassword
      },
      success: (res) => {
        if (res.statusCode === 200) {
          wx.showToast({
            title: '密码修改成功',
            icon: 'success'
          });
          setTimeout(() => {
            wx.navigateBack(); // 返回上一个页面
          }, 2000);
        } else {
          wx.showToast({
            title: res.data.message || '修改失败',
            icon: 'none'
          });
        }
      },
      fail: () => {
        wx.showToast({
          title: '请求失败，请重试',
          icon: 'none'
        });
      }
    });
  }
}); 