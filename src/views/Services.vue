<template>
  <div class="services-container">
    <el-card class="box-card">
      <template #header>
        <div class="card-header">
          <span class="card-title">服务项目配置 📋</span>
          <el-button v-if="isAdmin" type="primary" class="add-btn" @click="serviceDialogVisible = true">
            + 新增服务
          </el-button>
        </div>
      </template>
      <el-table :data="services" style="width: 100%" stripe highlight-current-row>
        <el-table-column prop="id" label="ID" width="80" align="center"></el-table-column>
        <el-table-column prop="name" label="服务名称"></el-table-column>
        <el-table-column prop="description" label="详细描述" show-overflow-tooltip></el-table-column>
        <el-table-column prop="price" label="基础价格(元)" width="120"></el-table-column>
        <el-table-column prop="category" label="业务类型" width="120">
          <template #default="scope">
            <el-tag :type="scope.row.category === '医疗' ? 'danger' : 'success'" effect="light">
              {{ scope.row.category }}
            </el-tag>
          </template>
        </el-table-column>
        <el-table-column label="操作" width="150" align="center" v-if="isAdmin">
          <template #default="scope">
            <el-button size="small" type="primary" link @click="handleEditService(scope.row)">编辑</el-button>
            <el-button size="small" type="danger" link @click="handleDeleteService(scope.row.id)">删除</el-button>
          </template>
        </el-table-column>
      </el-table>
    </el-card>

    <el-card class="box-card mt-20">
      <template #header>
        <div class="card-header">
          <span class="card-title">预约就诊记录 🏥</span>
          <el-button type="primary" class="add-btn" @click="handleAddRecord">
            + 登记新服务
          </el-button>
        </div>
      </template>
      <el-table :data="serviceRecords" style="width: 100%" stripe highlight-current-row>
        <el-table-column prop="id" label="ID" width="80" align="center"></el-table-column>
        <el-table-column label="宠物信息">
          <template #default="scope">
            <span class="pet-info-cell">
              <b>{{ getPetName(scope.row.petId) }}</b> 
              <small>({{ getOwnerNameByPetId(scope.row.petId) }})</small>
            </span>
          </template>
        </el-table-column>
        <el-table-column label="服务方案" min-width="150">
          <template #default="scope">
            <el-tooltip :content="getServiceName(scope.row.serviceId)" placement="top">
              <span class="truncate-cell">{{ getServiceName(scope.row.serviceId) }}</span>
            </el-tooltip>
          </template>
        </el-table-column>
        <el-table-column label="负责医生" width="120">
          <template #default="scope">
            <el-tag type="info" v-if="scope.row.doctorId">{{ getDoctorName(scope.row.doctorId) }}</el-tag>
            <span v-else class="text-gray">-</span>
          </template>
        </el-table-column>
        <el-table-column prop="serviceDate" label="日期时间" width="160" :formatter="formatDate"></el-table-column>
        <el-table-column prop="amount" label="总费用(元)" width="120" align="right">
          <template #default="scope">
            <span class="price-text">¥{{ scope.row.amount }}</span>
          </template>
        </el-table-column>
        <el-table-column label="操作" width="150" align="center" v-if="isAdmin">
          <template #default="scope">
            <el-button size="small" type="primary" link @click="handleEditRecord(scope.row)">编辑</el-button>
            <el-button size="small" type="danger" link @click="handleDeleteRecord(scope.row.id)">删除</el-button>
          </template>
        </el-table-column>
      </el-table>
    </el-card>

    <!-- 服务记录弹窗 -->
    <el-dialog
      v-model="recordDialogVisible"
      :title="recordDialogTitle"
      width="550px"
      destroy-on-close
    >
      <el-form :model="recordForm" :rules="recordRules" ref="recordFormRef" label-width="100px" class="service-record-form">
        <!-- 第1步：选择主人 (Cascader 模拟) -->
        <el-form-item label="所属主人" prop="tempOwnerId">
          <el-select v-if="isAdmin" v-model="recordForm.tempOwnerId" placeholder="先搜索确认主人姓名" filterable @change="handleOwnerChange" style="width: 100%">
            <el-option v-for="u in userList" :key="u.id" :label="u.name" :value="u.id" />
          </el-select>
          <el-input v-else :value="currentUser.name" disabled></el-input>
        </el-form-item>

        <!-- 第2步：选择对应用户的宠物 -->
        <el-form-item label="对应宠物" prop="petId">
          <el-select v-model="recordForm.petId" placeholder="请选择该主人下的宠物" style="width: 100%">
            <el-option v-for="p in filteredPets" :key="p.id" :label="p.name + ' (ID:' + p.id + ')'" :value="p.id" />
            <template #empty>
              <div class="empty-pet-tip">
                <p>该用户暂无宠物信息哦 😿</p>
                <el-button type="primary" link @click="goToAddPet">立即去创建宠物档案</el-button>
              </div>
            </template>
          </el-select>
        </el-form-item>

        <el-form-item label="服务项目" prop="serviceIds">
          <el-select v-model="recordForm.serviceIds" multiple placeholder="支持多选服务项目" style="width: 100%" @change="handleMultiServiceChange">
            <el-option
              v-for="svc in services"
              :key="svc.id"
              :label="svc.name + ' (¥' + svc.price + ')'"
              :value="svc.id"
            />
          </el-select>
        </el-form-item>

        <el-row :gutter="20">
          <el-col :span="12">
            <el-form-item label="指定医生">
              <el-select v-model="recordForm.doctorId" placeholder="派单医生" clearable style="width: 100%">
                <el-option v-for="d in doctors" :key="d.id" :label="d.name" :value="d.id" />
              </el-select>
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="服务日期" prop="serviceDate">
              <el-date-picker v-model="recordForm.serviceDate" type="datetime" format="YYYY-MM-DD HH:mm" value-format="YYYY-MM-DD HH:mm" placeholder="预约点" style="width: 100%" />
            </el-form-item>
          </el-col>
        </el-row>

        <el-form-item label="应付总额">
          <el-input v-model.number="recordForm.amount" prefix-icon="Money"><template #prefix>¥</template></el-input>
        </el-form-item>

        <el-form-item label="补充备注">
          <el-input type="textarea" v-model="recordForm.notes" :rows="2"></el-input>
        </el-form-item>
      </el-form>
      <template #footer>
        <span class="dialog-footer">
          <el-button @click="recordDialogVisible = false">取消</el-button>
          <el-button type="primary" @click="handleSubmitRecord">确认登记</el-button>
        </span>
      </template>
    </el-dialog>

    <!-- 服务项目编辑/新增弹窗 (管理员用) -->
    <el-dialog v-model="serviceDialogVisible" :title="serviceDialogTitle" width="500px">
      <el-form :model="serviceForm" :rules="serviceRules" ref="serviceFormRef" label-width="80px">
        <el-form-item label="服务名称" prop="name"><el-input v-model="serviceForm.name"></el-input></el-form-item>
        <el-form-item label="价格(元)" prop="price"><el-input v-model.number="serviceForm.price"></el-input></el-form-item>
        <el-form-item label="类别" prop="category"><el-input v-model="serviceForm.category" placeholder="如医疗、美容"></el-input></el-form-item>
        <el-form-item label="描述"><el-input type="textarea" v-model="serviceForm.description"></el-input></el-form-item>
      </el-form>
      <template #footer>
        <span class="dialog-footer">
          <el-button @click="serviceDialogVisible = false">取消</el-button>
          <el-button type="primary" @click="handleSubmitService">保存配置</el-button>
        </span>
      </template>
    </el-dialog>
  </div>
</template>

<script setup>
import { ref, onMounted, computed } from 'vue'
import { useRouter } from 'vue-router'
import { ElMessage } from 'element-plus'
import { Money } from '@element-plus/icons-vue'
import request from '@/utils/request'

const router = useRouter()
const services = ref([])
const serviceRecords = ref([])
const isAdmin = ref(false)
const currentUser = ref({})
const serviceDialogVisible = ref(false)
const recordDialogVisible = ref(false)
const recordFormRef = ref(null)
const serviceFormRef = ref(null)
const serviceDialogTitle = ref('配置服务方案')
const recordDialogTitle = ref('预约宠物服务')

const serviceForm = ref({
  id: '',
  name: '',
  description: '',
  price: 0,
  category: ''
})

const recordForm = ref({
  id: null,
  tempOwnerId: null,
  petId: null,
  serviceIds: [], // 多选
  doctorId: null,
  serviceDate: '',
  amount: 0,
  notes: ''
})

const recordRules = {
  tempOwnerId: [{ required: true, message: '请先确认主人', trigger: 'change' }],
  petId: [{ required: true, message: '请选择就诊宠物', trigger: 'change' }],
  serviceIds: [{ required: true, message: '请至少选择一项服务', trigger: 'change' }],
  serviceDate: [{ required: true, message: '请选择预约时间', trigger: 'change' }]
}

const serviceRules = {
  name: [{ required: true, message: '请输入服务名称', trigger: 'blur' }],
  price: [{ required: true, message: '请输入价格', trigger: 'blur' }],
  category: [{ required: true, message: '请输入类别', trigger: 'blur' }]
}

const pets = ref([])
const doctors = ref([])
const userList = ref([]) // 所有主人列表

// 过滤出选中主人对应的宠物
const filteredPets = computed(() => {
  if (!recordForm.value.tempOwnerId) return []
  return pets.value.filter(p => p.ownerId === recordForm.value.tempOwnerId)
})

const getDoctors = async () => {
  try {
    const response = await request.get('/api/doctors')
    doctors.value = response.data
  } catch (error) { console.error(error) }
}

const getPets = async () => {
  try {
    const response = await request.get('/api/pets')
    pets.value = response.data
  } catch (error) { console.error(error) }
}

const getUsers = async () => {
  try {
    const response = await request.get('/api/users/role/OWNER')
    userList.value = response.data
  } catch (error) { console.error(error) }
}

const formatDate = (row, column, cellValue) => {
  if (!cellValue) return ''
  return cellValue.replace('T', ' ').substring(0, 16)
}

const getServices = async () => {
  try {
    const response = await request.get('/api/services')
    services.value = response.data
  } catch (error) { console.error(error) }
}

const getServiceRecords = async () => {
  try {
    const response = await request.get('/api/service-records')
    serviceRecords.value = response.data
  } catch (error) { console.error(error) }
}

const handleOwnerChange = () => {
  recordForm.value.petId = null // 切换主人时清空已选宠物
}

const goToAddPet = () => {
  recordDialogVisible.value = false
  router.push('/pets')
}

// 多选服务变更，自动计算总价
const handleMultiServiceChange = (ids) => {
  let total = 0
  ids.forEach(id => {
    const s = services.value.find(item => item.id === id)
    if (s) total += s.price
  })
  recordForm.value.amount = total
}

const handleSubmitService = async () => {
  if (!serviceFormRef.value) return
  await serviceFormRef.value.validate(async (valid) => {
    if (valid) {
      try {
        if (serviceForm.value.id) {
          await request.put(`/api/services/${serviceForm.value.id}`, serviceForm.value)
        } else {
          await request.post('/api/services', serviceForm.value)
        }
        serviceDialogVisible.value = false
        getServices()
        ElMessage.success('操作成功')
      } catch (error) { console.error(error) }
    } else {
      ElMessage.warning('请填写完整的服务配置信息哦 📋')
    }
  })
}

const handleAddRecord = () => {
  recordForm.value = {
    id: null,
    tempOwnerId: currentUser.value.id || null,
    petId: null,
    serviceIds: [],
    doctorId: null,
    serviceDate: '',
    amount: 0,
    notes: ''
  }
  recordDialogTitle.value = '登记新服务'
  recordDialogVisible.value = true
}

const handleSubmitRecord = async () => {
  if (!recordFormRef.value) return
  await recordFormRef.value.validate(async (valid) => {
    if (valid) {
      const payload = { ...recordForm.value, serviceId: recordForm.value.serviceIds.join(',') }
      try {
        if (payload.id) {
          await request.put(`/api/service-records/${payload.id}`, payload)
        } else {
          await request.post('/api/service-records', payload)
        }
        recordDialogVisible.value = false
        getServiceRecords()
        ElMessage.success('服务登记成功')
      } catch (error) { console.error(error) }
    } else {
      ElMessage.warning('请填写完整的登记信息哦 📋')
    }
  })
}

const handleEditService = (row) => {
  serviceForm.value = { ...row }
  serviceDialogTitle.value = '编辑方案'
  serviceDialogVisible.value = true
}

const handleEditRecord = (row) => {
  // 处理回显，这里需要解析 serviceId (逗号字符串)
  const sIds = row.serviceId ? String(row.serviceId).split(',').map(Number) : []
  // 找对应的 ownerId
  const pet = pets.value.find(p => p.id === row.petId)
  recordForm.value = { ...row, serviceIds: sIds, tempOwnerId: pet ? pet.ownerId : null }
  recordDialogTitle.value = '修改服务记录'
  recordDialogVisible.value = true
}

const handleDeleteService = async (id) => {
  try {
    await request.delete(`/api/services/${id}`)
    getServices()
    ElMessage.success('已移除')
  } catch (error) { console.error(error) }
}

const handleDeleteRecord = async (id) => {
  try {
    await request.delete(`/api/service-records/${id}`)
    getServiceRecords()
    ElMessage.success('已撤销')
  } catch (error) { console.error(error) }
}

const getPetName = (id) => {
  const pet = pets.value.find(p => p.id === id)
  return pet ? pet.name : '未知'
}

const getOwnerNameByPetId = (petId) => {
  const pet = pets.value.find(p => p.id === petId)
  if (!pet) return '未知'
  const owner = userList.value.find(u => u.id === pet.ownerId)
  return owner ? owner.name : '加载中'
}

const getServiceName = (id) => {
  // 如果是逗号分隔，拆开显示
  if (!id) return '-'
  const names = String(id).split(',').map(curId => {
    const s = services.value.find(item => item.id == curId)
    return s ? s.name : curId
  })
  return names.join(' + ')
}

const getDoctorName = (id) => {
  const doc = doctors.value.find(d => d.id === id)
  return doc ? doc.name : '-'
}

onMounted(() => {
  const user = JSON.parse(localStorage.getItem('user') || '{}')
  currentUser.value = user
  isAdmin.value = user.role && user.role.toUpperCase() === 'ADMIN'
  
  getServices()
  getServiceRecords()
  getDoctors()
  getPets()
  getUsers()
})
</script>

<style scoped>
.services-container {
  animation: fadeIn 0.4s ease-in-out;
}

.box-card {
  margin-bottom: 24px;
  border-radius: 12px !important;
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
  font-size: 19px;
  font-weight: 700;
  color: #92400e; 
}

.add-btn {
  border-radius: 8px;
  font-weight: 600;
  padding: 8px 22px;
}

.pet-info-cell b {
  color: #b45309;
  font-size: 15px;
}

.pet-info-cell small {
  color: #94a3b8;
  margin-left: 4px;
}

.truncate-cell {
  display: inline-block;
  max-width: 100%;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
  color: #475569;
}

.price-text {
  font-weight: 700;
  color: #e11d48;
  font-size: 15px;
}

.empty-pet-tip {
  padding: 20px;
  text-align: center;
  color: #94a3b8;
}

.empty-pet-tip p {
  margin-bottom: 8px;
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