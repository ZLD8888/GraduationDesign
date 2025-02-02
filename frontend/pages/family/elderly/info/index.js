const app = getApp();

Page({
  data: {
    elderlyList: [],
    showBindModal: false,
    nameInput: '',
    idCardInput: '',
    userId: null
  },

  onLoad() {
    const userId = wx.getStorageSync('userId');
    const token = wx.getStorageSync('token');
    console.log("页面加载 - 用户ID:", userId);
    console.log("页面加载 - Token:", token);
    
    if (!userId || !token) {
      console.log("用户信息不完整，跳转登录页");
      wx.redirectTo({
        url: '/pages/login/login'
      });
      return;
    }
    
    this.setData({ userId });
    this.loadElderlyList();
  },

  onShow() {
    this.loadElderlyList();
  },

  // 计算年龄的函数
  calculateAge(birthDate) {
    if (!birthDate) return '';
    
    const today = new Date();
    const birth = new Date(birthDate);
    
    // 获取出生年月日和当前年月日
    const birthYear = birth.getFullYear();
    const birthMonth = birth.getMonth();
    const birthDay = birth.getDate();
    
    const currentYear = today.getFullYear();
    const currentMonth = today.getMonth();
    const currentDay = today.getDate();
    
    // 计算年龄
    let age = currentYear - birthYear;
    
    // 如果当前月份小于出生月份，或者月份相同但当前日期小于出生日期，年龄减1
    if (currentMonth < birthMonth || (currentMonth === birthMonth && currentDay < birthDay)) {
      age--;
    }
    
    return age;
  },

  // 加载已绑定的老人列表
  loadElderlyList() {
    const token = wx.getStorageSync('token');
    console.log("开始加载老人列表");
    console.log("当前登录的用户ID:", this.data.userId);
    console.log("当前token:", token);

    // 检查token格式
    if (!token) {
      console.log("Token不存在，跳转登录页");
      wx.redirectTo({
        url: '/pages/login/login'
      });
      return;
    }

    // 尝试解析token
    try {
      const tokenParts = token.split('.');
      if (tokenParts.length === 3) {
        const payload = JSON.parse(atob(tokenParts[1]));
        console.log("Token payload:", payload);
        console.log("Token过期时间:", new Date(payload.exp * 1000).toLocaleString());
      }
    } catch (e) {
      console.error("Token解析失败:", e);
    }

    const authHeader = token.startsWith('Bearer ') ? token : `Bearer ${token}`;
    console.log("发送的Authorization header:", authHeader);

    wx.request({
      url: `${app.globalData.baseUrl}/api/family/elderly/${this.data.userId}`,
      method: 'GET',
      header: {
        'Authorization': authHeader,
        'Content-Type': 'application/json'
      },
      success: (res) => {
        console.log("API完整响应:", res);
        console.log("响应状态码:", res.statusCode);
        console.log("响应头:", res.header);
        console.log("响应数据:", res.data);

        if (res.statusCode === 200) {
          if (res.data && res.data.code === '200') {
            // 处理每个老人的数据，计算年龄
            const elderlyList = res.data.data.map(elderly => ({
              ...elderly,
              age: this.calculateAge(elderly.birthDate)
            }));
            
            this.setData({
              elderlyList
            });
            console.log("成功获取老人列表:", elderlyList);
          } else {
            console.log("获取数据失败:", res.data);
            wx.showToast({
              title: res.data.msg || '获取数据失败',
              icon: 'none'
            });
          }
        } else if (res.statusCode === 403) {
          console.error('认证失败，完整响应:', res);
          
          // 尝试重新登录
          wx.login({
            success: (loginRes) => {
              if (loginRes.code) {
                console.log("重新获取登录code:", loginRes.code);
                // 这里可以调用你的登录接口
                wx.request({
                  url: `${app.globalData.baseUrl}/api/user/login`,
                  method: 'POST',
                  data: {
                    code: loginRes.code
                  },
                  success: (loginResponse) => {
                    if (loginResponse.data && loginResponse.data.code === '200') {
                      const newToken = loginResponse.data.data.token;
                      const newUserId = loginResponse.data.data.userId;
                      
                      wx.setStorageSync('token', newToken);
                      wx.setStorageSync('userId', newUserId);
                      
                      console.log("自动重新登录成功，重新加载数据");
                      this.loadElderlyList();
                    } else {
                      console.error("自动重新登录失败:", loginResponse);
                      wx.showToast({
                        title: '登录失败，请手动重新登录',
                        icon: 'none',
                        duration: 2000,
                        complete: () => {
                          setTimeout(() => {
                            wx.redirectTo({
                              url: '/pages/login/login'
                            });
                          }, 2000);
                        }
                      });
                    }
                  },
                  fail: (loginError) => {
                    console.error("自动重新登录请求失败:", loginError);
                    wx.showToast({
                      title: '登录失败，请手动重新登录',
                      icon: 'none',
                      duration: 2000,
                      complete: () => {
                        setTimeout(() => {
                          wx.redirectTo({
                            url: '/pages/login/login'
                          });
                        }, 2000);
                      }
                    });
                  }
                });
              }
            }
          });
        }
      },
      fail: (error) => {
        console.error('请求失败，完整错误:', error);
        console.error('错误状态码:', error.statusCode);
        console.error('错误信息:', error.errMsg);
        
        wx.showToast({
          title: '网络请求失败',
          icon: 'none'
        });
      }
    });
  },

  // 显示绑定弹窗
  showBindModal() {
    this.setData({
      showBindModal: true,
      nameInput: '',
      idCardInput: ''
    });
  },

  // 隐藏绑定弹窗
  hideBindModal() {
    this.setData({
      showBindModal: false,
      nameInput: '',
      idCardInput: ''
    });
  },

  // 验证身份证号
  validateIdCard(idCard) {
    // 身份证号码为15位或者18位，15位时全为数字，18位前17位为数字，最后一位是校验位，可能为数字或字符X
    const reg = /(^\d{15}$)|(^\d{18}$)|(^\d{17}(\d|X|x)$)/;
    return reg.test(idCard);
  },

  // 处理绑定老人
  handleBind() {
    const { nameInput, idCardInput } = this.data;
    
    // 验证姓名
    if (!nameInput.trim()) {
      wx.showToast({
        title: '请输入老人姓名',
        icon: 'none'
      });
      return;
    }

    // 验证身份证号
    if (!idCardInput.trim()) {
      wx.showToast({
        title: '请输入身份证号',
        icon: 'none'
      });
      return;
    }

    if (!this.validateIdCard(idCardInput)) {
      wx.showToast({
        title: '身份证号格式不正确',
        icon: 'none'
      });
      return;
    }

    const token = wx.getStorageSync('token');
    console.log("绑定请求token:", token);

    if (!token) {
      wx.showToast({
        title: '请先登录',
        icon: 'none',
        complete: () => {
          wx.redirectTo({
            url: '/pages/login/login'
          });
        }
      });
      return;
    }

    wx.request({
      url: `${app.globalData.baseUrl}/api/family/bind`,
      method: 'POST',
      header: {
        'Authorization': token.startsWith('Bearer ') ? token : `Bearer ${token}`,
        'Content-Type': 'application/json'
      },
      data: {
        familyId: this.data.userId,
        elderlyName: nameInput,
        elderlyIdCard: idCardInput
      },
      success: (res) => {
        console.log("绑定响应:", res);
        if (res.statusCode === 200) {
          if (res.data && res.data.code === '200') {
            wx.showToast({
              title: '绑定成功',
              icon: 'success'
            });
            this.hideBindModal();
            this.loadElderlyList();
          } else {
            wx.showToast({
              title: res.data.msg || '绑定失败',
              icon: 'none'
            });
          }
        } else if (res.statusCode === 403) {
          console.error('认证失败，完整响应:', res);
          wx.showToast({
            title: '认证失败，正在重新登录',
            icon: 'none',
            duration: 2000,
            complete: () => {
              wx.removeStorageSync('token');
              wx.removeStorageSync('userId');
              setTimeout(() => {
                wx.redirectTo({
                  url: '/pages/login/login'
                });
              }, 2000);
            }
          });
        }
      },
      fail: (error) => {
        console.error('绑定请求失败:', error);
        wx.showToast({
          title: '绑定失败',
          icon: 'none'
        });
      }
    });
  },

  // 处理解除绑定
  handleUnbind(e) {
    const elderlyId = e.currentTarget.dataset.id;
    wx.showModal({
      title: '确认解除绑定',
      content: '确定要解除与该老人的绑定关系吗？',
      success: (res) => {
        if (res.confirm) {
          this.unbindElderly(elderlyId);
        }
      }
    });
  },

  // 解除绑定请求
  unbindElderly(elderlyId) {
    // 从elderlyList中找到对应的老人信息
    const elderly = this.data.elderlyList.find(item => item.id === elderlyId);
    if (!elderly) {
      wx.showToast({
        title: '未找到老人信息',
        icon: 'none'
      });
      return;
    }

    const token = wx.getStorageSync('token');
    wx.request({
      url: `${app.globalData.baseUrl}/api/family/unbind`,
      method: 'POST',
      header: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      },
      data: {
        familyId: this.data.userId,
        elderlyName: elderly.name,
        elderlyIdCard: elderly.idCard
      },
      success: (res) => {
        if (res.data && res.data.code === '200') {
          wx.showToast({
            title: '解除绑定成功',
            icon: 'success'
          });
          this.loadElderlyList();
        } else {
          wx.showToast({
            title: res.data.msg || '解除绑定失败',
            icon: 'none'
          });
        }
      }
    });
  },

  // 跳转到老人详情页
  goToDetail(e) {
    const id = e.currentTarget.dataset.id;
    wx.navigateTo({
      url: `/pages/elderly/detail/detail?id=${id}`
    });
  }
}); 