// pages/share/invite_history.js
const app = getApp()

Page({

    data: {
        invite_history: [],
        invite_count: 0
    },

    onLoad: function (options) {

        wx.setNavigationBarTitle({ title: '邀请记录' })

        wx.request({
            url: app.globalData.host + 'get_invite_history',
            data: { 'openid': app.globalData.userAddress.openid },
            success: response => {
                this.setData({
                    invite_history: response.data.history,
                    invite_count: response.data.count
                })
            }
        })
    }
})