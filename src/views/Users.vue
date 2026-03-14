<template>
  <div class="users-container">
    <!-- 搜索筛选栏 -->
    <el-card class="search-card box-card">
      <el-form :inline="true" :model="searchForm" class="search-form">
        <el-form-item label="姓名">
          <el-input v-model="searchForm.name" placeholder="用户姓名" clearable @clear="getUsers" />
        </el-form-item>
        <el-form-item label="住址">
          <el-input v-model="searchForm.address" placeholder="模糊地址" clearable @clear="getUsers" />
        </el-form-item>
        <el-form-item label="身份证">
          <el-input v-model="searchForm.identCard" placeholder="身份证号" clearable @clear="getUsers" />
        </el-form-item>
        <el-form-item>
          <el-button type="primary" :icon="Search" @click="getUsers">查询</el-button>
          <el-button @click="resetSearch">重置</el-button>
        </el-form-item>
      </el-form>
    </el-card>

    <el-card class="box-card">
      <template #header>
        <div class="card-header">
          <span class="card-title">系统用户管理 👥</span>
          <el-button type="primary" class="add-btn" @click="handleAdd">
            + 添加用户
          </el-button>
        </div>
      </template>
      <el-table :data="users" style="width: 100%" stripe highlight-current-row>
        <el-table-column prop="id" label="ID" width="70" align="center"></el-table-column>
        <el-table-column prop="username" label="用户名" width="120"></el-table-column>
        <el-table-column prop="name" label="姓名" width="100"></el-table-column>
        <el-table-column prop="phone" label="电话" width="130"></el-table-column>
        <el-table-column prop="address" label="住址" show-overflow-tooltip></el-table-column>
        <el-table-column prop="identCard" label="身份证" width="180"></el-table-column>
        <el-table-column prop="role" label="角色" width="100">
          <template #default="scope">
            <el-tag :type="scope.row.role === 'ADMIN' ? 'danger' : 'success'" disable-transitions>
              {{ scope.row.role === 'ADMIN' ? '管理员' : '宠物主人' }}
            </el-tag>
          </template>
        </el-table-column>
        <el-table-column label="操作" width="150" align="center">
          <template #default="scope">
            <el-button size="small" type="primary" link @click="handleEdit(scope.row)">编辑</el-button>
            <el-button size="small" type="danger" link @click="handleDelete(scope.row.id)">删除</el-button>
          </template>
        </el-table-column>
      </el-table>
    </el-card>

    <!-- 添加/编辑用户对话框 -->
    <el-dialog
      v-model="dialogVisible"
      :title="dialogTitle"
      width="550px"
      destroy-on-close
    >
      <el-form :model="form" ref="userFormRef" :rules="rules" label-width="100px" class="user-form">
        <el-row :gutter="20">
          <el-col :span="12">
            <el-form-item label="用户名" prop="username">
              <el-input v-model="form.username" :disabled="!!form.id"></el-input>
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="密码" :prop="form.id ? '' : 'password'">
              <el-input type="password" v-model="form.password" :placeholder="form.id ? '留空表示不修改' : '登录密码'"></el-input>
            </el-form-item>
          </el-col>
        </el-row>
        
        <el-row :gutter="20">
          <el-col :span="12">
            <el-form-item label="真实姓名" prop="name">
              <el-input v-model="form.name"></el-input>
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="联系电话" prop="phone">
              <el-input v-model="form.phone"></el-input>
            </el-form-item>
          </el-col>
        </el-row>

        <el-form-item label="详细住址">
          <el-input v-model="form.address" placeholder="联系地址"></el-input>
        </el-form-item>

        <el-form-item label="身份证号">
          <el-input v-model="form.identCard" placeholder="18位证件号"></el-input>
        </el-form-item>

        <el-form-item label="系统角色" prop="role">
          <el-select v-model="form.role" style="width: 100%">
            <el-option label="管理员" value="ADMIN"></el-option>
            <el-option label="宠物主人" value="OWNER"></el-option>
          </el-select>
        </el-form-item>
      </el-form>
      <template #footer>
        <span class="dialog-footer">
          <el-button @click="dialogVisible = false">取消</el-button>
          <el-button type="primary" @click="handleSubmit">确定保存</el-button>
        </span>
      </template>
    </el-dialog>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { ElMessage } from 'element-plus'
import { Search } from '@element-plus/icons-vue'
import request from '@/utils/request'

const users = ref([])
const dialogVisible = ref(false)
const userFormRef = ref(null)
const dialogTitle = ref('添加用户')

const searchForm = ref({
  name: '',
  address: '',
  identCard: ''
})

const form = ref({
  id: '',
  username: '',
  password: '',
  name: '',
  phone: '',
  address: '',
  identCard: '',
  role: 'OWNER'
})

const rules = {
  username: [{ required: true, message: '请输入账户用户名', trigger: 'blur' }],
  password: [{ required: true, message: '请输入登录密码', trigger: 'blur' }],
  name: [{ required: true, message: '请输入真实姓名', trigger: 'blur' }],
  role: [{ required: true, message: '请分配系统角色', trigger: 'change' }]
}

// 获取用户列表（支持搜索）
const getUsers = async () => {
  try {
    const params = {}
    if (searchForm.value.name) params.name = searchForm.value.name
    if (searchForm.value.address) params.address = searchForm.value.address
    if (searchForm.value.identCard) params.identCard = searchForm.value.identCard
    
    const response = await request.get('/api/users', { params })
    users.value = response.data
  } catch (error) {
    console.error('获取用户列表失败:', error)
  }
}

const resetSearch = () => {
  searchForm.value = { name: '', address: '', identCard: '' }
  getUsers()
}

const handleAdd = () => {
  form.value = {
    id: '',
    username: '',
    password: '',
    name: '',
    phone: '',
    address: '',
    identCard: '',
    role: 'OWNER'
  }
  dialogTitle.value = '添加系统用户'
  dialogVisible.value = true
}

// 添加或更新用户
const handleSubmit = async () => {
  if (!userFormRef.value) return
  
  await userFormRef.value.validate(async (valid) => {
    if (valid) {
      try {
        if (form.value.id) {
          await request.put(`/api/users/${form.value.id}`, form.value)
          ElMessage.success('用户信息已更新 ✨')
        } else {
          await request.post('/api/users', form.value)
          ElMessage.success('用户创建成功 🚀')
        }
        dialogVisible.value = false
        getUsers()
      } catch (error) {
        // 后端可能返回 500 或 400 带有错误提示
        const errorMsg = error.response?.data?.message || '操作失败，请检查用户名是否已存在 🐾'
        ElMessage.error(errorMsg)
      }
    }
  })
}

// 编辑用户
const handleEdit = (row) => {
  form.value = { ...row, password: '' } // 编辑时不回显密码
  dialogTitle.value = '编辑用户信息'
  dialogVisible.value = true
}

// 删除用户
const handleDelete = async (id) => {
  try {
    await request.delete(`/api/users/${id}`)
    ElMessage.success('已删除该用户')
    getUsers()
  } catch (error) {
    console.error('删除用户失败:', error)
  }
}

// 组件挂载时获取用户列表
onMounted(() => {
  getUsers()
})
</script>

<style scoped>
.users-container {
  animation: fadeIn 0.4s ease-in-out;
}

.box-card {
  margin-bottom: 20px;
}

.search-card {
  background-color: #fffbeb !important;
  border: 1px dashed #fcd34d !important;
}

.search-form {
  padding-top: 18px;
}

.card-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.card-title {
  font-size: 18px;
  font-weight: 700;
  color: #92400e; 
}

.add-btn {
  border-radius: 8px;
  font-weight: 600;
  padding: 8px 20px;
}

.dialog-footer {
  display: flex;
  justify-content: flex-end;
  gap: 12px;
}

@keyframes fadeIn {
  from { opacity: 0; transform: translateY(10px); }
  to { opacity: 1; transform: translateY(0); }
}
</style>