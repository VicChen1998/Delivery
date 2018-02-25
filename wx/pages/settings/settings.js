// pages/settings.js

const app = getApp()

Page({
    data: {
        hasUserInfo: false,
        isSetting: false,
        userInfo: {},
        userAddress: {},

        university_range: [],
        university_index: 0,
        campus_range: [],
        campus_index: 0,
        community_range: [],
        community_index: 0,
        building_range: [{ 'id': '0000000000', 'name': '' }],
        building_index: 0,
    },

    get_university: function () {
        wx.request({
            url: app.globalData.host + 'get_university',
            success: response => {
                response.data.university_list.shift()
                if (this.data.userAddress.university.id != '0000') {
                    let index = 0, found = false
                    for (index in response.data.university_list) {
                        if (response.data.university_list[index].id == this.data.userAddress.university.id) {
                            found = true
                            break
                        }
                    }
                    if (found) {
                        this.setData({
                            university_range: response.data.university_list,
                            university_index: index
                        })
                    }
                    // TODO: 先这样吧，等下重写逻辑
                    else {
                        response.data.university_list.unshift({ 'id': '0000', 'name': '请选择' })
                        this.setData({ university_range: response.data.university_list })
                    }
                } else {
                    response.data.university_list.unshift({ 'id': '0000', 'name': '请选择' })
                    this.setData({ university_range: response.data.university_list })
                }


            }
        })
    },

    get_campus: function (university_id) {
        wx.request({
            url: app.globalData.host + 'get_campus',
            data: { 'university_id': university_id },
            success: response => {
                if (this.data.userAddress.campus.id != '000000') {
                    let index = 0, found = false
                    for (index in response.data.campus_list) {
                        if (response.data.campus_list[index].id == this.data.userAddress.campus.id) {
                            found = true
                            break
                        }
                    }
                    if (found) {
                        this.setData({
                            campus_range: response.data.campus_list,
                            campus_index: index
                        })
                    }
                    else {
                        response.data.campus_list.unshift({ 'id': '000000', 'name': '请选择' })
                        this.setData({ campus_range: response.data.campus_list })
                    }
                } else {
                    response.data.campus_list.unshift({ 'id': '000000', 'name': '请选择' })
                    this.setData({ campus_range: response.data.campus_list })
                }
            }
        })
    },

    get_community: function (campus_id) {
        wx.request({
            url: app.globalData.host + 'get_community',
            data: { 'campus_id': campus_id },
            success: response => {
                if (this.data.userAddress.community.id != '00000000') {
                    let index = 0, found = false
                    for (index in response.data.community_list) {
                        if (response.data.community_list[index].id == this.data.userAddress.community.id) {
                            found = true
                            break
                        }
                    }
                    if (found) {
                        this.setData({
                            community_range: response.data.community_list,
                            community_index: index
                        })
                    }
                    else {
                        response.data.community_list.unshift({ 'id': '00000000', 'name': '请选择' })
                        this.setData({ community_range: response.data.community_list })
                    }
                } else {
                    response.data.community_list.unshift({ 'id': '00000000', 'name': '请选择' })
                    this.setData({ community_range: response.data.community_list })
                }
            }
        })
    },

    get_building: function (community_id) {
        wx.request({
            url: app.globalData.host + 'get_building',
            data: { 'community_id': community_id },
            success: response => {
                if (this.data.userAddress.building.id != '0000000000') {
                    let index = 0, found = false
                    for (index in response.data.building_list) {
                        if (response.data.building_list[index].id == this.data.userAddress.building.id) {
                            found = true
                            break
                        }
                    }
                    if (found) {
                        this.setData({
                            building_range: response.data.building_list,
                            building_index: index
                        })
                    }
                    else {
                        response.data.building_list.unshift({ 'id': '0000000000', 'name': '请选择' })
                        this.setData({ building_range: response.data.building_list })
                    }
                } else {
                    response.data.building_list.unshift({ 'id': '0000000000', 'name': '请选择' })
                    this.setData({ building_range: response.data.building_list })
                }
            }
        })
    },

    onLoad: function (options) {
        this.setData({
            userInfo: app.globalData.userInfo,
            userAddress: app.globalData.userAddress,
            hasUserInfo: true
        })
        this.get_university()
        if (this.data.userAddress.university.id != '0000')
            this.get_campus(this.data.userAddress.university.id)
        if (this.data.userAddress.campus.id != '000000')
            this.get_community(this.data.userAddress.campus.id)
        if (this.data.userAddress.community.id != '00000000')
            this.get_building(this.data.userAddress.community.id)
    },

    start_set: function () {
        this.setData({ isSetting: true })
    },

    university_onchange: function (e) {
        if (this.data.university_range[e.detail.value] == '请选择')
            return false;
        this.setData({
            university_index: e.detail.value,
            campus_range: [' '],
            campus_index: 0
        })
        this.get_campus(this.data.university_range[this.data.university_index].id)
    },

    campus_onchange: function (e) {
        if (this.data.campus_range[e.detail.value] == '请选择')
            return false;
        this.setData({
            campus_index: e.detail.value,
            community_range: [' '],
            community_index: 0
        })
        this.get_community(this.data.campus_range[this.data.campus_index].id)
    },

    community_onchange: function (e) {
        if (this.data.community_range[e.detail.value] == '请选择')
            return false;
        this.setData({
            community_index: e.detail.value,
            building_range: [' '],
            building_index: 0,
        })
        this.get_building(this.data.community_range[this.data.community_index].id)
    },

    building_onchange: function (e) {
        if (this.data.building_range[e.detail.value] == '请选择')
            return false;
        this.setData({ building_index: e.detail.value, })
    },

    submit: function (e) {
        var upload_info = {
            'openid': this.data.userAddress.openid,
            'is_staff': this.data.userAddress.is_staff,
            'name': e.detail.value.name,
            'phone': e.detail.value.phone,
            'building_id': this.data.building_range[e.detail.value.building].id
        }
        if (upload_info.building_id == '0000000000' ||
            upload_info.name.length == 0 ||
            upload_info.phone.length == 0) {
            wx.showToast({
                title: '请完整填写默认收货信息',
                icon: 'none',
                duration: 2000,
            })
            return false;
        }

        wx.showToast({
            title: ' ',
            icon: 'loading',
            duration: 9999
        })

        wx.request({
            url: app.globalData.host + 'upload_address',
            method: 'POST',
            data: upload_info,
            header: { 'content-type': 'application/x-www-form-urlencoded' },
            success: response => {
                if (response.data.upload_status == 'success') {
                    var new_userAddress = this.data.userAddress
                    new_userAddress.name = upload_info.name
                    new_userAddress.phone = upload_info.phone
                    new_userAddress.university = this.data.university_range[this.data.university_index]
                    new_userAddress.campus = this.data.campus_range[this.data.campus_index]
                    new_userAddress.community = this.data.community_range[this.data.community_index]
                    new_userAddress.building = this.data.building_range[this.data.building_index]

                    app.globalData.userAddress = new_userAddress
                    app.globalData.hasChangeAddress = true
                    this.setData({
                        userAddress: new_userAddress,
                        isSetting: false
                    })

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

    IamDeliverer: function () {
        wx.navigateTo({
            url: '/pages/deliverer/deliverer',
        })
    }
})
