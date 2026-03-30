<template>
  <div class="doctors-container">
    <el-card class="box-card">
      <template #header>
        <div class="card-header">
          <span class="card-title">专家名录</span>
          <el-button v-if="isAdmin" type="primary" class="add-btn" @click="handleAdd">
            + 添加医生
          </el-button>
        </div>
      </template>

      <el-table :data="doctors" style="width: 100%" stripe highlight-current-row>
        <el-table-column prop="id" label="ID" width="80" align="center"></el-table-column>
        <el-table-column prop="name" label="姓名" width="120">
          <template #default="scope">
            <span style="font-weight: bold">{{ scope.row.name }}</span>
          </template>
        </el-table-column>
        <el-table-column prop="experienceYears" label="从业年限" width="100" align="center">
          <template #default="scope">
            <el-tag type="info">{{ scope.row.experienceYears }} 年</el-tag>
          </template>
        </el-table-column>
        <el-table-column prop="skills" label="擅长技能" width="200"></el-table-column>
        <el-table-column prop="introduction" label="专家介绍"></el-table-column>
        
        <el-table-column label="操作" width="180" align="center" v-if="isAdmin">
          <template #default="scope">
            <el-button size="small" type="primary" plain @click="handleEdit(scope.row)">编辑</el-button>
            <el-button size="small" type="danger" plain @click="handleDelete(scope.row.id)">删除</el-button>
          </template>
        </el-table-column>
      </el-table>
    </el-card>

    <el-dialog
      v-model="dialogVisible"
      :title="dialogTitle"
      width="500px"
    >
      <el-form :model="form" label-width="80px">
        <el-form-item label="姓名">
          <el-input v-model="form.name" placeholder="医生姓名"></el-input>
        </el-form-item>
        <el-form-item label="从业年限">
          <el-input-number v-model="form.experienceYears" :min="0" placeholder="年限"></el-input-number>
        </el-form-item>
        <el-form-item label="擅长技能">
          <el-input type="textarea" v-model="form.skills" placeholder="例如：犬科、猫科、外科手术..."></el-input>
        </el-form-item>
        <el-form-item label="医生介绍">
          <el-input type="textarea" :rows="3" v-model="form.introduction" placeholder="医生的详细履历等"></el-input>
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

const doctors = ref([])
const isAdmin = ref(false)
const dialogVisible = ref(false)
const dialogTitle = ref('添加医生')

const form = ref({
  id: null,
  name: '',
  experienceYears: 0,
  skills: '',
  introduction: ''
})

const getDoctors = async () => {
  try {
    const response = await request.get('/api/doctors')
    doctors.value = response.data
  } catch (error) {
    console.error('获取医生列表失败:', error)
  }
}

const handleAdd = () => {
  form.value = {
    id: null,
    name: '',
    experienceYears: 0,
    skills: '',
    introduction: ''
  }
  dialogTitle.value = '添加医生'
  dialogVisible.value = true
}

const handleSubmit = async () => {
  try {
    if (form.value.id) {
      await request.put(`/api/doctors/${form.value.id}`, form.value)
    } else {
      await request.post('/api/doctors', form.value)
    }
    dialogVisible.value = false
    getDoctors()
  } catch (error) {
    console.error('保存医生信息失败:', error)
  }
}

const handleEdit = (row) => {
  form.value = { ...row }
  dialogTitle.value = '编辑医生'
  dialogVisible.value = true
}

const handleDelete = async (id) => {
  try {
    await request.delete(`/api/doctors/${id}`)
    getDoctors()
  } catch (error) {
    console.error('删除医生失败:', error)
  }
}

onMounted(() => {
  const userStr = localStorage.getItem('user')
  if (userStr) {
    try {
      const user = JSON.parse(userStr)
      isAdmin.value = user.role && user.role.toUpperCase() === 'ADMIN'
    } catch (e) {}
  }
  getDoctors()
})
</script>

<style scoped>
.doctors-container {
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
</style>
