# autoweKPI Phase 3 UI组件开发计划

## 📋 开发目标
将已完成的核心功能（数据加载、KPI计算、状态管理）通过UI组件展示给用户，实现完整的经营分析周报生成功能。

## 🎯 核心任务（按优先级）

### Day 1: 文件上传组件
- 创建 `src/components/` 目录结构
- 开发 `FileUpload.vue` 组件
  - 支持拖拽上传
  - 文件验证（CSV格式）
  - 上传进度显示
  - 错误提示和处理
- 集成到 `Home.vue`

### Day 2: KPI指标卡片组件
- 开发 `KPICard.vue` 基础组件
- 开发 `KPIDashboard.vue` 仪表板
  - 15个KPI指标展示
  - 单/多机构模式自适应
  - 数值格式化（万元、百分比）
- 开发 `ReportHeader.vue` 报告头部
  - 动态标题生成
  - 日期和周次显示

### Day 3-4: 图表组件开发
- 开发 `BaseChart.vue` ECharts封装
- 开发5个图表组件：
  - `OverviewChart.vue` - 概览图表
  - `PremiumProgressChart.vue` - 保费进度
  - `VariableCostChart.vue` - 变动成本
  - `LossExposureChart.vue` - 损失暴露（气泡图）
  - `ExpenseChart.vue` - 费用支出
- 支持响应式resize

### Day 5: 报告视图和交互
- 开发 `ReportView.vue` 主报告组件
- 开发 `TabNavigation.vue` 标签页导航
- 开发 `DimensionSwitch.vue` 维度切换
- 集成所有组件到完整报告

## 🏗️ 技术实现要点

### 组件设计原则
- 使用Composition API (`<script setup lang="ts">`)
- 从Pinia store读取数据
- 遵循Element Plus设计规范
- 苹果风格UI设计（简洁、优雅）

### 数据流设计
```
用户上传CSV → DataLoader → Pinia Store → Vue组件 → UI展示
```

### 关键技术点
- 文件上传使用PapaParse解析
- KPI数据从store的computed属性获取
- ECharts图表支持动态数据更新
- 响应式设计适配移动端

## 📁 新增文件结构
```
src/components/
├── common/
│   ├── FileUpload.vue
│   ├── KPICard.vue
│   └── BaseChart.vue
├── report/
│   ├── ReportHeader.vue
│   ├── KPIDashboard.vue
│   └── ReportView.vue
├── charts/
│   ├── OverviewChart.vue
│   ├── PremiumProgressChart.vue
│   ├── VariableCostChart.vue
│   ├── LossExposureChart.vue
│   └── ExpenseChart.vue
└── navigation/
    ├── TabNavigation.vue
    └── DimensionSwitch.vue
```

## ✅ 验收标准
- 文件上传功能正常，支持拖拽
- 15个KPI指标准确展示
- 5类图表正常渲染和交互
- 单/多机构模式自动切换
- 维度切换功能正常
- 响应式设计适配
- TypeScript编译无错误
- ESLint检查通过

## 📊 预期产出
- 12个Vue组件
- ~2000行UI代码
- 完整的经营分析周报界面
- 用户可上传CSV并生成完整报告