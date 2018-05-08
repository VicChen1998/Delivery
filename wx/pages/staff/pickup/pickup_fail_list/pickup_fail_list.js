// pages/deliverer/pickup_fail_list/pickup_fail_list.js
const app = getApp()

Page({

    data: {
        pickup_fail_list: []
    },

    onLoad: function (options) {

        wx.setNavigationBarTitle({ title: '未取到' })

        wx.request({
            url: app.globalData.host + 'get_pickup_fail_list',
            data: {
                'openid': app.globalData.userAddress.openid,
                'campus_id': app.globalData.userAddress.campus.id
            },
            success: response => {
                this.setData({
                    pickup_fail_list: response.data.pickup_fail_list
                })
            }
        })
    },

    pickup_success: function (e) {
        wx.showModal({
            title: '确认已取到',
            content: '',
            confirmText: '是',
            cancelText: '否',
            success: res => {
                if (res.confirm) {
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
                                this.data.pickup_fail_list[e.target.dataset.index].status = 1
                                this.data.pickup_fail_list[e.target.dataset.index].status_describe = '已取件，等待配送'
                                this.setData({ pickup_fail_list: this.data.pickup_fail_list })
                            }
                        }
                    })
                }
            }
        })
    },

    cancel: function (e) {
        wx.showModal({
            title: '确认 取消订单？',
            content: '',
            confirmText: '取消订单',
            confirmColor: '#ff0000',
            cancelText: '按错',
            success: res => {
                if (res.confirm) {
                    wx.request({
                        url: app.globalData.host + 'deliverer_cancel',
                        method: 'POST',
                        header: { 'content-type': 'application/x-www-form-urlencoded' },
                        data: {
                            'openid': app.globalData.userAddress.openid,
                            'order_id': e.target.dataset.order_id,
                        },
                        success: response => {
                            if (response.data.status == 'success') {
                                this.data.pickup_fail_list[e.target.dataset.index].status = 14
                                this.data.pickup_fail_list[e.target.dataset.index].status_describe = '已取消'
                                this.setData({ pickup_fail_list: this.data.pickup_fail_list })
                            } else if (response.data.status == 'fail'){
                                wx.showModal({
                                    title: '不能退单',
                                    content: response.data.errMsg,
                                })
                            }
                        }
                    })
                }
            }
        })
    },

    raise_price: function (e) {
        wx.showModal({
            title: '是否已经和用户协商？',
            content: '',
            confirmText: '是',
            cancelText: '否',
            success: res => {
                if (res.confirm) {
                    var raise_options = ['1元', '2元', '3元', '4元', '5元', '6元']
                    wx.showActionSheet({
                        itemList: raise_options,
                        success: response => {
                            var raise = raise_options[response.tapIndex]
                            raise = raise.substring(0, raise.length - 1)
                            wx.request({
                                url: app.globalData.host + 'raise_price',
                                method: 'POST',
                                header: { 'content-type': 'application/x-www-form-urlencoded' },
                                data: {
                                    'openid': app.globalData.userAddress.openid,
                                    'order_id': e.target.dataset.order_id,
                                    'raise_num': raise
                                },
                                success: response => {
                                    if (response.data.status == 'success') {
                                        this.data.pickup_fail_list[e.target.dataset.index].final_price += ('+￥' + raise)
                                        this.setData({ pickup_fail_list: this.data.pickup_fail_list })
                                    }
                                }
                            })
                        }
                    })
                }
            }
        })
    }
})