// pages/deliverer/deliverer.js
const app = getApp()

Page({

    data: {
        community_list: [],
    },

    onLoad: function (options) {

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

    to_building_list: function (e) {
        wx.navigateTo({
            url: '/pages/staff/deliver/delivery_list/building_list?community_id=' + e.target.dataset.community_id + '&community_name=' + e.target.dataset.community_name,
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