# autoweKPI 知识库

## 📚 文档说明

本文档是autoweKPI项目的系统知识库，记录关键技术决策、最佳实践、问题解决方案和经验教训，作为项目的长期维护指南。

**最后更新**: 2025-12-11
**维护人**: 开发团队
**版本**: v1.0

---

## 目录

1. [项目架构](#项目架构)
2. [技术决策记录](#技术决策记录)
3. [核心模块说明](#核心模块说明)
4. [最佳实践](#最佳实践)
5. [常见问题与解决方案](#常见问题与解决方案)
6. [性能优化指南](#性能优化指南)
7. [测试策略](#测试策略)
8. [部署与运维](#部署与运维)

---

## 项目架构

### 整体架构图

```
┌─────────────────────────────────────────────────┐
│                  GitHub Pages                    │
│              (静态资源托管 + CDN)                 │
└─────────────────────────────────────────────────┘
                        ↓
┌─────────────────────────────────────────────────┐
│              Vue 3 单页应用 (SPA)                 │
├─────────────────────────────────────────────────┤
│  UI层 (Element Plus)                             │
│  ├── 文件上传组件                                 │
│  ├── KPI卡片组件                                 │
│  ├── ECharts图表组件                             │
│  └── 报告视图组件                                 │
├─────────────────────────────────────────────────┤
│  状态管理层 (Pinia)                               │
│  ├── data store: 数据+KPI+报告                   │
│  └── config store: 配置+UI状态                   │
├─────────────────────────────────────────────────┤
│  业务逻辑层 (Services)                            │
│  ├── DataLoader: CSV解析                        │
│  ├── KPICalculator: 15个KPI计算                 │
│  ├── DataAggregator: 数据聚合                    │
│  └── BusinessMapper: 业务映射                    │
├─────────────────────────────────────────────────┤
│  工具层 (Utils)                                   │
│  ├── math: 数学计算                              │
│  └── date: 日期处理                              │
├─────────────────────────────────────────────────┤
│  类型层 (Types)                                   │
│  └── 40+ TypeScript类型定义                      │
└─────────────────────────────────────────────────┘
```

### 技术栈选型

| 层级 | 技术 | 版本 | 选型理由 |
|------|------|------|----------|
| **前端框架** | Vue 3 | 3.5.13 | 渐进式、TypeScript支持好、学习曲线平缓 |
| **构建工具** | Vite | 6.0.5 | 开发体验好、构建快速、HMR优秀 |
| **类型系统** | TypeScript | 5.7.2 | 严格类型检查、IDE支持好、重构友好 |
| **状态管理** | Pinia | 2.2.8 | Composition API、类型推断好、轻量 |
| **UI组件库** | Element Plus | 2.9.2 | 组件丰富、文档完整、社区活跃 |
| **图表库** | ECharts | 5.5.1 | 功能强大、性能好、配置灵活 |
| **CSV解析** | PapaParse | 5.4.1 | 性能优秀、类型转换好、错误处理完善 |
| **工具库** | Lodash-es | 4.17.21 | Tree-shaking友好、API丰富 |
| **日期处理** | Day.js | 1.11.13 | 轻量、API类似moment、支持ISO周 |
| **数据库** | DuckDB WASM | 1.29.0 | 浏览器端SQL、性能好（预留） |

---

## 技术决策记录

### ADR-001: 使用Vue 3而不是React (2025-12-11)

**背景**: 需要选择前端框架进行Python Flask应用迁移

**选项**:
- React: 生态最大，但学习曲线陡
- Vue 3: 渐进式，TypeScript支持好
- Svelte: 性能最优，但生态小

**决策**: Vue 3

**理由**:
1. 渐进式设计，便于从HTML迁移
2. Composition API + TypeScript支持优秀
3. 学习曲线平缓，适合小团队
4. 生态成熟（Element Plus、ECharts集成好）
5. 性能足够（虚拟DOM优化）

**影响**:
- 正面：开发效率高、代码可维护性好
- 负面：无

**状态**: ✅ 已采纳

---

### ADR-002: 使用Pinia Composition API而不是Options API (2025-12-11)

**背景**: 需要选择状态管理方式

**选项**:
- Pinia Options API: 传统写法，类似Vuex
- Pinia Composition API: setup语法，类型推断好

**决策**: Composition API

**理由**:
1. 与Vue 3 setup语法一致
2. TypeScript类型推断更好
3. 逻辑复用更方便（composables）
4. 性能略优（编译优化）
5. 未来趋势

**影响**:
- 正面：类型安全、代码简洁、可维护性高
- 负面：需要熟悉Composition API

**状态**: ✅ 已采纳

---

### ADR-003: 服务层使用单例模式 (2025-12-11)

**背景**: 服务类需要在多处使用

**选项**:
- 每次new实例：灵活但管理复杂
- 单例导出：简单但不够灵活
- 依赖注入容器：灵活但过度设计

**决策**: 单例导出

**理由**:
1. 简化使用：`import { dataLoader } from '@/services/data-loader'`
2. 全局唯一实例，便于状态共享
3. TypeScript类型推断完整
4. 适合中小型项目

**影响**:
- 正面：使用简单、无需依赖注入
- 负面：测试时需要mock整个模块

**状态**: ✅ 已采纳

---

### ADR-004: TypeScript严格模式 (2025-12-11)

**背景**: 需要确定TypeScript配置级别

**选项**:
- 宽松模式：兼容性好但类型不安全
- 严格模式：类型安全但要求高

**决策**: 严格模式

**配置**:
```json
{
  "strict": true,
  "noUnusedLocals": true,
  "noUnusedParameters": true,
  "noFallthroughCasesInSwitch": true,
  "noUncheckedIndexedAccess": true
}
```

**理由**:
1. 提前发现潜在bug
2. 提高代码质量
3. 重构更安全
4. IDE提示更准确

**影响**:
- 正面：代码质量高、bug少
- 负面：初期开发稍慢

**状态**: ✅ 已采纳

---

## 核心模块说明

### 1. 类型系统 (src/types/)

**设计原则**:
- 业务实体优先（RawDataRow、KPIResult）
- 组合优于继承
- 避免any类型
- 导出统一入口

**文件结构**:
```
types/
├── data.ts      # 原始数据、分组数据、加载结果
├── kpi.ts       # KPI结果、报告摘要、阈值配置
├── chart.ts     # 图表类型、数据点、配置
├── config.ts    # 应用配置、会话状态
└── index.ts     # 统一导出
```

**关键类型**:
- `RawDataRow`: CSV原始数据行（8个必需字段）
- `KPIResult`: 15个KPI指标结果
- `ReportSummary`: 完整报告摘要
- `GroupKPIResult`: 分组KPI结果

---

### 2. 工具函数 (src/utils/)

#### math.ts - 数学工具

**核心函数**:
```typescript
// 安全除法（避免除零）
safeDivide(numerator, denominator, defaultValue = 0)

// 单位转换
yuanToWan(yuan)  // 元 -> 万元
wanToYuan(wan)   // 万元 -> 元

// 四舍五入
round(value, decimals = 2)

// 百分比计算
percentage(part, total, decimals = 2)

// 确保数值有效（NaN -> 0）
ensureNumber(value, defaultValue = 0)
```

**使用示例**:
```typescript
import { safeDivide, percentage } from '@/utils/math'

// 避免除零
const rate = safeDivide(paid, premium) * 100  // 分母为0时返回0

// 计算百分比
const achievementRate = percentage(actual, plan)  // 自动*100
```

---

#### date.ts - 日期工具

**核心函数**:
```typescript
// 获取ISO周的周六日期
getWeekSaturday(year, week)  // "2025年12月06日"

// 获取当前周次/年份
getCurrentWeek()
getCurrentYear()

// 格式化日期
formatDate(date, format = 'YYYY-MM-DD')
```

**ISO周说明**:
- 使用dayjs的isoWeek插件
- 符合ISO 8601标准
- 每周从周一开始
- 第一周包含该年的第一个周四

---

### 3. 服务层 (src/services/)

#### DataLoader - 数据加载器

**职责**: CSV文件解析、数据验证、数据清洗

**核心方法**:
```typescript
class DataLoader {
  async loadFromFile(file: File): Promise<DataLoadResult>
  parseCSV(content: string): DataLoadResult
  private validateData(data: RawDataRow[]): ValidationError[]
  private cleanData(data: RawDataRow[]): RawDataRow[]
  getStatistics(data: RawDataRow[])
}
```

**特性**:
- 使用PapaParse解析CSV
- 自动类型转换（dynamicTyping）
- 必需列验证（8个必需字段）
- 数值字段清洗（NaN -> 0）
- 友好的错误提示

**使用示例**:
```typescript
import { dataLoader } from '@/services/data-loader'

const result = await dataLoader.loadFromFile(file)
if (result.success) {
  console.log('数据行数:', result.rowCount)
  console.log('列数:', result.columnCount)
} else {
  console.error('错误:', result.errors)
}
```

---

#### KPICalculator - KPI计算引擎

**职责**: 计算15个KPI指标

**15个KPI指标**:
1. **基础指标** (3个): 签单保费、满期保费、已赚保费
2. **成本指标** (4个): 已报案赔付、未决赔款、获客成本、营运费用
3. **比率指标** (5个): 满期赔付率、变动成本率、综合成本率、费用率、贡献率
4. **边际指标** (1个): 满期边际贡献额
5. **进度指标** (2个): 满期率、保费达成率

**核心方法**:
```typescript
class KPICalculator {
  calculateKPIs(data: RawDataRow[], options?: KPICalculateOptions): KPIResult
  calculateGroupKPIs(groups: Array<{name, data}>, options?): GroupKPIResult[]
  private roundKPIResult(kpi: KPIResult): KPIResult
}
```

**计算公式**:
```typescript
// 变动成本率 = (已报案赔付 + 未决 + 获客成本) / 满期保费 * 100
const 变动成本率 = safeDivide(变动成本, 满期保费) * 100

// 贡献率 = 100 - 变动成本率
const 贡献率 = 100 - 变动成本率

// 满期边际贡献额 = 满期保费 * 贡献率 / 100
const 满期边际贡献额 = 满期保费 * (贡献率 / 100)
```

**精度控制**:
- 金额字段: 保留2位小数
- 比率字段: 保留1位小数

---

#### DataAggregator - 数据聚合器

**职责**: 按维度分组、计算分组KPI、排序

**核心方法**:
```typescript
class DataAggregator {
  groupByDimension(data, dimension): GroupedData[]
  calculateGroupedKPIs(data, dimension, sortBy?, limit?): GroupKPIResult[]
  isSingleOrgMode(data): boolean
  isMultiOrgMode(data): boolean
  getOrganizationName(data): string
  sortByPremiumProgress(results): GroupKPIResult[]
  getPremiumProgressData(data)
}
```

**分组维度**:
- `third_level_organization`: 三级机构
- `customer_category`: 客户类别
- `business_type_category`: 业务类型

**排序规则**:
- 默认: 按签单保费降序
- 保费进度: 有计划按达成率升序，无计划按保费升序

---

#### BusinessMapper - 业务映射器

**职责**: 业务类型映射、异常检测

**核心方法**:
```typescript
class BusinessMapper {
  setBusinessTypeMapping(mapping: BusinessTypeMapping)
  setThresholds(thresholds: Partial<ThresholdConfig>)
  applyBusinessTypeMapping(data): RawDataRow[]
  identifyProblemOrganizations(results): ProblemOrganization[]
  getBusinessTypeStatistics(data)
  getCustomerCategoryStatistics(data)
}
```

**异常检测规则**:
1. 综合成本率 > 93%
2. 保费达成率 < 95%（如果有计划）
3. 费用率 > 18%

**返回结果**: 前5个问题机构

---

### 4. 状态管理 (src/stores/)

#### data store - 数据状态

**状态**:
```typescript
{
  rawData: RawDataRow[]        // 原始数据
  loading: boolean             // 加载状态
  error: string | null         // 错误信息
  fileName: string             // 文件名
  year: number                 // 年份
  week: number                 // 周次
}
```

**计算属性**:
```typescript
{
  hasData: boolean             // 是否有数据
  statistics                   // 数据统计
  isSingleOrgMode             // 单机构模式
  organizationName            // 机构名称
  summaryKPI                  // 总体KPI
  kpiByOrganization           // 按机构分组KPI
  kpiByCustomerCategory       // 按客户类别分组KPI
  kpiByBusinessType           // 按业务类型分组KPI
  problemOrganizations        // 问题机构
  reportSummary               // 完整报告摘要
}
```

**操作方法**:
```typescript
{
  loadFile(file)              // 加载CSV文件
  setReportConfig(year, week) // 设置报告配置
  clearData()                 // 清除数据
  getKPIByDimension(dimension) // 获取指定维度KPI
}
```

---

#### config store - 配置状态

**状态**:
```typescript
{
  appConfig: AppConfig        // 应用配置
  activeTab: string           // 当前Tab
  activeDimension: GroupDimension // 当前维度
  sessionState: SessionState  // 会话状态
}
```

**操作方法**:
```typescript
{
  setActiveTab(tab)           // 设置激活Tab
  setActiveDimension(dimension) // 设置激活维度
  toggleTheme()               // 切换主题
  toggleDuckDB(enabled?)      // 启用/禁用DuckDB
  toggleTrend(enabled?)       // 启用/禁用趋势分析
  saveSessionState()          // 保存会话状态
  loadSessionState()          // 加载会话状态
  initialize()                // 初始化
}
```

**会话持久化**:
- 使用localStorage存储
- 自动恢复上次的Tab和维度选择
- 键名: `autoweKPI_session`

---

## 最佳实践

### 1. TypeScript使用

✅ **DO**:
```typescript
// 使用具体类型
function calculateKPI(data: RawDataRow[]): KPIResult { }

// 使用type而不是interface（对于联合类型）
type GroupDimension = 'organization' | 'customer' | 'business'

// 使用可选链和空值合并
const value = row.year_plan_premium ?? 0

// 避免类型断言，使用类型守卫
if (typeof value === 'number') { }
```

❌ **DON'T**:
```typescript
// 避免any
function process(data: any) { }

// 避免类型断言
const value = data as number

// 避免非空断言
const value = data!.field
```

---

### 2. 命名规范

**文件命名**: kebab-case
```
data-loader.ts
kpi-calculator.ts
```

**变量/函数**: camelCase
```typescript
const rawData = []
function calculateKPIs() {}
```

**类名**: PascalCase
```typescript
class DataLoader {}
class KPICalculator {}
```

**常量**: UPPER_SNAKE_CASE
```typescript
const REQUIRED_COLUMNS = []
const DEFAULT_THRESHOLDS = {}
```

**中文KPI字段**: 保留中文（与业务对齐）
```typescript
interface KPIResult {
  签单保费: number
  满期赔付率: number
}
```

---

### 3. 错误处理

✅ **统一错误处理模式**:
```typescript
async function loadFile(file: File): Promise<DataLoadResult> {
  try {
    // 业务逻辑
    return { success: true, data }
  } catch (error) {
    return {
      success: false,
      errors: [{
        type: 'invalid_value',
        message: error instanceof Error ? error.message : '未知错误'
      }]
    }
  }
}
```

✅ **使用Result模式而不是抛出异常**:
```typescript
interface DataLoadResult {
  success: boolean
  data?: RawDataRow[]
  errors?: ValidationError[]
}
```

---

### 4. 性能优化

✅ **使用计算属性缓存**:
```typescript
const summaryKPI = computed(() => {
  if (!hasData.value) return null
  return kpiCalculator.calculateKPIs(rawData.value)
})
```

✅ **避免不必要的响应式**:
```typescript
// 大数组使用shallowRef
const rawData = shallowRef<RawDataRow[]>([])

// 不需要响应式的使用markRaw
const calculator = markRaw(new KPICalculator())
```

---

## 常见问题与解决方案

### Q1: CSV解析中文乱码

**问题**: 某些CSV文件中文显示乱码

**原因**: 文件编码不是UTF-8

**解决方案**:
```typescript
// data-loader.ts中使用UTF-8编码
reader.readAsText(file, 'UTF-8')

// 如果仍有问题，可尝试
reader.readAsText(file, 'GBK')
```

---

### Q2: 除零错误导致NaN

**问题**: 某些机构满期保费为0，导致比率计算为NaN

**解决方案**: 使用safeDivide函数
```typescript
import { safeDivide } from '@/utils/math'

// 当分母为0时返回0
const rate = safeDivide(paid, premium) * 100
```

---

### Q3: 日期计算不准确

**问题**: ISO周计算结果与预期不符

**解决方案**:
- 使用dayjs的isoWeek插件（已配置）
- 确保理解ISO周规则：
  * 每周从周一开始
  * 第一周包含该年的第一个周四
  * 一年有52或53周

```typescript
import { getWeekSaturday } from '@/utils/date'

// 2025年第49周的周六
const date = getWeekSaturday(2025, 49)  // "2025年12月06日"
```

---

### Q4: TypeScript类型错误

**问题**: `Type 'X' is not assignable to type 'Y'`

**常见原因**:
1. 类型导入错误（import type vs import）
2. 可选字段未处理
3. 数组索引访问（noUncheckedIndexedAccess）

**解决方案**:
```typescript
// 1. 正确区分类型导入和值导入
import type { RawDataRow } from '@/types'  // 类型
import { DEFAULT_THRESHOLDS } from '@/types/kpi'  // 值

// 2. 处理可选字段
const plan = row.year_plan_premium ?? 0

// 3. 数组访问需要检查
const firstRow = data[0]
if (firstRow) {
  // 使用firstRow
}
```

---

## 性能优化指南

### 1. 大数据处理优化

**问题**: 10万行数据处理可能卡顿

**优化方案**:
1. **虚拟滚动**: 使用Element Plus的虚拟表格
2. **分批处理**: 将数据分批处理，避免阻塞UI
3. **Web Worker**: 将计算密集型任务放到Worker（预留）
4. **DuckDB**: 使用DuckDB WASM进行SQL查询（预留）

```typescript
// 示例：分批处理
async function processBatch(data: RawDataRow[], batchSize = 1000) {
  const results = []
  for (let i = 0; i < data.length; i += batchSize) {
    const batch = data.slice(i, i + batchSize)
    results.push(...processBatchData(batch))
    await new Promise(resolve => setTimeout(resolve, 0)) // 让出主线程
  }
  return results
}
```

---

### 2. 构建优化

**当前配置**:
```typescript
// vite.config.ts
build: {
  rollupOptions: {
    output: {
      manualChunks: {
        'vue-vendor': ['vue', 'vue-router', 'pinia'],
        'element-plus': ['element-plus', '@element-plus/icons-vue'],
        'charts': ['echarts'],
        'utils': ['lodash-es', 'papaparse', 'dayjs']
      }
    }
  }
}
```

**效果**:
- Element Plus: 1MB (gzip: 315KB)
- Vue vendor: 105KB (gzip: 41KB)
- Utils: 27KB (gzip: 10KB)

**进一步优化**:
1. 按需导入Element Plus组件
2. 懒加载路由
3. 图片压缩和WebP格式

---

## 测试策略

### 1. 单元测试（计划）

**测试框架**: Vitest

**覆盖范围**:
- 工具函数: math.ts, date.ts
- 核心服务: kpi-calculator.ts, aggregator.ts
- 目标覆盖率: >80%

**示例**:
```typescript
// kpi-calculator.test.ts
import { describe, it, expect } from 'vitest'
import { kpiCalculator } from '@/services/kpi-calculator'

describe('KPICalculator', () => {
  it('应正确计算变动成本率', () => {
    const data = [
      { matured_premium_yuan: 10000, reported_claim_payment_yuan: 6000, /* ... */ }
    ]
    const result = kpiCalculator.calculateKPIs(data)
    expect(result.变动成本率).toBeCloseTo(80, 1)
  })

  it('分母为0时应返回0', () => {
    const data = [{ matured_premium_yuan: 0, /* ... */ }]
    const result = kpiCalculator.calculateKPIs(data)
    expect(result.满期赔付率).toBe(0)
  })
})
```

---

### 2. 集成测试（计划）

**测试场景**:
- 完整数据流: 上传 -> 解析 -> 计算 -> 展示
- 多种数据格式: 单机构、多机构、有计划、无计划

---

### 3. E2E测试（计划）

**测试框架**: Playwright

**测试用例**:
- 用户上传CSV文件
- 切换不同维度查看KPI
- 切换Tab查看不同图表
- 导出报告

---

## 部署与运维

### 1. GitHub Actions自动部署

**配置文件**: `.github/workflows/deploy.yml`

**触发条件**:
- push到main分支
- push到gh-pages分支
- 手动触发（workflow_dispatch）

**部署流程**:
```yaml
1. Checkout代码
2. 安装Node.js 20
3. 安装依赖: npm ci
4. 构建: npm run build
5. 上传产物到GitHub Pages
6. 部署到Pages环境
```

**访问地址**: `https://<username>.github.io/autoweKPI/`

---

### 2. 环境变量

**开发环境**:
```bash
VITE_APP_TITLE=autoweKPI
VITE_APP_VERSION=0.1.0
```

**生产环境**:
```bash
NODE_ENV=production
```

---

### 3. 监控与日志

**浏览器控制台日志**:
- 数据加载: 行数、列数、耗时
- KPI计算: 计算耗时
- 错误信息: 友好的错误提示

**性能监控**:
```typescript
// 使用Performance API
const start = performance.now()
// ... 业务逻辑
const end = performance.now()
console.log(`耗时: ${end - start}ms`)
```

---

## 附录

### 相关文档链接

- [项目管理文档](PROJECT_MANAGEMENT.md)
- [开发日志](DEVELOPMENT_LOG.md)
- [可行性分析](FEASIBILITY_ANALYSIS.md)
- [功能清单](FEATURE_CHECKLIST.md)
- [扩展功能规划](EXTENSIONS_PLAN.md)

### 外部参考

- [Vue 3文档](https://vuejs.org/)
- [TypeScript手册](https://www.typescriptlang.org/)
- [Pinia文档](https://pinia.vuejs.org/)
- [Element Plus文档](https://element-plus.org/)
- [ECharts文档](https://echarts.apache.org/)
- [Day.js文档](https://day.js.org/)

---

**文档维护**: 每次重大更新后同步更新本文档
**最后更新**: 2025-12-11
