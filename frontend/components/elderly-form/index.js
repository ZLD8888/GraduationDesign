Component({
  properties: {
    formData: {
      type: Object, // 表单数据的类型
      value: {}, // 默认值为空对象
      observer: function(newVal) {
        if (newVal) {
          // 更新所有表单数据
          this.setData({
            name: newVal.name || '',
            gender: newVal.gender || '',
            age: newVal.age || '',
            idCard: newVal.idCard || '',
            phone: newVal.phone || '',
            address: newVal.address || '',
            emergencyContact: newVal.emergencyContact || '',
            emergencyPhone: newVal.emergencyPhone || '',
            medicalHistory: newVal.medicalHistory || '',
            healthCondition: newVal.healthCondition || '',
            bedNumber: newVal.bedNumber || '',
            birthDate: newVal.birthDate || '',
            checkInDate: newVal.checkInDate || '',
          });

          // 设置性别索引
          if (newVal.gender) {
            const genderIndex = this.data.genders.indexOf(newVal.gender);
            this.setData({
              genderIndex: genderIndex >= 0 ? genderIndex : null
            });
          }

          // 加载护工列表并设置选中的护工
          this.loadCaregivers().then(() => {
            if (newVal.caregiverId) {
              // 如果有护工ID，获取护工信息
              this.loadCaregiverInfo(newVal.caregiverId).then(caregiver => {
                if (caregiver) {
                  const newCaregivers = [...this.data.caregivers];
                  if (!newCaregivers.find(c => c.id === caregiver.id)) {
                    newCaregivers.push(caregiver);
                  }
                  const caregiverIndex = newCaregivers.findIndex(c => c.id === caregiver.id);
                  this.setData({
                    caregivers: newCaregivers,
                    caregiverIndex: caregiverIndex >= 0 ? caregiverIndex : null
                  });
                }
              });
            }
          });
        }
      }
    },
    submitText: {
      type: String, // 提交按钮的文本类型
      value: '提交' // 默认文本为"提交"
    }
  },

  data: {
    name: '',
    gender: '',
    age: '',
    idCard: '',
    phone: '',
    address: '',
    emergencyContact: '',
    emergencyPhone: '',
    medicalHistory: '',
    healthCondition: '',
    bedNumber: '',
    genders: ['男', '女'], // 性别选项
    genderIndex: null, // 当前选择的性别索引
    caregivers: [], // 护理人员列表
    caregiverIndex: null, // 当前选择的护理人员索引
    birthDate: '',
    checkInDate: '',
  },

  lifetimes: {
    attached() {
      // 组件初始化时加载护工列表
      this.loadCaregivers();
    }
  },

  methods: {
    loadCaregivers() {
      // 加载护理人员列表
      const token = wx.getStorageSync('token'); // 从本地存储获取 token
      return new Promise((resolve) => {
        wx.request({
          url: `${getApp().globalData.baseUrl}/api/users/caregivers`, // 请求护理人员的 API
          method: 'GET',
          header: {
            'Authorization': `Bearer ${token}` // 设置请求头，包含 token
          },
          success: (res) => {
            if (res.data && res.data.data) {
              this.setData({ caregivers: res.data.data }); // 设置护理人员数据
            }
            resolve(res.data.data); // 解析 Promise
          },
          fail: () => {
            resolve([]);
          }
        });
      });
    },

    loadCaregiverInfo(caregiverId) {
      const token = wx.getStorageSync('token');
      return new Promise((resolve) => {
        wx.request({
          url: `${getApp().globalData.baseUrl}/api/users/caregiver/${caregiverId}`,
          method: 'GET',
          header: {
            'Authorization': `Bearer ${token}`
          },
          success: (res) => {
            if (res.data && res.data.data) {
              resolve(res.data.data);
            } else {
              resolve(null);
            }
          },
          fail: () => {
            resolve(null);
          }
        });
      });
    },

    handleGenderChange(e) {
      // 处理性别选择变化
      const index = e.detail.value;
      this.setData({
        genderIndex: index,
        gender: this.data.genders[index]
      });
    },

    handleCaregiverChange(e) {
      // 处理护理人员选择变化
      const index = e.detail.value;
      this.setData({
        caregiverIndex: index
      });
    },

    handleDateChange(e) {
      // 处理日期选择变化
      const field = e.currentTarget.dataset.field; // 获取当前字段
      this.setData({
        [field]: e.detail.value  // 直接存储在组件的 data 中，而不是 formData 中
      });
    },

    handleSubmit(e) {
      // 处理表单提交
      const formData = e.detail.value;
      
      // 添加性别数据
      if (this.data.genderIndex !== null) {
        formData.gender = this.data.genders[this.data.genderIndex];
      }
      
      // 添加护工ID
      if (this.data.caregiverIndex !== null) {
        formData.caregiverId = this.data.caregivers[this.data.caregiverIndex].id;
      }

      // 添加日期字段
      if (this.data.birthDate) {
        formData.birthDate = this.data.birthDate;
      }
      if (this.data.checkInDate) {
        formData.checkInDate = this.data.checkInDate;
      }

      // 身份证号验证
      const idCardPattern = /^[1-9]\d{5}(18|19|20)\d{2}(0[1-9]|1[0-2])(0[1-9]|[12]\d|3[01])\d{3}(\d|X)$/;
      if (!idCardPattern.test(formData.idCard)) {
        wx.showToast({
          title: '身份证号格式不正确',
          icon: 'none'
        });
        return;
      }

      // 手机号验证
      const phonePattern = /^1[3-9]\d{9}$/;
      if (!phonePattern.test(formData.phone)) {
        wx.showToast({
          title: '请输入有效的手机号',
          icon: 'none'
        });
        return;
      }

      this.triggerEvent('submit', formData); // 触发提交事件，将表单数据传递出去
    }
  }
}); 