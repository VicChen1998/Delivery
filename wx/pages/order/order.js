//index.js
const app = getApp()

Page({
    data: {
        openid: null,
        userInfo: {},
        deliveryInfo: {},
        hasUserInfo: false,
        hasDeliveryInfo: false,

        pkg_position_range: [],
        pkg_position_index: 0,
        community_range: [],
        community_index: 0,
        building_range: ['- - -'],
        building_index: 0

    },

    onLoad: function () {

        function upload_userinfo(data) {
            if (data.hasUserInfo && data.openid != null && data.deliveryInfo.first_signin) {
                wx.request({
                    url: 'https://www.vicchen.club/upload_userinfo',
                    data: data.userInfo,
                    method: 'POST',
                    header: { 'content-type': 'application/x-www-form-urlencoded' },
                })
            }
        }

        // 登录
        wx.login({
            success: response => {
                // 发送 res.code 到后台换取 openId, sessionKey, unionId
                wx.request({
                    url: 'https://www.vicchen.club/signin',
                    data: { js_code: response.code, },
                    method: 'GET',
                    success: response => {
                        if (response.data.signin_status == 'success') {
                            this.setData({
                                deliveryInfo: response.data,
                                hasDeliveryInfo: true
                            })
                            this.data.openid = response.data.openid
                            app.globalData.deliveryInfo = response.data

                            this.data.userInfo.openid = this.data.openid
                            upload_userinfo(this.data)

                            if (this.data.deliveryInfo.community) {
                                var index = this.data.community_range.indexOf(this.data.deliveryInfo.community)
                                this.setData({ community_index: index })
                                wx.request({
                                    url: 'https://www.vicchen.club/get_building',
                                    data: { 'university': this.data.deliveryInfo.university, 'campus': this.data.deliveryInfo.campus, 'community': this.data.deliveryInfo.community },
                                    success: response => {
                                        this.setData({ building_range: response.data.building_list })
                                        if (this.data.deliveryInfo.building) {
                                            var index = this.data.building_range.indexOf(this.data.deliveryInfo.building)
                                            this.setData({ building_index: index })
                                        } else {
                                            var new_building_range = this.data.building_range
                                            new_building_range.unshift('请选择')
                                            this.setData({ building_range: new_building_range, building_index: 0 })
                                        }
                                    }
                                })
                            }

                        } else {
                            wx.showToast({
                                title: 'login fail:' + response.data.errMsg,
                                icon: 'none'
                            })
                        }

                    }
                })
            }
        })

        if (app.globalData.userInfo) {
            this.setData({
                userInfo: app.globalData.userInfo,
                hasUserInfo: true
            })

            this.data.userInfo.openid = this.data.openid
            upload_userinfo(this.data)
        } else {
            // 由于 getUserInfo 是网络请求，可能会在 Page.onLoad 之后才返回
            // 所以此处加入 callback 以防止这种情况
            app.userInfoReadyCallback = res => {
                this.setData({
                    userInfo: res.userInfo,
                    hasUserInfo: true
                })

                this.data.userInfo.openid = this.data.openid
                upload_userinfo(this.data)
            }
        }

        wx.request({
            url: 'https://www.vicchen.club/get_pkgPosition',
            data: {
                'university': '郑州大学',
                'campus': '新校区',
            },
            success: response => {
                response.data.pkg_position_list.unshift('请选择')
                this.setData({ pkg_position_range: response.data.pkg_position_list })
            }
        })

        wx.request({
            url: 'https://www.vicchen.club/get_community',
            data: {
                'university': '郑州大学',
                'campus': '新校区',
            },
            success: response => {
                response.data.community_list.unshift('请选择')
                this.setData({ community_range: response.data.community_list })
            }
        })
    },

    pkg_position_onchange: function (e) {
        if (e.detail.value == '请选择')
            return false;
        this.setData({
            pkg_position_index: e.detail.value
        })
    },
    community_onchange: function (e) {
        if (e.detail.value == '请选择')
            return false;
        var pre_choice = this.data.community_range[this.data.community_index]
        this.setData({ community_index: e.detail.value })

        if(this.data.community_range[this.data.community_index] != pre_choice){
            this.setData({
                building_range: [' '],
                building_index: 0
            })
            wx.request({
                url: 'https://www.vicchen.club/get_building',
                data: {
                    'university': '郑州大学',
                    'campus': '新校区',
                    'community': this.data.community_range[this.data.community_index]
                },
                success: response => {
                    response.data.building_list.unshift('请选择')
                    this.setData({
                        building_range: response.data.building_list,
                        building_index: 0
                    })
                }
            })
        }
        
    },
    building_onchange: function (e) {
        if (e.detail.value == '请选择')
            return false;
        this.setData({
            building_index: e.detail.value
        })
    },

    order: function (e) {

        var order_info = {
            'openid': this.data.openid,
            'name': e.detail.value.name,
            'phone': e.detail.value.phone,
            'university': '郑州大学',
            'campus': '新校区',
            'community': this.data.community_range[e.detail.value.community],
            'building': this.data.building_range[e.detail.value.building],
            'pkg_position': this.data.pkg_position_range[e.detail.value.pkg_position],
            'pkg_info': e.detail.value.pkg_info,
            'comment': e.detail.value.comment
        }

        for (var i in order_info) {
            var value = order_info[i]
            if (value.length == 0 || value == '请选择' || value == undefined) {
                wx.showToast({
                    title: '请完整填写订单',
                    icon: 'none',
                    duration: 2000,
                })
                return false;
            }
        }
        wx.showToast({
            title: ' ',
            icon: 'loading',
            duration: 9999
        })

        wx.request({
            url: 'https://www.vicchen.club/order',
            data: order_info,
            method: 'POST',
            header: { 'content-type': 'application/x-www-form-urlencoded' },
            success: response => {
                if (response.data.order_status == 'success') {
                    wx.showToast({ title: '下单成功' })
                    wx.switchTab({
                        url: '/pages/record/record',
                    })
                } else {
                    wx.showToast({ title: 'error: ' + response.data.errMsg, icon: 'none', duration: 3000 })
                }
            },
            fail: response => {
                wx.showToast({ title: '连接服务器失败' })
                console.log(response)
            }
        })
    },

    toSettings: function () {
        wx.switchTab({
            url: '/pages/settings/settings',
        })
    },

})
