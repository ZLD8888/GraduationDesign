Component({
  properties: {
    formData: {
      type: Object,
      value: {}
    },
    submitText: {
      type: String,
      value: '提交'
    }
  },

  data: {
    genders: ['男', '女'],
    genderIndex: null,
    caregivers: [],
    caregiverIndex: null
  },

  lifetimes: {
    attached() {
      this.initFormData();
      this.loadCaregivers();
    }
  },

  methods: {
    initFormData() {
      const { gender, caregiver } = this.data.formData;
      if (gender) {
        this.setData({
          genderIndex: this.data.genders.indexOf(gender)
        });
      }
      if (caregiver) {
        this.loadCaregivers().then(() => {
          const index = this.data.caregivers.findIndex(c => c.id === caregiver.id);
          this.setData({ caregiverIndex: index });
        });
      }
    },

    loadCaregivers() {
      const token = wx.getStorageSync('token');
      return new Promise((resolve) => {
        wx.request({
          url: `${getApp().globalData.baseUrl}/api/users/caregivers`,
          method: 'GET',
          header: {
            'Authorization': `Bearer ${token}`
          },
          success: (res) => {
            this.setData({ caregivers: res.data });
            resolve(res.data);
          }
        });
      });
    },

    handleGenderChange(e) {
      this.setData({
        genderIndex: e.detail.value,
        ['formData.gender']: this.data.genders[e.detail.value]
      });
    },

    handleCaregiverChange(e) {
      this.setData({
        caregiverIndex: e.detail.value,
        ['formData.caregiverId']: this.data.caregivers[e.detail.value].id
      });
    },

    handleDateChange(e) {
      const field = e.currentTarget.dataset.field;
      this.setData({
        [`formData.${field}`]: e.detail.value
      });
    },

    handleSubmit(e) {
      const formData = e.detail.value;
      formData.gender = this.data.genders[this.data.genderIndex];
      formData.caregiverId = this.data.caregivers[this.data.caregiverIndex]?.id;
      
      this.triggerEvent('submit', formData);
    }
  }
}); 