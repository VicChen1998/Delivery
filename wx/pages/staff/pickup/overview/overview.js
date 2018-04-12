// pages/deliverer/deliverer.js
const app = getApp()

Page({

    data: {
        not_pickup_count: 0,
        pkg_position_by_time_list: [],
    },

    onLoad: function (options) {

        wx.request({
            url: app.globalData.host + 'deliverer_get_pkg_position',
            data: {
                'openid': app.globalData.userAddress.openid,
                'campus_id': app.globalData.userAddress.campus.id,
            },
            success: response => {
                this.setData({
                    pkg_position_by_time_list: response.data.pkg_position_by_time_list,
                    not_pickup_count: response.data.not_pickup_count
                })
            },
            complete: response => {
                wx.stopPullDownRefresh()
                wx.hideNavigationBarLoading()
            }
        })

    },

    to_pickup_list: function (e) {
        wx.navigateTo({
            url: '/pages/staff/pickup/pickup_list/pickup_list?pkg_position_id=' + e.target.dataset.pkg_position_id + '&pickup_time=' + e.target.dataset.pickup_time,
        })
    },

    to_not_pickup_list: function (e) {
        wx.navigateTo({
            url: '/pages/staff/pickup/pickup_fail_list/pickup_fail_list',
        })
    },

    onPullDownRefresh: function () {
        wx.showNavigationBarLoading()
        this.onLoad()
    },

    to_search: function (e) {
        if (e.detail.value.length >= 1) {
            wx.navigateTo({
                url: '/pages/staff/search/search' + '?keyword=' + e.detail.value,
            })
        }
    },

})