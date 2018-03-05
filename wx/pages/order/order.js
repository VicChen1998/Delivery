//index.js
const app = getApp()

var util = require('../../utils/util.js')

Page({
    data: {
        hasUserInfo: false,
        hasUserAddress: false,
        userInfo: {},
        userAddress: {},

        community_range: [{ 'id': '', 'name': '- - -' }],
        community_index: 0,
        building_range: [{ 'id': '', 'name': '- - -' }],
        building_index: 0,
        pkg_position_range: [{ 'id': '', 'name': '- - -' }],
        pkg_position_index: 0,
        pickup_time_range: [],
        pickup_time_index: 0,
        price_range: [2, 3, 4, 5, 6, 7, 8, 9, 10],
        price_index: 1,

        pkg_info: '',
        comment: '',

        isModifying: false,
        modifying_order: {}
    },

    init_community: function () {
        wx.request({
            url: app.globalData.host + 'get_community',
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
            url: app.globalData.host + 'get_building',
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

    init_pickup_time: function () {
        var all_pickup_time = [], pickup_time_range = []
        for (var i in this.data.pkg_position_range)
            for (var j in this.data.pkg_position_range[i].pickup_time)
                all_pickup_time.push(this.data.pkg_position_range[i].pickup_time[j])

        for (var i in all_pickup_time)
            if (!pickup_time_range.includes(all_pickup_time[i]))
                pickup_time_range.push(all_pickup_time[i])

        pickup_time_range.sort((a, b) => { return a > b })

        for (var i in pickup_time_range)
            pickup_time_range[i] += '之前'

        this.setData({ pickup_time_range: pickup_time_range })

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
            pkg_position_range.unshift({ 'id': '0000000000', 'name': '请选择' })
            this.setData({ pkg_position_range: pkg_position_range })
            this.init_pickup_time()
        } else {
            app.pkg_position_range_ReadyCallback = response => {
                var pkg_position_range = util.deepCopyArray(app.globalData.pkg_position_range)
                pkg_position_range.unshift({ 'id': '0000000000', 'name': '请选择' })
                this.setData({ pkg_position_range: pkg_position_range })
                this.init_pickup_time()
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

        if (app.globalData.isModifying) {
            this.setData({
                isModifying: true,
                modifying_order: app.globalData.modifying_order
            })
            app.globalData.isModifying = false

            // 宿舍区
            for (var i in this.data.community_range) {
                if (this.data.community_range[i].id == this.data.modifying_order.community.id) {
                    this.setData({ community_index: i })
                    wx.request({
                        url: app.globalData.host + 'get_building',
                        data: { 'community_id': this.data.community_range[this.data.community_index].id },
                        success: response => {
                            this.setData({ building_range: response.data.building_list })
                            for (var j in this.data.building_range) {
                                if (this.data.building_range[j].id == this.data.modifying_order.building.id) {
                                    this.setData({ building_index: j })
                                    break
                                }
                            }
                        }
                    })
                    break
                }
            }
            // 领取位置
            for (var i in this.data.pkg_position_range) {
                if (this.data.pkg_position_range[i].id == this.data.modifying_order.pkg_position.id) {
                    this.setData({ pkg_position_index: i })
                }
            }
            // 领取时限
            for (var i in this.data.pickup_time_range) {
                if (this.data.pickup_time_range[i] == (this.data.modifying_order.pickup_time + '之前')) {
                    this.setData({ pickup_time_index: i })
                }
            }
        }
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

    pkg_position_onchange: function (e) {
        if (this.data.pkg_position_range[e.detail.value].name == '请选择')
            return false;

        var pickup_time = this.data.pkg_position_range[e.detail.value].pickup_time[0]
        var pickup_time_index = this.data.pickup_time_range.indexOf(pickup_time + '之前')

        this.setData({
            pkg_position_index: e.detail.value,
            pickup_time_index: pickup_time_index
        })
    },

    pickup_time_onchange: function (e) {
        this.setData({
            pickup_time_index: e.detail.value
        })
    },

    price_onchange: function (e) {
        this.setData({
            price_index: e.detail.value
        })
    },

    check_order: function (e) {
        var formtype = e.detail.target.dataset.formtype

        var order_info = {
            'openid': this.data.userAddress.openid,
            'name': e.detail.value.name,
            'phone': e.detail.value.phone,
            'building_id': this.data.building_range[e.detail.value.building].id,
            'pkg_position_id': this.data.pkg_position_range[e.detail.value.pkg_position].id,
            'pickup_time': this.data.pickup_time_range[e.detail.value.pickup_time],
            'pkg_info': e.detail.value.pkg_info,
            'price': this.data.price_range[e.detail.value.price],
            'pickup_next_day': 'False',
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

        var date = new Date()
        var current_time = (Array(2).join(0) + date.getHours()).slice(-2) + ':' + date.getMinutes()
        var pickup_time = order_info.pickup_time.substring(0, order_info.pickup_time.length - 2)

        if (pickup_time < current_time) {
            wx.showModal({
                title: '已超过领取时限',
                content: '轻骑小兵明天去帮您取可以吗',
                confirmText: '好的',
                cancelText: '取消',
                success: response => {
                    if (response.cancel)
                        return false
                    else
                        order_info.pickup_next_day = 'True'
                        this.order(formtype, order_info)
                }
            })
        } else {
            this.order(formtype, order_info)
        }
    },

    order: function (formtype, order_info) {

        wx.showToast({
            title: ' ',
            icon: 'loading',
            duration: 9999
        })

        if (formtype == 'submit') {
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
                            comment: '',
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
        }
        else if (formtype == 'modify') {
            order_info.order_id = this.data.modifying_order.id
            wx.request({
                url: app.globalData.host + 'modify',
                data: order_info,
                method: 'POST',
                header: { 'content-type': 'application/x-www-form-urlencoded' },
                success: response => {
                    if (response.data.modify_status == 'success') {
                        wx.switchTab({
                            url: '/pages/record/record',
                            success: response => { wx.showToast({ title: '修改成功' }) }
                        })
                        this.setData({
                            pkg_info: '',
                            comment: '',
                            isModifying: false,
                            modifying_order: {}
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
        }


    },

    cancel_modify: function () {
        this.setData({
            pkg_info: '',
            comment: '',
            isModifying: false,
            modifying_order: {}
        })
        this.init_community();

        var pkg_position_range = util.deepCopyArray(app.globalData.pkg_position_range)
        pkg_position_range.unshift({ 'id': '0000000000', 'name': '请选择' })
        this.setData({
            pkg_position_range: pkg_position_range,
            pkg_position_index: 0,
        })
    },

    toSettings: function () {
        wx.switchTab({
            url: '/pages/settings/settings',
        })
    },

})
