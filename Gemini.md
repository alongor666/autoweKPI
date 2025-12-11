
# 开发协作指南

## 📋 文档说明

本文档专门为AI助手准备，提供项目背景、架构设计、开发规范等关键信息，帮助AI更高效地协助开发工作。

**最后更新**: 2025-12-11
**项目状态**: Phase 1-2 已完成，进入 Phase 3 UI开发阶段

---

## 🎯 项目概述

### 项目名称

**autoweKPI** - 车险经营分析周报自动生成工具

### 核心目标

将Python Flask + Jinja2的后端应用迁移为Vue 3 + TypeScript的纯前端应用，部署到GitHub Pages，实现：

- ✅ 零服务器成本（GitHub Pages免费托管）
- ✅ 100%功能复刻（168项功能全部迁移）
- ✅ 性能提升30%+
- ✅ 用户体验优化（操作步骤减少50%）

### 业务背景

- **用户**: 保险公司业务分析人员
- **场景**: 每周上传CSV数据，自动生成经营分析周报
- **数据量**: 通常几千到几万行，最多支持100万行
- **核心功能**:
  - 计算15个KPI指标（签单保费、满期保费、变动成本率等）
  - 按机构/客户类别/业务类型聚合分析
  - 生成5类可视化图表
  - 识别问题机构

---

## 🏗️ 技术架构

### 技术栈

```
前端框架: Vue 3.5.13 (Composition API)
类型系统: TypeScript 5.7.2 (严格模式)
构建工具: Vite 6.0.5
状态管理: Pinia 2.2.8
UI组件库: Element Plus 2.9.2
图表库: ECharts 5.5.1
CSV解析: PapaParse 5.4.1
工具库: Lodash-es 4.17.21, Day.js 1.11.13
部署: GitHub Pages (自动化CI/CD)
```

### 项目结构

```
autoweKPI/
├── CLAUDE.md                # AI协作指南
├── AGENTS.md                # 本文档 - AI助手开发协作指南
├── docs/                    # 📚 文档目录（所有MD文档集中管理）
│   ├── PROJECT_MANAGEMENT.md    # 项目管理（任务、进度、验收）
│   ├── DEVELOPMENT_LOG.md       # 开发日志（每日记录）
│   ├── KNOWLEDGE_BASE.md        # 知识库（技术决策、最佳实践）
│   ├── FEASIBILITY_ANALYSIS.md  # 可行性分析
│   ├── FEATURE_CHECKLIST.md     # 功能清单（168项）
│   └── ...
├── src/
│   ├── types/              # TypeScript类型定义（40+类型）
│   │   ├── data.ts        # 数据类型
│   │   ├── kpi.ts         # KPI类型
│   │   ├── chart.ts       # 图表类型
│   │   └── config.ts      # 配置类型
│   ├── utils/              # 工具函数
│   │   ├── math.ts        # 数学计算（safeDivide等）
│   │   └── date.ts        # 日期处理（ISO周计算）
│   ├── services/           # 业务逻辑层（单例模式）
│   │   ├── data-loader.ts      # CSV解析与验证
│   │   ├── kpi-calculator.ts   # 15个KPI计算
│   │   ├── aggregator.ts       # 数据聚合（Lodash groupBy）
│   │   └── mapper.ts           # 业务映射与异常检测
│   ├── stores/             # Pinia状态管理
│   │   ├── data.ts        # 数据+KPI+报告
│   │   └── config.ts      # 配置+UI状态
│   ├── components/         # Vue组件（待开发）
│   ├── views/              # 页面组件
│   │   └── Home.vue       # 首页
│   ├── router/             # Vue Router
│   ├── assets/             # 静态资源
│   └── main.ts             # 应用入口
├── .github/workflows/      # GitHub Actions
├── vite.config.ts          # Vite配置
├── tsconfig.json           # TypeScript配置（严格模式）
└── package.json            # 依赖管理
```

---

## 📖 核心概念与术语

### 业务术语

| 术语           | 英文                 | 说明                               |
| -------------- | -------------------- | ---------------------------------- |
| 签单保费       | Signed Premium       | 新签订保单的保费金额               |
| 满期保费       | Matured Premium      | 已到期保单的保费金额               |
| 变动成本率     | Variable Cost Ratio  | (赔付+未决+获客成本)/满期保费*100  |
| 综合成本率     | Combined Ratio       | (赔付+未决+获客+营运)/满期保费*100 |
| 贡献率         | Contribution Margin  | 100 - 变动成本率                   |
| 满期边际贡献额 | Matured Contribution | 满期保费 * 贡献率 / 100            |
| 已报案赔付     | Reported Claims      | 已经报案的赔付支出                 |
| 未决赔款准备金 | IBNR                 | Incurred But Not Reported          |
| 获客成本       | Acquisition Cost     | 手续费 + 佣金                      |
| 营运费用       | Operating Expense    | 日常运营费用                       |

### 技术术语

| 术语                 | 说明                                                     |
| -------------------- | -------------------------------------------------------- |
| **单机构模式** | 数据中只有1个唯一机构，标题显示机构名                    |
| **多机构模式** | 数据中有12个以上唯一机构，标题显示"分公司"               |
| **分组维度**   | 按机构/客户类别/业务类型进行数据聚合                     |
| **ISO周**      | ISO 8601标准的周次计算（周一开始，第一周包含第一个周四） |
| **safeDivide** | 安全除法函数，分母为0时返回0而非NaN                      |

---

## 🎨 设计原则

### 1. 类型安全优先

```typescript
✅ DO: 使用严格类型
interface RawDataRow {
  signed_premium_yuan: number  // 明确类型
  third_level_organization: string
}

❌ DON'T: 使用any或类型断言
const data: any = {}  // 禁止
const value = data as number  // 避免
```

### 2. 单一职责原则

- 每个服务类只负责一个领域
- DataLoader只负责数据加载
- KPICalculator只负责KPI计算
- DataAggregator只负责数据聚合

### 3. 单例模式

```typescript
// 服务类导出单例
export const dataLoader = new DataLoader()
export const kpiCalculator = new KPICalculator()

// 使用
import { dataLoader } from '@/services/data-loader'
```

### 4. 组合式API

```typescript
// Pinia stores使用Composition API
export const useDataStore = defineStore('data', () => {
  const rawData = ref<RawDataRow[]>([])
  const summaryKPI = computed(() => { /* ... */ })
  return { rawData, summaryKPI }
})
```

---

## 🔧 开发规范

### 命名规范

- **文件名**: kebab-case (`data-loader.ts`)
- **变量/函数**: camelCase (`rawData`, `calculateKPIs`)
- **类名**: PascalCase (`DataLoader`, `KPICalculator`)
- **常量**: UPPER_SNAKE_CASE (`REQUIRED_COLUMNS`)
- **中文KPI**: 保留中文 (`签单保费`, `变动成本率`)

### 导入规范

```typescript
// 类型导入使用 import type
import type { RawDataRow, KPIResult } from '@/types'

// 值导入使用 import
import { REQUIRED_COLUMNS } from '@/types/data'
import { dataLoader } from '@/services/data-loader'

// 路径别名
import { safeDivide } from '@/utils/math'  // @ = src/
```

### 错误处理规范

```typescript
// 使用Result模式而非抛出异常
interface DataLoadResult {
  success: boolean
  data?: RawDataRow[]
  errors?: ValidationError[]
}

// 函数返回Result
async function loadFile(file: File): Promise<DataLoadResult> {
  try {
    return { success: true, data }
  } catch (error) {
    return {
      success: false,
      errors: [{ type: 'invalid_value', message: '...' }]
    }
  }
}
```

### 注释规范

```typescript
/**
 * 计算单组数据的KPI
 *
 * @param data - 该组的原始数据
 * @param options - 计算选项
 * @returns KPI计算结果
 */
calculateKPIs(data: RawDataRow[], options?: KPICalculateOptions): KPIResult
```

---

## 📊 数据流程

### 完整数据流

```
1. 用户上传CSV文件
   ↓
2. DataLoader.loadFromFile()
   - PapaParse解析CSV
   - 验证必需列（8个字段）
   - 清洗数值字段（NaN -> 0）
   ↓
3. 保存到 dataStore.rawData
   ↓
4. 响应式计算（computed）
   ├── summaryKPI (总体KPI)
   ├── kpiByOrganization (按机构)
   ├── kpiByCustomerCategory (按客户)
   └── kpiByBusinessType (按业务)
   ↓
5. UI组件读取store展示
   - KPI卡片
   - ECharts图表
   - 报告视图
```

### KPI计算流程

```typescript
// 1. 聚合基础数据（元）
const signedPremium = sumBy(data, 'signed_premium_yuan')
const maturedPremium = sumBy(data, 'matured_premium_yuan')
// ...

// 2. 转换为万元
const 签单保费 = yuanToWan(signedPremium)
const 满期保费 = yuanToWan(maturedPremium)

// 3. 计算比率（使用safeDivide避免除零）
const 变动成本率 = safeDivide(变动成本, 满期保费) * 100

// 4. 四舍五入
return {
  签单保费: round(签单保费, 2),  // 金额保留2位
  变动成本率: round(变动成本率, 1)  // 比率保留1位
}
```

---

## 🚦 开发状态

### ✅ 已完成 (Phase 1-2)

- [X] 项目初始化（Vite + Vue 3 + TypeScript）
- [X] 类型系统（4个文件，40+类型）
- [X] 工具函数（math.ts, date.ts）
- [X] 核心服务（4个服务类，~1200行）
- [X] Pinia状态管理（2个stores）
- [X] TypeScript编译验证
- [X] 生产构建验证

### 🚧 进行中 (Phase 3)

- [ ] 文件上传组件
- [ ] KPI卡片组件
- [ ] ECharts图表封装
- [ ] 报告视图组件
- [ ] Tab切换和维度切换

### 📋 待开发 (Phase 4-5)

- [ ] DuckDB集成（预留）
- [ ] 多周趋势分析（预留）
- [ ] GitHub Pages部署
- [ ] 端到端测试

---

## 🎯 关键文件速查

### 必读文档（按优先级）

1. **[PROJECT_MANAGEMENT.md](PROJECT_MANAGEMENT.md)** - 项目管理、任务规划、验收标准
2. **[KNOWLEDGE_BASE.md](KNOWLEDGE_BASE.md)** - 技术决策、最佳实践、常见问题
3. **[DEVELOPMENT_LOG.md](DEVELOPMENT_LOG.md)** - 每日开发记录、技术决策
4. **[FEATURE_CHECKLIST.md](FEATURE_CHECKLIST.md)** - 168项功能清单（Python vs TS对照）

### 核心代码文件

```
src/types/kpi.ts           # KPI类型定义（15个指标）
src/utils/math.ts          # safeDivide等工具函数
src/services/kpi-calculator.ts  # 核心计算逻辑
src/stores/data.ts         # 数据状态管理
```

---

## 💡 AI协作要点

### 开发新功能时

1. **先查阅文档**

   - 检查 `FEATURE_CHECKLIST.md` 了解功能需求
   - 查看 `KNOWLEDGE_BASE.md` 学习最佳实践
   - 参考 `PROJECT_MANAGEMENT.md` 确认任务范围
2. **遵循现有模式**

   - 服务类使用单例模式
   - Pinia使用Composition API
   - 类型定义放在 `src/types/`
   - 保持TypeScript严格模式
3. **更新文档**

   - 完成功能后更新 `DEVELOPMENT_LOG.md`
   - 重要决策记录到 `KNOWLEDGE_BASE.md` 的ADR部分
   - 任务完成后更新 `PROJECT_MANAGEMENT.md` 的进度

### 调试问题时

1. 查阅 `KNOWLEDGE_BASE.md` 的"常见问题与解决方案"
2. 检查TypeScript类型错误（严格模式）
3. 验证数据流：CSV解析 → KPI计算 → Store → UI

### 代码审查重点

- ✅ TypeScript编译无错误
- ✅ 无any类型（除非必要）
- ✅ 函数有完整JSDoc注释
- ✅ 遵循命名规范
- ✅ 错误处理使用Result模式
- ✅ 数值计算使用safeDivide避免除零

---

## 🔍 常见任务速查

### 添加新的KPI指标

1. 在 `src/types/kpi.ts` 的 `KPIResult` 接口添加字段
2. 在 `src/services/kpi-calculator.ts` 实现计算逻辑
3. 在 `roundKPIResult()` 添加四舍五入规则
4. 更新 `KNOWLEDGE_BASE.md` 的KPI说明

### 添加新的服务类

1. 在 `src/services/` 创建文件（kebab-case）
2. 导出单例：`export const xxxService = new XxxService()`
3. 在 `KNOWLEDGE_BASE.md` 添加模块说明
4. 考虑是否需要在store中集成

### 添加新的Vue组件

1. 在 `src/components/` 创建组件文件
2. 使用Composition API (`<script setup lang="ts">`)
3. 从store读取数据：`const dataStore = useDataStore()`
4. 使用Element Plus组件

### 修复TypeScript错误

1. 检查导入方式（import type vs import）
2. 处理可选字段（使用 `?? 默认值`）
3. 数组访问需要检查（`noUncheckedIndexedAccess`）
4. 参考 `KNOWLEDGE_BASE.md` 的"常见问题Q4"

---

## 📝 文档更新规范

### 开发日志 (DEVELOPMENT_LOG.md)

**更新时机**: 每天开发结束
**内容**:

- 今日目标完成情况
- 技术决策和理由
- 遇到的问题和解决方案
- 代码统计
- 明日计划

### 项目管理 (PROJECT_MANAGEMENT.md)

**更新时机**: 完成一个Phase或重要任务
**内容**:

- 更新任务进度（□ → [x]）
- 更新验收标准（❌ → ✅）
- 记录实际工作量
- 更新产出物

### 知识库 (KNOWLEDGE_BASE.md)

**更新时机**: 有重要技术决策或最佳实践时
**内容**:

- 新增ADR（架构决策记录）
- 更新最佳实践
- 补充常见问题解决方案
- 更新核心模块说明

---

## 🎓 学习资源

### Vue 3核心概念

- Composition API (`setup`, `ref`, `computed`)
- 响应式系统 (`reactive`, `watch`)
- 生命周期 (`onMounted`, `onUnmounted`)

### TypeScript关键点

- 严格模式配置
- 类型推断和类型守卫
- 泛型使用
- `import type` vs `import`

### Pinia状态管理

- Composition API写法
- 计算属性（`computed`）
- 持久化（localStorage）
- Store组合

---

## ⚠️ 注意事项

### DO（推荐做法）

✅ 保持TypeScript严格模式
✅ 使用safeDivide避免除零
✅ 服务类导出单例
✅ 错误使用Result模式而非抛异常
✅ KPI字段名保留中文（业务对齐）
✅ 每天更新开发日志

### DON'T（避免做法）

❌ 不要使用any类型
❌ 不要直接抛出异常（用Result）
❌ 不要在多处new实例（用单例）
❌ 不要忽略TypeScript错误
❌ 不要创建不必要的新文档（使用现有文档）
❌ 不要跳过文档更新

---

## 📞 快速定位

**遇到类型错误**: → KNOWLEDGE_BASE.md > 常见问题 > Q4
**需要了解KPI计算**: → KNOWLEDGE_BASE.md > 核心模块 > KPICalculator
**查看任务进度**: → PROJECT_MANAGEMENT.md > 开发阶段规划
**了解技术选型**: → KNOWLEDGE_BASE.md > 技术决策记录
**查找功能需求**: → FEATURE_CHECKLIST.md > 对应章节

---

**文档维护**: 开发团队
**最后更新**: 2025-12-11
**版本**: v1.0
