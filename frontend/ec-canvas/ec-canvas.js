const WxCanvas = require('./wx-canvas');
const echarts = require('./echarts');

function wrapTouch(event) {
  for (let i = 0; i < event.touches.length; ++i) {
    const touch = event.touches[i];
    touch.offsetX = touch.x;
    touch.offsetY = touch.y;
  }
  return event;
}

function compareVersion(v1, v2) {
  v1 = v1.split('.')
  v2 = v2.split('.')
  const len = Math.max(v1.length, v2.length)
  while (v1.length < len) {
    v1.push('0')
  }
  while (v2.length < len) {
    v2.push('0')
  }
  for (let i = 0; i < len; i++) {
    const num1 = parseInt(v1[i])
    const num2 = parseInt(v2[i])
    if (num1 > num2) {
      return 1
    } else if (num1 < num2) {
      return -1
    }
  }
  return 0
}

Component({
  properties: {
    canvasId: {
      type: String,
      value: 'ec-canvas'
    },
    ec: {
      type: Object
    },
    forceUseOld: {
      type: Boolean,
      value: false
    }
  },
  data: {
    isUseNewCanvas: false
  },
  ready: function () {
    wx.nextTick(() => {
      if (!this.data.ec) {
        console.warn('组件需要绑定 ec 变量');
        return;
      }

      if (!this.data.ec.onInit) {
        console.warn('组件需要绑定 ec.onInit 函数');
        return;
      }

      this.init();
    });
  },
  methods: {
    init: function (callback) {
      const version = wx.getAppBaseInfo().SDKVersion;
      const canUseNewCanvas = compareVersion(version, '2.9.0') >= 0;
      const forceUseOld = this.data.forceUseOld;
      const isUseNewCanvas = canUseNewCanvas && !forceUseOld;
      this.setData({ isUseNewCanvas });

      if (isUseNewCanvas) {
        // 使用新版本接口，限定查询作用域
        const query = this.createSelectorQuery().in(this);
        query.select(`#${this.data.canvasId}`)
          .fields({ 
            node: true, 
            size: true,
            context: true 
          })
          .exec((res) => {
            console.log('Canvas查询结果:', res);
            if (!res[0] || !res[0].node) {
              console.error('获取Canvas节点失败');
              setTimeout(() => this.init(callback), 50);
              return;
            }
            const canvasNode = res[0].node;
            const canvasContext = canvasNode.getContext('2d');
            const dpr = wx.getWindowInfo().pixelRatio;
            canvasNode.width = res[0].width * dpr;
            canvasNode.height = res[0].height * dpr;
            const canvas = new WxCanvas(canvasContext, this.data.canvasId, true, canvasNode);
            echarts.setPlatformAPI({
              createCanvas: () => canvas,
              addEventListener: (target, type, listener) => {
                target.addEventListener(type, listener);
              },
              removeEventListener: (target, type, listener) => {
                target.removeEventListener(type, listener);
              }
            });

            const chart = this.data.ec.onInit(canvas, res[0].width, res[0].height, dpr);
            if (chart) {
              this.chart = chart;
            }
          });
      } else {
        // 使用旧版本的接口
        const ctx = wx.createCanvasContext(this.data.canvasId, this);
        const canvas = new WxCanvas(ctx, this.data.canvasId);
        echarts.setCanvasCreator(() => canvas);

        const query = wx.createSelectorQuery().in(this);
        query.select('.ec-canvas')
          .boundingClientRect((res) => {
            if (!res) {
              setTimeout(() => this.init(callback), 100);
              return;
            }
            this._initChart(res.width, res.height, callback);
          })
          .exec();
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