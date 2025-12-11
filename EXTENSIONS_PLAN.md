# 扩展功能规划与可扩展架构设计

## 📋 目录

1. [DuckDB数据导入](#一duckdb数据导入)
2. [多周趋势分析](#二多周趋势分析)
3. [可扩展架构设计](#三可扩展架构设计)
4. [鲁棒性设计](#四鲁棒性设计)
5. [技术选型](#五技术选型)

---

## 一、DuckDB数据导入

### 1.1 功能概述

**目标**: 支持直接查询和导入DuckDB数据库，实现更高效的数据处理和多表关联分析。

### 1.2 技术方案

#### 选项A: DuckDB-WASM (推荐)

**优势**:
- ✅ 完全在浏览器运行
- ✅ 支持SQL查询
- ✅ 性能优异（比纯JS快10-100倍）
- ✅ 支持Parquet、CSV等多种格式
- ✅ 零服务器成本

**安装**:
```bash
npm install @duckdb/duckdb-wasm
```

**使用示例**:
```typescript
// src/utils/duckdb-loader.ts
import * as duckdb from '@duckdb/duckdb-wasm';

export class DuckDBLoader {
  private db: duckdb.AsyncDuckDB | null = null;
  private conn: duckdb.AsyncDuckDBConnection | null = null;

  async initialize() {
    const JSDELIVR_BUNDLES = duckdb.getJsDelivrBundles();
    const bundle = await duckdb.selectBundle(JSDELIVR_BUNDLES);
    const worker_url = URL.createObjectURL(
      new Blob([`importScripts("${bundle.mainWorker}");`], {
        type: 'text/javascript',
      })
    );
    const worker = new Worker(worker_url);
    const logger = new duckdb.ConsoleLogger();
    this.db = new duckdb.AsyncDuckDB(logger, worker);
    await this.db.instantiate(bundle.mainModule, bundle.pthreadWorker);
    this.conn = await this.db.connect();
  }

  async loadFromFile(file: File): Promise<any[]> {
    if (!this.conn) throw new Error('DuckDB not initialized');

    // 注册文件到虚拟文件系统
    await this.db!.registerFileHandle(
      file.name,
      file,
      duckdb.DuckDBDataProtocol.BROWSER_FILEREADER,
      true
    );

    // 执行SQL查询
    const result = await this.conn.query(`
      SELECT
        third_level_organization,
        business_type_category,
        customer_category_3,
        SUM(signed_premium_yuan) as signed_premium_yuan,
        SUM(matured_premium_yuan) as matured_premium_yuan,
        SUM(policy_count) as policy_count,
        SUM(claim_case_count) as claim_case_count,
        SUM(reported_claim_payment_yuan) as reported_claim_payment_yuan,
        SUM(expense_amount_yuan) as expense_amount_yuan,
        AVG(premium_plan_yuan) as premium_plan_yuan,
        MAX(week_number) as week_number
      FROM read_csv_auto('${file.name}')
      GROUP BY
        third_level_organization,
        business_type_category,
        customer_category_3
    `);

    return result.toArray().map(row => row.toJSON());
  }

  async queryMultiWeek(files: File[], weekRange: [number, number]): Promise<any[]> {
    if (!this.conn) throw new Error('DuckDB not initialized');

    // 注册所有文件
    for (const file of files) {
      await this.db!.registerFileHandle(
        file.name,
        file,
        duckdb.DuckDBDataProtocol.BROWSER_FILEREADER,
        true
      );
    }

    // 合并多周数据
    const unionQueries = files.map(f => `SELECT * FROM read_csv_auto('${f.name}')`);
    const result = await this.conn.query(`
      WITH combined_data AS (
        ${unionQueries.join(' UNION ALL ')}
      )
      SELECT
        week_number,
        third_level_organization,
        SUM(signed_premium_yuan) as total_premium,
        SUM(reported_claim_payment_yuan) as total_claim,
        SUM(expense_amount_yuan) as total_expense,
        SUM(policy_count) as total_policies
      FROM combined_data
      WHERE week_number BETWEEN ${weekRange[0]} AND ${weekRange[1]}
      GROUP BY week_number, third_level_organization
      ORDER BY week_number, total_premium DESC
    `);

    return result.toArray().map(row => row.toJSON());
  }

  async executeSQL(sql: string): Promise<any[]> {
    if (!this.conn) throw new Error('DuckDB not initialized');
    const result = await this.conn.query(sql);
    return result.toArray().map(row => row.toJSON());
  }

  async cleanup() {
    if (this.conn) await this.conn.close();
    if (this.db) await this.db.terminate();
  }
}
```

#### 集成到UI

```vue
<!-- src/components/upload/DuckDBUploader.vue -->
<template>
  <div class="duckdb-uploader">
    <el-tabs v-model="uploadMode">
      <el-tab-pane label="CSV上传" name="csv">
        <upload-zone @file-change="handleCSVUpload" />
      </el-tab-pane>

      <el-tab-pane label="DuckDB查询" name="duckdb">
        <div class="sql-editor">
          <el-input
            v-model="sqlQuery"
            type="textarea"
            :rows="10"
            placeholder="输入SQL查询..."
          />
          <el-button type="primary" @click="executeQuery">
            执行查询
          </el-button>
        </div>

        <div class="file-upload">
          <el-upload
            ref="uploadRef"
            :auto-upload="false"
            :on-change="handleDuckDBFileChange"
            multiple
            accept=".csv,.parquet,.duckdb"
          >
            <el-button>选择数据文件</el-button>
          </el-upload>
        </div>
      </el-tab-pane>
    </el-tabs>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, onUnmounted } from 'vue';
import { DuckDBLoader } from '@/utils/duckdb-loader';
import { useDataStore } from '@/stores/data';

const dataStore = useDataStore();
const uploadMode = ref('csv');
const sqlQuery = ref(`
SELECT
  third_level_organization,
  SUM(signed_premium_yuan) as total_premium
FROM data
GROUP BY third_level_organization
ORDER BY total_premium DESC
LIMIT 10
`);

const duckdb = new DuckDBLoader();

onMounted(async () => {
  await duckdb.initialize();
});

onUnmounted(() => {
  duckdb.cleanup();
});

async function executeQuery() {
  try {
    const results = await duckdb.executeSQL(sqlQuery.value);
    dataStore.setRawData(results);
  } catch (error) {
    console.error('Query execution failed:', error);
  }
}
</script>
```

### 1.3 支持的数据格式

| 格式 | 扩展名 | DuckDB函数 | 用途 |
|------|-------|-----------|------|
| CSV | .csv | `read_csv_auto()` | 基础数据 |
| Parquet | .parquet | `read_parquet()` | 高性能列式存储 |
| JSON | .json | `read_json_auto()` | 配置文件 |
| DuckDB | .duckdb | `ATTACH` | 预处理数据库 |

### 1.4 架构设计

```typescript
// src/stores/data.ts - 扩展版
export const useDataStore = defineStore('data', () => {
  // ... 现有代码

  // 新增：数据源类型
  const dataSource = ref<'csv' | 'duckdb'>('csv');
  const duckdbLoader = new DuckDBLoader();

  // 新增：通用加载方法
  async function loadData(source: File | File[], type: 'csv' | 'duckdb') {
    dataSource.value = type;

    if (type === 'csv') {
      await loadCSV(source as File);
    } else if (type === 'duckdb') {
      await loadDuckDB(source);
    }
  }

  async function loadDuckDB(files: File | File[]) {
    loading.value = true;
    try {
      await duckdbLoader.initialize();

      if (Array.isArray(files)) {
        // 多文件合并查询
        const data = await duckdbLoader.queryMultiWeek(files, [1, 52]);
        rawData.value = data;
      } else {
        // 单文件查询
        const data = await duckdbLoader.loadFromFile(files);
        rawData.value = data;
      }

      processedData.value = calculator.processData(rawData.value);
      loading.value = false;
    } catch (error) {
      error.value = error.message;
      loading.value = false;
    }
  }

  return {
    // ... 现有返回
    dataSource,
    loadData,
    loadDuckDB,
  };
});
```

---

## 二、多周趋势分析

### 2.1 功能概述

**目标**: 支持分公司和三级机构两种模式下的多周趋势对比分析。

### 2.2 数据结构设计

```typescript
// src/types/trend.ts
export interface WeeklyData {
  week: number;
  year: number;
  organization: string;
  metrics: {
    签单保费: number;
    满期赔付率: number;
    费用率: number;
    变动成本率: number;
    年计划达成率: number;
    // ... 其他指标
  };
}

export interface TrendAnalysis {
  organization: string;
  orgType: 'branch' | 'third_level'; // 分公司 or 三级机构
  weekRange: [number, number];
  data: WeeklyData[];
  statistics: {
    avgPremium: number;
    avgCostRate: number;
    trend: 'up' | 'down' | 'stable';
    growthRate: number; // 环比增长率
  };
}
```

### 2.3 趋势计算引擎

```typescript
// src/utils/trend-calculator.ts
import _ from 'lodash-es';

export class TrendCalculator {
  /**
   * 计算多周趋势
   */
  calculateTrend(
    weeklyData: WeeklyData[],
    orgType: 'branch' | 'third_level'
  ): TrendAnalysis[] {
    const grouped = _.groupBy(weeklyData, 'organization');

    return Object.entries(grouped).map(([org, data]) => {
      const sortedData = _.orderBy(data, 'week', 'asc');
      const weekRange: [number, number] = [
        sortedData[0].week,
        sortedData[sortedData.length - 1].week,
      ];

      return {
        organization: org,
        orgType,
        weekRange,
        data: sortedData,
        statistics: this.calculateStatistics(sortedData),
      };
    });
  }

  /**
   * 计算统计指标
   */
  private calculateStatistics(data: WeeklyData[]) {
    const premiums = data.map(d => d.metrics.签单保费);
    const costRates = data.map(d => d.metrics.变动成本率);

    const avgPremium = _.mean(premiums);
    const avgCostRate = _.mean(costRates);

    // 计算趋势（线性回归）
    const trend = this.detectTrend(premiums);

    // 计算环比增长率
    const growthRate = this.calculateGrowthRate(premiums);

    return {
      avgPremium,
      avgCostRate,
      trend,
      growthRate,
    };
  }

  /**
   * 线性回归检测趋势
   */
  private detectTrend(values: number[]): 'up' | 'down' | 'stable' {
    const n = values.length;
    const xMean = (n - 1) / 2;
    const yMean = _.mean(values);

    let numerator = 0;
    let denominator = 0;

    values.forEach((y, x) => {
      numerator += (x - xMean) * (y - yMean);
      denominator += Math.pow(x - xMean, 2);
    });

    const slope = numerator / denominator;

    if (slope > 0.05) return 'up';
    if (slope < -0.05) return 'down';
    return 'stable';
  }

  /**
   * 计算环比增长率
   */
  private calculateGrowthRate(values: number[]): number {
    if (values.length < 2) return 0;
    const last = values[values.length - 1];
    const prev = values[values.length - 2];
    return ((last - prev) / prev) * 100;
  }

  /**
   * 同比对比（去年同期）
   */
  compareYearOverYear(
    currentYear: WeeklyData[],
    previousYear: WeeklyData[]
  ): any {
    // 按周次对齐
    const currentByWeek = _.keyBy(currentYear, 'week');
    const previousByWeek = _.keyBy(previousYear, 'week');

    const comparison = [];
    for (const week in currentByWeek) {
      const current = currentByWeek[week];
      const previous = previousByWeek[week];

      if (previous) {
        comparison.push({
          week: parseInt(week),
          current: current.metrics,
          previous: previous.metrics,
          yoyGrowth: {
            保费增长率:
              ((current.metrics.签单保费 - previous.metrics.签单保费) /
                previous.metrics.签单保费) *
              100,
            成本率变化:
              current.metrics.变动成本率 - previous.metrics.变动成本率,
          },
        });
      }
    }

    return comparison;
  }
}
```

### 2.4 趋势图表组件

```vue
<!-- src/components/charts/TrendChart.vue -->
<template>
  <div class="trend-chart">
    <div class="controls">
      <el-radio-group v-model="orgType">
        <el-radio label="branch">分公司汇总</el-radio>
        <el-radio label="third_level">三级机构明细</el-radio>
      </el-radio-group>

      <el-date-picker
        v-model="weekRange"
        type="weekrange"
        range-separator="至"
        start-placeholder="开始周"
        end-placeholder="结束周"
      />

      <el-select v-model="selectedOrg" placeholder="选择机构">
        <el-option
          v-for="org in organizations"
          :key="org"
          :label="org"
          :value="org"
        />
      </el-select>
    </div>

    <v-chart :option="chartOption" :style="{ height: '500px' }" autoresize />
  </div>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue';
import { useTrendStore } from '@/stores/trend';
import VChart from 'vue-echarts';

const trendStore = useTrendStore();
const orgType = ref<'branch' | 'third_level'>('branch');
const weekRange = ref<[Date, Date]>([new Date(), new Date()]);
const selectedOrg = ref('');

const organizations = computed(() => {
  return trendStore.getTrendData(orgType.value).map(t => t.organization);
});

const chartOption = computed(() => {
  const trendData = trendStore.getTrendByOrg(selectedOrg.value, orgType.value);
  if (!trendData) return {};

  return {
    title: {
      text: `${selectedOrg.value} 趋势分析`,
      left: 'center',
    },
    tooltip: {
      trigger: 'axis',
      axisPointer: { type: 'cross' },
    },
    legend: {
      data: ['签单保费', '变动成本率', '年计划达成率'],
      top: 40,
    },
    xAxis: {
      type: 'category',
      data: trendData.data.map(d => `第${d.week}周`),
    },
    yAxis: [
      {
        type: 'value',
        name: '保费（万元）',
        position: 'left',
      },
      {
        type: 'value',
        name: '比率（%）',
        position: 'right',
      },
    ],
    series: [
      {
        name: '签单保费',
        type: 'line',
        yAxisIndex: 0,
        data: trendData.data.map(d => d.metrics.签单保费 / 10000),
        smooth: true,
        itemStyle: { color: '#5470c6' },
      },
      {
        name: '变动成本率',
        type: 'line',
        yAxisIndex: 1,
        data: trendData.data.map(d => d.metrics.变动成本率),
        smooth: true,
        itemStyle: { color: '#ee6666' },
        markLine: {
          data: [{ yAxis: 88, name: '基准线' }],
        },
      },
      {
        name: '年计划达成率',
        type: 'line',
        yAxisIndex: 1,
        data: trendData.data.map(d => d.metrics.年计划达成率),
        smooth: true,
        itemStyle: { color: '#91cc75' },
        markLine: {
          data: [{ yAxis: 100, name: '达标线' }],
        },
      },
    ],
  };
});
</script>
```

### 2.5 Pinia状态管理

```typescript
// src/stores/trend.ts
import { defineStore } from 'pinia';
import { ref, computed } from 'vue';
import { TrendCalculator } from '@/utils/trend-calculator';
import type { WeeklyData, TrendAnalysis } from '@/types/trend';

export const useTrendStore = defineStore('trend', () => {
  const weeklyData = ref<WeeklyData[]>([]);
  const trendCalculator = new TrendCalculator();

  // 分公司趋势
  const branchTrends = computed(() =>
    trendCalculator.calculateTrend(weeklyData.value, 'branch')
  );

  // 三级机构趋势
  const thirdLevelTrends = computed(() =>
    trendCalculator.calculateTrend(weeklyData.value, 'third_level')
  );

  function getTrendData(orgType: 'branch' | 'third_level'): TrendAnalysis[] {
    return orgType === 'branch' ? branchTrends.value : thirdLevelTrends.value;
  }

  function getTrendByOrg(
    org: string,
    orgType: 'branch' | 'third_level'
  ): TrendAnalysis | undefined {
    const trends = getTrendData(orgType);
    return trends.find(t => t.organization === org);
  }

  async function loadMultiWeekData(files: File[]) {
    // 使用DuckDB合并多周数据
    const duckdb = new DuckDBLoader();
    await duckdb.initialize();
    const data = await duckdb.queryMultiWeek(files, [1, 52]);
    weeklyData.value = data;
  }

  return {
    weeklyData,
    branchTrends,
    thirdLevelTrends,
    getTrendData,
    getTrendByOrg,
    loadMultiWeekData,
  };
});
```

---

## 三、可扩展架构设计

### 3.1 插件化架构

```typescript
// src/core/plugin-system.ts
export interface Plugin {
  name: string;
  version: string;
  install: (app: App) => void;
  uninstall?: () => void;
}

export class PluginManager {
  private plugins: Map<string, Plugin> = new Map();

  register(plugin: Plugin) {
    if (this.plugins.has(plugin.name)) {
      console.warn(`Plugin ${plugin.name} already registered`);
      return;
    }
    this.plugins.set(plugin.name, plugin);
  }

  install(app: App) {
    this.plugins.forEach(plugin => {
      plugin.install(app);
      console.log(`Plugin ${plugin.name} v${plugin.version} installed`);
    });
  }

  uninstall(pluginName: string) {
    const plugin = this.plugins.get(pluginName);
    if (plugin?.uninstall) {
      plugin.uninstall();
    }
    this.plugins.delete(pluginName);
  }
}
```

### 3.2 数据源抽象层

```typescript
// src/core/data-source.ts
export interface DataSource {
  name: string;
  type: 'csv' | 'duckdb' | 'api' | 'indexeddb';
  load(input: any): Promise<RawDataRow[]>;
  validate(data: RawDataRow[]): ValidationResult;
}

export class DataSourceManager {
  private sources: Map<string, DataSource> = new Map();

  register(source: DataSource) {
    this.sources.set(source.type, source);
  }

  async load(type: string, input: any): Promise<RawDataRow[]> {
    const source = this.sources.get(type);
    if (!source) {
      throw new Error(`Data source ${type} not found`);
    }

    const data = await source.load(input);
    const validation = source.validate(data);

    if (!validation.valid) {
      throw new Error(validation.errors.join('; '));
    }

    return data;
  }
}

// 示例：CSV数据源
export class CSVDataSource implements DataSource {
  name = 'CSV Parser';
  type = 'csv' as const;

  async load(file: File): Promise<RawDataRow[]> {
    return new Promise((resolve, reject) => {
      Papa.parse(file, {
        header: true,
        dynamicTyping: true,
        complete: results => resolve(results.data),
        error: error => reject(error),
      });
    });
  }

  validate(data: RawDataRow[]): ValidationResult {
    // ... 验证逻辑
  }
}

// 示例：DuckDB数据源
export class DuckDBDataSource implements DataSource {
  name = 'DuckDB';
  type = 'duckdb' as const;
  private loader = new DuckDBLoader();

  async load(files: File | File[]): Promise<RawDataRow[]> {
    await this.loader.initialize();
    if (Array.isArray(files)) {
      return this.loader.queryMultiWeek(files, [1, 52]);
    }
    return this.loader.loadFromFile(files);
  }

  validate(data: RawDataRow[]): ValidationResult {
    // ... 验证逻辑
  }
}
```

### 3.3 计算引擎抽象

```typescript
// src/core/calculator-engine.ts
export interface CalculatorEngine {
  name: string;
  calculate(data: RawDataRow[], config?: any): ProcessedDataRow[];
}

export class CalculatorRegistry {
  private engines: Map<string, CalculatorEngine> = new Map();

  register(engine: CalculatorEngine) {
    this.engines.set(engine.name, engine);
  }

  get(name: string): CalculatorEngine | undefined {
    return this.engines.get(name);
  }

  getDefault(): CalculatorEngine {
    return this.engines.get('default')!;
  }
}

// 默认KPI计算引擎
export class DefaultKPIEngine implements CalculatorEngine {
  name = 'default';

  calculate(data: RawDataRow[]): ProcessedDataRow[] {
    const calculator = new KPICalculator();
    return calculator.processData(data);
  }
}

// 扩展：Web Worker并行计算引擎
export class ParallelKPIEngine implements CalculatorEngine {
  name = 'parallel';

  async calculate(data: RawDataRow[]): Promise<ProcessedDataRow[]> {
    const worker = new Worker(
      new URL('../workers/kpi-worker.ts', import.meta.url)
    );

    return new Promise((resolve, reject) => {
      worker.postMessage({ data, action: 'calculate' });
      worker.onmessage = e => resolve(e.data.results);
      worker.onerror = reject;
    });
  }
}
```

### 3.4 渲染器抽象

```typescript
// src/core/renderer.ts
export interface ChartRenderer {
  name: string;
  type: 'echarts' | 'chartjs' | 'd3' | 'custom';
  render(container: HTMLElement, data: any, config: any): void;
  update(data: any): void;
  destroy(): void;
}

export class RendererRegistry {
  private renderers: Map<string, ChartRenderer> = new Map();

  register(renderer: ChartRenderer) {
    this.renderers.set(renderer.name, renderer);
  }

  get(name: string): ChartRenderer | undefined {
    return this.renderers.get(name);
  }
}
```

### 3.5 配置管理系统

```typescript
// src/core/config-manager.ts
export interface AppConfig {
  dataSource: {
    default: 'csv' | 'duckdb';
    enabledSources: string[];
  };
  calculator: {
    engine: 'default' | 'parallel';
    workerPoolSize: number;
  };
  features: {
    enableTrendAnalysis: boolean;
    enableDuckDB: boolean;
    enableExport: boolean;
    enableOffline: boolean;
  };
  ui: {
    theme: 'light' | 'dark' | 'auto';
    language: 'zh-CN' | 'en-US';
    chartLibrary: 'echarts' | 'chartjs';
  };
  performance: {
    enableWebWorker: boolean;
    enableVirtualScroll: boolean;
    chunkSize: number;
  };
}

export class ConfigManager {
  private config: AppConfig;

  constructor(defaultConfig: AppConfig) {
    this.config = this.loadConfig() || defaultConfig;
  }

  get<K extends keyof AppConfig>(key: K): AppConfig[K] {
    return this.config[key];
  }

  set<K extends keyof AppConfig>(key: K, value: AppConfig[K]) {
    this.config[key] = value;
    this.saveConfig();
  }

  private loadConfig(): AppConfig | null {
    const saved = localStorage.getItem('app-config');
    return saved ? JSON.parse(saved) : null;
  }

  private saveConfig() {
    localStorage.setItem('app-config', JSON.stringify(this.config));
  }
}
```

### 3.6 项目目录结构（扩展版）

```
autoweKPI/
├── src/
│   ├── core/                      # 核心架构
│   │   ├── plugin-system.ts       # 插件系统
│   │   ├── data-source.ts         # 数据源抽象
│   │   ├── calculator-engine.ts   # 计算引擎
│   │   ├── renderer.ts            # 渲染器抽象
│   │   └── config-manager.ts      # 配置管理
│   ├── plugins/                   # 插件目录
│   │   ├── duckdb/                # DuckDB插件
│   │   │   ├── index.ts
│   │   │   ├── loader.ts
│   │   │   └── queries/
│   │   ├── trend-analysis/        # 趋势分析插件
│   │   │   ├── index.ts
│   │   │   ├── calculator.ts
│   │   │   └── components/
│   │   └── export/                # 导出插件
│   │       ├── pdf-exporter.ts
│   │       ├── excel-exporter.ts
│   │       └── image-exporter.ts
│   ├── data-sources/              # 数据源实现
│   │   ├── csv-source.ts
│   │   ├── duckdb-source.ts
│   │   ├── api-source.ts          # 预留：API数据源
│   │   └── indexeddb-source.ts    # 预留：本地数据库
│   ├── calculators/               # 计算引擎实现
│   │   ├── default-kpi.ts
│   │   ├── parallel-kpi.ts
│   │   └── custom-kpi.ts          # 预留：自定义计算
│   ├── renderers/                 # 渲染器实现
│   │   ├── echarts-renderer.ts
│   │   ├── chartjs-renderer.ts    # 预留
│   │   └── d3-renderer.ts         # 预留
│   ├── extensions/                # 扩展功能
│   │   ├── trend-analysis/        # 趋势分析
│   │   ├── forecasting/           # 预留：预测分析
│   │   ├── anomaly-detection/     # 预留：异常检测
│   │   └── report-template/       # 预留：报告模板
│   └── main.ts                    # 应用入口
├── plugins.config.ts              # 插件配置
└── extensions.config.ts           # 扩展配置
```

---

## 四、鲁棒性设计

### 4.1 错误处理体系

```typescript
// src/core/error-handler.ts
export enum ErrorCode {
  // 数据错误
  DATA_LOAD_FAILED = 'E1001',
  DATA_VALIDATION_FAILED = 'E1002',
  DATA_PARSE_FAILED = 'E1003',

  // 计算错误
  CALCULATION_FAILED = 'E2001',
  INVALID_KPI_CONFIG = 'E2002',

  // 渲染错误
  CHART_RENDER_FAILED = 'E3001',
  DOM_NOT_FOUND = 'E3002',

  // 系统错误
  WORKER_FAILED = 'E4001',
  MEMORY_OVERFLOW = 'E4002',
  NETWORK_ERROR = 'E4003',
}

export class AppError extends Error {
  constructor(
    public code: ErrorCode,
    public message: string,
    public details?: any,
    public recoverable: boolean = true
  ) {
    super(message);
    this.name = 'AppError';
  }
}

export class ErrorHandler {
  private static instance: ErrorHandler;
  private errorLog: AppError[] = [];

  static getInstance(): ErrorHandler {
    if (!this.instance) {
      this.instance = new ErrorHandler();
    }
    return this.instance;
  }

  handle(error: Error | AppError) {
    if (error instanceof AppError) {
      this.handleAppError(error);
    } else {
      this.handleUnknownError(error);
    }
  }

  private handleAppError(error: AppError) {
    console.error(`[${error.code}] ${error.message}`, error.details);
    this.errorLog.push(error);

    // 用户友好提示
    ElMessage.error({
      message: this.getUserMessage(error),
      duration: 5000,
      showClose: true,
    });

    // 可恢复错误：尝试恢复
    if (error.recoverable) {
      this.attemptRecovery(error);
    } else {
      // 不可恢复：重置应用
      this.resetApp();
    }

    // 上报错误（生产环境）
    if (import.meta.env.PROD) {
      this.reportError(error);
    }
  }

  private getUserMessage(error: AppError): string {
    const messages: Record<ErrorCode, string> = {
      [ErrorCode.DATA_LOAD_FAILED]: '数据加载失败，请检查文件格式',
      [ErrorCode.DATA_VALIDATION_FAILED]: '数据验证失败，请确认必需字段存在',
      [ErrorCode.CALCULATION_FAILED]: 'KPI计算出错，请检查数据完整性',
      // ... 其他错误消息
    };
    return messages[error.code] || '发生未知错误';
  }

  private attemptRecovery(error: AppError) {
    // 根据错误类型尝试恢复
    switch (error.code) {
      case ErrorCode.DATA_LOAD_FAILED:
        // 清空数据，回到上传页面
        useDataStore().reset();
        break;
      case ErrorCode.WORKER_FAILED:
        // 回退到主线程计算
        useConfigManager().set('calculator', { engine: 'default' });
        break;
    }
  }

  private resetApp() {
    // 清空所有状态
    localStorage.clear();
    sessionStorage.clear();
    window.location.reload();
  }

  private reportError(error: AppError) {
    // 发送到错误监控服务（如Sentry）
    // Sentry.captureException(error);
  }

  getErrorLog(): AppError[] {
    return this.errorLog;
  }
}
```

### 4.2 数据验证层

```typescript
// src/core/validators.ts
import { z } from 'zod';

// 使用Zod进行运行时类型验证
export const RawDataSchema = z.object({
  third_level_organization: z.string().min(1, '机构名称不能为空'),
  business_type_category: z.string(),
  customer_category_3: z.string(),
  signed_premium_yuan: z.number().nonnegative('签单保费不能为负'),
  matured_premium_yuan: z.number().nonnegative(),
  policy_count: z.number().int().nonnegative(),
  claim_case_count: z.number().int().nonnegative(),
  reported_claim_payment_yuan: z.number().nonnegative(),
  expense_amount_yuan: z.number().nonnegative(),
  premium_plan_yuan: z.number().nonnegative(),
  week_number: z.number().int().min(1).max(53),
});

export class DataValidator {
  static validate(data: unknown[]): ValidationResult {
    const errors: string[] = [];
    const warnings: string[] = [];

    data.forEach((row, index) => {
      try {
        RawDataSchema.parse(row);
      } catch (error) {
        if (error instanceof z.ZodError) {
          errors.push(`第${index + 1}行: ${error.errors[0].message}`);
        }
      }
    });

    // 业务规则验证
    this.validateBusinessRules(data, warnings);

    return {
      valid: errors.length === 0,
      errors,
      warnings,
    };
  }

  private static validateBusinessRules(data: any[], warnings: string[]) {
    // 警告：满期保费 > 签单保费
    data.forEach((row, i) => {
      if (row.matured_premium_yuan > row.signed_premium_yuan * 1.5) {
        warnings.push(
          `第${i + 1}行: 满期保费异常（是签单保费的${(row.matured_premium_yuan / row.signed_premium_yuan).toFixed(1)}倍）`
        );
      }
    });

    // 警告：赔付率 > 200%
    data.forEach((row, i) => {
      const claimRate = (row.reported_claim_payment_yuan / row.matured_premium_yuan) * 100;
      if (claimRate > 200) {
        warnings.push(`第${i + 1}行: 赔付率异常（${claimRate.toFixed(1)}%）`);
      }
    });
  }
}
```

### 4.3 性能监控

```typescript
// src/core/performance-monitor.ts
export class PerformanceMonitor {
  private metrics: Map<string, number[]> = new Map();

  measure(name: string, fn: () => any): any {
    const start = performance.now();
    const result = fn();
    const duration = performance.now() - start;

    if (!this.metrics.has(name)) {
      this.metrics.set(name, []);
    }
    this.metrics.get(name)!.push(duration);

    console.log(`[Perf] ${name}: ${duration.toFixed(2)}ms`);
    return result;
  }

  async measureAsync(name: string, fn: () => Promise<any>): Promise<any> {
    const start = performance.now();
    const result = await fn();
    const duration = performance.now() - start;

    if (!this.metrics.has(name)) {
      this.metrics.set(name, []);
    }
    this.metrics.get(name)!.push(duration);

    console.log(`[Perf] ${name}: ${duration.toFixed(2)}ms`);
    return result;
  }

  getStats(name: string) {
    const values = this.metrics.get(name) || [];
    if (values.length === 0) return null;

    return {
      count: values.length,
      avg: values.reduce((a, b) => a + b, 0) / values.length,
      min: Math.min(...values),
      max: Math.max(...values),
    };
  }

  report() {
    console.table(
      Array.from(this.metrics.entries()).map(([name, values]) => ({
        Operation: name,
        ...this.getStats(name),
      }))
    );
  }
}
```

### 4.4 内存管理

```typescript
// src/core/memory-manager.ts
export class MemoryManager {
  private watchers: (() => void)[] = [];

  startMonitoring() {
    if ('memory' in performance) {
      setInterval(() => {
        const memory = (performance as any).memory;
        const usedMB = memory.usedJSHeapSize / 1048576;
        const limitMB = memory.jsHeapSizeLimit / 1048576;

        console.log(`Memory: ${usedMB.toFixed(2)}MB / ${limitMB.toFixed(2)}MB`);

        // 警告：内存使用超过80%
        if (usedMB / limitMB > 0.8) {
          console.warn('High memory usage detected, triggering cleanup');
          this.cleanup();
        }
      }, 5000);
    }
  }

  cleanup() {
    // 触发垃圾回收（仅建议）
    this.watchers.forEach(fn => fn());
    this.watchers = [];

    // 清理大对象
    useDataStore().$reset();

    // 强制垃圾回收（仅Chrome DevTools）
    if (window.gc) {
      window.gc();
    }
  }

  onCleanup(fn: () => void) {
    this.watchers.push(fn);
  }
}
```

### 4.5 离线支持

```typescript
// src/core/offline-manager.ts
export class OfflineManager {
  private sw: ServiceWorkerRegistration | null = null;

  async register() {
    if ('serviceWorker' in navigator) {
      try {
        this.sw = await navigator.serviceWorker.register('/sw.js');
        console.log('Service Worker registered');

        // 监听更新
        this.sw.addEventListener('updatefound', () => {
          ElMessage.info('发现新版本，正在更新...');
        });
      } catch (error) {
        console.error('Service Worker registration failed:', error);
      }
    }
  }

  async cacheData(key: string, data: any) {
    const cache = await caches.open('data-cache-v1');
    await cache.put(
      key,
      new Response(JSON.stringify(data), {
        headers: { 'Content-Type': 'application/json' },
      })
    );
  }

  async getCachedData(key: string): Promise<any | null> {
    const cache = await caches.open('data-cache-v1');
    const response = await cache.match(key);
    return response ? response.json() : null;
  }
}
```

---

## 五、技术选型总结

### 5.1 核心依赖

| 功能 | 技术选型 | 版本 | 理由 |
|------|---------|------|------|
| DuckDB | `@duckdb/duckdb-wasm` | ^1.28 | 浏览器内SQL查询，性能优异 |
| 数据验证 | `zod` | ^3.22 | 运行时类型安全 |
| 日期处理 | `dayjs` | ^1.11 | 轻量级，支持插件 |
| 图表库 | `echarts` | ^5.4 | 功能强大，已有基础 |
| 状态管理 | `pinia` | ^2.1 | Vue 3官方推荐 |
| UI组件 | `element-plus` | ^2.4 | 企业级，组件丰富 |

### 5.2 可选依赖（按需加载）

| 功能 | 技术选型 | 用途 |
|------|---------|------|
| PDF导出 | `jspdf` + `html2canvas` | 报告导出 |
| Excel导出 | `xlsx` | 数据导出 |
| 错误监控 | `@sentry/vue` | 生产环境监控 |
| 离线支持 | `workbox` | PWA |
| 图表增强 | `echarts-gl` | 3D图表 |

---

## 六、实施优先级

### P0 - 核心功能（Phase 1-3）
- ✅ CSV上传和处理
- ✅ KPI计算
- ✅ 基础图表
- ✅ 单/多机构模式

### P1 - 高优先级扩展（Phase 4）
- 🔄 DuckDB数据导入
- 🔄 基础趋势分析（单周对比）
- 🔄 错误处理体系
- 🔄 性能监控

### P2 - 中优先级扩展（Phase 5+）
- ⏳ 多周趋势分析
- ⏳ 同比/环比对比
- ⏳ 导出功能（PDF/Excel）
- ⏳ 离线支持（PWA）

### P3 - 低优先级扩展（未来）
- 📋 预测分析
- 📋 异常自动检测
- 📋 自定义报告模板
- 📋 多语言支持

---

**以上规划确保了项目的高扩展性和鲁棒性，所有扩展点都已预留好接口。**
