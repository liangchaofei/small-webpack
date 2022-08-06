class CopyrightWebpackPlugin {
    // constructor(options){
    //     console.log('插件被使用了',options)
    // }

    apply(compiler){
        // compile时刻，同步
        compiler.hooks.compile.tap('CopyrightWebpackPlugin',compilation=>{
            console.log('compilation', compilation)
        })
        // emit时刻 异步
        // tapAsync 异步
        compiler.hooks.emit.tapAsync('CopyrightWebpackPlugin',(compilation,cb) => {
            debugger;
            console.log('compilation',compilation.assets) // 打包生成的内容
            compilation.assets['copyright.txt'] = {
                source: function(){
                    return 'copyright by curry'
                },
                size: function(){
                    return 18;
                }
            }

            cb()
        })
    }
}

module.exports = CopyrightWebpackPlugin;