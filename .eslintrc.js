module.exports = {
    // 使用推荐配置作为基础
    extends: [
        'eslint:recommended',
        'plugin:react/recommended',
        'plugin:react-hooks/recommended',
    ],
    // 使用的插件
    plugins: [
        'react',
        'react-hooks',
    ],
    // 解析器选项，支持最新的 JavaScript 和 JSX
    parserOptions: {
        ecmaVersion: 'latest',
        sourceType: 'module',
        ecmaFeatures: {
            jsx: true,
        },
    },
    // 环境变量，支持浏览器和 ES6 特性
    env: {
        browser: true,
        es2021: true,
        node: true,
    },
    // 规则配置：0=关闭，1=警告，2=错误
    rules: {
        // === 代码净化核心规则 ===

        // 1. 圈复杂度：限制单个函数的独立路径数量，最高不超过 5
        // 参考自项目中的“圈复杂度 ≤ 5”规则[reference:0][reference:1]
        'complexity': ['error', { max: 5 }],

        // 2. 函数参数数量：最多 3 个，超出建议使用对象传参
        // 参考自项目中的“函数参数 ≤ 3个”规则[reference:2][reference:3]
        'max-params': ['error', { max: 3 }],

        // 3. 块嵌套深度：最多 3 层，避免“回调地狱”
        // 参考自项目中的“嵌套深度 ≤ 3层”规则[reference:4][reference:5][reference:6]
        'max-depth': ['error', { max: 3 }],

        // 4. 函数最大行数：不超过 50 行，强制函数保持短小精悍
        // 参考自项目中的“函数行数 ≤ 50行”规则[reference:7]
        'max-lines-per-function': ['error', { max: 50 }],

        // === 其他推荐规则 ===

        // 强制使用 === 和 !==，避免类型转换带来的隐患
        'eqeqeq': ['error', 'always'],

        // 禁止使用 var，强制使用 let 或 const
        'no-var': 'error',

        // 优先使用箭头函数作为回调
        'prefer-arrow-callback': 'error',

        // 禁止使用容易造成安全风险的 eval
        'no-eval': 'error',

        // 禁止使用无意义的魔术数字
        'no-magic-numbers': ['warn', { ignore: [0, 1, -1] }],
    },
    // 针对 React 项目的额外设置
    settings: {
        react: {
            version: 'detect', // 自动检测 React 版本
        },
    },
};