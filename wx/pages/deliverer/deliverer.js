// pages/deliverer/deliverer.js
const app = getApp()

Page({

    data: {
        pkg_position_by_time_list: [],
        community_list: [],

    },

    onLoad: function (options) {

        wx.request({
            url: app.globalData.host + 'deliverer_get_pkg_position',
            data: {
                'openid': app.globalData.userAddress.openid,
                'campus_id': app.globalData.userAddress.campus.id,
            },
            success: response => {
                this.setData({ pkg_position_by_time_list: response.data.pkg_position_by_time_list })
            },
            complete: response => {
                wx.stopPullDownRefresh()
                wx.hideNavigationBarLoading()
            }
        })

        wx.request({
            url: app.globalData.host + 'deliverer_get_community',
            data: {
                'openid': app.globalData.userAddress.openid,
                'campus_id': app.globalData.userAddress.campus.id
            },
            success: response => {
                this.setData({ community_list: response.data.community_list })
            }
        })

    },

    to_pickup_list: function (e) {
        wx.navigateTo({
            url: '/pages/deliverer/pickup_list/pickup_list?pkg_position_id=' + e.target.dataset.pkg_position_id + '&pickup_time=' + e.target.dataset.pickup_time,
        })
    },

    to_building_list: function (e) {
        wx.navigateTo({
            url: '/pages/deliverer/delivery_list/building_list?community_id=' + e.target.dataset.community_id + '&community_name=' + e.target.dataset.community_name,
        })
    },

    onPullDownRefresh: function () {
        wx.showNavigationBarLoading()
        this.onLoad()
    },


})