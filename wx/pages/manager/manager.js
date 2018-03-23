// pages/manager.js
const app = getApp()

Page({

    data: {
        date: 'null',
        stat: {}
    },

    onLoad: function (options) {
        var date = new Date()
        this.setData({ date: date.getFullYear() + '年' + date.getMonth() + '月' + date.getDate() + '日' })

        wx.request({
            url: app.globalData.host + 'stat/mobile',
            data: { 'openid': app.globalData.userAddress.openid },
            success: response => {
                if (response.data.status == 'success') {
                    this.setData({ stat: response.data.stat_data })
                }
            }
        })
    },

})