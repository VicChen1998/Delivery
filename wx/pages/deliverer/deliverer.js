// pages/deliverer/deliverer.js
const app = getApp()

Page({

    data: {
        pkg_position_list: [],
        community_list: [],

    },

    onLoad: function (options) {

        this.setData({pkg_position_list: app.globalData.pkg_position_range})

        wx.request({
            url: app.globalData.host + 'get_community',
            data: { 'campus_id': app.globalData.userAddress.campus.id },
            success: response => {
                this.setData({ community_list: response.data.community_list })
            }
        })

    },

    to_pickup_list: function (e) {
        wx.navigateTo({
            url: '/pages/deliverer/pickup_list/pickup_list?pkg_position_id=' + e.target.id,
        })
    },

    to_delivery_list: function (e) {
        wx.navigateTo({
            url: '/pages/deliverer/delivery_list/delivery_list?community_id=' + e.target.id,
        })
    }
})