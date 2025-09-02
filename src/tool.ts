import sizeOf from "image-size";
import { ISizeCalculationResult } from "image-size/dist/types/interface";

/**
 * 将字符串转为驼峰命名
 */
export const convertToCamelCase = (str: string) => {
  // 将分隔符或@符号后的字母转为大写
  let camelCaseStr = str.replace(/[\-\/\\_@](\w)/g, function (match, p1) {
    return p1.toUpperCase();
  });

  // 首字母小写
  camelCaseStr = camelCaseStr.charAt(0).toLowerCase() + camelCaseStr.slice(1);

  return camelCaseStr;
};

/**
 * 首字母大写
 */
export const capitalizeFirstLetter = (str: string) => {
  return str.charAt(0).toUpperCase() + str.slice(1);
};

/**
 * 从xxxx@2x.png 提取出倍数
 */
export const extractNumber = (str: string) => {
  const numberRegex = /@(\d+)x/;
  const match = str.match(numberRegex);
  if (match && match[1]) {
    return parseInt(match[1]);
  }
  return 1;
};

export const readImageSize = (
  file: string
): Promise<ISizeCalculationResult> => {
  return new Promise((resolve) => {
    sizeOf(file, function (_err, dimensions) {
      if (dimensions) {
        resolve(dimensions);
      } else {
        resolve({ width: 0, height: 0 });
      }
    });
  });
};
