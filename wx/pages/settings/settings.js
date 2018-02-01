// pages/settings.js

const app = getApp()

Page({
    data: {
        isSetting: false,
        userInfo: {},
        deliveryInfo: {},
        hasUserInfo: false,
        hasDeliveryInfo: false,

        university_range: [],
        university_index: 0,
        campus_range: [],
        campus_index: 0,
        community_range: [],
        community_index: 0,
        building_range: [],
        building_index: 0,
    },

    onLoad: function (options) {
        if (app.globalData.userInfo) {
            this.setData({
                userInfo: app.globalData.userInfo,
                hasUserInfo: true
            })
        }

        if (app.globalData.deliveryInfo) {
            this.setData({
                deliveryInfo: app.globalData.deliveryInfo,
                hasDeliveryInfo: true
            })
        } else {
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
                                app.globalData.deliveryInfo = response.data
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
        }

        // 获取university_list
        wx.request({
            url: 'https://www.vicchen.club/get_university',
            success: response => {
                this.setData({ university_range: response.data.university_list })
                if (this.data.deliveryInfo.university) {
                    var index = this.data.university_range.indexOf(this.data.deliveryInfo.university)
                    this.setData({ university_index: index })

                    // 已有university数据
                    // 获取campus_list
                    wx.request({
                        url: 'https://www.vicchen.club/get_campus',
                        data: { 'university': this.data.deliveryInfo.university },
                        success: response => {
                            this.setData({ campus_range: response.data.campus_list })
                            if (this.data.deliveryInfo.campus) {
                                var index = this.data.campus_range.indexOf(this.data.deliveryInfo.campus)
                                this.setData({ campus_index: index })

                                // 已有campus数据
                                // 获取community_list
                                wx.request({
                                    url: 'https://www.vicchen.club/get_community',
                                    data: { 'university': this.data.deliveryInfo.university, 'campus': this.data.deliveryInfo.campus },
                                    success: response => {
                                        this.setData({ community_range: response.data.community_list })
                                        if (this.data.deliveryInfo.community) {
                                            var index = this.data.community_range.indexOf(this.data.deliveryInfo.community)
                                            this.setData({ community_index: index })

                                            // 已有community数据
                                            // 获取building_list
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

                                        } else {
                                            var new_community_range = this.data.community_range
                                            new_community_range.unshift('请选择')
                                            this.setData({ community_range: new_community_range, community_index: 0 })
                                        }
                                    }
                                })

                            } else {
                                var new_campus_range = this.data.compus_range
                                new_campus_range.unshift('请选择')
                                this.setData({ campus_range: new_campus_range, campus_index: 0 })
                            }
                        }
                    })

                } else {
                    var new_university_range = this.data.university_range
                    new_university_range.unshift('请选择')
                    this.setData({ university_range: new_university_range, university_index: 0 })
                }
            }
        })
    },

    start_set: function () {
        this.setData({
            isSetting: true,
        })

        if (this.data.deliveryInfo.university) {
            var index = this.data.university_range.indexOf(this.data.deliveryInfo.university)
            this.setData({ university_index: index })

            if (this.data.deliveryInfo.campus) {
                var index = this.data.campus_range.indexOf(this.data.deliveryInfo.campus)
                this.setData({ campus_index: index })

                if (this.data.deliveryInfo.community) {
                    var index = this.data.community_range.indexOf(this.data.deliveryInfo.community)
                    this.setData({ community_index: index })

                    if (this.data.deliveryInfo.building) {
                        var index = this.data.building_range.indexOf(this.data.deliveryInfo.building)
                        this.setData({ building_index: index })
                    }
                }
            }
        }
    },

    university_onchange: function (e) {
        if (this.data.university_range[e.detail.value] == '请选择')
            return false;
        var pre_choice = this.data.university_range[this.data.university_index]
        this.setData({ university_index: e.detail.value })
        if (this.data.university_range[this.data.university_index] != pre_choice) {
            this.setData({
                campus_range: [' '],
                campus_index: 0
            })
            wx.request({
                url: 'https://www.vicchen.club/get_campus',
                data: {
                    'university': this.data.university_range[this.data.university_index]
                },
                success: response => {
                    var campus_range = response.data.campus_list
                    campus_range.unshift('请选择')
                    this.setData({ campus_range: campus_range, campus_index: 0 })
                }
            })
        }
    },

    campus_onchange: function (e) {
        if (this.data.campus_range[e.detail.value] == '请选择')
            return false;
        var pre_choice = this.data.campus_range[this.data.campus_index]
        this.setData({ campus_index: e.detail.value })
        if (this.data.campus_range[this.data.campus_index] != pre_choice) {
            this.setData({
                community_range: [' '],
                community_index: 0
            })
            wx.request({
                url: 'https://www.vicchen.club/get_community',
                data: {
                    'university': this.data.university_range[this.data.university_index],
                    'campus': this.data.campus_range[this.data.campus_index]
                },
                success: response => {
                    var community_range = response.data.community_list
                    community_range.unshift('请选择')
                    this.setData({ community_range: community_range, community_index: 0 })
                }
            })
        }
    },

    community_onchange: function (e) {
        if (this.data.community_range[e.detail.value] == '请选择')
            return false;
        var pre_choice = this.data.community_range[this.data.community_index]
        this.setData({ community_index: e.detail.value })
        if (this.data.community_range[this.data.community_index] != pre_choice) {
            this.setData({
                building_range: [' '],
                building_index: 0
            })
            wx.request({
                url: 'https://www.vicchen.club/get_building',
                data: {
                    'university': this.data.university_range[this.data.university_index],
                    'campus': this.data.campus_range[this.data.campus_index],
                    'community': this.data.community_range[this.data.community_index]
                },
                success: response => {
                    var building_range = response.data.building_list
                    building_range.unshift('请选择')
                    this.setData({ building_range: building_range, building_index: 0 })
                }
            })
        }
    },

    building_onchange: function (e) {
        if (this.data.building_range[e.detail.value] == '请选择')
            return false;
        this.setData({ building_index: e.detail.value, })
    },

    submit: function (e) {
        var new_delivery_info = {
            'openid': this.data.deliveryInfo.openid,
            'name': e.detail.value.name,
            'phone': e.detail.value.phone,
            'university': this.data.university_range[e.detail.value.university],
            'campus': this.data.campus_range[e.detail.value.campus],
            'community': this.data.community_range[e.detail.value.community],
            'building': this.data.building_range[e.detail.value.building]
        }

        for (var i in new_delivery_info) {
            var value = new_delivery_info[i]
            if (value.length == 0 || value == '请选择') {
                wx.showToast({
                    title: '请完整填写默认收货信息',
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
            url: 'https://www.vicchen.club/upload_delivery_info',
            method: 'POST',
            data: new_delivery_info,
            header: { 'content-type': 'application/x-www-form-urlencoded' },
            success: response => {
                if (response.data.upload_status == 'success') {
                    this.setData({
                        deliveryInfo: new_delivery_info,
                        isSetting: false
                    })
                    app.globalData.deliveryInfo = new_delivery_info
                    wx.showToast({ title: '修改成功' })
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


})
