## 项目识别与约束
- 外部只读项目：`/e:/LQiu/CS3604/12306_Follow/Our-12306-CS3604-modify-personal-center-ui/`
- 当前实现目标：在本仓库中以独立目录实现并对齐外部项目的“注册”后端逻辑，保持与外部项目完全隔离；不修改外部项目文件
- 当前项目已有等效注册实现，后续以“核对一致性 + 差异对齐 + 测试验证”为主

## 完整逻辑分析（外部项目 /register）
- 路由处理逻辑
  - 路由文件：`.../backend/src/routes/register.js:11-66`
  - 基础路径挂载：`/api/register`，端点包括：
    - `POST /validate-username`
    - `POST /validate-password`
    - `POST /validate-name`
    - `POST /validate-idcard`
    - `POST /validate-email`
    - `POST /validate-phone`
    - `POST /`（提交注册）
    - `POST /send-verification-code`（发送验证码）
    - `POST /complete`（完成注册）
    - `GET /service-terms`、`GET /privacy-policy`（条款/隐私）
  - 挂载位置：`.../backend/src/app.js:28-36`（`/api/register` 与 `/api/terms`）
- 请求参数验证机制
  - 控制器：`.../backend/src/controllers/registerController.js`
  - 规则要点：
    - 用户名长度 6-30、字母开头、`[a-zA-Z0-9_]`（`registerController.js:21-43`）
    - 密码长度≥6、仅`[a-zA-Z0-9_]`，至少两类（字母/数字/下划线）（`70-103`）
    - 姓名字符长度（汉字算2）、允许中文/英文/点/单空格（`120-155`）
    - 证件号仅字母数字、长度18（`168-197`）
    - 邮箱正则校验（`209-239`），空值视为通过
    - 手机号 11 位纯数字（`245-276`）
    - 注册提交必填字段、密码一致性、必须同意条款（`282-318`）
    - 完成注册阶段验证码校验（短信/邮箱）（`469-491`）
- 数据库操作流程
  - 服务层：`.../backend/src/services/registrationDbService.js`
  - 查重：用户名/证件类型+号码/手机号/邮箱（`10-76`）
  - 创建用户：`bcrypt` 加密密码、写入 `users` 表（唯一约束冲突映射友好错误）（`81-127`）
  - 短信验证码：生成 6 位、5 分钟有效、记录 `verification_codes`（`212-229`）；校验并标记使用（`235-291`）
  - 邮箱验证码：生成 6 位、10 分钟有效、记录 `email_verification_codes`，并校验/标记（`132-205`）
  - 会话管理：`.../backend/src/services/sessionService.js`（创建/获取/删除会话、验证码发送频率 1 分钟限制）（`10-43, 48-71, 76-86, 91-107, 114-131`）
  - 数据库连接与表：`.../backend/src/services/dbService.js` 初始化 `users/verification_codes/email_verification_codes/sessions`，并提供 `get/all/run`（`26-91, 123-160`）
  - 乘客逻辑：注册成功后自动添加本人为乘客（`registerController.js:498-511`；`.../backend/src/services/passengerService.js:202-258`）
- 业务规则实现
  - 全局唯一性约束与人身标识一致性（用户名/证件/手机号/邮箱）
  - 验证码通道限流：1 分钟频率限制（短信/邮箱）
  - 验证码时效：短信 5 分钟、邮箱 10 分钟
  - 会话封装注册信息，完成后清理会话
  - 自动建立“本人乘车人”记录（失败仅记录，不阻断注册）
- 错误处理机制
  - 就地 try/catch，返回 `400/409/429/500`（`registerController.js` 各方法）
  - 数据层唯一约束映射到中文文案（`registrationDbService.js:109-126`）
  - 应用级错误中间件（`.../backend/src/app.js:43-52`）
- 响应格式规范
  - 校验端点返回 `{valid:boolean, message|error}`
  - 注册提交返回 `{message, sessionId}`（`201`）
  - 验证码发送返回 `{message, verificationCode}`（开发模式便于联调）
  - 完成注册返回 `{message, userId}`（`201`）

## 当前项目对比与差异点
- 当前项目等效实现：
  - 路由：`backend/src/routes/register.js:11-23`
  - 控制器：`backend/src/controllers/registerController.js:17-238`
  - 数据库服务：`backend/src/services/registrationDbService.js:14-290`
  - 会话服务：`backend/src/services/sessionService.js:10-129`
  - 数据库初始化：`backend/src/services/dbService.js:37-146`
- 主要差异：
  - 频率控制：外部项目短信频率含 `purpose` 字段（`sessionService.js:114-131`、DB 迁移 `purpose` 列），当前项目为通用短信频率；可保持现状或在新模块中扩展
  - 自动添加乘客：外部项目在完成注册时尝试添加乘客；当前项目控制器未集成此段逻辑（可按需引入，容错不阻断注册）
  - 错误文案：当前项目复用 `messages` 常量（`backend/src/constants/messages.js`），外部项目文案直接写死；迁移时统一走常量

## 迁移实施方案（独立目录）
- 新建目录：`backend/modules/register-migrated/`
  - `routes/register.js`：导出路由，与当前 `app.js` 挂载保持一致（`/api/register`、`/api/terms`）
  - `controllers/registerController.js`：以外部项目为基准合并实现，统一错误文案走 `messages`，保留所有校验/会话/验证码/完成注册流程；可选增加“自动添加乘客”逻辑（容错）
  - `services/registrationDbService.js`：沿用当前项目 `dbService`，保留参数化查询与 `bcrypt`，完整覆盖查重/创建用户/验证码生成与校验
  - `services/sessionService.js`：沿用现有版本；如需 `purpose` 频率控制，新增独立方法且仅在本模块使用，避免影响全局
- 依赖与配置
  - 依赖复用：`express/sqlite3/bcryptjs/uuid/cors/helmet/dotenv` 已在 `backend/package.json:13-23` 中存在
  - 数据库：沿用当前项目 `DB_PATH/TEST_DB_PATH` 环境变量；不改变全局 `dbService`
  - 安全：继续使用参数化查询、`bcrypt` 盐值 10、输入校验、频率限制
- 集成方式
  - 在 `backend/src/app.js` 增加（或切换到）新模块路由导入；保留原路由以便快速回滚
  - 条款路由与注册路由同模块导出，防止分散

## 测试与验证
- 单元测试
  - 复用并扩展现有用例：`backend/test/routes/register.test.js:31-741`、`backend/test/services/registrationDbService.test.js`
  - 新增用例：
    - 自动添加乘客的容错路径（创建失败不阻断注册）
    - 短信/邮箱频率限制边界（1 分钟窗口）
    - 验证码过期与已用状态覆盖
- 集成测试
  - 端到端：注册→发送验证码→完成注册→登录；
  - 前端交互：通过已启动的 `vite` 前端与 `/api/register` 联调（代理 `vite.config.ts:7-14`）
- 性能测试
  - 使用 `supertest` 记录关键端点 P95 响应时间；数据量基线下目标 `< 100ms`（本地 SQLite）
  - 并发模拟：`artillery/k6` 脚本（可选）对验证码发送频率控制进行压力验证
- 安全测试
  - 输入校验绕过、SQL 注入验证（参数化查询已防护）
  - 速率限制与验证码重放；会话过期清理验证

## 交付步骤
- 创建 `backend/modules/register-migrated/` 并加入上述文件
- 在 `backend/src/app.js` 引入并挂载新路由，保留旧路由以便对比
- 运行与修复测试（单元/集成），生成覆盖率报告
- 记录差异与回滚方案；在确认通过后再切换默认使用新模块

## 文件参考索引
- 外部路由：`Our-12306-.../backend/src/routes/register.js:11-66`
- 外部控制器：`Our-12306-.../backend/src/controllers/registerController.js:17-573`
- 外部注册DB服务：`Our-12306-.../backend/src/services/registrationDbService.js:14-294`
- 外部会话服务：`Our-12306-.../backend/src/services/sessionService.js:10-134`
- 外部 DB 服务：`Our-12306-.../backend/src/services/dbService.js:10-121, 123-181`
- 当前路由：`backend/src/routes/register.js:11-29`
- 当前控制器：`backend/src/controllers/registerController.js:17-238`
- 当前注册DB服务：`backend/src/services/registrationDbService.js:14-290`
- 当前会话服务：`backend/src/services/sessionService.js:10-129`
- 当前 DB 服务：`backend/src/services/dbService.js:37-146`

请确认以上计划；确认后我将在独立目录中完成迁移与测试，并不改动外部项目。