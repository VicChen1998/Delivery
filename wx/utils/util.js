const formatTime = date => {
    const year = date.getFullYear()
    const month = date.getMonth() + 1
    const day = date.getDate()
    const hour = date.getHours()
    const minute = date.getMinutes()
    const second = date.getSeconds()

    return [year, month, day].map(formatNumber).join('/') + ' ' + [hour, minute, second].map(formatNumber).join(':')
}

const formatNumber = n => {
    n = n.toString()
    return n[1] ? n : '0' + n
}

const deepCopyObj = src => {
    var dst = {};
    for (var prop in src) {
        if (src.hasOwnProperty(prop)) {
            dst[prop] = src[prop];
        }
    }
    return dst;
}

const deepCopyArray = src => {
    var dst = [];
    for (let i = 0; i < src.length; i++) {
        dst.push(src[i]);
    }
    return dst;
}

const recognize_pkg_info = info => {

    var keyword_map = {
        '菊园2号楼前台': '菊二前台',
        '菊园2号楼分拣区': '菊二分拣区',
        '菊园2号楼自助': '菊二自助区',
        '菊园2号楼(东侧)自助': '菊二自助区',
        '菊园5号楼西北侧分拣区': '菊五分拣区',
        '菊园5号楼东南侧自助一区': '菊五自助一区',
        '菊园5号楼自助二区': '菊五自助二区',
        '西门': '西门',
        '东门': '东门',
        '南门': '南门',
    }

    for (var k in keyword_map) {
        if (info.indexOf(k) != -1)
            return {
                'status': 'success',
                'pkg_position_name': keyword_map[k]
            }
    }

    return { 'status': 'fail' }
}

module.exports = {
    formatTime: formatTime,
    deepCopyObj: deepCopyObj,
    deepCopyArray: deepCopyArray,
    recognize_pkg_info: recognize_pkg_info,
}
