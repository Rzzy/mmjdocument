# 项目开发规范
> 本文档为 AI Agent 及团队协作的统一规则，所有代码生成、修改、重构必须遵守。

---

## 一、项目基础信息

- **技术栈**：Vue 3.4+ (Composition API)、TypeScript 5.0+、Vite 5.0+
- **状态管理**：Pinia（禁止使用 Vuex）
- **路由**：Vue Router 4.x
- **HTTP 请求**：Axios（统一封装）
- **代码规范**：基于 Airbnb JavaScript Style Guide，适配 Vue 3 生态
- **包管理器**：pnpm（禁止 npm/yarn）

---

## 二、代码风格规范

### 1. 命名规范

| 类型 | 规范 | 示例 |
|------|------|------|
| 组件文件 | PascalCase | `UserProfile.vue` |
| 组合式函数 | camelCase，use 前缀 | `useUserList.ts` |
| 工具函数 | camelCase | `formatDate.ts` |
| 常量 | UPPER_SNAKE_CASE | `API_BASE_URL` |
| 类型/接口 | PascalCase | `UserInfo` |
| 枚举 | PascalCase | `OrderStatus` |
| 变量/函数 | camelCase | `getUserInfo` |
| 文件夹 | kebab-case | `user-center/` |

### 2. Vue 组件规范

```vue
<!-- ✅ 正确示例 -->
<script setup lang="ts">
// 1. imports（按类型分组：外部库 → 内部模块 → 类型）
import { ref, computed, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { useUserStore } from '@/stores/user'
import type { UserInfo } from '@/types'

// 2. props/emits 定义（必须完整类型）
const props = defineProps<{
  userId: string
  readonly?: boolean
}>()

const emit = defineEmits<{
  (e: 'update', value: UserInfo): void
  (e: 'close'): void
}>()

// 3. 组合式函数调用
const router = useRouter()
const userStore = useUserStore()

// 4. 响应式状态
const loading = ref(false)
const userData = ref<UserInfo | null>(null)

// 5. 计算属性
const displayName = computed(() => userData.value?.name ?? '未知用户')

// 6. 方法
const fetchUser = async () => {
  loading.value = true
  try {
    userData.value = await api.getUser(props.userId)
  } finally {
    loading.value = false
  }
}

// 7. 生命周期
onMounted(() => {
  fetchUser()
})
</script>

<template>
  <div class="user-profile">
    <span>{{ displayName }}</span>
  </div>
</template>

<style scoped lang="scss">
.user-profile {
  // 样式
}
</style>
```

### 3. TypeScript 强制要求

- **禁止使用 `any`**：除非有充分理由并添加 `// eslint-disable-next-line @typescript-eslint/no-explicit-any` 注释
- 所有函数必须明确参数类型和返回值类型
- 优先使用 `interface` 定义对象结构，`type` 用于联合类型和工具类型
- 使用 `as const` 定义常量枚举

```typescript
// ❌ 错误
const data: any = {}
function getData(id) { return {} }

// ✅ 正确
const data: Record<string, unknown> = {}
function getData(id: string): UserInfo {
  // ...
}
```

---

## 三、架构与分层原则

### 目录结构（强制）

```
src/
├── app/               # 应用入口（启动、路由、全局布局）
├── pages/             # 页面组装（只做组合，不写业务逻辑）
├── features/          # 核心业务模块（按领域划分）
│   └── [module-name]/
│       ├── api/       # 该模块的接口请求
│       ├── hooks/     # 该模块的组合式函数
│       ├── types/     # 该模块的类型定义
│       ├── components/# 该模块的私有组件
│       └── store/     # 该模块的Pinia store（如有）
├── shared/            # 底层基础（无业务逻辑）
│   ├── ui/            # 通用UI组件（Button/Modal/Input）
│   ├── lib/           # 纯函数工具（纯函数，无副作用）
│   ├── config/        # 全局配置（常量、环境变量）
│   └── types/         # 全局通用类型
└── tests/             # 测试文件
```

### 依赖规则（铁律）

```
app/ → pages/ → features/ → shared/
         ↓
      禁止反向引用
```

- `shared/` **绝不能** 引用 `features/` 或 `pages/`
- `features/` 之间 **不能互相引用**，如需共享代码，下沉到 `shared/`
- `pages/` 只做组合，不写业务逻辑
- **ESLint 强制检查**：禁止反向导入

### 魔法值治理

```typescript
// ❌ 错误：魔法数字/字符串
if (status === 2) { /* 2是什么意思？ */ }
const url = `/api/user/${id}`

// ✅ 正确：常量化
// shared/config/constants.ts
export const ORDER_STATUS = {
  PENDING: 1,
  APPROVED: 2,
  REJECTED: 3,
} as const

export const API_ENDPOINTS = {
  USER: {
    LIST: '/api/user/list',
    DETAIL: (id: string) => `/api/user/${id}`,
  },
} as const

// 使用时
import { ORDER_STATUS, API_ENDPOINTS } from '@/shared/config/constants'
if (status === ORDER_STATUS.APPROVED) { /* 语义清晰 */ }
```

---

## 四、质量门槛

### 1. 提交前检查

- [ ] TypeScript 编译无错误：`pnpm type-check`
- [ ] ESLint 检查通过：`pnpm lint`
- [ ] 所有单元测试通过：`pnpm test`
- [ ] 无 `console.log`、`debugger` 残留（开发调试除外）
- [ ] 新增功能有对应单元测试

### 2. 测试要求

- 单元测试框架：Vitest
- 核心工具函数必须有单元测试
- 业务逻辑通过组合式函数测试覆盖

### 3. 性能基线

- 单文件组件 `<script>` 代码不超过 300 行（不含 template/style）
- 组合式函数不超过 200 行
- 单个函数不超过 50 行（超过需拆分）

---

## 五、常见陷阱与最佳实践

### 1. 响应式最佳实践

```typescript
// ❌ 错误：解构丢失响应式
const { name, age } = userStore

// ✅ 正确：使用 storeToRefs
import { storeToRefs } from 'pinia'
const { name, age } = storeToRefs(userStore)
```

### 2. 副作用管理

- 副作用（API 请求、定时器、事件监听）放在 `onMounted` 或组合式函数中
- 必须在 `onUnmounted` 中清理定时器和事件监听

```typescript
// ✅ 正确：自动清理
const timer = ref<ReturnType<typeof setInterval> | null>(null)
onMounted(() => {
  timer.value = setInterval(() => { /* ... */ }, 1000)
})
onUnmounted(() => {
  if (timer.value) clearInterval(timer.value)
})
```

### 3. 组合式函数规范

- 文件命名：`useXxx.ts`
- 返回值使用对象而非数组（便于按需解构）
- 组合式函数内只封装逻辑，不包含模板

---

## 六、安全与禁止操作

### 黑名单（禁止使用）

- ❌ `var` → 使用 `const` / `let`
- ❌ `any` → 定义明确类型
- ❌ `==` → 使用 `===`
- ❌ Vuex → 使用 Pinia
- ❌ Options API → 使用 Composition API + `<script setup>`
- ❌ 未处理的 Promise → 必须 `.catch` 或 `try/catch`
- ❌ 硬编码敏感信息（密钥、密码）→ 使用环境变量

### 环境变量规范

```typescript
// shared/config/env.ts
export const getEnv = (key: keyof ImportMetaEnv): string => {
  const value = import.meta.env[key]
  if (value === undefined) {
    throw new Error(`环境变量 ${key} 未配置`)
  }
  return value
}

// 使用时
const API_URL = getEnv('VITE_API_URL') // 类型安全，缺失即报错
```

---

## 七、Agent 协作指引

- **代码生成**：严格遵循上述规范，优先使用 `shared/` 的现有工具和常量
- **重构操作**：每次修改一个模块，完成后运行 `pnpm type-check && pnpm test`
- **不确定时**：询问用户或在文档中搜索，不要臆测 API 用法
- **遇到规范冲突**：以本文件为准，如有疑问向用户确认

---

*本文件随项目演进持续更新，重大变更需团队评审。*