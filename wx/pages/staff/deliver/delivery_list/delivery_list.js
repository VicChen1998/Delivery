// pages/deliverer/delivery_list/delivery_list.js
const app = getApp()

Page({

    data: {
        title: '',
        delivery_list: []
    },


    onLoad: function (options) {
        wx.setNavigationBarTitle({ title: options.building_name })
        wx.request({
            url: app.globalData.host + 'get_delivery_list',
            data: {
                'openid': app.globalData.userAddress.openid,
                'building_id': options.building_id
            },
            success: response => {
                this.setData({
                    delivery_list: response.data.delivery_list
                })
            }
        })
    },

    call: function (e) {
        wx.makePhoneCall({
            phoneNumber: e.currentTarget.dataset.phone,
        })
    },

    has_deliver: function (e) {
        wx.showModal({
            title: '确认已送达',
            content: '',
            confirmText: '是',
            cancelText: '否',
            success: res => {
                if (res.confirm) {
                    var index = e.target.dataset.index
                    var phone = e.target.dataset.phone

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
                                this.data.delivery_list[index].status = 7
                                this.data.delivery_list[index].status_describe = '已送达，请下楼取件'
                                this.setData({ delivery_list: this.data.delivery_list })
                            }
                        }
                    })
                }
            }
        })
    },

    not_deliver: function (e) {
        var index = e.target.dataset.index
        var reason_list = ['联系不上', '次日再送']
        wx.showActionSheet({
            itemList: reason_list,
            success: res => {
                wx.request({
                    url: app.globalData.host + 'not_delivery',
                    method: 'POST',
                    header: { 'content-type': 'application/x-www-form-urlencoded' },
                    data: {
                        'openid': app.globalData.userAddress.openid,
                        'order_id': e.target.dataset.order_id,
                        'errMsg': reason_list[res.tapIndex],
                    },
                    success: response => {
                        if (response.data.status == 'success') {
                            this.data.delivery_list[index].status = -1
                            this.data.delivery_list[index].status_describe = reason_list[res.tapIndex]
                            this.setData({ delivery_list: this.data.delivery_list })
                        }
                    }
                })

            }
        })
    },

    confirm_pay: function (e) {
        wx.showModal({
            title: '确认已付款',
            content: '',
            confirmText: '是',
            cancelText: '否',
            success: res => {
                if (res.confirm) {
                    var index = e.target.dataset.index

                    wx.request({
                        url: app.globalData.host + 'confirm_pay',
                        method: 'POST',
                        header: { 'content-type': 'application/x-www-form-urlencoded' },
                        data: {
                            'openid': app.globalData.userAddress.openid,
                            'order_id': e.target.dataset.order_id
                        },
                        success: response => {
                            if (response.data.status == 'success') {
                                this.data.delivery_list[index].has_pay = 2
                                this.setData({ delivery_list: this.data.delivery_list })
                            }
                        }
                    })
                }
            }
        })
    }

})