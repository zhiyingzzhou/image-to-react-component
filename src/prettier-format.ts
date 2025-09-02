import * as fs from 'fs'
import * as prettier from 'prettier'

interface IFormatOptions {
    content: string;
    filename: string;
    parser?: string;
    prettierConfigPath: string;
}

export const format = async (options: IFormatOptions) => {
  // 解析prettier配置
  const prettierOptions = await prettier.resolveConfig(options.prettierConfigPath);
  // 使用prettier格式化代码
  const formatText = await prettier.format(options.content, {
    parser: options.parser || "typescript",
    ...prettierOptions,
  });
  fs.writeFileSync(options.filename, formatText);
};