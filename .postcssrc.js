// postcss.config.js
module.exports = {
    // 配置要使用的 postCSS插件
    plugins: {
        'postcss-pxtorem': {
            // lib-flexible的REM适配方案，把一行分成10份，每份就是十分之一
            // 所以rootValue应该设置为你的设计稿的十分之一
            // 目前设计稿是750， 应该设置为75
            // 如果是Vant的样式，就按照37.5来转换；
            // 如果是自己的样式，就按照75来转换
            // 查文档知:rootValue 支持两种类型：
            //      数字：固定的数值
            //      函数：可以动态处理返回值
            //              postcss-pxtorem 处理每个css文件都会调用该函数
            //              它会把被处理的css文件相关的信息通过参数传递给该函数
            rootValue({ file }) {
                return file.indexOf('vant') !== -1 ? 37.5 : 75
            },
            // rootValue: 37.5,
            // 配置要转换的 CSS 属性
            propList: ['*'],

            // 配置不要转换的样式资源
            exclude: 'github-markdown'
        },
    },
};