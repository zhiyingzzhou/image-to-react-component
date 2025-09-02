import * as chokidar from 'chokidar';
import * as ejs from 'ejs';
import * as fs from 'fs';
import jsdom from 'jsdom';
import * as path from 'path';
import * as rimraf from 'rimraf';

import { format } from './prettier-format';
import {
  capitalizeFirstLetter,
  convertToCamelCase,
  extractNumber,
  readImageSize,
} from './tool';

const imageTemplate = path.join(__dirname, './template/image.ejs');
const nextImageTemplate = path.join(__dirname, './template/next-image.ejs');
const svgTemplate = path.join(__dirname, './template/svg.ejs');

interface ImageToReactComponentOptions {
  /**
   * 图片文件目录
   */
  input: string;
  /**
   * 生成的组件文件目录
   */
  output: string;
  /**
   * 监听的文件后缀
   * @example ['.png', '.jpg', '.jpeg', '.svg']
   */
  extensions: string[];
  /**
   * 是否按照倍数缩放图片
   */
  factor: boolean;
  /**
   * prettier配置文件路径
   */
  prettierConfigPath: string;
  /**
   * 是否使用next/image
   */
  useNextImage?: boolean;
}

class ImageToReactComponent {
  watcher = null;
  options: ImageToReactComponentOptions & {
    targetDir: string;
    outputDir: string;
    getContext?: () => ImageToReactComponent;
  };
  constructor(props: ImageToReactComponentOptions) {
    const targetDir = props.input;
    const outputDir = props.output;
    this.options = {
      ...props,
      targetDir,
      outputDir,
    };
  }

  getContext() {
    return this;
  }

  async getFileIno(filePath: string, type: 'add' | 'unlink') {
    const fileName = filePath.replace(
      `${this.options.targetDir}${path.sep}`,
      '',
    );
    const { ext, name: nameWithoutExtension } = path.parse(fileName);
    const extension = ext.toLowerCase();

    const fileNameWithoutExtensionLowerCase = fileName
      .replace(extension, '')
      .toLowerCase();
    // 获取组件名称
    const componentName = capitalizeFirstLetter(
      convertToCamelCase(fileNameWithoutExtensionLowerCase),
    );
    let size: Awaited<ReturnType<typeof readImageSize>> = {
      width: 0,
      height: 0,
    };
    if (type === 'add') {
      // 读取图片尺寸
      size = await readImageSize(filePath);
      if (this.options.factor) {
        const factor = extractNumber(nameWithoutExtension);
        if (size.width && size.height) {
          size.width = size.width / factor;
          size.height = size.height / factor;
        }
      }
    }

    let viewBox;
    // 如果是svg文件
    if (extension.includes('svg')) {
      const dom = new jsdom.JSDOM(`<body>
          ${fs.readFileSync(filePath)}
        </body>`);
      viewBox = dom.window.document.body
        .querySelector('svg')
        ?.getAttribute('viewBox');
    }

    return {
      // 文件相对于 targetDir 的相对路径
      relativeFilePath: path
        .relative(this.options.outputDir, filePath)
        .replace(/\\/g, '/'),
      componentName,
      componentFilePath: path.resolve(
        this.options.outputDir,
        `${componentName}.tsx`,
      ),
      size,
      fileNameWithoutExtensionLowerCase,
      nameWithoutExtension,
      extension,
      viewBox,
    };
  }

  // 监听文件添加事件
  async add(filePath: string) {
    const context = this.options.getContext?.();
    const extension = path.extname(filePath).toLowerCase();
    if (context && context.options.extensions.includes(extension)) {
      console.log(`图片文件已添加：${filePath}`);
      // 在这里处理图片文件的逻辑
      const fileInfo = await context.getFileIno(filePath, 'add');
      ejs
        .renderFile(
          fileInfo.extension.includes('svg')
            ? svgTemplate
            : context.options.useNextImage
              ? nextImageTemplate
              : imageTemplate,
          {
            ...fileInfo.size,
            ...fileInfo,
          },
        )
        .then((template) => {
          format({
            content: template,
            filename: fileInfo.componentFilePath,
            prettierConfigPath: context.options.prettierConfigPath,
          });
          // fs.writeFileSync(fileInfo.componentFilePath, template);
          console.log(
            `图片文件对应的组件已生成：${fileInfo.componentFilePath}`,
          );
        });
    }
  }

  // 监听文件删除事件
  async unlink(filePath: string) {
    const context = this.options.getContext?.();
    const extension = path.extname(filePath).toLowerCase();
    if (context && context.options.extensions.includes(extension)) {
      console.log(`图片文件已删除：${filePath}`);
      // 在这里处理图片文件的逻辑
      const fileInfo = await context.getFileIno(filePath, 'unlink');
      rimraf.sync(fileInfo.componentFilePath);
      console.log(`图片文件对应的组件已删除：${fileInfo.componentFilePath}`);
    }
  }

  // 监听错误事件
  error(error: Error) {
    console.error(`发生错误：${error}`);
  }

  init() {
    // 判断目录是否存在
    fs.access(this.options.targetDir, fs.constants.R_OK, (err) => {
      if (err) {
        throw err;
      }
      const stat = fs.lstatSync(this.options.targetDir);
      //   判断是否是文件夹
      if (stat.isFile()) {
        throw new Error('input must be a directory');
      }
      // 指定要监视的目录路径
      // 监视目录的变化
      const watcher = chokidar.watch(this.options.targetDir, {
        ignored: /[\/\\]\./, // 忽略隐藏文件
        persistent: true, // 持续监视
        getContext: this.getContext.bind(this),
      } as chokidar.WatchOptions);

      watcher.on('add', this.add);

      watcher.on('change', this.add);

      watcher.on('unlink', this.unlink);

      watcher.on('error', this.error);
    });
  }
}
export default ImageToReactComponent;
