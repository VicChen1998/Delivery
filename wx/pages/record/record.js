// pages/history.js
const app = getApp()

Page({

    data: {
        hasUserAddress: false,
        userAddress: {},

        finish_get_order: false,
        hasOrder: false,
        order_count: 0,
        order_list: {},

    },

    clear: function () {
        this.setData({
            hasOrder: false,
            order_count: 0,
            order_list: {}
        })
    },

    onLoad: function (options) {

        if (app.globalData.userAddress) {
            this.setData({
                userAddress: app.globalData.userAddress,
                hasUserAddress: true
            })
        } else {
            app.sendUserAddressToRecordPage = response => {
                this.setData({
                    userAddress: app.globalData.userAddress,
                    hasUserAddress: true
                })
            }
        }

        wx.request({
            url: app.globalData.host + 'get_notice',
            data: { 'page': '/pages/record/record' },
            success: response => {
                if (response.data.has_notice) {
                    wx.showModal({
                        title: response.data.title,
                        content: response.data.content,
                        showCancel: false,
                    })
                }
            }
        })
    },

    onShow: function () {
        this.get_order()
    },

    onPullDownRefresh: function () {
        this.get_order()
    },

    get_order: function () {
        wx.showNavigationBarLoading()
        wx.request({
            url: app.globalData.host + 'get_order',
            data: { 'openid': this.data.userAddress.openid },
            success: response => {
                this.setData({
                    order_list: response.data.order_list,
                    order_count: response.data.order_count,
                    hasOrder: true
                })
            },
            complete: response => {
                this.setData({ finish_get_order: true })
                wx.stopPullDownRefresh()
                wx.hideNavigationBarLoading()
            }
        })
    },

    show_detail: function (e) {
        app.globalData.order = this.data.order_list[e.currentTarget.dataset.index]
        wx.navigateTo({
            url: '/pages/record/detail/detail',
        })
    },

    to_QRcode: function (e) {
        wx.navigateTo({
            url: '/pages/pay/pay',
        })
    },

    onReachBottom: function () {
        console.log('reach botton')
    },

    onShareAppMessage: app.onShareAppMessage

})