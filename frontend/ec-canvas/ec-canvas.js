Component({
  properties: {
    canvasId: {
      type: String,
      value: 'ec-canvas'
    },
    ec: {
      type: Object
    }
  },
  data: {
    isUseNew: false
  },
  ready: function () {
    if (!this.data.ec) {
      console.warn('组件需绑定 ec 变量，例：<ec-canvas id="mychart-dom-bar" canvas-id="mychart-bar" ec="{{ ec }}"></ec-canvas>');
      return;
    }
    if (!this.data.ec.lazyLoad) {
      this.init();
    }
  },
  methods: {
    init: function (callback) {
      const version = wx.version.version.split('.').map(n => parseInt(n, 10));
      const isValid = version[0] > 1 || (version[0] === 1 && version[1] >= 9);
      this.setData({ isUseNew: isValid });

      const ctx = wx.createCanvasContext(this.data.canvasId, this);
      const canvas = new WxCanvas(ctx, this.data.canvasId, false);

      echarts.setCanvasCreator(() => canvas);
      const chart = echarts.init(canvas, null, {
        width: this.data.ec.width || 300,
        height: this.data.ec.height || 200
      });
      
      if (typeof callback === 'function') {
        callback(chart);
      }

      if (typeof this.data.ec.onInit === 'function') {
        this.data.ec.onInit(chart);
      }
    },
    canvasToTempFilePath(opt) {
      const that = this;
      opt = opt || {};
      opt.canvasId = this.data.canvasId;
      
      return wx.canvasToTempFilePath({
        ...opt,
        success: function (res) {
          typeof opt.success === 'function' && opt.success(res);
        },
        fail: function (error) {
          typeof opt.fail === 'function' && opt.fail(error);
        }
      }, that);
    },
    touchStart(e) {
      if (this.chart && e.touches.length > 0) {
        var touch = e.touches[0];
        var handler = this.chart.getZr().handler;
        handler.dispatch('mousedown', {
          zrX: touch.x,
          zrY: touch.y
        });
        handler.dispatch('mousemove', {
          zrX: touch.x,
          zrY: touch.y
        });
        handler.processGesture(wrapTouch(e), 'start');
      }
    },
    touchMove(e) {
      if (this.chart && e.touches.length > 0) {
        var touch = e.touches[0];
        var handler = this.chart.getZr().handler;
        handler.dispatch('mousemove', {
          zrX: touch.x,
          zrY: touch.y
        });
        handler.processGesture(wrapTouch(e), 'change');
      }
    },
    touchEnd(e) {
      if (this.chart) {
        const touch = e.changedTouches ? e.changedTouches[0] : {};
        var handler = this.chart.getZr().handler;
        handler.dispatch('mouseup', {
          zrX: touch.x,
          zrY: touch.y
        });
        handler.dispatch('click', {
          zrX: touch.x,
          zrY: touch.y
        });
        handler.processGesture(wrapTouch(e), 'end');
      }
    }
  }
}); 