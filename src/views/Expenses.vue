<template>
  <div class="expenses-container">
    <el-card class="box-card">
      <template #header>
        <div class="card-header">
          <span class="card-title">费用核算与查询</span>
        </div>
      </template>
      <el-form :model="expenseForm" label-width="100px">
        <el-form-item label="选择宠物">
          <el-select v-model.number="expenseForm.petId" placeholder="请选择要查询的宠物">
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
            v-model="expenseForm.startDate" 
            type="datetime" 
            format="YYYY-MM-DD HH:mm"
            value-format="YYYY-MM-DD HH:mm"
            placeholder="选择开始日期" 
            style="width: 100%">
          </el-date-picker>
        </el-form-item>
        <el-form-item label="结束日期">
          <el-date-picker 
            v-model="expenseForm.endDate" 
            type="datetime" 
            format="YYYY-MM-DD HH:mm"
            value-format="YYYY-MM-DD HH:mm"
            placeholder="选择结束日期" 
            style="width: 100%">
          </el-date-picker>
        </el-form-item>
        <el-form-item>
          <el-button type="primary" @click="generateExpenseList" class="add-btn">
            + 生成消费清单
          </el-button>
          <el-button type="success" plain @click="exportExpenseExcel" class="action-btn">
            ⬇ 导出Excel
          </el-button>
        </el-form-item>
      </el-form>
    </el-card>

    <el-card class="box-card mt-20" v-if="expenseList.length > 0">
      <template #header>
        <div class="card-header">
          <span class="card-title">消费清单详情</span>
          <el-button type="info" plain @click="calculateTotal">
            🧮 计算总计
          </el-button>
        </div>
      </template>
      <el-table :data="expenseList" style="width: 100%" stripe highlight-current-row>
        <el-table-column prop="id" label="记录ID" width="80" align="center"></el-table-column>
        <el-table-column prop="serviceDate" label="服务日期" :formatter="formatDate"></el-table-column>
        <el-table-column label="服务项目">
          <template #default="scope">
            {{ getServiceName(scope.row.serviceId) }}
          </template>
        </el-table-column>
        <el-table-column prop="amount" label="金额" align="right">
          <template #default="scope">
            <span style="color: #f56c6c; font-weight: bold;">￥{{ scope.row.amount }}</span>
          </template>
        </el-table-column>
        <el-table-column prop="notes" label="备注"></el-table-column>
      </el-table>
      <div class="total-amount" v-if="totalAmount > 0">
        <span>总计：</span>
        <span class="amount">{{ totalAmount }}</span>
      </div>
    </el-card>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import request from '@/utils/request'

const expenseForm = ref({
  petId: '',
  startDate: '',
  endDate: ''
})

const expenseList = ref([])
const totalAmount = ref(0)
const pets = ref([])
const services = ref([])

// 获取辅助数据
const getPetsAndServices = async () => {
  try {
    const [petsRes, servicesRes] = await Promise.all([
      request.get('/api/pets'),
      request.get('/api/services')
    ])
    pets.value = petsRes.data
    services.value = servicesRes.data
  } catch (error) {
    console.error('获取辅助数据失败:', error)
  }
}

const getServiceName = (id) => {
  const svc = services.value.find(s => s.id === id)
  return svc ? svc.name : id
}

const formatDate = (row, column, cellValue) => {
  if (!cellValue) return ''
  const d = new Date(cellValue)
  const pad = (n) => n.toString().padStart(2, '0')
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())} ${pad(d.getHours())}:${pad(d.getMinutes())}`
}

// 生成消费清单
const generateExpenseList = async () => {
  const { petId, startDate, endDate } = expenseForm.value
  const start = startDate ? startDate.toISOString().split('T')[0] : ''
  const end = endDate ? endDate.toISOString().split('T')[0] : ''
  
  try {
    const response = await request.get(`/api/expenses/list/${petId}?startDate=${start}&endDate=${end}`)
    expenseList.value = response.data
  } catch (error) {
    console.error('生成消费清单失败:', error)
  }
}

// 计算总计
const calculateTotal = async () => {
  const { petId, startDate, endDate } = expenseForm.value
  const start = startDate ? startDate.toISOString().split('T')[0] : ''
  const end = endDate ? endDate.toISOString().split('T')[0] : ''
  
  try {
    const response = await request.get(`/api/expenses/total/${petId}?startDate=${start}&endDate=${end}`)
    totalAmount.value = response.data
  } catch (error) {
    console.error('计算总计失败:', error)
  }
}

// 导出Excel
const exportExpenseExcel = () => {
  const { petId, startDate, endDate } = expenseForm.value
  const start = startDate ? startDate.toISOString().split('T')[0] : ''
  const end = endDate ? endDate.toISOString().split('T')[0] : ''
  const token = localStorage.getItem('token')
  window.open(`/api/expenses/export/${petId}?startDate=${start}&endDate=${end}&token=${token}`)
}

onMounted(() => {
  getPetsAndServices()
})
</script>

<style scoped>
.expenses-container {
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

.add-btn, .action-btn {
  border-radius: 8px;
  font-weight: 600;
  padding: 8px 20px;
}

.total-amount {
  margin-top: 20px;
  text-align: right;
  font-size: 16px;
  font-weight: bold;
}

.amount {
  color: #f56c6c;
  margin-left: 10px;
  font-size: 20px;
}

@keyframes fadeIn {
  from { opacity: 0; transform: translateY(10px); }
  to { opacity: 1; transform: translateY(0); }
}
</style>