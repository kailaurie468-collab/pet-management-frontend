<template>
  <div class="users-container">
    <el-card class="box-card">
      <template #header>
        <div class="card-header">
          <span class="card-title">系统用户管理</span>
          <el-button type="primary" class="add-btn" @click="dialogVisible = true">
            + 添加用户
          </el-button>
        </div>
      </template>
      <el-table :data="users" style="width: 100%" stripe highlight-current-row>
        <el-table-column prop="id" label="ID" width="80" align="center"></el-table-column>
        <el-table-column prop="username" label="用户名"></el-table-column>
        <el-table-column prop="name" label="姓名"></el-table-column>
        <el-table-column prop="phone" label="电话"></el-table-column>
        <el-table-column prop="role" label="角色">
          <template #default="scope">
            <el-tag :type="scope.row.role === 'admin' ? 'danger' : 'info'" disable-transitions>
              {{ scope.row.role === 'admin' ? '管理员' : '普通用户' }}
            </el-tag>
          </template>
        </el-table-column>
        <el-table-column label="操作" width="180" align="center">
          <template #default="scope">
            <el-button size="small" type="primary" plain @click="handleEdit(scope.row)">编辑</el-button>
            <el-button size="small" type="danger" plain @click="handleDelete(scope.row.id)">删除</el-button>
          </template>
        </el-table-column>
      </el-table>
    </el-card>

    <!-- 添加/编辑用户对话框 -->
    <el-dialog
      v-model="dialogVisible"
      :title="dialogTitle"
      width="500px"
    >
      <el-form :model="form" label-width="80px">
        <el-form-item label="用户名">
          <el-input v-model="form.username"></el-input>
        </el-form-item>
        <el-form-item label="密码">
          <el-input type="password" v-model="form.password"></el-input>
        </el-form-item>
        <el-form-item label="姓名">
          <el-input v-model="form.name"></el-input>
        </el-form-item>
        <el-form-item label="电话">
          <el-input v-model="form.phone"></el-input>
        </el-form-item>
        <el-form-item label="角色">
          <el-select v-model="form.role">
            <el-option label="管理员" value="admin"></el-option>
            <el-option label="宠物主人" value="owner"></el-option>
          </el-select>
        </el-form-item>
      </el-form>
      <template #footer>
        <span class="dialog-footer">
          <el-button @click="dialogVisible = false">取消</el-button>
          <el-button type="primary" @click="handleSubmit">确定</el-button>
        </span>
      </template>
    </el-dialog>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import request from '@/utils/request'

const users = ref([])
const dialogVisible = ref(false)
const dialogTitle = ref('添加用户')
const form = ref({
  id: '',
  username: '',
  password: '',
  name: '',
  phone: '',
  role: ''
})

// 获取用户列表
const getUsers = async () => {
  try {
    const response = await request.get('/api/users')
    users.value = response.data
  } catch (error) {
    console.error('获取用户列表失败:', error)
  }
}

// 添加或更新用户
const handleSubmit = async () => {
  try {
    if (form.value.id) {
      // 更新用户
      await request.put(`/api/users/${form.value.id}`, form.value)
    } else {
      // 添加用户
      await request.post('/api/users', form.value)
    }
    dialogVisible.value = false
    getUsers()
  } catch (error) {
    console.error('保存用户信息失败:', error)
  }
}

// 编辑用户
const handleEdit = (row) => {
  form.value = { ...row }
  dialogTitle.value = '编辑用户'
  dialogVisible.value = true
}

// 删除用户
const handleDelete = async (id) => {
  try {
    await request.delete(`/api/users/${id}`)
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

.card-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.card-title {
  font-size: 18px;
  font-weight: 700;
  color: #1e293b;
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