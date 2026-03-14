<template>
  <div class="pets-container">
    <!-- 搜索与筛选栏 -->
    <el-card class="search-card box-card">
      <el-form :inline="true" :model="searchForm" class="search-form">
        <el-form-item label="宠物名字">
          <el-input v-model="searchForm.petName" placeholder="输入宠物名模糊查找" clearable @clear="getPets" />
        </el-form-item>
        <el-form-item label="主人名字">
          <el-input v-model="searchForm.ownerName" placeholder="输入主人名查找" clearable @clear="getPets" />
        </el-form-item>
        <el-form-item>
          <el-button type="primary" :icon="Search" @click="getPets">查询</el-button>
          <el-button @click="resetSearch">重置</el-button>
        </el-form-item>
      </el-form>
    </el-card>

    <el-card class="box-card">
      <template #header>
        <div class="card-header">
          <span class="card-title">宠物档案中心 🐾</span>
          <el-button type="primary" class="add-btn" @click="handleAdd">
            + 添加新宠
          </el-button>
        </div>
      </template>
      <el-table :data="pets" style="width: 100%" stripe highlight-current-row>
        <el-table-column label="照片" width="100" align="center">
          <template #default="scope">
            <el-avatar 
              :size="50" 
              :src="scope.row.photo || defaultPetAvatar" 
              shape="square"
              class="pet-avatar-img"
            >
              <img src="https://cube.elemecdn.com/e/fd/0fc7ed0fb22c5583395619a800129jpg.png" />
            </el-avatar>
          </template>
        </el-table-column>
        <el-table-column prop="name" label="姓名" min-width="100"></el-table-column>
        <el-table-column prop="type" label="类型" width="100"></el-table-column>
        <el-table-column prop="age" label="年龄" width="80"></el-table-column>
        <el-table-column prop="gender" label="性别" width="80">
          <template #default="scope">
            <el-tag :type="scope.row.gender === '公' ? 'primary' : 'danger'" size="small">
              {{ scope.row.gender }}
            </el-tag>
          </template>
        </el-table-column>
        <el-table-column prop="breed" label="品种" min-width="120"></el-table-column>
        <el-table-column label="绝育状态" width="100" align="center">
          <template #default="scope">
            <el-tag :type="scope.row.isNeutered ? 'success' : 'info'" effect="plain">
              {{ scope.row.isNeutered ? '已绝育' : '未绝育' }}
            </el-tag>
          </template>
        </el-table-column>
        <el-table-column prop="ownerName" label="主人姓名" min-width="120">
          <template #default="scope">
            {{ getOwnerName(scope.row.ownerId) }}
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

    <el-dialog
      v-model="dialogVisible"
      :title="dialogTitle"
      width="550px"
      destroy-on-close
    >
      <el-form :model="form" :rules="rules" ref="petFormRef" label-width="100px" class="pet-form">
        <el-form-item label="宠物照片">
          <el-upload
            class="avatar-uploader"
            action="/api/upload"
            :show-file-list="false"
            :on-success="handleAvatarSuccess"
            :before-upload="beforeAvatarUpload"
          >
            <img v-if="form.photo" :src="form.photo" class="avatar" />
            <el-icon v-else class="avatar-uploader-icon"><Plus /></el-icon>
          </el-upload>
          <div class="upload-tip">建议尺寸 200x200，支持 jpg/png</div>
        </el-form-item>
        
        <el-row :gutter="20">
          <el-col :span="12">
            <el-form-item label="姓名" prop="name">
              <el-input v-model="form.name" placeholder="小名"></el-input>
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="类型" prop="type">
              <el-select v-model="form.type" placeholder="请选择">
                <el-option label="猫 (Cat)" value="猫" />
                <el-option label="狗 (Dog)" value="狗" />
                <el-option label="鸟类 (Bird)" value="鸟类" />
                <el-option label="其他" value="其他" />
              </el-select>
            </el-form-item>
          </el-col>
        </el-row>

        <el-row :gutter="20">
          <el-col :span="12">
            <el-form-item label="年龄" prop="age">
              <el-input-number v-model="form.age" :min="0" style="width: 100%"></el-input-number>
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="性别" prop="gender">
              <el-radio-group v-model="form.gender">
                <el-radio label="公">公</el-radio>
                <el-radio label="母">母</el-radio>
              </el-radio-group>
            </el-form-item>
          </el-col>
        </el-row>

        <el-form-item label="品种" prop="breed">
          <el-input v-model="form.breed" placeholder="如：英短、金毛等"></el-input>
        </el-form-item>

        <el-form-item label="绝育状态">
          <el-switch
            v-model="form.isNeutered"
            active-text="已绝育"
            inactive-text="未绝育"
            :active-value="1"
            :inactive-value="0"
          />
        </el-form-item>

        <el-form-item label="所属主人" prop="ownerId">
          <el-select v-if="isAdmin" v-model="form.ownerId" placeholder="请选择该宠物的领养人" style="width: 100%" filterable>
            <el-option v-for="o in owners" :key="o.id" :label="o.name + ' (' + o.username + ')'" :value="o.id" />
          </el-select>
          <el-input v-else :value="currentUser.name" disabled></el-input>
        </el-form-item>

        <el-form-item label="详情描述">
          <el-input type="textarea" v-model="form.description" :rows="3" placeholder="写写宝贝的性格、爱好等..."></el-input>
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
import { Search, Plus } from '@element-plus/icons-vue'
import request from '@/utils/request'

const pets = ref([])
const owners = ref([])
const isAdmin = ref(false)
const currentUser = ref({})
const dialogVisible = ref(false)
const petFormRef = ref(null)
const dialogTitle = ref('添加宠物')

const defaultPetAvatar = 'https://cube.elemecdn.com/9/c2/f0ee8a3c7c9638a54940382568c9dpng.png'

const searchForm = ref({
  petName: '',
  ownerName: ''
})

const form = ref({
  id: null,
  name: '',
  type: '',
  age: null,
  gender: '公',
  breed: '',
  description: '',
  photo: '',
  isNeutered: 0,
  ownerId: null
})

const rules = {
  name: [{ required: true, message: '请输入宠物姓名哦 🐾', trigger: 'blur' }],
  type: [{ required: true, message: '请选择宠物类型 🐱', trigger: 'change' }],
  age: [{ required: true, message: '请输入宠物年龄 🎂', trigger: 'blur' }],
  gender: [{ required: true, message: '请选择宠物性别 ♂/♀', trigger: 'change' }],
  breed: [{ required: true, message: '请输入宠物品种 🐩', trigger: 'blur' }]
}

// 获取宠物列表（支持搜索）
const getPets = async () => {
  try {
    const params = {}
    if (searchForm.value.petName) params.petName = searchForm.value.petName
    if (searchForm.value.ownerName) params.ownerName = searchForm.value.ownerName
    
    const response = await request.get('/api/pets', { params })
    pets.value = response.data
  } catch (error) {
    console.error('获取宠物列表失败:', error)
  }
}

// 获取主人列表以进行 ID 到名称的映射
const getOwners = async () => {
  try {
    const response = await request.get('/api/users/role/OWNER')
    owners.value = response.data
  } catch (error) {
    console.error('获取主人列表失败:', error)
  }
}

const getOwnerName = (id) => {
  const owner = owners.value.find(o => o.id === id)
  return owner ? owner.name : '未知主人'
}

const resetSearch = () => {
  searchForm.value.petName = ''
  searchForm.value.ownerName = ''
  getPets()
}

// 图片上传处理
const handleAvatarSuccess = (response) => {
  // 模拟上传成功，实际应取后端返回的 url
  // form.value.photo = response.url
  ElMessage.info('图片上传功能开发中...已模拟显示 📸')
}

const beforeAvatarUpload = (file) => {
  const isJPGorPNG = file.type === 'image/jpeg' || file.type === 'image/png'
  const isLt2M = file.size / 1024 / 1024 < 2

  if (!isJPGorPNG) {
    ElMessage.error('上传头像图片只能是 JPG 或 PNG 格式!')
  }
  if (!isLt2M) {
    ElMessage.error('上传头像图片大小不能超过 2MB!')
  }
  
  // 暂且模拟：直接将本地 blob 转为预览图
  const reader = new FileReader()
  reader.readAsDataURL(file)
  reader.onload = () => {
    form.value.photo = reader.result
  }

  return false // 返回 false 阻止自动上传到 action 路径，仅作展示
}

const handleAdd = () => {
  form.value = {
    id: null,
    name: '',
    type: '',
    age: null,
    gender: '公',
    breed: '',
    description: '',
    photo: '',
    isNeutered: 0,
    ownerId: currentUser.value.id || null
  }
  dialogTitle.value = '添加新宠档案'
  dialogVisible.value = true
}

const handleSubmit = async () => {
  if (!petFormRef.value) return
  
  await petFormRef.value.validate(async (valid) => {
    if (valid) {
      try {
        if (form.value.id) {
          await request.put(`/api/pets/${form.value.id}`, form.value)
          ElMessage.success('更新宠物信息成功 ✨')
        } else {
          await request.post('/api/pets', form.value)
          ElMessage.success('添加宠物成功 🐾')
        }
        dialogVisible.value = false
        getPets()
      } catch (error) {
        console.error('保存宠物信息失败:', error)
        ElMessage.error('保存失败，请稍后再试')
      }
    } else {
      ElMessage.warning('请填写完整的宠物信息哦（描述除外） 📋')
    }
  })
}

const handleEdit = (row) => {
  form.value = { ...row }
  dialogTitle.value = '编辑宠物档案'
  dialogVisible.value = true
}

const handleDelete = async (id) => {
  try {
    await request.delete(`/api/pets/${id}`)
    ElMessage.success('已删除该宠物档案')
    getPets()
  } catch (error) {
    console.error('删除宠物失败:', error)
  }
}

onMounted(() => {
  const user = JSON.parse(localStorage.getItem('user') || '{}')
  currentUser.value = user
  isAdmin.value = user.role && user.role.toUpperCase() === 'ADMIN'
  
  getPets()
  getOwners()
})
</script>

<style scoped>
.pets-container {
  animation: fadeIn 0.4s ease-in-out;
}

.box-card {
  margin-bottom: 20px;
}

.search-card {
  background-color: #fffbeb !important; /* 浅橙色背景 */
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

/* 宠物头像样式 */
.pet-avatar-img {
  border: 2px solid #fef3c7;
  transition: transform 0.2s;
}

.pet-avatar-img:hover {
  transform: scale(1.1);
}

/* 图片上传组件样式 */
.avatar-uploader {
  border: 2px dashed #dcdfe6;
  border-radius: 12px;
  cursor: pointer;
  position: relative;
  overflow: hidden;
  width: 120px;
  height: 120px;
  display: flex;
  justify-content: center;
  align-items: center;
  transition: border-color 0.3s;
}

.avatar-uploader:hover {
  border-color: var(--el-color-primary);
}

.avatar-uploader-icon {
  font-size: 28px;
  color: #8c939d;
}

.avatar {
  width: 120px;
  height: 120px;
  display: block;
  object-fit: cover;
}

.upload-tip {
  font-size: 12px;
  color: #94a3b8;
  margin-top: 8px;
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