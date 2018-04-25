// pages/manager.js
const app = getApp()

Page({

    data: {
        date: '',
        feedback_count: 0,
        stat: {},

        user_growth: [],
    },

    onLoad: function (options) {

        wx.setNavigationBarTitle({ title: '管理' })

        var date = new Date()
        this.setData({ date: date.getFullYear() + '年' + (date.getMonth() + 1) + '月' + date.getDate() + '日' })

        wx.request({
            url: app.globalData.host + 'stat/mobile',
            data: { 'openid': app.globalData.userAddress.openid },
            success: response => {
                if (response.data.status == 'success') {
                    this.setData({ stat: response.data.stat_data })
                }
            }
        })

        wx.request({
            url: app.globalData.host + 'stat/mobile/user_growth',
            data: { 'openid': app.globalData.userAddress.openid },
            success: response => {
                if (response.data.status == 'success') {
                    this.setData({ user_growth: response.data.growth })
                    this.draw_user_growth()
                }
            }
        })

        wx.request({
            url: app.globalData.host + 'get_feedback_count',
            data: { 'openid': app.globalData.userAddress.openid },
            success: response => {
                if (response.data.status == 'success') {
                    this.setData({ feedback_count: response.data.untreated + response.data.treating })
                }
            }
        })
    },

    draw_user_growth: function () {

        // 指向数据
        const data = this.data.user_growth

        // 创建画布环境
        const user_new = wx.createCanvasContext('user_new')
        const user_total = wx.createCanvasContext('user_total')
        // 设置线条颜色
        user_new.setStrokeStyle('#7cb5ec')
        user_total.setStrokeStyle('#7cb5ec')
        // 设置文字大小
        user_new.setFontSize(10)
        user_total.setFontSize(10)
        // 设置文字居中
        user_new.setTextAlign('center')
        user_total.setTextAlign('center')

        // 起始位置
        var w_curr = 15
        // 画布宽高
        const w_canvas = wx.getSystemInfoSync().windowWidth - w_curr
        const h_canvas = 100
        // 宽度步长
        const w_step = w_canvas / data.length

        // 获取最大最小值
        var new_max = 0, new_min = 99999
        var total_max = 0, total_min = 99999
        for (var i = 0; i < data.length; i++) {
            new_max = new_max < data[i].new ? data[i].new : new_max
            new_min = new_min > data[i].new ? data[i].new : new_min

            total_max = total_max < data[i].total ? data[i].total : total_max
            total_min = total_min > data[i].total ? data[i].total : total_min
        }

        // 计算缩放率适应画布
        const new_ratio = h_canvas / new_max
        const total_ratio = h_canvas / total_max

        /*  因为原点在左上角所以要用高度减去数值得到翻转后的y坐标
         *  因为服务器返回数组[0]是最近的一天所以要从数组尾部开始画图
         *  减去最小值使得最小值所在点位于屏幕底部(画布的顶部)
         *  乘缩放率使得最大值所在点位于屏幕顶部(画布的底部)
         *  mmp作孽啊
         */

        // 开始描绘路径
        user_new.beginPath()
        user_total.beginPath()
        // 移动到起始点
        user_new.moveTo(w_curr, h_canvas - (data[data.length - 1].new - new_min) * new_ratio)
        user_total.moveTo(w_curr, h_canvas - (data[data.length - 1].total - total_min) * total_ratio)
        // 绘制起点日期和人数
        user_new.fillText(data[data.length - 1].date, w_curr, h_canvas + 10)
        user_new.fillText(data[data.length - 1].new, w_curr, h_canvas - (data[data.length - 1].new - new_min) * new_ratio)
        user_total.fillText(data[data.length - 1].date, w_curr, h_canvas + 10)
        user_total.fillText(data[data.length - 1].total, w_curr, h_canvas - (data[data.length - 1].total - total_min) * total_ratio)

        // 依次绘制路径
        for (var i = data.length - 2; i >= 0; i--) {
            w_curr += w_step
            user_new.lineTo(w_curr, h_canvas - (data[i].new - new_min) * new_ratio)
            user_total.lineTo(w_curr, h_canvas - (data[i].total - total_min) * total_ratio)
            // 每7天绘制日期和人数
            if ((data.length - i - 1) % 7 == 0) {
                user_new.fillText(data[i].date, w_curr, h_canvas + 10)
                user_new.fillText(data[i].new, w_curr, h_canvas - (data[i].new - new_min) * new_ratio)
                user_total.fillText(data[i].date, w_curr, h_canvas + 10)
                user_total.fillText(data[i].total, w_curr, h_canvas - (data[i].total - total_min) * total_ratio)
            }
        }

        // 填充路径 绘图
        user_new.stroke()
        user_total.stroke()
        user_new.draw()
        user_total.draw()
    },

    to_search_user: function (e) {
        if (e.detail.value.length >= 1) {
            wx.navigateTo({
                url: '/pages/staff/manage/search_user/search_user' + '?keyword=' + e.detail.value,
            })
        }
    },

    to_top_user: function (e) {
        wx.navigateTo({
            url: '/pages/staff/manage/top_user/top_user',
        })
    },

    to_feedback: function (e) {
        wx.navigateTo({
            url: '/pages/staff/manage/feedback/feedback',
        })
    }

})