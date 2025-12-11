/**
 * 数学工具函数
 * 对应Python版本的safe_divide等工具函数
 */

/**
 * 安全除法
 * 当分母为0时返回0，避免NaN
 * 对应Python的safe_divide函数
 *
 * @param numerator - 分子
 * @param denominator - 分母
 * @param defaultValue - 分母为0时的默认值
 * @returns 计算结果
 */
export function safeDivide(
  numerator: number,
  denominator: number,
  defaultValue: number = 0
): number {
  if (!denominator || denominator === 0 || !isFinite(denominator)) {
    return defaultValue
  }

  const result = numerator / denominator

  if (!isFinite(result) || isNaN(result)) {
    return defaultValue
  }

  return result
}

/**
 * 将元转换为万元
 *
 * @param yuan - 金额（元）
 * @returns 金额（万元）
 */
export function yuanToWan(yuan: number): number {
  return yuan / 10000
}

/**
 * 将万元转换为元
 *
 * @param wan - 金额（万元）
 * @returns 金额（元）
 */
export function wanToYuan(wan: number): number {
  return wan * 10000
}

/**
 * 四舍五入到指定小数位
 *
 * @param value - 数值
 * @param decimals - 小数位数（默认2位）
 * @returns 四舍五入后的数值
 */
export function round(value: number, decimals: number = 2): number {
  if (!isFinite(value) || isNaN(value)) {
    return 0
  }

  const factor = Math.pow(10, decimals)
  return Math.round(value * factor) / factor
}

/**
 * 计算百分比
 *
 * @param part - 部分
 * @param total - 总数
 * @param decimals - 小数位数（默认2位）
 * @returns 百分比（不含%符号）
 */
export function percentage(part: number, total: number, decimals: number = 2): number {
  return round(safeDivide(part, total) * 100, decimals)
}

/**
 * 确保数值有效
 * 将NaN、Infinity转换为0
 *
 * @param value - 输入值
 * @param defaultValue - 无效时的默认值
 * @returns 有效的数值
 */
export function ensureNumber(value: unknown, defaultValue: number = 0): number {
  const num = Number(value)

  if (isNaN(num) || !isFinite(num)) {
    return defaultValue
  }

  return num
}

/**
 * 数组求和
 *
 * @param numbers - 数字数组
 * @returns 总和
 */
export function sum(numbers: number[]): number {
  return numbers.reduce((acc, val) => acc + ensureNumber(val), 0)
}

/**
 * 数组平均值
 *
 * @param numbers - 数字数组
 * @returns 平均值
 */
export function average(numbers: number[]): number {
  if (numbers.length === 0) {
    return 0
  }
  return sum(numbers) / numbers.length
}
