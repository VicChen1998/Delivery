// pages/deliverer/delivery_list/building_list.js
const app = getApp()

Page({

    data: {
        title: '',
        building_list: []
    },

    onLoad: function (options) {
        this.setData({title: options.community_name})
        wx.request({
            url: app.globalData.host + 'deliverer_get_building',
            data: {
                'openid': app.globalData.userAddress.openid,
                'community_id': options.community_id
            },
            success: response => {
                this.setData({
                    building_list: response.data.building_list
                })
            }
        })
    },

    to_delivery_list: function (e) {
        wx.navigateTo({
            url: '/pages/deliverer/delivery_list/delivery_list?building_id=' + e.target.id + '&building_name=' + e.target.dataset.building_name,
        })
    }
})