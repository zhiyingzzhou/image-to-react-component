module.exports = {
  // 一行的字符数，如果超过会进行换行，默认为80
  printWidth: 80,
  indent_style: 'space',
  indent_size: 2,
  trailingComma: 'all',
  proseWrap: 'never',
  // 字符串是否使用单引号，默认为false，使用双引号
  singleQuote: true,
  semi: true,
  // 对象大括号直接是否有空格，默认为true，效果：{ foo: bar }
  bracketSpacing: true,
  plugins: ['prettier-plugin-organize-imports', 'prettier-plugin-packagejson'],
};
