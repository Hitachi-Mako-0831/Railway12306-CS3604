# 重构 /trains 页面实施计划

## 概览与目标
- 目标：在不改变输入/输出与外观行为的前提下，重构 `/trains` 页面以提升可读性、可维护性与性能，并补充关键路径单元测试。
- 路由位置：`frontend/src/App.tsx:26`（`/trains` → `TrainListPage`）。
- 页面主体：`frontend/src/pages/TrainListPage.tsx`；核心子组件：`our12306/TrainSearchBar.tsx`、`our12306/TrainFilterPanel.tsx`、`our12306/TrainList.tsx`、`our12306/TrainItem.tsx`、`our12306/ReserveButton.tsx`。
- 后端接口保持不变（`GET /api/trains/search`、`/api/trains/:trainNo/detail`、`/api/trains/available-dates`）。

## 受影响范围与不变约束
- 不变约束：
  - 输入输出字段与类型保持一致（`trainService.ts` 输出结构不变）。
  - 页面交互与视觉不变（现有 CSS、DOM 结构保持）。
  - 旧版组件与测试不受影响（`components/TrainListTable.tsx`、`TrainFilterBar.tsx` 保留）。
- 主要改动文件：
  - `frontend/src/pages/TrainListPage.tsx`
  - `frontend/src/components/our12306/TrainFilterPanel.tsx`
  - `frontend/src/components/our12306/ReserveButton.tsx`
  - 必要的小幅提取：`frontend/src/components/our12306/TrainList.tsx`、`TrainItem.tsx`

## 控制流重构
- for → while：
  - 将日期标签生成逻辑的 `for` 改为 `while`，保持索引与边界一致。
  - 参考位置：`frontend/src/components/our12306/TrainFilterPanel.tsx:25`（当前 `for (let i = -1; i <= 14; i++)`）。
- 条件判断 → 策略/状态：
  - 预订按钮点击逻辑以“规则管线（策略模式）”替换多层判断：
    - 规则：登录校验、查询结果过期校验（>5分钟）、临近发车提醒（<3小时）。
    - 参考位置：`frontend/src/components/our12306/ReserveButton.tsx:15-19`。
  - 列表筛选逻辑使用“字典化策略映射”替换多段 `if`：
    - 键 → 过滤函数映射，按存在的筛选项顺序执行。
    - 参考位置：`frontend/src/pages/TrainListPage.tsx:120-135`。
- 递归 ↔ 迭代评估：
  - 日期区间生成与筛选均为线性序列处理，更适合迭代；不引入递归。

## 数据结构优化
- 用字典替代多段 if-else：
  - `filterStrategies = { trainTypes, departureStations, arrivalStations, seatTypes }` → 针对每个键提供函数并按需执行。
- 用集合提升查找效率：
  - 在过滤前将数组筛选条件转为 `Set`（如 `trainTypesSet`、`depSet`、`arrSet`、`seatSet`），将 `includes/some` 退化为 O(1) 成员判定。
- 去重已使用 `Set`：
  - 保持并封装去重逻辑为工具函数（出/到站、席别）。

## 函数重组
- 将复杂函数拆分为单一职责：
  - `fetchTrains(params)` → 拆分为：
    - `buildQuery(params)`（组装查询参数）
    - `normalizeTrains(raw, departureDate)`（结构规范化，保留现有字段）
    - `deriveFilterOptions(trains)`（出/到站、席别集合）
    - `updateQueryState(trains)`（设置 `trains`、`filteredTrains`、`queryTimestamp`）
  - 每个函数 ≤ 50 行。
- 合并强关联的顺序流程：
  - 将筛选策略组合为 `applyFilters(trains, filters)` 复合函数，内部按策略映射顺序执行。
- 颗粒度准则：
  - 页面级保留少量编排函数；纯计算收敛到工具函数，避免碎片化。

## 质量保证与测试
- 保持与通过现有测试：
  - 组件测试（旧版）不变：`frontend/test/components/*Train*`。
  - 页面测试引用缺失容器不调整（`TrainsPageContainer.*`），避免引入新的不兼容。
- 新增关键路径测试（新增，不影响旧测试）：
  - `ReserveButton` 规则管线：未登录提示、过期提示、临近发车提示、正常预订分支。
  - `TrainListPage.applyFilters`：各筛选组合的行数与稳定性。
  - `TrainFilterPanel` 日期标签生成：边界与选中态。
- 覆盖率目标：关键分支与异常分支均覆盖；与当前覆盖持平或提升。

## 性能与一致性
- 性能：
  - 使用 `Set` 降低包含判定成本；避免重复遍历（一次派生集合，一次过滤）。
  - 保持现有排序与渲染形态（`TrainList.tsx:27-28`）。
- 一致性：
  - 输出结构与文案不变（如到达日文案、席别标签、错误消息）。
  - 时间计算与过期提示间隔保持一致（`TrainListPage.tsx:88-97`）。

## 代码规范
- 遵循项目 TypeScript/React 约定，保持命名与样式文件不变。
- 在关键函数与策略映射处添加清晰注释与 JSDoc（函数目的、参数、返回值、边界条件）。

## 文档与提交说明
- 技术文档更新：在 `.trae/documents/2-车票查询与筛选/03-车次列表页.md` 增补“筛选策略映射与规则管线”章节与数据结构说明。
- 提交说明（示例）：
  - 重构 `/trains` 页面：
    - 控制流：日期标签 `for→while`；预订逻辑策略化；筛选策略映射化。
    - 数据结构：条件集合 Set 化；字典化过滤。
    - 函数：查询/派生/筛选拆分与复合。
    - 测试：新增 ReserveButton 与筛选关键路径用例。
    - 一致性：I/O 与 UI 不变；性能不低于原实现。

## 风险与回滚
- 风险：筛选与预订逻辑回归风险、日期生成边界偏差。
- 缓解：保留原分支对照的回归测试；最小改动策略（不改字段/文案/排序）。
- 回滚：按提交粒度可快速回退到重构前版本；策略映射保持可替换为原 `if` 分支。