// pages/staff/manage/top_user/top_user.js
const app = getApp()

Page({

    data: {
        year: null,
        month: null,
        user_list: []
    },

    onLoad: function (options) {

        var date = new Date()
        this.setData({
            year: date.getFullYear(),
            month: date.getMonth() + 1
        })

        this.get_top_user()

    },

    get_top_user: function () {
        wx.request({
            url: app.globalData.host + 'stat/mobile/top_user',
            data: {
                'openid': app.globalData.userAddress.openid,
                'year': this.data.year,
                'month': this.data.month
            },
            success: response => {
                if (response.data.status == 'success') {
                    this.setData({
                        user_list: response.data.users
                    })
                    wx.setNavigationBarTitle({ title: this.data.year + '年' + this.data.month + '月下单排行' })
                }
            }
        })
    },

    last_month: function (e) {
        if (this.data.month == 1){
            this.setData({
                month: 12,
                year: this.data.year - 1
            })
        } else {
            this.setData({
                month: this.data.month - 1
            })
        }
        this.get_top_user()
    },

    next_month: function(e) {
        if (this.data.month == 12){
            this.setData({
                month: 1,
                year: this.data.year + 1
            })
        } else {
            this.setData({
                month: this.data.month + 1
            })
        }
        this.get_top_user()
    }

})