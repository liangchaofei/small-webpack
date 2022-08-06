module.exports = function(source){
    console.log('this', this.query) // 获取参数

    const callback = this.async();

    setTimeout(() => {
        const res = source.replace('curry',this.query.name);
        callback(res)
    },1000)

}