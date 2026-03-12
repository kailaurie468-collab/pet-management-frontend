<template>
  <div class="pets-container">
    <el-card class="box-card">
      <template #header>
        <div class="card-header">
          <span class="card-title">宠物档案记录</span>
          <el-button type="primary" class="add-btn" @click="handleAdd">
            + 添加宠物
          </el-button>
        </div>
      </template>
      <el-table :data="pets" style="width: 100%" stripe highlight-current-row>
        <el-table-column prop="id" label="ID" width="80" align="center"></el-table-column>
        <el-table-column prop="name" label="姓名"></el-table-column>
        <el-table-column prop="type" label="类型"></el-table-column>
        <el-table-column prop="age" label="年龄"></el-table-column>
        <el-table-column prop="gender" label="性别"></el-table-column>
        <el-table-column prop="breed" label="品种"></el-table-column>
        <el-table-column prop="ownerId" label="主人ID"></el-table-column>
        <el-table-column label="操作" width="180" align="center">
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
          <el-input v-model="form.name"></el-input>
        </el-form-item>
        <el-form-item label="类型">
          <el-select
            v-model="form.type"
            filterable
            allow-create
            default-first-option
            placeholder="搜索或输入猫/狗/鸟等"
          >
            <el-option label="猫 (Cat)" value="猫" />
            <el-option label="狗 (Dog)" value="狗" />
            <el-option label="鸟类 (Bird)" value="鸟类" />
            <el-option label="小型哺乳动物" value="小型哺乳动物" />
            <el-option label="爬行动物" value="爬行动物" />
          </el-select>
        </el-form-item>
        <el-form-item label="年龄">
          <el-input-number v-model="form.age" :min="0"></el-input-number>
        </el-form-item>
        <el-form-item label="性别">
          <el-select v-model="form.gender">
            <el-option label="公" value="公"></el-option>
            <el-option label="母" value="母"></el-option>
          </el-select>
        </el-form-item>
        <el-form-item label="品种">
          <el-select
            v-model="form.breed"
            filterable
            allow-create
            default-first-option
            placeholder="如英短、金毛等"
          >
            <el-option label="英国短毛猫" value="英国短毛猫" />
            <el-option label="金毛寻回犬" value="金毛寻回犬" />
            <el-option label="布偶猫" value="布偶猫" />
            <el-option label="中华田园犬" value="中华田园犬" />
            <el-option label="柯基" value="柯基" />
          </el-select>
        </el-form-item>
        <el-form-item label="描述">
          <el-input type="textarea" v-model="form.description"></el-input>
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

const pets = ref([])
const dialogVisible = ref(false)
const dialogTitle = ref('添加宠物')
const form = ref({
  id: null,
  name: '',
  type: '',
  age: null,
  gender: '',
  breed: '',
  description: ''
})

const getPets = async () => {
  try {
    const response = await request.get('/api/pets')
    pets.value = response.data
  } catch (error) {
    console.error('获取宠物列表失败:', error)
  }
}

const handleAdd = () => {
  form.value = {
    id: null,
    name: '',
    type: '',
    age: null,
    gender: '',
    breed: '',
    description: ''
  }
  dialogTitle.value = '添加宠物'
  dialogVisible.value = true
}

const handleSubmit = async () => {
  try {
    if (form.value.id) {
      await request.put(`/api/pets/${form.value.id}`, form.value)
    } else {
      await request.post('/api/pets', form.value)
    }
    dialogVisible.value = false
    getPets()
  } catch (error) {
    console.error('保存宠物信息失败:', error)
  }
}

const handleEdit = (row) => {
  form.value = { ...row }
  dialogTitle.value = '编辑宠物'
  dialogVisible.value = true
}

const handleDelete = async (id) => {
  try {
    await request.delete(`/api/pets/${id}`)
    getPets()
  } catch (error) {
    console.error('删除宠物失败:', error)
  }
}

onMounted(() => {
  getPets()
})
</script>

<style scoped>
.pets-container {
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