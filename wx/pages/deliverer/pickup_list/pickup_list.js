// pages/deliverer/delivery_list/delivery_list.js
const app = getApp()

Page({

    data: {
        title: '',
        pickup_list: []
    },


    onLoad: function (options) {
        wx.request({
            url: app.globalData.host + 'get_pickup_list',
            data: {
                'openid': app.globalData.userAddress.openid,
                'pkg_position_id': options.pkg_position_id
            },
            success: response => {
                this.setData({
                    title: response.data.pkg_position_name,
                    pickup_list: response.data.pickup_list
                })
            }
        })
    },

    pickup_success: function (e) {
        wx.request({
            url: app.globalData.host + 'pickup',
            method: 'POST',
            header: { 'content-type': 'application/x-www-form-urlencoded' },
            data: {
                'openid': app.globalData.userAddress.openid,
                'order_id': e.target.dataset.order_id,
                'pickup_status': 'success'
            },
            success: response => {
                if (response.data.status == 'success') {
                    for (var i in this.data.pickup_list)
                        if (this.data.pickup_list[i].id == e.target.dataset.order_id) {
                            this.data.pickup_list[i].status = 1
                            this.data.pickup_list[i].status_describe = '已取件，等待配送'
                            this.setData({ pickup_list: this.data.pickup_list })
                            break
                        }
                }
            }

        })
    },

    pickup_fail: function (e) {
        wx.request({
            url: app.globalData.host + 'pickup',
            method: 'POST',
            header: { 'content-type': 'application/x-www-form-urlencoded' },
            data: {
                'openid': app.globalData.userAddress.openid,
                'order_id': e.target.dataset.order_id,
                'pickup_status': 'fail'
            },
            success: response => {
                if (response.data.status == 'success') {
                    for (var i in this.data.pickup_list)
                        if (this.data.pickup_list[i].id == e.target.dataset.order_id) {
                            this.data.pickup_list[i].status = -1
                            this.data.pickup_list[i].status_describe = '未取到'
                            this.setData({ pickup_list: this.data.pickup_list })
                            break
                        }
                }
            }

        })
    }
})