<template>
  <div class="services-container">
    <el-card class="box-card">
      <template #header>
        <div class="card-header">
          <span class="card-title">服务项目管理</span>
          <el-button v-if="isAdmin" type="primary" class="add-btn" @click="serviceDialogVisible = true">
            + 添加服务项目
          </el-button>
        </div>
      </template>
      <el-table :data="services" style="width: 100%" stripe highlight-current-row>
        <el-table-column prop="id" label="ID" width="80" align="center"></el-table-column>
        <el-table-column prop="name" label="服务名称"></el-table-column>
        <el-table-column prop="description" label="描述"></el-table-column>
        <el-table-column prop="price" label="价格"></el-table-column>
        <el-table-column prop="category" label="类别">
          <template #default="scope">
            <el-tag :type="scope.row.category === '医疗' ? 'danger' : 'success'" disable-transitions>
              {{ scope.row.category }}
            </el-tag>
          </template>
        </el-table-column>
        <el-table-column label="操作" width="180" align="center" v-if="isAdmin">
          <template #default="scope">
            <el-button size="small" type="primary" plain @click="handleEditService(scope.row)">编辑</el-button>
            <el-button size="small" type="danger" plain @click="handleDeleteService(scope.row.id)">删除</el-button>
          </template>
        </el-table-column>
      </el-table>
    </el-card>

    <el-card class="box-card mt-20">
      <template #header>
        <div class="card-header">
          <span class="card-title">服务记录管理</span>
          <el-button type="primary" class="add-btn" @click="handleAddRecord">
            + 预约服务
          </el-button>
        </div>
      </template>
      <el-table :data="serviceRecords" style="width: 100%" stripe highlight-current-row>
        <el-table-column prop="id" label="ID" width="80" align="center"></el-table-column>
        <el-table-column label="就诊宠物">
          <template #default="scope">
            {{ getPetName(scope.row.petId) }}
          </template>
        </el-table-column>
        <el-table-column label="服务项目">
          <template #default="scope">
            {{ getServiceName(scope.row.serviceId) }}
          </template>
        </el-table-column>
        <el-table-column label="主治大夫">
          <template #default="scope">
            <el-tag type="info" disable-transitions v-if="scope.row.doctorId">
              {{ getDoctorName(scope.row.doctorId) }}
            </el-tag>
            <span v-else>未指派</span>
          </template>
        </el-table-column>
        <el-table-column prop="serviceDate" label="服务日期" :formatter="formatDate"></el-table-column>
        <el-table-column prop="amount" label="金额(元)"></el-table-column>
        <el-table-column label="操作" width="180" align="center" v-if="isAdmin">
          <template #default="scope">
            <el-button size="small" type="primary" plain @click="handleEditRecord(scope.row)">编辑</el-button>
            <el-button size="small" type="danger" plain @click="handleDeleteRecord(scope.row.id)">删除</el-button>
          </template>
        </el-table-column>
      </el-table>
    </el-card>

    <!-- 添加/编辑服务项目对话框 -->
    <el-dialog
      v-model="serviceDialogVisible"
      :title="serviceDialogTitle"
      width="500px"
    >
      <el-form :model="serviceForm" label-width="80px">
        <el-form-item label="服务名称">
          <el-input v-model="serviceForm.name"></el-input>
        </el-form-item>
        <el-form-item label="描述">
          <el-input type="textarea" v-model="serviceForm.description"></el-input>
        </el-form-item>
        <el-form-item label="价格">
          <el-input v-model.number="serviceForm.price"></el-input>
        </el-form-item>
        <el-form-item label="类别">
          <el-input v-model="serviceForm.category"></el-input>
        </el-form-item>
      </el-form>
      <template #footer>
        <span class="dialog-footer">
          <el-button @click="serviceDialogVisible = false">取消</el-button>
          <el-button type="primary" @click="handleSubmitService">确定</el-button>
        </span>
      </template>
    </el-dialog>

    <!-- 添加/编辑服务记录对话框 -->
    <el-dialog
      v-model="recordDialogVisible"
      :title="recordDialogTitle"
      width="500px"
    >
      <el-form :model="recordForm" label-width="80px">
        <el-form-item label="选择宠物">
          <el-select v-model="recordForm.petId" placeholder="请选择就诊宠物">
            <el-option
              v-for="pet in pets"
              :key="pet.id"
              :label="pet.name"
              :value="pet.id"
            />
          </el-select>
        </el-form-item>
        <el-form-item label="服务项目">
          <el-select v-model="recordForm.serviceId" placeholder="请选择服务方案" @change="handleServiceChange">
            <el-option
              v-for="svc in services"
              :key="svc.id"
              :label="svc.name + ' - ' + svc.price + '元'"
              :value="svc.id"
            />
          </el-select>
        </el-form-item>
        <el-form-item label="指定医生">
          <el-select v-model="recordForm.doctorId" placeholder="不指定则系统随机派单" clearable>
            <el-option
              v-for="doctor in doctors"
              :key="doctor.id"
              :label="doctor.name + ' (' + doctor.skills + ')'"
              :value="doctor.id"
            />
          </el-select>
        </el-form-item>
        <el-form-item label="服务日期">
          <el-date-picker 
            v-model="recordForm.serviceDate" 
            type="datetime" 
            format="YYYY-MM-DD HH:mm"
            value-format="YYYY-MM-DD HH:mm"
            placeholder="选择服务时间">
          </el-date-picker>
        </el-form-item>
        <el-form-item label="金额">
          <el-input v-model.number="recordForm.amount"></el-input>
        </el-form-item>
        <el-form-item label="备注">
          <el-input type="textarea" v-model="recordForm.notes"></el-input>
        </el-form-item>
      </el-form>
      <template #footer>
        <span class="dialog-footer">
          <el-button @click="recordDialogVisible = false">取消</el-button>
          <el-button type="primary" @click="handleSubmitRecord">确定</el-button>
        </span>
      </template>
    </el-dialog>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import request from '@/utils/request'

const services = ref([])
const serviceRecords = ref([])
const isAdmin = ref(false)
const serviceDialogVisible = ref(false)
const recordDialogVisible = ref(false)
const serviceDialogTitle = ref('添加服务项目')
const recordDialogTitle = ref('添加服务记录')

const serviceForm = ref({
  id: '',
  name: '',
  description: '',
  price: '',
  category: ''
})

const recordForm = ref({
  id: '',
  petId: '',
  serviceId: '',
  doctorId: '',
  serviceDate: '',
  amount: '',
  notes: ''
})

const pets = ref([])
const doctors = ref([])

// 获取医生列表
const getDoctors = async () => {
  try {
    const response = await request.get('/api/doctors')
    doctors.value = response.data
  } catch (error) {
    console.error('获取医生列表失败:', error)
  }
}

// 获取全部宠物列表供下拉菜单回显
const getPets = async () => {
  try {
    const response = await request.get('/api/pets')
    pets.value = response.data
  } catch (error) {
    console.error('获取宠物列表失败:', error)
  }
}

// 工具函数：日期格式化
const formatDate = (row, column, cellValue) => {
  if (!cellValue) return ''
  const d = new Date(cellValue)
  const pad = (n) => n.toString().padStart(2, '0')
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())} ${pad(d.getHours())}:${pad(d.getMinutes())}`
}

// 获取服务项目列表
const getServices = async () => {
  try {
    const response = await request.get('/api/services')
    services.value = response.data
  } catch (error) {
    console.error('获取服务项目列表失败:', error)
  }
}

// 获取服务记录列表
const getServiceRecords = async () => {
  try {
    const response = await request.get('/api/service-records')
    serviceRecords.value = response.data
  } catch (error) {
    console.error('获取服务记录列表失败:', error)
  }
}

// 添加或更新服务项目
const handleSubmitService = async () => {
  try {
    if (serviceForm.value.id) {
      // 更新服务项目
      await request.put(`/api/services/${serviceForm.value.id}`, serviceForm.value)
    } else {
      // 添加服务项目
      await request.post('/api/services', serviceForm.value)
    }
    serviceDialogVisible.value = false
    getServices()
  } catch (error) {
    console.error('保存服务项目失败:', error)
  }
}

// 添加服务记录的弹窗内更替处理
const handleServiceChange = (val) => {
  const selectedService = services.value.find(s => s.id === val)
  if (selectedService) {
    recordForm.value.amount = selectedService.price
  }
}

// 开启预约服务表单
const handleAddRecord = () => {
  recordForm.value = {
    id: null,
    petId: null,
    serviceId: null,
    doctorId: null,
    serviceDate: '',
    amount: null,
    notes: ''
  }
  recordDialogTitle.value = '预约服务'
  recordDialogVisible.value = true
}

// 添加或更新服务记录
const handleSubmitRecord = async () => {
  try {
    if (recordForm.value.id) {
      // 更新服务记录
      await request.put(`/api/service-records/${recordForm.value.id}`, recordForm.value)
    } else {
      // 添加服务记录
      await request.post('/api/service-records', recordForm.value)
    }
    recordDialogVisible.value = false
    getServiceRecords()
  } catch (error) {
    console.error('保存服务记录失败:', error)
  }
}

// 编辑服务项目
const handleEditService = (row) => {
  serviceForm.value = { ...row }
  serviceDialogTitle.value = '编辑服务项目'
  serviceDialogVisible.value = true
}

// 编辑服务记录
const handleEditRecord = (row) => {
  recordForm.value = { ...row }
  recordDialogTitle.value = '编辑服务记录'
  recordDialogVisible.value = true
}

// 删除服务项目
const handleDeleteService = async (id) => {
  try {
    await request.delete(`/api/services/${id}`)
    getServices()
  } catch (error) {
    console.error('删除服务项目失败:', error)
  }
}

// 删除服务记录
const handleDeleteRecord = async (id) => {
  try {
    await request.delete(`/api/service-records/${id}`)
    getServiceRecords()
  } catch (error) {
    console.error('删除服务记录失败:', error)
  }
}

// 取名字辅助函数
const getPetName = (id) => {
  const pet = pets.value.find(p => p.id === id)
  return pet ? pet.name : id
}

const getServiceName = (id) => {
  const svc = services.value.find(s => s.id === id)
  return svc ? svc.name : id
}

const getDoctorName = (id) => {
  const doc = doctors.value.find(d => d.id === id)
  return doc ? doc.name : id
}

// 组件挂载时获取数据
onMounted(() => {
  const userStr = localStorage.getItem('user')
  if (userStr) {
    try {
      const user = JSON.parse(userStr)
      isAdmin.value = user.role === 'admin'
    } catch (e) {}
  }
  
  getServices()
  getServiceRecords()
  getDoctors()
  getPets()
})
</script>

<style scoped>
.services-container {
  animation: fadeIn 0.4s ease-in-out;
}

.box-card {
  margin-bottom: 24px;
}

.mt-20 {
  margin-top: 20px;
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