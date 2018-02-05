// pages/deliverer/delivery_list/delivery_list.js
const app = getApp()

Page({

    data: {
        title: '',
        delivery_list: []
    },


    onLoad: function (options) {
        wx.request({
            url: app.globalData.host + 'get_delivery_list',
            data: {
                'openid': app.globalData.userAddress.openid,
                'community_id': options.community_id
            },
            success: response => {
                this.setData({
                    title: response.data.community_name,
                    delivery_list: response.data.delivery_list
                })
            }
        })
    },
})