/* 
请求模块
*/

import store from '@/store'
import axios from 'axios'
import JSONBig from 'json-bigint'

// JSONBig 可以处理数据中超出JavaScript安全整数范围的问题
// JSONBig.parse()         //把JSON格式的字符串转为JavaScript对象
// JSONBig.stringify()      //把JavaScript对象转为JSON格式的字符串


const request = axios.create({
    // 接口的基准路径
    baseURL: 'http://toutiao.itheima.net',

    // 自定义后端返回的原始数据
    // data:后端返回的原始数据，就是JSON格式的字符串
    transformResponse: [function (data) {
        try {
            return JSONBig.parse(data)
        } catch (err) {
            return data
        }

        // axios默认在内部这样来处理后端返回的数据
        // return data
    }]
})

// 请求拦截器
request.interceptors.request.use(function (config) {
    // 请求发起会经过这里
    // config :本次请求的请求配置对象
    const { user } = store.state
    if (user && user.token) {
        config.headers.Authorization = `Bearer ${user.token}`
    }
    console.log(config);
    // 注意:必须返回config配置对象，否则请求停止出不去
    return config
}, function (error) {
    // 请求出错（即没有发出去）会进入这里
    return Promise.reject(error)
})

// 响应拦截器

export default request