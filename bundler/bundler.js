const fs = require('fs');
const parser = require('@babel/parser');
const traverse = require('@babel/traverse').default;
const path = require('path')
const babel = require('@babel/core');


const moduleAnalyser = (filename) => {
    const content = fs.readFileSync(filename, 'utf-8');
    const ast = parser.parse(content,{
        sourceType: 'module'
    })
    const dependencies = {}; // 收集依赖
    traverse(ast, {
        ImportDeclaration({ node }){
            // node.source.value  相对路径   ./message.js 
            const dirname = path.dirname(filename) // ./src
            const newFile= './' + path.join(dirname,node.source.value) // ./src/message.js
            dependencies[node.source.value] = newFile    // 相对路径： 绝对路径 { './message.js': './src/message.js' }
        }
    })
    // 将esm代码转换成浏览器能识别的代码
    // 就是 code 
    const { code } = babel.transformFromAst(ast,null,{
        presets: ['@babel/preset-env']
    })
    return {
        filename,
        dependencies,
        code
    }
}   
const makeDependenciesGraph = (entry) => {
    const entryModule = moduleAnalyser(entry); // 入口文件分析
    const graphArray = [entryModule];
    for(let i = 0;i<graphArray.length;i++){
        const item = graphArray[i];
        const { dependencies } = item;
        if(dependencies){
            for(let j in dependencies){
                graphArray.push(moduleAnalyser(dependencies[j])) // 不断收集 依赖
            }
        }
    }
    const graph = {};
    graphArray.forEach(item => {
        graph[item.filename] = {
            dependencies: item.dependencies,
            code: item.code
        }
    })
    return graph;
}

const generateCode = (entry) => {
    const graph = JSON.stringify(makeDependenciesGraph(entry))

    return `
        (function(graph){
            function require(module){
                function localRequire(relativePath){
                    return  require(graph[module].dependencies[relativePath])
                }
                var exports = {};

                (function(require,exports,code){
                    eval(code)
                })(localRequire, exports, graph[module].code)

                return exports;
            };
            require('${entry}')
        })(${graph})
    `
}
const code = generateCode('./src/index.js')
console.log(code)
