/**
 * 数据加载服务
 * 对应Python的data_loader.py
 * 负责CSV文件解析和数据验证
 */

import Papa from 'papaparse'
import type {
  RawDataRow,
  DataLoadResult,
  ValidationError,
  ParseConfig,
  REQUIRED_COLUMNS,
  NUMERIC_COLUMNS,
} from '@/types'
import { ensureNumber } from '@/utils/math'

// 导入常量
import { REQUIRED_COLUMNS as REQ_COLS, NUMERIC_COLUMNS as NUM_COLS } from '@/types/data'

export class DataLoader {
  /**
   * 从File对象加载CSV数据
   *
   * @param file - CSV文件
   * @returns 加载结果
   */
  async loadFromFile(file: File): Promise<DataLoadResult> {
    try {
      const content = await this.readFileContent(file)
      return this.parseCSV(content)
    } catch (error) {
      return {
        success: false,
        errors: [
          {
            type: 'invalid_value',
            message: '文件读取失败',
            details: [error instanceof Error ? error.message : String(error)],
          },
        ],
      }
    }
  }

  /**
   * 从字符串内容解析CSV
   *
   * @param content - CSV内容
   * @returns 加载结果
   */
  parseCSV(content: string): DataLoadResult {
    // PapaParse配置
    const config: Papa.ParseConfig<RawDataRow> = {
      header: true, // 首行为表头
      dynamicTyping: true, // 自动类型转换
      skipEmptyLines: true, // 跳过空行
      transformHeader: (header: string) => header.trim(), // 去除表头空格
      transform: (value: string) => value.trim(), // 去除值的空格
    }

    // 解析CSV
    const parseResult = Papa.parse<RawDataRow>(content, config)

    // 检查解析错误
    if (parseResult.errors.length > 0) {
      return {
        success: false,
        errors: [
          {
            type: 'invalid_value',
            message: 'CSV解析失败',
            details: parseResult.errors.map(e => `第${e.row}行: ${e.message}`),
          },
        ],
      }
    }

    const data = parseResult.data

    // 检查数据是否为空
    if (data.length === 0) {
      return {
        success: false,
        errors: [
          {
            type: 'empty_data',
            message: 'CSV文件为空',
          },
        ],
      }
    }

    // 验证数据
    const validationErrors = this.validateData(data)
    if (validationErrors.length > 0) {
      return {
        success: false,
        errors: validationErrors,
      }
    }

    // 清洗数据
    const cleanedData = this.cleanData(data)

    // 计算列数（从第一行推断）
    const columnCount = Object.keys(cleanedData[0] || {}).length

    return {
      success: true,
      data: cleanedData,
      rowCount: cleanedData.length,
      columnCount,
    }
  }

  /**
   * 验证数据
   *
   * @param data - 原始数据
   * @returns 验证错误列表
   */
  private validateData(data: RawDataRow[]): ValidationError[] {
    const errors: ValidationError[] = []

    if (data.length === 0) {
      errors.push({
        type: 'empty_data',
        message: '数据为空',
      })
      return errors
    }

    // 检查必需列
    const firstRow = data[0]
    if (!firstRow) {
      errors.push({
        type: 'empty_data',
        message: '数据行为空',
      })
      return errors
    }

    const actualColumns = Object.keys(firstRow)
    const missingColumns = REQ_COLS.filter(col => !actualColumns.includes(col as string))

    if (missingColumns.length > 0) {
      errors.push({
        type: 'missing_column',
        message: 'CSV文件缺失必要列',
        details: missingColumns as string[],
      })
    }

    return errors
  }

  /**
   * 清洗数据
   * 确保数值字段为有效数字
   *
   * @param data - 原始数据
   * @returns 清洗后的数据
   */
  private cleanData(data: RawDataRow[]): RawDataRow[] {
    return data.map(row => {
      const cleaned: RawDataRow = { ...row }

      // 清洗数值字段
      NUM_COLS.forEach(col => {
        const key = col as keyof RawDataRow
        if (key in cleaned) {
          cleaned[key] = ensureNumber(cleaned[key], 0) as never
        }
      })

      // 确保字符串字段不为空
      if (!cleaned.third_level_organization) {
        cleaned.third_level_organization = '未知机构'
      }

      if (!cleaned.business_type_category) {
        cleaned.business_type_category = '其他'
      }

      if (!cleaned.customer_category) {
        cleaned.customer_category = '其他'
      }

      return cleaned
    })
  }

  /**
   * 读取文件内容
   *
   * @param file - 文件对象
   * @returns 文件内容字符串
   */
  private readFileContent(file: File): Promise<string> {
    return new Promise((resolve, reject) => {
      const reader = new FileReader()

      reader.onload = e => {
        const content = e.target?.result as string
        if (content) {
          resolve(content)
        } else {
          reject(new Error('文件内容为空'))
        }
      }

      reader.onerror = () => {
        reject(new Error('文件读取失败'))
      }

      // 尝试使用UTF-8编码读取
      reader.readAsText(file, 'UTF-8')
    })
  }

  /**
   * 获取数据统计信息
   *
   * @param data - 数据
   * @returns 统计信息
   */
  getStatistics(data: RawDataRow[]) {
    if (data.length === 0) {
      return {
        totalRows: 0,
        totalPremium: 0,
        uniqueOrganizations: 0,
        uniqueBusinessTypes: 0,
      }
    }

    const totalPremium = data.reduce((sum, row) => sum + row.signed_premium_yuan, 0)
    const uniqueOrganizations = new Set(data.map(row => row.third_level_organization)).size
    const uniqueBusinessTypes = new Set(data.map(row => row.business_type_category)).size

    return {
      totalRows: data.length,
      totalPremium,
      uniqueOrganizations,
      uniqueBusinessTypes,
    }
  }
}

// 导出单例
export const dataLoader = new DataLoader()
