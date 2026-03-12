<template>
  <div class="health-records-container">
    <el-card class="box-card">
      <template #header>
        <div class="card-header">
          <span class="card-title">健康记录管理</span>
          <el-button type="primary" class="add-btn" @click="dialogVisible = true">
            + 添加健康记录
          </el-button>
        </div>
      </template>
      <el-table :data="healthRecords" style="width: 100%" stripe highlight-current-row>
        <el-table-column prop="id" label="ID" width="80" align="center"></el-table-column>
        <el-table-column label="就诊宠物">
          <template #default="scope">
            {{ getPetName(scope.row.petId) }}
          </template>
        </el-table-column>
        <el-table-column prop="type" label="类型">
          <template #default="scope">
            <el-tag :type="scope.row.type === '疫苗' ? 'success' : 'warning'" disable-transitions>
              {{ scope.row.type }}
            </el-tag>
          </template>
        </el-table-column>
        <el-table-column prop="content" label="内容"></el-table-column>
        <el-table-column prop="recordDate" label="记录日期" :formatter="formatDate"></el-table-column>
        <el-table-column prop="doctor" label="医生"></el-table-column>
        <el-table-column label="操作" width="180" align="center">
          <template #default="scope">
            <el-button size="small" type="primary" plain @click="handleEdit(scope.row)">编辑</el-button>
            <el-button size="small" type="danger" plain @click="handleDelete(scope.row.id)">删除</el-button>
          </template>
        </el-table-column>
      </el-table>
    </el-card>

    <!-- 健康报表导出 -->
    <el-card class="box-card mt-20">
      <template #header>
        <div class="card-header">
          <span class="card-title">健康报表导出</span>
        </div>
      </template>
      <el-form :model="reportForm" label-width="100px">
        <el-form-item label="选择宠物">
          <el-select v-model.number="reportForm.petId" placeholder="按宠物导出">
            <el-option
              v-for="pet in pets"
              :key="pet.id"
              :label="pet.name"
              :value="pet.id"
            />
          </el-select>
        </el-form-item>
        <el-form-item label="开始日期">
          <el-date-picker 
            v-model="reportForm.startDate" 
            type="datetime" 
            format="YYYY-MM-DD HH:mm"
            value-format="YYYY-MM-DD HH:mm"
            placeholder="选择开始日期">
          </el-date-picker>
        </el-form-item>
        <el-form-item label="结束日期">
          <el-date-picker 
            v-model="reportForm.endDate" 
            type="datetime" 
            format="YYYY-MM-DD HH:mm"
            value-format="YYYY-MM-DD HH:mm"
            placeholder="选择结束日期">
          </el-date-picker>
        </el-form-item>
        <el-form-item>
          <el-button type="primary" @click="exportHealthReport">导出报表</el-button>
        </el-form-item>
      </el-form>
    </el-card>

    <!-- 添加/编辑健康记录对话框 -->
    <el-dialog
      v-model="dialogVisible"
      :title="dialogTitle"
      width="500px"
    >
      <el-form :model="form" label-width="80px">
        <el-form-item label="宠物ID">
          <el-input v-model.number="form.petId"></el-input>
        </el-form-item>
        <el-form-item label="类型">
          <el-select v-model="form.type">
            <el-option label="体检" value="checkup"></el-option>
            <el-option label="疫苗" value="vaccine"></el-option>
          </el-select>
        </el-form-item>
        <el-form-item label="内容">
          <el-input type="textarea" v-model="form.content"></el-input>
        </el-form-item>
        <el-form-item label="记录日期">
          <el-date-picker 
            v-model="form.recordDate" 
            type="datetime" 
            format="YYYY-MM-DD HH:mm"
            value-format="YYYY-MM-DD HH:mm"
            placeholder="选择日期">
          </el-date-picker>
        </el-form-item>
        <el-form-item label="医生">
          <el-input v-model="form.doctor"></el-input>
        </el-form-item>
        <el-form-item label="备注">
          <el-input type="textarea" v-model="form.notes"></el-input>
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

const healthRecords = ref([])
const dialogVisible = ref(false)
const dialogTitle = ref('添加健康记录')
const form = ref({
  id: '',
  petId: '',
  type: '',
  content: '',
  recordDate: '',
  doctor: '',
  notes: ''
})
const reportForm = ref({
  petId: '',
  startDate: '',
  startDate: '',
  endDate: ''
})

const pets = ref([])

// 获取宠物列表用于转换名称
const getPets = async () => {
  try {
    const response = await request.get('/api/pets')
    pets.value = response.data
  } catch (error) {
    console.error('获取宠物列表失败:', error)
  }
}

const getPetName = (id) => {
  const pet = pets.value.find(p => p.id === id)
  return pet ? pet.name : id
}

// 日期格式化方法
const formatDate = (row, column, cellValue) => {
  if (!cellValue) return ''
  const d = new Date(cellValue)
  const pad = (n) => n.toString().padStart(2, '0')
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())} ${pad(d.getHours())}:${pad(d.getMinutes())}`
}

// 获取健康记录列表
const getHealthRecords = async () => {
  try {
    const response = await request.get('/api/health-records')
    healthRecords.value = response.data
  } catch (error) {
    console.error('获取健康记录列表失败:', error)
  }
}

// 添加或更新健康记录
const handleSubmit = async () => {
  try {
    if (form.value.id) {
      // 更新健康记录
      await request.put(`/api/health-records/${form.value.id}`, form.value)
    } else {
      // 添加健康记录
      await request.post('/api/health-records', form.value)
    }
    dialogVisible.value = false
    getHealthRecords()
  } catch (error) {
    console.error('保存健康记录失败:', error)
  }
}

// 编辑健康记录
const handleEdit = (row) => {
  form.value = { ...row }
  dialogTitle.value = '编辑健康记录'
  dialogVisible.value = true
}

// 删除健康记录
const handleDelete = async (id) => {
  try {
    await request.delete(`/api/health-records/${id}`)
    getHealthRecords()
  } catch (error) {
    console.error('删除健康记录失败:', error)
  }
}

// 导出健康报表
const exportHealthReport = () => {
  const { petId, startDate, endDate } = reportForm.value
  const start = startDate ? startDate.toISOString().split('T')[0] : ''
  const end = endDate ? endDate.toISOString().split('T')[0] : ''
  const token = localStorage.getItem('token')
  window.open(`/api/health-records/report/${petId}?startDate=${start}&endDate=${end}&token=${token}`)
}

// 组件挂载时获取健康记录列表
onMounted(() => {
  getHealthRecords()
  getPets()
})
</script>

<style scoped>
.health-records-container {
  padding: 20px;
}

.card-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.dialog-footer {
  display: flex;
  justify-content: flex-end;
}

.mt-20 {
  margin-top: 20px;
}
</style>