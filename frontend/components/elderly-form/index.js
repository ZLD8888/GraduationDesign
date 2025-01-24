Component({
  properties: {
    formData: {
      type: Object, // 表单数据的类型
      value: {} // 默认值为空对象
    },
    submitText: {
      type: String, // 提交按钮的文本类型
      value: '提交' // 默认文本为"提交"
    }
  },

  data: {
    genders: ['男', '女'], // 性别选项
    genderIndex: null, // 当前选择的性别索引
    caregivers: [], // 护理人员列表
    caregiverIndex: null // 当前选择的护理人员索引
  },

  lifetimes: {
    attached() {
      this.initFormData(); // 组件附加时初始化表单数据
      this.loadCaregivers(); // 加载护理人员列表
    }
  },

  methods: {
    initFormData() {
      // 初始化表单数据
      const { gender, caregiver } = this.data.formData; // 从表单数据中获取性别和护理人员
      if (gender) {
        this.setData({
          genderIndex: this.data.genders.indexOf(gender) // 设置性别索引
        });
      }
      if (caregiver) {
        this.loadCaregivers().then(() => {
          const index = this.data.caregivers.findIndex(c => c.id === caregiver.id); // 查找护理人员的索引
          this.setData({ caregiverIndex: index }); // 设置护理人员索引
        });
      }
    },

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
            this.setData({ caregivers: res.data.data }); // 设置护理人员数据
            resolve(res.data.data); // 解析 Promise
          }
        });
      });
    },

    handleGenderChange(e) {
      // 处理性别选择变化
      this.setData({
        genderIndex: e.detail.value, // 更新性别索引
        ['formData.gender']: this.data.genders[e.detail.value] // 更新表单数据中的性别
      });
    },

    handleCaregiverChange(e) {
      // 处理护理人员选择变化
      this.setData({
        caregiverIndex: e.detail.value, // 更新护理人员索引
        ['formData.caregiverId']: this.data.caregivers[e.detail.value].id // 更新表单数据中的护理人员 ID
      });
    },

    handleDateChange(e) {
      // 处理日期选择变化
      const field = e.currentTarget.dataset.field; // 获取当前字段
      this.setData({
        [`formData.${field}`]: e.detail.value // 更新表单数据中的日期字段
      });
    },

    handleSubmit(e) {
      // 处理表单提交
      const formData = e.detail.value; // 获取表单数据
      formData.gender = this.data.genders[this.data.genderIndex]; // 设置性别
      formData.caregiverId = this.data.caregivers[this.data.caregiverIndex]?.id; // 设置护理人员 ID

      // 身份证号验证
      const idCard = formData.idCard; // 假设身份证号字段名为 idCard
      const idCardPattern = /^[1-9]\d{5}(18|19|20)\d{2}(0[1-9]|1[0-2])(0[1-9]|[12]\d|3[01])\d{3}(\d|X)$/; // 身份证号正则表达式
      if (!idCardPattern.test(idCard)) {
        wx.showToast({
          title: '身份证号格式不正确',
          icon: 'none'
        });
        return; // 如果身份证号格式不正确，终止提交
      }

      this.triggerEvent('submit', formData); // 触发提交事件，将表单数据传递出去
    }
  }
}); 