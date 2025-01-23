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

  methods: {
    handleDateChange(e) {
      this.setData({
        'formData.recordTime': e.detail.value
      });
    },

    handleSubmit(e) {
      const formData = e.detail.value;
      // 数据类型转换
      formData.temperature = parseFloat(formData.temperature);
      formData.bloodPressureSystolic = parseInt(formData.bloodPressureSystolic);
      formData.bloodPressureDiastolic = parseInt(formData.bloodPressureDiastolic);
      formData.heartRate = parseInt(formData.heartRate);
      formData.bloodSugar = parseFloat(formData.bloodSugar);
      
      this.triggerEvent('submit', formData);
    }
  }
}); 