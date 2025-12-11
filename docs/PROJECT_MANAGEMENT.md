# autoweKPI 项目管理文档

## 📋 文档版本

- **版本**: v1.0.0
- **创建日期**: 2025-12-11
- **最后更新**: 2025-12-11
- **负责人**: 开发团队
- **状态**: 规划阶段

---

## 目录

1. [项目概述](#一项目概述)
2. [开发阶段规划](#二开发阶段规划)
3. [任务分解](#三任务分解)
4. [开发记录模板](#四开发记录模板)
5. [变更管理](#五变更管理)
6. [风险管理](#六风险管理)
7. [质量控制](#七质量控制)

---

## 一、项目概述

### 1.1 项目基本信息

| 项目 | 信息 |
|------|------|
| **项目名称** | autoweKPI GitHub Pages 迁移项目 |
| **项目类型** | 技术重构 + 功能扩展 |
| **项目周期** | 15个工作日（3周） |
| **技术栈** | Vue 3 + TypeScript + Vite + GitHub Pages |
| **团队规模** | 1-2人 |
| **预算** | $0（使用免费技术栈） |

### 1.2 项目目标

#### 核心目标
1. ✅ **100%功能复刻**: 迁移所有Python Flask功能到纯前端
2. ✅ **性能提升**: 响应速度提升30%+
3. ✅ **成本降低**: 年度运营成本降至$0
4. ✅ **用户体验优化**: 操作步骤减少50%

#### 扩展目标
1. 🔄 **DuckDB支持**: 高性能SQL查询
2. 🔄 **多周趋势**: 分公司和三级机构趋势分析
3. 🔄 **鲁棒性**: 完善错误处理和恢复机制
4. 🔄 **可扩展**: 插件化架构，便于未来扩展

### 1.3 成功指标

| 指标 | 目标值 | 验收标准 |
|------|-------|----------|
| 功能完整性 | 100% | 168项功能全部通过测试 |
| 计算精度 | 100% | 与Python结果误差<0.01% |
| 性能提升 | ≥30% | 10万行数据处理<3秒 |
| 代码覆盖率 | ≥80% | 单元测试+集成测试 |
| Lighthouse分数 | ≥90 | 性能、可访问性、最佳实践 |
| 用户满意度 | ≥95% | 内部用户测试反馈 |

---

## 二、开发阶段规划

### Phase 1: 项目初始化（Day 1） ✅ 已完成

**目标**: 搭建开发环境，配置基础架构

**主要任务**:
- [x] 创建Vite + Vue 3项目
- [x] 安装核心依赖（389 packages）
- [x] 配置TypeScript（严格模式）
- [x] 配置ESLint + Prettier
- [x] 搭建项目目录结构（9个目录）
- [x] 配置GitHub Actions部署

**产出物**:
- ✅ 可运行的项目骨架
- ✅ 完整的配置文件（9个）
- ✅ 欢迎页面（Home.vue）
- ✅ 开发日志更新

**验收标准**:
- ✅ `npm run dev` 正常启动（126ms）
- ✅ 无TypeScript错误
- ✅ 代码格式化正常工作
- ✅ 生产构建成功（2.39秒）

**完成时间**: 2025-12-11
**实际工作量**: 0.5 天

---

### Phase 2: 核心功能迁移（Day 1） ✅ 已完成

**目标**: 迁移所有数据处理和KPI计算逻辑

#### 类型定义和数据加载 ✅

**任务**:
- [x] 定义所有TypeScript类型（4个文件，40+类型）
- [x] 实现CSV解析器（PapaParse）
- [x] 实现数据验证器（必需列检查）
- [x] 数据清洗逻辑（数值字段、空值处理）

**验收**:
- ✅ 能正确解析CSV文件
- ✅ 数据验证规则完整
- ✅ 错误提示友好

#### KPI计算引擎 ✅

**任务**:
- [x] 实现所有15个KPI计算函数
- [x] 实现safeDivide等工具函数
- [x] 边界条件处理（除零、NaN、Infinity）
- [x] 四舍五入逻辑

**验收**:
- ✅ 所有KPI计算逻辑与Python对标
- ✅ 边界情况处理正确
- ✅ TypeScript类型检查通过

#### 数据聚合和映射 ✅

**任务**:
- [x] 实现GroupBy聚合（Lodash）
- [x] 业务类型映射
- [x] 阈值检测（3个规则）
- [x] 问题机构识别（Top 5）

**验收**:
- ✅ 聚合逻辑与pandas等价
- ✅ 映射逻辑正确
- ✅ 异常检测准确

#### Pinia状态管理 ✅

**任务**:
- [x] 设计状态结构（Composition API）
- [x] 实现data store（数据+KPI+报告）
- [x] 实现config store（配置+UI状态）
- [x] 状态持久化（localStorage）

**验收**:
- ✅ 状态管理清晰
- ✅ 数据流合理（单向）
- ✅ 响应式正常

**产出物**:
- ✅ 类型定义：4个文件
- ✅ 工具函数：2个文件
- ✅ 核心服务：4个文件
- ✅ 状态管理：2个stores
- ✅ 代码总计：~2000行

**完成时间**: 2025-12-11
**实际工作量**: 0.5天
**备注**: 提前完成，与Day 1合并完成

---

### Phase 3: UI组件开发（Day 8-12）

#### Day 8: 上传组件

**任务**:
- [ ] 文件上传组件
- [ ] 拖拽支持
- [ ] 进度条
- [ ] 错误提示

**验收**:
- 拖拽上传正常
- 进度实时更新
- 错误提示友好

#### Day 9: 报告头部和KPI卡片

**任务**:
- [ ] 报告标题组件
- [ ] 日期计算和显示
- [ ] KPI卡片组件
- [ ] 单/多机构模式切换

**验收**:
- 标题动态生成正确
- KPI数值正确
- 模式切换正常

#### Day 10-11: 图表组件

**任务**:
- [ ] ECharts封装
- [ ] 概览图表
- [ ] 保费进度图表
- [ ] 变动成本图表
- [ ] 损失暴露图表（气泡图）
- [ ] 费用支出图表

**验收**:
- 所有图表正常渲染
- 交互功能完整
- 自适应resize

#### Day 12: 标签页和交互

**任务**:
- [ ] 标签页切换
- [ ] 维度切换
- [ ] 子标签页（损失暴露）
- [ ] 浮动按钮

**验收**:
- 所有交互正常
- 状态保持正确
- 动画流畅

---

### Phase 4: 扩展功能（Day 13）

#### DuckDB集成

**任务**:
- [ ] 安装@duckdb/duckdb-wasm
- [ ] 实现DuckDBLoader
- [ ] UI集成
- [ ] SQL查询界面

**验收**:
- 能加载CSV到DuckDB
- SQL查询正常
- 性能优于纯JS

#### 基础趋势分析

**任务**:
- [ ] 多周数据合并
- [ ] 趋势计算
- [ ] 趋势图表
- [ ] Store集成

**验收**:
- 能合并多周数据
- 趋势计算正确
- 图表展示清晰

---

### Phase 5: 部署和优化（Day 14-15）

#### Day 14: GitHub Actions部署

**任务**:
- [ ] 配置deploy.yml
- [ ] 配置vite.config.ts
- [ ] 配置GitHub Pages
- [ ] 首次部署测试

**验收**:
- 自动构建成功
- GitHub Pages访问正常
- 所有资源加载成功

#### Day 15: 测试和优化

**任务**:
- [ ] 端到端测试
- [ ] 性能优化
- [ ] 代码审查
- [ ] 文档完善
- [ ] 用户验收测试

**验收**:
- 所有测试通过
- Lighthouse分数>90
- 文档完整
- 用户反馈良好

---

## 三、任务分解

### 3.1 任务看板

```
待办 (TODO)          进行中 (IN PROGRESS)     已完成 (DONE)
─────────────────    ────────────────────     ──────────────
□ TypeScript类型     ■ 项目规划文档           ✓ 项目初始化
□ CSV解析器          ■ 技术方案设计           ✓ 可行性分析
□ KPI计算引擎                                 ✓ 功能清单
□ 数据聚合                                    ✓ 扩展规划
□ UI组件
□ 图表封装
□ DuckDB集成
□ 趋势分析
□ 部署配置
□ 测试优化
```

### 3.2 任务优先级矩阵

```
重要且紧急 (P0)         重要不紧急 (P1)
─────────────────      ─────────────────
• CSV解析和验证         • DuckDB集成
• KPI计算引擎           • 趋势分析
• 基础图表渲染          • 导出功能
• 单/多机构模式         • 离线支持

不重要但紧急 (P2)       不重要不紧急 (P3)
─────────────────      ─────────────────
• UI美化                • 预测分析
• 动画效果              • 多语言
• 主题切换              • 自定义模板
```

---

## 四、开发记录模板

### 4.1 每日开发日志

```markdown
# 开发日志 - YYYY-MM-DD

## 今日目标
- [ ] 任务1
- [ ] 任务2
- [ ] 任务3

## 完成情况
- [x] 完成了XXX
- [x] 修复了XXX bug
- [ ] XXX遇到阻塞（原因：...）

## 技术决策
1. **问题**: XXX
   **方案A**: ...
   **方案B**: ...
   **选择**: B
   **理由**: ...

## 遇到的问题
1. **问题描述**: XXX
   **解决方案**: XXX
   **参考资料**: [链接]

## 代码统计
- 新增代码: XXX 行
- 删除代码: XXX 行
- 测试覆盖: XX%

## 明日计划
- [ ] 任务1
- [ ] 任务2

## 备注
其他需要记录的事项...
```

### 4.2 周报模板

```markdown
# 周报 - 第X周 (MM/DD - MM/DD)

## 本周目标完成情况
- [x] Phase X 完成（100%）
- [ ] Phase Y 进行中（60%）

## 主要成果
1. 完成XXX模块开发
2. 实现XXX功能
3. 修复XXX个bug

## 技术亮点
- 采用XXX技术解决了XXX问题
- 性能优化：XXX提升XX%

## 遇到的挑战
1. **挑战**: XXX
   **解决**: XXX

## 下周计划
1. Phase Y 剩余任务
2. Phase Z 启动

## 风险提示
- 风险1: XXX（严重程度：高/中/低）
- 应对措施: XXX
```

### 4.3 代码审查记录

```markdown
# 代码审查 - YYYY-MM-DD

## 审查范围
- 模块: XXX
- 文件: XXX
- 代码行数: XXX

## 审查发现

### 🔴 严重问题
1. **问题**: XXX
   **位置**: `src/xxx.ts:123`
   **建议**: XXX
   **状态**: 待修复

### 🟡 一般问题
1. **问题**: XXX
   **建议**: XXX
   **状态**: 已修复

### 🟢 建议改进
1. **建议**: XXX
   **优先级**: 低

## 总体评价
- 代码质量: ⭐⭐⭐⭐⭐
- 可维护性: ⭐⭐⭐⭐
- 性能: ⭐⭐⭐⭐⭐
- 测试覆盖: ⭐⭐⭐⭐

## 审查人签名
- 审查人: XXX
- 日期: YYYY-MM-DD
```

---

## 五、变更管理

### 5.1 变更请求模板

```markdown
# 变更请求 #001

## 基本信息
- **请求人**: XXX
- **日期**: YYYY-MM-DD
- **类型**: 功能增加 / Bug修复 / 优化改进
- **优先级**: P0 / P1 / P2 / P3

## 变更描述
详细描述需要变更的内容...

## 变更理由
为什么需要这个变更...

## 影响范围
- 影响的模块: XXX
- 影响的文件: XXX
- 预计工作量: X 人日

## 风险评估
- 技术风险: 高/中/低
- 进度风险: 高/中/低
- 说明: ...

## 审批记录
- [ ] 技术负责人: XXX (YYYY-MM-DD)
- [ ] 项目负责人: XXX (YYYY-MM-DD)

## 实施记录
- 开始时间: YYYY-MM-DD
- 完成时间: YYYY-MM-DD
- 实际工作量: X 人日
```

### 5.2 变更日志

| 版本 | 日期 | 类型 | 描述 | 负责人 |
|------|------|------|------|--------|
| v0.1.0 | 2025-12-11 | 初始化 | 项目创建 | XXX |
| v0.2.0 | 2025-12-13 | 功能 | 完成CSV解析 | XXX |
| v0.3.0 | 2025-12-15 | 功能 | 完成KPI计算 | XXX |
| ... | ... | ... | ... | ... |

---

## 六、风险管理

### 6.1 风险识别和应对

| ID | 风险描述 | 概率 | 影响 | 等级 | 应对措施 | 负责人 | 状态 |
|----|---------|------|------|------|----------|--------|------|
| R01 | TypeScript学习曲线 | 中 | 中 | P2 | 提前学习，参考文档 | XXX | ✅ |
| R02 | 性能不达标 | 低 | 高 | P1 | Web Worker优化 | XXX | 🟡 |
| R03 | DuckDB兼容性 | 低 | 中 | P2 | 充分测试，准备降级方案 | XXX | ⏳ |
| R04 | GitHub Pages限制 | 低 | 低 | P3 | 确保构建产物<1GB | XXX | ⏳ |

**图例**:
- ✅ 已解决
- 🟡 监控中
- ⏳ 待处理
- 🔴 严重

### 6.2 风险应对策略

#### R02: 性能风险应对

**触发条件**: 10万行数据处理时间>3秒

**应对措施**:
1. **计划A**: 启用Web Worker并行计算
2. **计划B**: 使用DuckDB WASM替代纯JS
3. **计划C**: 数据分批处理，显示进度

**责任人**: 技术负责人
**检查点**: Day 7（KPI计算完成后性能测试）

---

## 七、质量控制

### 7.1 质量标准

#### 代码质量

| 指标 | 标准 | 工具 |
|------|------|------|
| TypeScript覆盖率 | ≥95% | TypeScript编译器 |
| 单元测试覆盖率 | ≥80% | Vitest + c8 |
| ESLint规则 | 0 error, <10 warning | ESLint |
| 代码重复率 | <5% | jscpd |
| 圈复杂度 | <10 | ESLint complexity |

#### 性能标准

| 指标 | 标准 | 测试方法 |
|------|------|----------|
| 首屏加载 | <2秒 | Lighthouse |
| 数据处理(1万行) | <0.5秒 | Performance API |
| 数据处理(10万行) | <3秒 | Performance API |
| 图表渲染 | <500ms | Performance API |
| 内存占用 | <100MB | Chrome DevTools |

#### 功能质量

| 指标 | 标准 | 验证方法 |
|------|------|----------|
| 功能完整性 | 168/168 | 功能清单对照 |
| 计算精度 | 误差<0.01% | 与Python结果对比 |
| 兼容性 | 现代浏览器100% | BrowserStack测试 |
| 移动端适配 | 完整支持 | 真机测试 |

### 7.2 测试策略

#### 单元测试

```typescript
// 示例: KPI计算器测试
describe('KPICalculator', () => {
  const calculator = new KPICalculator();

  it('应正确计算变动成本率', () => {
    const data = [
      { matured_premium_yuan: 10000, reported_claim_payment_yuan: 6000, ... }
    ];
    const result = calculator.calculateKPIs(data);
    expect(result.变动成本率).toBeCloseTo(80, 1);
  });

  it('分母为0时应返回0', () => {
    const data = [{ matured_premium_yuan: 0, ... }];
    const result = calculator.calculateKPIs(data);
    expect(result.满期赔付率).toBe(0);
  });
});
```

#### 集成测试

```typescript
// 示例: 数据流测试
describe('Data Flow', () => {
  it('应正确处理完整数据流程', async () => {
    const file = new File([csvContent], 'test.csv');

    await dataStore.loadFile(file);

    expect(dataStore.hasData).toBe(true);
    expect(dataStore.processedData.length).toBeGreaterThan(0);

    const report = reportStore.generateReport();
    expect(report.summary.签单保费).toBeCloseTo(expectedPremium, 2);
  });
});
```

#### E2E测试

```typescript
// 使用Playwright
test('用户完整操作流程', async ({ page }) => {
  await page.goto('http://localhost:5173');

  // 上传文件
  await page.setInputFiles('input[type="file"]', 'test.csv');

  // 等待处理完成
  await page.waitForSelector('.report-view');

  // 验证KPI
  const premium = await page.textContent('#metric-premium');
  expect(premium).toContain('39690.73');

  // 切换维度
  await page.click('button[data-dimension="category"]');
  await page.waitForSelector('.chart-updated');

  // 截图对比
  await expect(page).toHaveScreenshot('category-view.png');
});
```

### 7.3 质量检查清单

#### 提交前检查

- [ ] 代码格式化 (`npm run format`)
- [ ] 无TypeScript错误 (`npm run type-check`)
- [ ] 无ESLint错误 (`npm run lint`)
- [ ] 所有测试通过 (`npm run test`)
- [ ] 无console.log残留
- [ ] 注释清晰完整

#### 合并前检查

- [ ] 所有单元测试通过
- [ ] 集成测试通过
- [ ] 代码审查通过
- [ ] 性能测试达标
- [ ] 文档已更新
- [ ] CHANGELOG已更新

#### 发布前检查

- [ ] E2E测试通过
- [ ] 生产构建成功
- [ ] Lighthouse分数≥90
- [ ] 真机测试通过
- [ ] 用户验收测试通过
- [ ] 回滚方案已准备

---

## 八、工具和流程

### 8.1 开发工具链

| 工具 | 用途 | 版本 |
|------|------|------|
| VS Code | IDE | 最新 |
| Node.js | 运行环境 | ≥18.0 |
| pnpm | 包管理 | ≥8.0 |
| Git | 版本控制 | ≥2.40 |
| GitHub | 代码托管 | - |
| Vite | 构建工具 | ≥5.0 |
| Vitest | 测试框架 | ≥1.0 |
| Playwright | E2E测试 | ≥1.40 |

### 8.2 Git工作流

#### 分支策略

```
main (生产分支)
  ↑
  └── gh-pages (开发分支)
       ├── feature/csv-parser (功能分支)
       ├── feature/kpi-calculator
       ├── feature/charts
       └── bugfix/xxx (修复分支)
```

#### 提交规范

```
<type>(<scope>): <subject>

<body>

<footer>
```

**类型(type)**:
- `feat`: 新功能
- `fix`: Bug修复
- `docs`: 文档更新
- `style`: 代码格式
- `refactor`: 重构
- `test`: 测试
- `chore`: 构建工具

**示例**:
```
feat(kpi): add trend calculation

实现多周趋势计算功能，支持环比和同比分析

Closes #123
```

### 8.3 代码审查流程

1. **创建PR** - 功能开发完成后
2. **自动检查** - GitHub Actions运行测试
3. **人工审查** - 至少1人审查
4. **修改反馈** - 根据审查意见修改
5. **批准合并** - 审查通过后合并
6. **删除分支** - 合并后删除feature分支

---

## 九、文档管理

### 9.1 文档结构

```
docs/
├── PROJECT_MANAGEMENT.md (本文档)
├── DEVELOPMENT_LOG.md (开发日志)
├── CHANGELOG.md (变更日志)
├── API.md (API文档)
├── ARCHITECTURE.md (架构文档)
└── USER_GUIDE.md (用户手册)
```

### 9.2 文档更新规范

- **及时性**: 代码和文档同步更新
- **准确性**: 文档描述与实际一致
- **完整性**: 覆盖所有关键功能
- **易读性**: 清晰的结构和示例

---

## 十、附录

### 10.1 相关文档链接

- [GitHub Pages迁移方案](GITHUB_PAGES_MIGRATION_PLAN.md)
- [可行性分析](FEASIBILITY_ANALYSIS.md)
- [功能清单](FEATURE_CHECKLIST.md)
- [扩展功能规划](EXTENSIONS_PLAN.md)
- [迁移总览](README_MIGRATION.md)

### 10.2 外部参考

- [Vue 3 文档](https://vuejs.org/)
- [TypeScript 手册](https://www.typescriptlang.org/)
- [Vite 指南](https://vitejs.dev/)
- [Element Plus](https://element-plus.org/)
- [DuckDB WASM](https://duckdb.org/docs/api/wasm)

---

**文档维护**: 开发团队
**审核**: 项目负责人
**最后审核日期**: 2025-12-11
