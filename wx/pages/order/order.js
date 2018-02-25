//index.js
const app = getApp()

var util = require('../../utils/util.js')

Page({
    data: {
        hasUserInfo: false,
        hasUserAddress: false,
        userInfo: {},
        userAddress: {},

        pkg_position_range: [{ 'id': '', 'name': '- - -' }],
        pkg_position_index: 0,
        community_range: [{ 'id': '', 'name': '- - -' }],
        community_index: 0,
        building_range: [{ 'id': '', 'name': '- - -' }],
        building_index: 0,

        pkg_info: '',
        comment: ''
    },

    init_community: function () {
        wx.request({
            url: app.globalData.host + '/get_community',
            data: { 'campus_id': this.data.userAddress.campus.id },
            success: response => {
                this.setData({ community_range: response.data.community_list })
                if (this.data.userAddress.community.id) {
                    for (var i in this.data.community_range) {
                        if (this.data.community_range[i].name == this.data.userAddress.community.name) {
                            this.setData({ community_index: i })
                            break
                        }
                    }
                }
                this.init_building()
            }
        })
    },

    init_building: function () {
        wx.request({
            url: app.globalData.host + '/get_building',
            data: { 'community_id': this.data.userAddress.community.id },
            success: response => {
                this.setData({ building_range: response.data.building_list })
                if (this.data.userAddress.building.id) {
                    for (var i in this.data.building_range) {
                        if (this.data.building_range[i].name == this.data.userAddress.building.name) {
                            this.setData({ building_index: i })
                            break
                        }
                    }
                }
            }
        })
    },

    onLoad: function () {

        if (app.globalData.userInfo) {
            this.setData({
                userInfo: app.globalData.userInfo,
                hasUserInfo: true
            })
        }
        else {
            app.userInfoReadyCallback = response => {
                this.setData({
                    userInfo: app.globalData.userInfo,
                    hasUserInfo: true
                })
            }
        }

        if (app.globalData.userAddress) {
            this.setData({
                userAddress: app.globalData.userAddress,
                hasUserAddress: true
            })
            this.init_community()
        } else {
            app.userAddressReadyCallback = response => {
                this.setData({
                    userAddress: app.globalData.userAddress,
                    hasUserAddress: true
                })
                this.init_community()
            }
        }

        if (app.globalData.pkg_position_range) {
            var pkg_position_range = util.deepCopyArray(app.globalData.pkg_position_range)
            pkg_position_range.unshift({'id':'0000000000','name': '请选择'})
            this.setData({ pkg_position_range: pkg_position_range })
        } else {
            app.pkg_position_range_ReadyCallback = response => {
                var pkg_position_range = util.deepCopyArray(app.globalData.pkg_position_range)
                pkg_position_range.unshift({'id': '0000000000', 'name': '请选择' })
                this.setData({ pkg_position_range: pkg_position_range })
            }
        }


    },

    onShow: function () {
        if (app.globalData.hasChangeAddress) {
            this.setData({
                userAddress: app.globalData.userAddress,
                hasUserAddress: true
            })
            app.globalData.hasChangeAddress = false
            this.init_community()
            app.get_pkg_position(this.data.userAddress.campus.id)
        }
    },

    pkg_position_onchange: function (e) {
        if (this.data.pkg_position_range[e.detail.value].name == '请选择')
            return false;
        this.setData({
            pkg_position_index: e.detail.value
        })
    },

    community_onchange: function (e) {
        if (this.data.community_range[e.detail.value].name == '请选择')
            return false;

        var pre_choice = this.data.community_range[this.data.community_index]
        this.setData({ community_index: e.detail.value })

        if (this.data.community_range[this.data.community_index] != pre_choice) {
            this.setData({
                building_range: [{ 'id': '-1', 'name': ' ' }],
                building_index: 0
            })
            wx.request({
                url: app.globalData.host + 'get_building',
                data: { 'community_id': this.data.community_range[this.data.community_index].id },
                success: response => {
                    this.setData({
                        building_range: response.data.building_list,
                        building_index: 0
                    })
                }
            })
        }

    },

    building_onchange: function (e) {
        if (this.data.building_range[e.detail.value].name == '请选择')
            return false;
        this.setData({
            building_index: e.detail.value
        })
    },

    order: function (e) {

        var order_info = {
            'openid': this.data.userAddress.openid,
            'name': e.detail.value.name,
            'phone': e.detail.value.phone,
            'building_id': this.data.building_range[e.detail.value.building].id,
            'pkg_position_id': this.data.pkg_position_range[e.detail.value.pkg_position].id,
            'pkg_info': e.detail.value.pkg_info
        }

        for (var i in order_info) {
            var value = order_info[i]
            if (value.length == 0 || value == '0000000000' || value == undefined) {
                wx.showToast({
                    title: '请完整填写订单',
                    icon: 'none',
                    duration: 2000,
                })
                return false;
            }
        }

        order_info.comment = e.detail.value.comment

        wx.showToast({
            title: ' ',
            icon: 'loading',
            duration: 9999
        })

        wx.request({
            url: app.globalData.host + 'order',
            data: order_info,
            method: 'POST',
            header: { 'content-type': 'application/x-www-form-urlencoded' },
            success: response => {
                if (response.data.order_status == 'success') {
                    wx.switchTab({
                        url: '/pages/record/record',
                        success: response => { wx.showToast({ title: '下单成功' }) }
                    })
                    this.setData({
                        pkg_info: '',
                        comment: ''
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
