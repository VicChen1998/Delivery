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

    has_deliver: function (e) {
        var index, phone = ''
        for (index in this.data.delivery_list) {
            if (this.data.delivery_list[index].id == e.target.dataset.order_id) {
                phone = this.data.delivery_list[index].phone
                break
            }
        }

        wx.request({
            url: app.globalData.host + 'delivery',
            method: 'POST',
            header: { 'content-type': 'application/x-www-form-urlencoded' },
            data: {
                'openid': app.globalData.userAddress.openid,
                'order_id': e.target.dataset.order_id
            },
            success: response => {
                if (response.data.status == 'success') {
                    this.data.delivery_list[index].status = 2
                    this.data.delivery_list[index].status_describe = '已送达，请下楼取件'
                    this.setData({ delivery_list: this.data.delivery_list })
                }
            }
        })


        wx.makePhoneCall({ phoneNumber: phone })
    }
})