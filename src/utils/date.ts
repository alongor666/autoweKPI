/**
 * 日期工具函数
 * 对应Python版本的日期处理
 * 使用dayjs库实现ISO周计算
 */

import dayjs from 'dayjs'
import isoWeek from 'dayjs/plugin/isoWeek'
import isLeapYear from 'dayjs/plugin/isLeapYear'
import weekOfYear from 'dayjs/plugin/weekOfYear'
import 'dayjs/locale/zh-cn'

// 扩展dayjs插件
dayjs.extend(isoWeek)
dayjs.extend(isLeapYear)
dayjs.extend(weekOfYear)
dayjs.locale('zh-cn')

/**
 * 获取指定年份和ISO周的周六日期
 * 对应Python的date.fromisocalendar(year, week, 6)
 *
 * @param year - 年份
 * @param week - ISO周次（1-53）
 * @returns ISO周六的日期字符串（YYYY年MM月DD日）
 */
export function getWeekSaturday(year: number, week: number): string {
  try {
    // 设置为该年第一天
    let date = dayjs(`${year}-01-01`)

    // 设置为该年的第N个ISO周
    date = date.isoWeek(week)

    // 设置为周六（dayjs中周六是6）
    date = date.day(6)

    // 格式化为中文日期
    return date.format('YYYY年MM月DD日')
  } catch (error) {
    console.error(`Invalid date: year=${year}, week=${week}`, error)
    return ''
  }
}

/**
 * 获取当前ISO周次
 *
 * @returns 当前ISO周次
 */
export function getCurrentWeek(): number {
  return dayjs().isoWeek()
}

/**
 * 获取当前年份
 *
 * @returns 当前年份
 */
export function getCurrentYear(): number {
  return dayjs().year()
}

/**
 * 格式化日期
 *
 * @param date - 日期对象或字符串
 * @param format - 格式字符串（默认：YYYY-MM-DD）
 * @returns 格式化后的日期字符串
 */
export function formatDate(date: Date | string, format: string = 'YYYY-MM-DD'): string {
  return dayjs(date).format(format)
}

/**
 * 计算两个日期之间的天数差
 *
 * @param date1 - 日期1
 * @param date2 - 日期2
 * @returns 天数差
 */
export function daysBetween(date1: Date | string, date2: Date | string): number {
  return Math.abs(dayjs(date1).diff(dayjs(date2), 'day'))
}

/**
 * 判断是否是闰年
 *
 * @param year - 年份
 * @returns 是否是闰年
 */
export function isLeap(year: number): boolean {
  return dayjs(`${year}-01-01`).isLeapYear()
}

/**
 * 获取一年有多少个ISO周
 *
 * @param year - 年份
 * @returns ISO周数（52或53）
 */
export function getWeeksInYear(year: number): number {
  // ISO 8601规则：12月28日所在的周是该年的最后一周
  const lastDay = dayjs(`${year}-12-28`)
  return lastDay.isoWeek()
}
