
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
        price_index: 0,
        voucher_range: [],
        voucher_index: 0,

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

    init_voucher: function () {

        if (this.data.userAddress.voucher == 0) {
            this.setData({ voucher_range: ['你还没有免单券哦~'] })
        } else {
            var range = ['不使用']
            for (var i = 0; i < this.data.userAddress.voucher; i++)
                range.unshift('使用 免单券 ×1')

            this.setData({ voucher_range: range })
        }
    },

    onLoad: function (options) {

        if (app.globalData.userInfo) {
            this.setData({
                userInfo: app.globalData.userInfo,
                hasUserInfo: true
            })
        } else {
            app.sendUserInfoToOrderPage = response => {
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
            this.init_voucher()
        } else {
            app.sendUserAddressToOrderPage = response => {
                this.setData({
                    userAddress: app.globalData.userAddress,
                    hasUserAddress: true
                })
                this.init_community()
                this.init_voucher()
            }
        }

        if (app.globalData.pkg_position_range) {
            var pkg_position_range = util.deepCopyArray(app.globalData.pkg_position_range)
            pkg_position_range.unshift({ 'id': '0000000000', 'name': '请选择' })
            this.setData({ pkg_position_range: pkg_position_range })
        } else {
            app.pkg_position_range_ReadyCallback = response => {
                var pkg_position_range = util.deepCopyArray(app.globalData.pkg_position_range)
                pkg_position_range.unshift({ 'id': '0000000000', 'name': '请选择' })
                this.setData({ pkg_position_range: pkg_position_range })
            }
        }

    },

    onShow: function () {

        if (this.data.hasUserAddress) {
            if (this.data.userAddress.voucher != app.globalData.userAddress.voucher) {
                this.setData({ userAddress: app.globalData.userAddress })
                this.init_voucher()
            }
        }

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
                    var pickup_time_range = this.data.pkg_position_range[i].pickup_time
                    for (var j in pickup_time_range) {
                        if (pickup_time_range[j].indexOf('之前') == -1)
                            pickup_time_range[j] += '之前'
                    }
                    this.setData({
                        pkg_position_index: i,
                        pickup_time_range: this.data.pkg_position_range[i].pickup_time
                    })
                    break
                }
            }
            // 领取时限
            for (var i in this.data.pickup_time_range) {
                if (this.data.pickup_time_range[i] == (this.data.modifying_order.pickup_time + '之前')) {
                    this.setData({ pickup_time_index: i })
                    break
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

        var pickup_time_range = this.data.pkg_position_range[e.detail.value].pickup_time
        for (var i in pickup_time_range) {
            if (pickup_time_range[i].indexOf('之前') == -1)
                pickup_time_range[i] += '之前'
        }

        this.setData({
            pkg_position_index: e.detail.value,
            pickup_time_range: pickup_time_range,
            pickup_time_index: 0,
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

    voucher_onchange: function (e) {
        this.setData({
            voucher_index: e.detail.value
        })
    },

    recognize_pkg_info: function (e) {
        var pkg_info = e.detail.value
        if (pkg_info.length < 10)
            return false;

        var result = util.recognize_pkg_info(pkg_info)

        if (result.status == 'success') {
            for (var i in this.data.pkg_position_range) {
                if (this.data.pkg_position_range[i].name == result.pkg_position_name) {
                    var e = {
                        'detail': {
                            'value': i
                        }
                    }

                    this.pkg_position_onchange(e)

                    if (result.pkg_position_name == '西门' ||
                        result.pkg_position_name == '东门' ||
                        result.pkg_position_name == '南门' ||
                        result.pkg_position_name == '菊二前台' ||
                        result.pkg_position_name == '京东快递') {
                        wx.showToast({
                            title: '请确认领取时限！',
                            icon: 'none',
                        })
                    }
                }
            }
        }
        else {
            if (this.data.pkg_position_index == 0 && this.data.pickup_time_index == 0) {
                wx.showToast({
                    title: '自动识别失败，请您选择快递位置和领取时限',
                    icon: 'none'
                })
            }
        }
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

        if (order_info.phone.length != 11) {
            wx.showToast({
                title: '请正确填写手机号',
                icon: 'none',
                duration: 2000,
            })
            return false;
        }

        order_info.comment = e.detail.value.comment

        var voucher_info = this.data.voucher_range[e.detail.value.voucher]
        if (voucher_info == '使用 免单券 ×1')
            order_info.use_voucher = 'True'
        else
            order_info.use_voucher = 'False'

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
                        if (order_info.use_voucher == 'True') {
                            app.refreshVoucher()
                        }
                    } else {
                        wx.showToast({ title: 'error: ' + response.data.errMsg, icon: 'none', duration: 3000 })
                    }
                },
                fail: response => {
                    wx.showToast({ title: '连接服务器失败' })
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
    }

})
