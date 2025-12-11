# GitHub Pages 部署改造方案

## 📋 项目概述

将 autoweKPI 从 Python Flask + 后端处理架构改造为纯前端应用，部署到 GitHub Pages，实现零服务器成本的静态网站托管。

### 当前架构
- **后端**: Python Flask (app.py) + Python数据处理模块 (src/)
- **前端**: HTML + JavaScript + ECharts
- **部署**: 需要 Python 运行环境和 Flask 服务器

### 目标架构
- **前端**: Vue 3 + TypeScript + Vite
- **数据处理**: 纯前端 JavaScript/TypeScript 实现
- **部署**: GitHub Pages 静态托管
- **构建**: GitHub Actions 自动化构建和部署

---

## 🎯 核心原则

1. **用户体验不变**: 保持现有的上传CSV → 生成报告的工作流程
2. **功能完全保留**: 所有KPI计算、图表展示、异常检测功能完整迁移
3. **性能优化**: 利用现代前端技术提升加载和处理速度
4. **可维护性**: 使用TypeScript和模块化架构提升代码质量

---

## 🏗️ 技术栈选型

### 1. 前端框架: Vue 3 + TypeScript

**选择理由**:
- **渐进式**: 可以从简单的HTML逐步迁移
- **组合式API**: 更好的逻辑复用和类型推断
- **TypeScript支持**: 一流的类型安全
- **生态成熟**: 丰富的UI组件库和工具链

**替代方案对比**:
| 技术 | 优势 | 劣势 | 评分 |
|------|------|------|------|
| Vue 3 + TS | 学习曲线平缓、TypeScript支持好、组件化清晰 | - | ⭐⭐⭐⭐⭐ |
| React + TS | 生态最大、就业市场好 | 学习曲线陡峭、需要更多配置 | ⭐⭐⭐⭐ |
| Svelte | 性能最优、代码最简洁 | 生态相对小、学习资源少 | ⭐⭐⭐ |

### 2. 构建工具: Vite

**选择理由**:
- **快速**: 基于ESM的极速冷启动
- **优化**: 自动代码分割、Tree-shaking
- **现代**: 原生支持TypeScript、JSX
- **简单**: 零配置即可使用

### 3. UI组件库: Element Plus

**选择理由**:
- **Vue 3原生**: 完美支持组合式API
- **企业级**: 适合数据分析类应用
- **中文友好**: 文档和社区支持好
- **组件丰富**: Upload、Table、Dialog等现成可用

### 4. 数据处理: PapaParse + Lodash

**选择理由**:
- **PapaParse**: CSV解析库，性能优秀，支持大文件
- **Lodash**: 数据聚合、分组、排序等工具函数
- **Day.js**: 轻量级日期处理（替代moment.js）

### 5. 图表库: ECharts (保持不变)

**选择理由**:
- **已有基础**: 当前项目已使用
- **功能强大**: 满足所有图表需求
- **性能优秀**: 大数据量渲染流畅
- **Vue集成**: vue-echarts 封装完善

### 6. 状态管理: Pinia

**选择理由**:
- **Vue 3官方推荐**: 替代Vuex
- **TypeScript原生**: 完美的类型推断
- **简单**: API设计直观
- **模块化**: 天然支持代码分割

---

## 📊 数据处理迁移方案

### Python → TypeScript 算法映射

#### 1. 数据加载 (data_loader.py)

**Python原逻辑**:
```python
import pandas as pd

class DataLoader:
    def load_csv(self, path):
        df = pd.read_csv(path)
        df['signed_premium_yuan'] = pd.to_numeric(df['signed_premium_yuan'])
        return df
```

**TypeScript实现**:
```typescript
import Papa from 'papaparse';

interface RawDataRow {
  third_level_organization: string;
  business_type_category: string;
  signed_premium_yuan: string;
  // ... 其他字段
}

export class DataLoader {
  async loadCSV(file: File): Promise<RawDataRow[]> {
    return new Promise((resolve, reject) => {
      Papa.parse(file, {
        header: true,
        dynamicTyping: true,
        skipEmptyLines: true,
        complete: (results) => resolve(results.data),
        error: (error) => reject(error)
      });
    });
  }
}
```

#### 2. KPI计算 (kpi_calculator.py)

**Python原逻辑**:
```python
class KPICalculator:
    def calculate_change_cost_rate(self, row):
        premium = row['matured_premium_yuan']
        claim = row['reported_claim_payment_yuan']
        expense = row['expense_amount_yuan']
        return ((claim + expense) / premium * 100) if premium > 0 else 0
```

**TypeScript实现**:
```typescript
interface DataRow {
  matured_premium_yuan: number;
  reported_claim_payment_yuan: number;
  expense_amount_yuan: number;
}

export class KPICalculator {
  calculateChangeCostRate(row: DataRow): number {
    const { matured_premium_yuan, reported_claim_payment_yuan, expense_amount_yuan } = row;
    if (matured_premium_yuan <= 0) return 0;
    return ((reported_claim_payment_yuan + expense_amount_yuan) / matured_premium_yuan) * 100;
  }

  // 批量计算优化
  calculateBatch(data: DataRow[]): number[] {
    return data.map(row => this.calculateChangeCostRate(row));
  }
}
```

#### 3. 数据聚合 (report_generator.py)

**Python原逻辑**:
```python
def aggregate_by_dimension(df, dimension):
    return df.groupby(dimension).agg({
        'signed_premium_yuan': 'sum',
        'policy_count': 'sum'
    }).reset_index()
```

**TypeScript实现**:
```typescript
import _ from 'lodash';

export class DataAggregator {
  aggregateByDimension(
    data: DataRow[],
    dimension: keyof DataRow
  ): AggregatedData[] {
    return _(data)
      .groupBy(dimension)
      .map((group, key) => ({
        dimension: key,
        signed_premium_yuan: _.sumBy(group, 'signed_premium_yuan'),
        policy_count: _.sumBy(group, 'policy_count'),
        // ... 其他聚合字段
      }))
      .value();
  }
}
```

### 性能优化策略

1. **Web Worker处理大数据**:
```typescript
// worker.ts
self.onmessage = (e: MessageEvent) => {
  const { data, action } = e.data;

  if (action === 'calculate') {
    const calculator = new KPICalculator();
    const results = calculator.calculateBatch(data);
    self.postMessage({ results });
  }
};

// main.ts
const worker = new Worker(new URL('./worker.ts', import.meta.url));
worker.postMessage({ data: csvData, action: 'calculate' });
worker.onmessage = (e) => {
  const { results } = e.data;
  // 使用计算结果
};
```

2. **虚拟滚动处理大表格**:
```vue
<template>
  <el-table-v2
    :data="largeDataset"
    :columns="columns"
    :height="600"
  />
</template>
```

3. **按需加载图表**:
```typescript
// 懒加载ECharts组件
const BarChart = defineAsyncComponent(() =>
  import('./components/charts/BarChart.vue')
);
```

---

## 🎨 用户体验流程设计

### 流程对比

#### 当前流程 (Flask)
```
1. 用户访问 localhost:5001
2. 上传CSV文件
3. Flask后端处理 (Python)
   - 读取CSV
   - 计算KPI
   - 生成JSON
   - 注入HTML模板
4. 返回完整HTML页面
5. 用户查看报告
```

#### 新流程 (GitHub Pages)
```
1. 用户访问 username.github.io/autoweKPI
2. 上传CSV文件 (拖拽或选择)
3. 前端处理 (TypeScript + Web Worker)
   - 解析CSV (PapaParse)
   - 计算KPI (纯JS算法)
   - 构建数据结构
4. 动态渲染页面 (Vue 3)
   - 更新响应式数据
   - 重绘ECharts图表
   - 展示计算结果
5. 用户查看报告
6. (可选) 导出HTML/PDF
```

### 页面结构设计

```
┌─────────────────────────────────────────┐
│         顶部导航 (Header)                │
│  [Logo] autoweKPI    [上传数据] [导出]   │
├─────────────────────────────────────────┤
│                                         │
│  ┌───────────────────────────────┐     │
│  │    上传区域 (首次访问)          │     │
│  │                               │     │
│  │   📁 拖拽CSV文件到此处         │     │
│  │       或点击选择文件            │     │
│  │                               │     │
│  │   支持格式: .csv (最大50MB)    │     │
│  └───────────────────────────────┘     │
│                                         │
│  ┌───────────────────────────────┐     │
│  │    报告区域 (上传后显示)        │     │
│  │                               │     │
│  │  [标签页导航]                  │     │
│  │  • 经营概览                    │     │
│  │  • 保费进度                    │     │
│  │  • 变动成本                    │     │
│  │  • 损失暴露                    │     │
│  │  • 费用支出                    │     │
│  │                               │     │
│  │  [图表和数据展示区]            │     │
│  │  ┌─────────────────────┐      │     │
│  │  │  ECharts 图表        │      │     │
│  │  └─────────────────────┘      │     │
│  │                               │     │
│  └───────────────────────────────┘     │
│                                         │
├─────────────────────────────────────────┤
│         底部 (Footer)                   │
│  © 2025 autoweKPI | GitHub | 文档       │
└─────────────────────────────────────────┘
```

### 组件层次结构

```
App.vue
├── AppHeader.vue
│   ├── Logo
│   ├── NavMenu
│   └── ActionButtons
│       ├── UploadButton
│       └── ExportButton
├── UploadZone.vue
│   ├── DragDropArea
│   ├── FileInput
│   └── ProgressBar
├── ReportView.vue (v-if="hasData")
│   ├── ReportHeader.vue
│   │   ├── TitleSection
│   │   └── MetaInfo (周次、日期)
│   ├── TabNavigation.vue
│   │   └── TabItem (×5)
│   └── TabContent.vue
│       ├── OverviewTab.vue
│       │   ├── KPICards
│       │   ├── DimensionSelector
│       │   └── OverviewChart
│       ├── PremiumProgressTab.vue
│       │   ├── ProgressTable
│       │   └── ProgressChart
│       ├── VariableCostTab.vue
│       ├── LossExposureTab.vue
│       │   ├── BubbleChart
│       │   └── SecondaryMetricsChart
│       └── ExpenseTab.vue
└── AppFooter.vue
```

---

## 🔧 项目结构设计

```
autoweKPI/
├── .github/
│   └── workflows/
│       └── deploy.yml           # GitHub Actions 部署配置
├── public/                      # 静态资源
│   ├── favicon.ico
│   └── assets/
│       └── echarts.min.js       # ECharts CDN备份
├── src/
│   ├── main.ts                  # 应用入口
│   ├── App.vue                  # 根组件
│   ├── components/              # 组件目录
│   │   ├── layout/
│   │   │   ├── AppHeader.vue
│   │   │   └── AppFooter.vue
│   │   ├── upload/
│   │   │   ├── UploadZone.vue
│   │   │   └── FileValidator.vue
│   │   ├── report/
│   │   │   ├── ReportView.vue
│   │   │   ├── ReportHeader.vue
│   │   │   ├── TabNavigation.vue
│   │   │   └── tabs/
│   │   │       ├── OverviewTab.vue
│   │   │       ├── PremiumProgressTab.vue
│   │   │       ├── VariableCostTab.vue
│   │   │       ├── LossExposureTab.vue
│   │   │       └── ExpenseTab.vue
│   │   └── charts/
│   │       ├── BarChart.vue
│   │       ├── PieChart.vue
│   │       ├── LineChart.vue
│   │       ├── BubbleChart.vue
│   │       └── TableView.vue
│   ├── composables/             # 组合式函数
│   │   ├── useDataLoader.ts
│   │   ├── useKPICalculator.ts
│   │   └── useChartConfig.ts
│   ├── stores/                  # Pinia状态管理
│   │   ├── data.ts              # 数据状态
│   │   ├── report.ts            # 报告状态
│   │   └── config.ts            # 配置状态
│   ├── utils/                   # 工具函数
│   │   ├── csv-parser.ts        # CSV解析
│   │   ├── data-loader.ts       # 数据加载 (迁移自data_loader.py)
│   │   ├── kpi-calculator.ts    # KPI计算 (迁移自kpi_calculator.py)
│   │   ├── mapper.ts            # 数据映射 (迁移自mapper.py)
│   │   ├── aggregator.ts        # 数据聚合 (迁移自report_generator.py)
│   │   └── date-utils.ts        # 日期工具
│   ├── types/                   # TypeScript类型定义
│   │   ├── data.ts
│   │   ├── kpi.ts
│   │   ├── chart.ts
│   │   └── config.ts
│   ├── config/                  # 配置文件
│   │   ├── business-type-mapping.json
│   │   ├── thresholds.json
│   │   └── year-plans.json
│   ├── workers/                 # Web Workers
│   │   └── data-processor.worker.ts
│   ├── assets/                  # 样式和资源
│   │   ├── styles/
│   │   │   ├── main.css
│   │   │   └── variables.css
│   │   └── images/
│   └── router/                  # Vue Router (可选)
│       └── index.ts
├── docs/                        # 文档 (保持不变)
├── dist/                        # 构建输出 (gitignore)
├── index.html                   # HTML入口
├── vite.config.ts               # Vite配置
├── tsconfig.json                # TypeScript配置
├── package.json                 # 依赖管理
└── README.md                    # 项目说明
```

---

## 🚀 实施步骤

### Phase 1: 项目初始化 (第1-2天)

#### 1.1 创建Vite + Vue 3项目
```bash
# 在gh-pages分支执行
npm create vite@latest . -- --template vue-ts
npm install
```

#### 1.2 安装核心依赖
```bash
# UI组件库
npm install element-plus

# 数据处理
npm install papaparse lodash-es dayjs

# 图表库
npm install echarts vue-echarts

# 状态管理
npm install pinia

# 工具库
npm install @vueuse/core

# 类型定义
npm install -D @types/papaparse @types/lodash-es
```

#### 1.3 配置TypeScript
```json
// tsconfig.json
{
  "compilerOptions": {
    "target": "ES2020",
    "module": "ESNext",
    "lib": ["ES2020", "DOM", "DOM.Iterable"],
    "strict": true,
    "jsx": "preserve",
    "moduleResolution": "bundler",
    "resolveJsonModule": true,
    "isolatedModules": true,
    "esModuleInterop": true,
    "skipLibCheck": true,
    "paths": {
      "@/*": ["./src/*"]
    }
  }
}
```

#### 1.4 配置Vite
```typescript
// vite.config.ts
import { defineConfig } from 'vite';
import vue from '@vitejs/plugin-vue';
import { resolve } from 'path';

export default defineConfig({
  plugins: [vue()],
  base: '/autoweKPI/',  // GitHub Pages子路径
  resolve: {
    alias: {
      '@': resolve(__dirname, 'src'),
    },
  },
  build: {
    outDir: 'dist',
    sourcemap: false,
    rollupOptions: {
      output: {
        manualChunks: {
          'echarts': ['echarts', 'vue-echarts'],
          'element': ['element-plus'],
          'vendor': ['vue', 'pinia'],
        },
      },
    },
  },
  worker: {
    format: 'es',
  },
});
```

### Phase 2: 核心功能迁移 (第3-7天)

#### 2.1 数据类型定义 (第3天)
```typescript
// src/types/data.ts
export interface RawDataRow {
  third_level_organization: string;
  business_type_category: string;
  customer_category_3: string;
  signed_premium_yuan: number;
  matured_premium_yuan: number;
  policy_count: number;
  claim_case_count: number;
  reported_claim_payment_yuan: number;
  expense_amount_yuan: number;
  premium_plan_yuan: number;
  week_number: number;
}

export interface ProcessedDataRow extends RawDataRow {
  change_cost_rate: number;
  claim_rate: number;
  expense_rate: number;
  plan_completion_rate: number;
}

export interface AggregatedData {
  dimension: string;
  total_premium: number;
  total_claim: number;
  total_expense: number;
  policy_count: number;
  avg_cost_rate: number;
}

// src/types/config.ts
export interface BusinessTypeMapping {
  ui_full_name: string;
  ui_short_label: string;
  csv_raw_value: string;
  category: string;
}

export interface Thresholds {
  四象限基准线: {
    保费达成率: number;
    变动成本率: number;
    满期赔付率: number;
    费用率: number;
    出险率: number;
    案均赔款: number;
  };
  问题机构识别阈值: {
    年保费未达标: number;
    变动成本率超标: number;
    满期赔付率超标: number;
    费用率超标: number;
  };
}
```

#### 2.2 数据加载模块 (第3天)
```typescript
// src/utils/csv-parser.ts
import Papa from 'papaparse';
import type { RawDataRow } from '@/types/data';

export class CSVParser {
  async parse(file: File): Promise<RawDataRow[]> {
    return new Promise((resolve, reject) => {
      Papa.parse(file, {
        header: true,
        dynamicTyping: true,
        skipEmptyLines: true,
        transformHeader: (header: string) => header.trim(),
        complete: (results) => {
          if (results.errors.length > 0) {
            reject(new Error(`CSV解析错误: ${results.errors[0].message}`));
          }
          resolve(results.data as RawDataRow[]);
        },
        error: (error) => reject(error),
      });
    });
  }

  validate(data: RawDataRow[]): { valid: boolean; errors: string[] } {
    const errors: string[] = [];
    const requiredFields: (keyof RawDataRow)[] = [
      'third_level_organization',
      'business_type_category',
      'signed_premium_yuan',
      'matured_premium_yuan',
      'week_number',
    ];

    if (data.length === 0) {
      errors.push('CSV文件为空');
    }

    const firstRow = data[0];
    requiredFields.forEach((field) => {
      if (!(field in firstRow)) {
        errors.push(`缺少必需字段: ${field}`);
      }
    });

    return { valid: errors.length === 0, errors };
  }
}
```

#### 2.3 KPI计算模块 (第4天)
```typescript
// src/utils/kpi-calculator.ts
import type { RawDataRow, ProcessedDataRow } from '@/types/data';

export class KPICalculator {
  /**
   * 计算变动成本率
   * 公式: (赔款 + 费用) / 满期保费 * 100
   */
  calculateChangeCostRate(row: RawDataRow): number {
    const { matured_premium_yuan, reported_claim_payment_yuan, expense_amount_yuan } = row;
    if (matured_premium_yuan <= 0) return 0;
    return ((reported_claim_payment_yuan + expense_amount_yuan) / matured_premium_yuan) * 100;
  }

  /**
   * 计算赔付率
   * 公式: 赔款 / 满期保费 * 100
   */
  calculateClaimRate(row: RawDataRow): number {
    const { matured_premium_yuan, reported_claim_payment_yuan } = row;
    if (matured_premium_yuan <= 0) return 0;
    return (reported_claim_payment_yuan / matured_premium_yuan) * 100;
  }

  /**
   * 计算费用率
   * 公式: 费用 / 满期保费 * 100
   */
  calculateExpenseRate(row: RawDataRow): number {
    const { matured_premium_yuan, expense_amount_yuan } = row;
    if (matured_premium_yuan <= 0) return 0;
    return (expense_amount_yuan / matured_premium_yuan) * 100;
  }

  /**
   * 计算计划达成率
   * 公式: 签单保费 / 预算保费 * 100
   */
  calculatePlanCompletionRate(row: RawDataRow): number {
    const { signed_premium_yuan, premium_plan_yuan } = row;
    if (premium_plan_yuan <= 0) return 0;
    return (signed_premium_yuan / premium_plan_yuan) * 100;
  }

  /**
   * 批量处理数据
   */
  processData(rawData: RawDataRow[]): ProcessedDataRow[] {
    return rawData.map((row) => ({
      ...row,
      change_cost_rate: this.calculateChangeCostRate(row),
      claim_rate: this.calculateClaimRate(row),
      expense_rate: this.calculateExpenseRate(row),
      plan_completion_rate: this.calculatePlanCompletionRate(row),
    }));
  }
}
```

#### 2.4 数据聚合模块 (第4天)
```typescript
// src/utils/aggregator.ts
import _ from 'lodash-es';
import type { ProcessedDataRow, AggregatedData } from '@/types/data';

export class DataAggregator {
  /**
   * 按维度聚合数据
   * @param data 处理后的数据
   * @param dimension 聚合维度字段
   */
  aggregateByDimension(
    data: ProcessedDataRow[],
    dimension: 'third_level_organization' | 'customer_category_3' | 'business_type_category'
  ): AggregatedData[] {
    return _(data)
      .groupBy(dimension)
      .map((group, key) => {
        const total_premium = _.sumBy(group, 'signed_premium_yuan');
        const total_claim = _.sumBy(group, 'reported_claim_payment_yuan');
        const total_expense = _.sumBy(group, 'expense_amount_yuan');
        const matured_premium = _.sumBy(group, 'matured_premium_yuan');

        return {
          dimension: key,
          total_premium,
          total_claim,
          total_expense,
          policy_count: _.sumBy(group, 'policy_count'),
          avg_cost_rate: matured_premium > 0
            ? ((total_claim + total_expense) / matured_premium) * 100
            : 0,
        };
      })
      .orderBy(['total_premium'], ['desc'])
      .value();
  }

  /**
   * 计算全局KPI
   */
  calculateGlobalKPI(data: ProcessedDataRow[]) {
    return {
      total_premium: _.sumBy(data, 'signed_premium_yuan'),
      total_matured_premium: _.sumBy(data, 'matured_premium_yuan'),
      total_claim: _.sumBy(data, 'reported_claim_payment_yuan'),
      total_expense: _.sumBy(data, 'expense_amount_yuan'),
      total_policy_count: _.sumBy(data, 'policy_count'),
      total_claim_count: _.sumBy(data, 'claim_case_count'),
      avg_change_cost_rate: _.meanBy(data, 'change_cost_rate'),
      avg_claim_rate: _.meanBy(data, 'claim_rate'),
      avg_expense_rate: _.meanBy(data, 'expense_rate'),
    };
  }
}
```

#### 2.5 Pinia状态管理 (第5天)
```typescript
// src/stores/data.ts
import { defineStore } from 'pinia';
import { ref, computed } from 'vue';
import type { RawDataRow, ProcessedDataRow } from '@/types/data';
import { CSVParser } from '@/utils/csv-parser';
import { KPICalculator } from '@/utils/kpi-calculator';
import { DataAggregator } from '@/utils/aggregator';

export const useDataStore = defineStore('data', () => {
  // State
  const rawData = ref<RawDataRow[]>([]);
  const processedData = ref<ProcessedDataRow[]>([]);
  const loading = ref(false);
  const error = ref<string | null>(null);

  // 实例
  const parser = new CSVParser();
  const calculator = new KPICalculator();
  const aggregator = new DataAggregator();

  // Getters
  const hasData = computed(() => processedData.value.length > 0);

  const weekNumber = computed(() => {
    if (rawData.value.length === 0) return null;
    return rawData.value[0].week_number;
  });

  const organizationList = computed(() => {
    return [...new Set(rawData.value.map(row => row.third_level_organization))];
  });

  const isSingleOrgMode = computed(() => {
    return organizationList.value.length === 1;
  });

  // Actions
  async function loadFile(file: File) {
    loading.value = true;
    error.value = null;

    try {
      // 解析CSV
      rawData.value = await parser.parse(file);

      // 验证数据
      const validation = parser.validate(rawData.value);
      if (!validation.valid) {
        throw new Error(validation.errors.join('; '));
      }

      // 计算KPI
      processedData.value = calculator.processData(rawData.value);

      loading.value = false;
    } catch (e) {
      error.value = e instanceof Error ? e.message : '未知错误';
      loading.value = false;
      throw e;
    }
  }

  function reset() {
    rawData.value = [];
    processedData.value = [];
    error.value = null;
  }

  return {
    // State
    rawData,
    processedData,
    loading,
    error,
    // Getters
    hasData,
    weekNumber,
    organizationList,
    isSingleOrgMode,
    // Actions
    loadFile,
    reset,
  };
});
```

### Phase 3: UI组件开发 (第8-12天)

#### 3.1 上传组件 (第8天)
```vue
<!-- src/components/upload/UploadZone.vue -->
<template>
  <div
    class="upload-zone"
    :class="{ 'is-dragover': isDragover }"
    @drop.prevent="handleDrop"
    @dragover.prevent="isDragover = true"
    @dragleave.prevent="isDragover = false"
  >
    <el-upload
      ref="uploadRef"
      :auto-upload="false"
      :show-file-list="false"
      :on-change="handleFileChange"
      accept=".csv"
      drag
    >
      <el-icon class="upload-icon"><upload-filled /></el-icon>
      <div class="upload-text">
        <p>拖拽CSV文件到此处</p>
        <p>或点击选择文件</p>
      </div>
      <template #tip>
        <div class="upload-tip">
          支持格式: .csv | 最大文件: 50MB
        </div>
      </template>
    </el-upload>

    <el-progress
      v-if="dataStore.loading"
      :percentage="progress"
      :status="progress === 100 ? 'success' : undefined"
    />
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue';
import { ElMessage } from 'element-plus';
import { UploadFilled } from '@element-plus/icons-vue';
import { useDataStore } from '@/stores/data';
import type { UploadFile } from 'element-plus';

const dataStore = useDataStore();
const isDragover = ref(false);
const progress = ref(0);

const handleFileChange = async (uploadFile: UploadFile) => {
  if (!uploadFile.raw) return;

  // 验证文件类型
  if (!uploadFile.name.endsWith('.csv')) {
    ElMessage.error('请上传CSV格式文件');
    return;
  }

  // 验证文件大小 (50MB)
  const maxSize = 50 * 1024 * 1024;
  if (uploadFile.raw.size > maxSize) {
    ElMessage.error('文件大小不能超过50MB');
    return;
  }

  try {
    // 模拟进度
    const interval = setInterval(() => {
      if (progress.value < 90) {
        progress.value += 10;
      }
    }, 100);

    await dataStore.loadFile(uploadFile.raw);

    clearInterval(interval);
    progress.value = 100;

    ElMessage.success('数据加载成功');
  } catch (error) {
    ElMessage.error(`加载失败: ${error instanceof Error ? error.message : '未知错误'}`);
    progress.value = 0;
  }
};

const handleDrop = (e: DragEvent) => {
  isDragover.value = false;
  const files = e.dataTransfer?.files;
  if (files && files.length > 0) {
    handleFileChange({ raw: files[0] } as UploadFile);
  }
};
</script>

<style scoped>
.upload-zone {
  max-width: 600px;
  margin: 40px auto;
  padding: 20px;
  transition: all 0.3s;
}

.upload-zone.is-dragover {
  transform: scale(1.02);
}

.upload-icon {
  font-size: 67px;
  color: #409eff;
  margin-bottom: 16px;
}

.upload-text p:first-child {
  font-size: 18px;
  font-weight: 500;
  margin-bottom: 8px;
}

.upload-text p:last-child {
  font-size: 14px;
  color: #909399;
}

.upload-tip {
  margin-top: 12px;
  font-size: 12px;
  color: #909399;
}
</style>
```

#### 3.2 报告视图 (第9-10天)
```vue
<!-- src/components/report/ReportView.vue -->
<template>
  <div class="report-view">
    <report-header />

    <el-tabs v-model="activeTab" class="report-tabs">
      <el-tab-pane label="经营概览" name="overview">
        <overview-tab />
      </el-tab-pane>

      <el-tab-pane label="保费进度" name="premium">
        <premium-progress-tab />
      </el-tab-pane>

      <el-tab-pane label="变动成本" name="cost">
        <variable-cost-tab />
      </el-tab-pane>

      <el-tab-pane label="损失暴露" name="loss">
        <loss-exposure-tab />
      </el-tab-pane>

      <el-tab-pane label="费用支出" name="expense">
        <expense-tab />
      </el-tab-pane>
    </el-tabs>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue';
import ReportHeader from './ReportHeader.vue';
import OverviewTab from './tabs/OverviewTab.vue';
import PremiumProgressTab from './tabs/PremiumProgressTab.vue';
import VariableCostTab from './tabs/VariableCostTab.vue';
import LossExposureTab from './tabs/LossExposureTab.vue';
import ExpenseTab from './tabs/ExpenseTab.vue';

const activeTab = ref('overview');
</script>

<style scoped>
.report-view {
  max-width: 1400px;
  margin: 0 auto;
  padding: 20px;
}

.report-tabs {
  margin-top: 20px;
}
</style>
```

#### 3.3 图表组件封装 (第11-12天)
```vue
<!-- src/components/charts/BarChart.vue -->
<template>
  <v-chart
    :option="chartOption"
    :style="{ height: height }"
    autoresize
  />
</template>

<script setup lang="ts">
import { computed } from 'vue';
import VChart from 'vue-echarts';
import { use } from 'echarts/core';
import { CanvasRenderer } from 'echarts/renderers';
import { BarChart } from 'echarts/charts';
import {
  TitleComponent,
  TooltipComponent,
  LegendComponent,
  GridComponent,
} from 'echarts/components';

use([
  CanvasRenderer,
  BarChart,
  TitleComponent,
  TooltipComponent,
  LegendComponent,
  GridComponent,
]);

interface Props {
  data: Array<{ name: string; value: number }>;
  title?: string;
  height?: string;
}

const props = withDefaults(defineProps<Props>(), {
  title: '',
  height: '400px',
});

const chartOption = computed(() => ({
  title: {
    text: props.title,
    left: 'center',
  },
  tooltip: {
    trigger: 'axis',
    axisPointer: {
      type: 'shadow',
    },
  },
  xAxis: {
    type: 'category',
    data: props.data.map(item => item.name),
  },
  yAxis: {
    type: 'value',
  },
  series: [
    {
      type: 'bar',
      data: props.data.map(item => item.value),
      itemStyle: {
        color: '#409EFF',
      },
    },
  ],
}));
</script>
```

### Phase 4: GitHub Actions部署 (第13天)

```yaml
# .github/workflows/deploy.yml
name: Deploy to GitHub Pages

on:
  push:
    branches:
      - gh-pages
  workflow_dispatch:

permissions:
  contents: read
  pages: write
  id-token: write

concurrency:
  group: "pages"
  cancel-in-progress: false

jobs:
  build:
    runs-on: ubuntu-latest
    steps:
      - name: Checkout
        uses: actions/checkout@v4

      - name: Setup Node
        uses: actions/setup-node@v4
        with:
          node-version: '20'
          cache: 'npm'

      - name: Install dependencies
        run: npm ci

      - name: Build
        run: npm run build

      - name: Upload artifact
        uses: actions/upload-pages-artifact@v3
        with:
          path: ./dist

  deploy:
    environment:
      name: github-pages
      url: ${{ steps.deployment.outputs.page_url }}
    runs-on: ubuntu-latest
    needs: build
    steps:
      - name: Deploy to GitHub Pages
        id: deployment
        uses: actions/deploy-pages@v4
```

### Phase 5: 测试和优化 (第14-15天)

#### 5.1 单元测试
```typescript
// src/utils/__tests__/kpi-calculator.spec.ts
import { describe, it, expect } from 'vitest';
import { KPICalculator } from '../kpi-calculator';

describe('KPICalculator', () => {
  const calculator = new KPICalculator();

  it('should calculate change cost rate correctly', () => {
    const row = {
      matured_premium_yuan: 10000,
      reported_claim_payment_yuan: 6000,
      expense_amount_yuan: 2000,
    };

    const result = calculator.calculateChangeCostRate(row as any);
    expect(result).toBe(80); // (6000 + 2000) / 10000 * 100
  });

  it('should return 0 when matured premium is 0', () => {
    const row = {
      matured_premium_yuan: 0,
      reported_claim_payment_yuan: 6000,
      expense_amount_yuan: 2000,
    };

    const result = calculator.calculateChangeCostRate(row as any);
    expect(result).toBe(0);
  });
});
```

#### 5.2 性能优化清单
- [ ] 启用Vite构建优化（Tree-shaking、代码分割）
- [ ] 图片资源使用WebP格式
- [ ] 懒加载非首屏图表组件
- [ ] 使用Web Worker处理大数据量计算
- [ ] 启用浏览器缓存策略
- [ ] 使用虚拟滚动处理大列表
- [ ] 压缩静态资源（Gzip/Brotli）

---

## 📦 配置文件迁移

所有配置文件从 `reference/` 迁移到 `src/config/`，并转换为ES模块：

```typescript
// src/config/business-type-mapping.ts
export const businessTypeMapping = {
  business_types: [
    {
      ui_full_name: "非营业客车新车",
      ui_short_label: "非营客-新",
      csv_raw_value: "非营业客车新车",
      category: "非营业客车"
    },
    // ... 其他映射
  ]
};
```

---

## 🎯 验收标准

### 功能完整性
- [ ] CSV上传功能正常
- [ ] 数据验证逻辑完整
- [ ] 所有KPI计算准确（与Python版本结果一致）
- [ ] 所有图表正常渲染
- [ ] 异常检测逻辑正确
- [ ] 单机构/多机构模式自动识别

### 用户体验
- [ ] 上传响应速度 < 3秒（10万行数据）
- [ ] 图表交互流畅（60fps）
- [ ] 移动端适配良好
- [ ] 错误提示友好
- [ ] 支持拖拽上传

### 技术质量
- [ ] TypeScript类型覆盖率 > 95%
- [ ] 单元测试覆盖率 > 80%
- [ ] Lighthouse性能评分 > 90
- [ ] 无控制台错误或警告
- [ ] 构建体积 < 2MB (gzipped)

### 部署成功
- [ ] GitHub Actions自动构建成功
- [ ] GitHub Pages访问正常
- [ ] 所有静态资源加载成功
- [ ] HTTPS证书有效

---

## 📅 时间规划

| 阶段 | 任务 | 预计时间 | 产出 |
|------|------|----------|------|
| Phase 1 | 项目初始化 | 2天 | 可运行的Vite项目骨架 |
| Phase 2 | 核心功能迁移 | 5天 | 数据处理、KPI计算模块 |
| Phase 3 | UI组件开发 | 5天 | 完整的页面和图表 |
| Phase 4 | 部署配置 | 1天 | GitHub Actions工作流 |
| Phase 5 | 测试优化 | 2天 | 测试报告、性能优化 |
| **总计** | | **15天** | **可部署的生产版本** |

---

## 🔍 风险与应对

| 风险 | 影响 | 概率 | 应对措施 |
|------|------|------|----------|
| 大数据量性能问题 | 高 | 中 | 使用Web Worker、虚拟滚动、分页 |
| TypeScript类型复杂度 | 中 | 中 | 逐步迁移、使用any作为临时方案 |
| ECharts兼容性问题 | 中 | 低 | 使用vue-echarts官方封装 |
| GitHub Pages限制 | 低 | 低 | 确保构建产物 < 1GB |

---

## 📚 参考资源

### 官方文档
- [Vue 3 文档](https://vuejs.org/)
- [Vite 文档](https://vitejs.dev/)
- [TypeScript 文档](https://www.typescriptlang.org/)
- [Element Plus 文档](https://element-plus.org/)
- [ECharts 文档](https://echarts.apache.org/)
- [Pinia 文档](https://pinia.vuejs.org/)

### 工具库
- [PapaParse 文档](https://www.papaparse.com/)
- [Lodash 文档](https://lodash.com/)
- [Day.js 文档](https://day.js.org/)
- [VueUse 文档](https://vueuse.org/)

### GitHub Pages
- [GitHub Pages 文档](https://docs.github.com/en/pages)
- [GitHub Actions 文档](https://docs.github.com/en/actions)

---

## ✅ 下一步行动

1. **立即执行**: 在gh-pages分支初始化Vite项目
2. **并行开发**:
   - 前端开发人员：UI组件开发
   - 算法工程师：数据处理逻辑迁移
3. **持续集成**: 每日提交代码，触发GitHub Actions构建
4. **迭代优化**: 根据实际性能和用户反馈调整

---

**🚀 准备就绪，开始改造！**
