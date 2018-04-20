// pages/staff/manage/top_user/top_user.js
const app = getApp()

Page({

    data: {
        user_list: []
    },

    onLoad: function (options) {

        wx.setNavigationBarTitle({ title: '下单排行' })

        wx.request({
            url: app.globalData.host + 'stat/mobile/top_user',
            data: { 'openid': app.globalData.userAddress.openid },
            success: response => {
                if (response.data.status == 'success') {
                    this.setData({
                        user_list: response.data.users
                    })
                }
            }
        })
    }
})