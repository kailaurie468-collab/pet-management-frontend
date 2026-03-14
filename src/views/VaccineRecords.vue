<template>
  <div class="vaccine-container">
    <el-card class="box-card">
      <template #header>
        <div class="card-header">
          <span class="card-title">宠物疫苗记录 💉</span>
          <el-button type="primary" class="add-btn" @click="handleAdd">
            + 登记疫苗
          </el-button>
        </div>
      </template>
      <el-table :data="records" style="width: 100%" stripe highlight-current-row>
        <el-table-column prop="id" label="ID" width="80" align="center"></el-table-column>
        <el-table-column label="宠物姓名">
          <template #default="scope">
            <b>{{ getPetName(scope.row.petId) }}</b>
          </template>
        </el-table-column>
        <el-table-column prop="vaccineName" label="疫苗名称"></el-table-column>
        <el-table-column prop="vaccineDate" label="接种日期"></el-table-column>
        <el-table-column prop="nextDueDate" label="下次接种"></el-table-column>
        <el-table-column prop="notes" label="备注" show-overflow-tooltip></el-table-column>
        <el-table-column label="操作" width="150" align="center">
          <template #default="scope">
            <el-button size="small" type="primary" link @click="handleEdit(scope.row)">编辑</el-button>
            <el-button size="small" type="danger" link @click="handleDelete(scope.row.id)">删除</el-button>
          </template>
        </el-table-column>
      </el-table>
    </el-card>

    <el-dialog v-model="dialogVisible" :title="dialogTitle" width="500px">
      <el-form :model="form" :rules="rules" ref="formRef" label-width="100px">
        <el-form-item label="对应宠物" prop="petId">
          <el-select v-model="form.petId" placeholder="请选择宠物" style="width: 100%">
            <el-option v-for="p in pets" :key="p.id" :label="p.name" :value="p.id" />
          </el-select>
        </el-form-item>
        <el-form-item label="疫苗名称" prop="vaccineName">
          <el-input v-model="form.vaccineName" placeholder="如：狂犬病疫苗"></el-input>
        </el-form-item>
        <el-form-item label="接种日期" prop="vaccineDate">
          <el-date-picker v-model="form.vaccineDate" type="date" value-format="YYYY-MM-DD" style="width: 100%" />
        </el-form-item>
        <el-form-item label="下次建议">
          <el-date-picker v-model="form.nextDueDate" type="date" value-format="YYYY-MM-DD" style="width: 100%" />
        </el-form-item>
        <el-form-item label="备注说明">
          <el-input type="textarea" v-model="form.notes"></el-input>
        </el-form-item>
      </el-form>
      <template #footer>
        <span class="dialog-footer">
          <el-button @click="dialogVisible = false">取消</el-button>
          <el-button type="primary" @click="handleSubmit">确认保存</el-button>
        </span>
      </template>
    </el-dialog>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { ElMessage } from 'element-plus'
import request from '@/utils/request'

const records = ref([])
const pets = ref([])
const dialogVisible = ref(false)
const dialogTitle = ref('登记疫苗信息')
const formRef = ref(null)

const form = ref({
  id: null,
  petId: null,
  vaccineName: '',
  vaccineDate: '',
  nextDueDate: '',
  notes: ''
})

const rules = {
  petId: [{ required: true, message: '请选择关联宠物', trigger: 'change' }],
  vaccineName: [{ required: true, message: '请输入疫苗名称', trigger: 'blur' }],
  vaccineDate: [{ required: true, message: '请选择接种时间', trigger: 'change' }]
}

const getRecords = async () => {
  try {
    const res = await request.get('/api/vaccine-records')
    records.value = res.data
  } catch (e) { console.error(e) }
}

const getPets = async () => {
  try {
    const res = await request.get('/api/pets')
    pets.value = res.data
  } catch (e) { console.error(e) }
}

const getPetName = (id) => {
  const p = pets.value.find(item => item.id === id)
  return p ? p.name : '加载中...'
}

const handleAdd = () => {
  form.value = { id: null, petId: null, vaccineName: '', vaccineDate: '', nextDueDate: '', notes: '' }
  dialogTitle.value = '登记疫苗信息'
  dialogVisible.value = true
}

const handleEdit = (row) => {
  form.value = { ...row }
  dialogTitle.value = '更新疫苗记录'
  dialogVisible.value = true
}

const handleSubmit = async () => {
  if (!formRef.value) return
  await formRef.value.validate(async (valid) => {
    if (valid) {
      try {
        if (form.value.id) {
          await request.put(`/api/vaccine-records/${form.value.id}`, form.value)
        } else {
          await request.post('/api/vaccine-records', form.value)
        }
        ElMessage.success('保存成功')
        dialogVisible.value = false
        getRecords()
      } catch (e) { console.error(e) }
    } else {
      ElMessage.warning('请填写完整的疫苗接种信息哦 💉')
    }
  })
}

const handleDelete = async (id) => {
  try {
    await request.delete(`/api/vaccine-records/${id}`)
    ElMessage.success('已删除记录')
    getRecords()
  } catch (e) { console.error(e) }
}

onMounted(() => {
  getRecords()
  getPets()
})
</script>

<style scoped>
.vaccine-container {
  animation: fadeIn 0.4s ease-in-out;
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
@keyframes fadeIn {
  from { opacity: 0; transform: translateY(10px); }
  to { opacity: 1; transform: translateY(0); }
}
</style>
