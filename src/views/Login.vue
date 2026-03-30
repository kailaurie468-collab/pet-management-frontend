<template>
  <div class="login-wrapper">
    <!-- 主容器：毛玻璃/内阴影卡片 -->
    <main class="login-card">
      <!-- 左侧：品牌与形象展示 -->
      <section class="brand-panel">
        <div class="decorative-blob-1"></div>
        <div class="decorative-blob-2"></div>
        
        <div class="brand-inner">
          <header class="logo-area">
            <svg class="heart-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor">
              <path d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" stroke-linecap="round" stroke-linejoin="round" stroke-width="2"></path>
            </svg>
            <h1 class="brand-name">宠物信息管理</h1>
          </header>

          <div class="hero-image-box">
           <img src="@/assets/pet.png" alt="Happy Pets" class="hero-img">
            <!-- <img src="https://lh3.googleusercontent.com/aida-public/AB6AXuCZjVMDUzO7gilnphR23siYb5DibDfGXnqljScGWFDMqGPMRc4fAPFgJbZ7l64VVs8Iy89kdpuB37V-TPDyWY762BTy_hQjqeNU7L3A6jD-3fRhEo80fCx4OvzfjQiI0fSLP09bH-4XNAqGgMJcBSnOHN1409jSmwjuzQmZ3Cbc1tsUj9B82Pvnw2Vd7a7T_Qwn869h8-RypAcl_vXneVrpaMUqvBRCfBFyAQSMDCjhg3EOqYj_1BuBPBf_HJRkKxG19c2NNa5T6ndK" alt="Happy Pets" class="hero-img"> -->
          </div>

          <h2 class="hero-title">每一个宠物都有一个独特的故事</h2>
          <p class="hero-desc">在一个友好的地方管理健康记录、预约和日常生活</p>
        </div>
      </section>

      <!-- 右侧：登录表单 -->
      <section class="form-panel">
        <div class="form-inner">
          <header class="form-header">
            <h2 class="welcome-title">欢迎回来!</h2>
            <p class="welcome-subtitle">请输入您的详细信息以访问您宠物的信息</p>
          </header>

          <el-form :model="loginForm" :rules="rules" ref="formRef" class="login-form">
            <div class="input-group">
              <label class="label">用户名</label>
              <el-input 
                v-model="loginForm.username" 
                placeholder="input your username" 
                class="custom-input"
              />
            </div>

            <div class="input-group">
              <label class="label">密码</label>
              <el-input 
                v-model="loginForm.password" 
                type="password" 
                placeholder="••••••••" 
                show-password
                class="custom-input"
                @keyup.enter="handleLogin"
              />
            </div>

            <div class="form-actions">
              <el-checkbox v-model="rememberMe" class="remember-cb">记住我</el-checkbox>
              <!-- 移除忘记密码 -->
            </div>

            <el-button 
              type="primary" 
              class="submit-btn" 
              :loading="loading" 
              @click="handleLogin"
            >
              登录
            </el-button>
          </el-form>

          <footer class="form-footer">
            <p>© 2026宠物信息管理</p>
          </footer>
        </div>
      </section>
    </main>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { ElMessage } from 'element-plus'
import request from '@/utils/request'

const router = useRouter()
const formRef = ref(null)
const loading = ref(false)
const rememberMe = ref(false)

const loginForm = ref({
  username: '',
  password: ''
})

const rules = {
  username: [{ required: true, message: 'Please enter your username', trigger: 'blur' }],
  password: [{ required: true, message: 'Please enter your password', trigger: 'blur' }]
}

onMounted(() => {
  const savedUser = localStorage.getItem('remembered_username')
  if (savedUser) {
    loginForm.value.username = savedUser
    rememberMe.value = true
  }
})

const handleLogin = async () => {
  if (!formRef.value) return
  
  await formRef.value.validate(async (valid) => {
    if (!valid) return
    
    loading.value = true
    try {
      const res = await request.post('/api/login', {
        username: loginForm.value.username,
        password: loginForm.value.password
      })
      
      if (res.data.success) {
        if (rememberMe.value) {
          localStorage.setItem('remembered_username', loginForm.value.username)
        } else {
          localStorage.removeItem('remembered_username')
        }
        
        localStorage.setItem('token', res.data.token)
        localStorage.setItem('user', JSON.stringify(res.data.user))
        ElMessage.success('Login Successful')
        router.push('/')
      } else {
        ElMessage.error(res.data.message || 'Login Failed')
      }
    } catch (err) {
      console.error(err)
      ElMessage.error('Server error, please try again')
    } finally {
      loading.value = false
    }
  })
}
</script>

<style scoped>
/* 引用 Stitch 源码中的配色与样式 */
.login-wrapper {
  min-height: 100vh;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 20px;
  background-color: #f8fafc;
  /* 爪印背景图案 */
  background-image: url("data:image/svg+xml,%3Csvg width='40' height='40' viewBox='0 0 40 40' xmlns='http://www.w3.org/2000/01/svg'%3E%3Cpath d='M20 2c1.1 0 2 .9 2 2s-.9 2-2 2-2-.9-2-2 .9-2 2-2zm-6 3c1.1 0 2 .9 2 2s-.9 2-2 2-2-.9-2-2 .9-2 2-2zm12 0c1.1 0 2 .9 2 2s-.9 2-2 2-2-.9-2-2 .9-2 2-2zm-12 8c-2.2 0-4 1.8-4 4s1.8 4 4 4 4-1.8 4-4-1.8-4-4-4zm12 0c-2.2 0-4 1.8-4 4s1.8 4 4 4 4-1.8 4-4-1.8-4-4-4z' fill='%234db6ac' fill-opacity='0.05' fill-rule='evenodd'/%3E%3C/svg%3E");
  font-family: 'Plus Jakarta Sans', system-ui, -apple-system, sans-serif;
}

.login-card {
  width: 100%;
  max-width: 1100px;
  min-height: 650px;
  display: flex;
  background: white;
  border-radius: 32px;
  box-shadow: 0 25px 50px -12px rgba(0, 0, 0, 0.15);
  overflow: hidden;
}

/* 左侧面板 */
.brand-panel {
  flex: 1;
  background-color: #E0F2F1;
  position: relative;
  overflow: hidden;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 60px;
  text-align: center;
}

.decorative-blob-1 {
  position: absolute;
  top: -80px;
  left: -80px;
  width: 250px;
  height: 250px;
  background-color: #B2EBF2;
  border-radius: 50%;
  opacity: 0.5;
}

.decorative-blob-2 {
  position: absolute;
  bottom: -80px;
  right: -80px;
  width: 320px;
  height: 320px;
  background-color: #4DB6AC;
  border-radius: 50%;
  opacity: 0.1;
}

.brand-inner {
  position: relative;
  z-index: 2;
}

.logo-area {
  display: flex;
  align-items: center;
  justify-content: center;
  margin-bottom: 30px;
  color: #4DB6AC;
}

.heart-icon {
  width: 44px;
  height: 44px;
  margin-right: 12px;
}

.brand-name {
  font-size: 32px;
  font-weight: 800;
  color: #8D6E63;
  margin: 0;
}

.hero-image-box {
  margin-bottom: 35px;
  border-radius: 20px;
  overflow: hidden;
  box-shadow: 0 10px 15px -3px rgba(0,0,0,0.1);
  border: 4px solid white;
}

.hero-img {
  width: 100%;
  height: 280px;
  object-fit: cover;
  display: block;
}

.hero-title {
  font-size: 24px;
  font-weight: 700;
  color: #1e293b;
  margin-bottom: 15px;
}

.hero-desc {
  font-size: 16px;
  color: #64748b;
  max-width: 380px;
  margin: 0 auto;
  line-height: 1.6;
}

/* 右侧面板 */
.form-panel {
  flex: 1;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 60px;
  background: white;
}

.form-inner {
  width: 100%;
  max-width: 400px;
}

.form-header {
  margin-bottom: 40px;
}

.welcome-title {
  font-size: 30px;
  font-weight: 800;
  color: #111827;
  margin-bottom: 10px;
}

.welcome-subtitle {
  font-size: 16px;
  color: #6b7280;
}

.input-group {
  margin-bottom: 24px;
}

.label {
  display: block;
  font-size: 14px;
  font-weight: 600;
  color: #374151;
  margin-bottom: 8px;
}

:deep(.custom-input .el-input__wrapper) {
  background-color: white;
  border-radius: 12px;
  padding: 10px 15px;
  box-shadow: 0 0 0 1px #e5e7eb inset !important;
  transition: all 0.2s;
}

:deep(.custom-input .el-input__wrapper.is-focus) {
  box-shadow: 0 0 0 2px #4DB6AC inset !important;
}

.form-actions {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 30px;
}

.remember-cb {
  height: auto;
}

:deep(.el-checkbox__inner) {
  width: 18px;
  height: 18px;
  border-radius: 4px;
}

:deep(.el-checkbox__label) {
  font-size: 14px;
  color: #4b5563;
}

:deep(.el-checkbox__input.is-checked .el-checkbox__inner) {
  background-color: #4DB6AC;
  border-color: #4DB6AC;
}

:deep(.el-checkbox__input.is-checked + .el-checkbox__label) {
  color: #4DB6AC;
}

.submit-btn {
  width: 100%;
  padding: 14px;
  height: auto;
  font-size: 16px;
  font-weight: 700;
  border-radius: 14px;
  background-color: #4DB6AC;
  border: none;
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
}

.submit-btn:hover {
  background-color: #38a197;
  transform: translateY(-2px);
  box-shadow: 0 10px 15px -3px rgba(77, 182, 172, 0.3);
}

.form-footer {
  margin-top: 50px;
  text-align: center;
  color: #9ca3af;
  font-size: 13px;
}

/* 适配移动端 */
@media (max-width: 900px) {
  .login-card {
    flex-direction: column;
    max-width: 500px;
    border-radius: 24px;
  }
  .brand-panel {
    display: none; /* 如果要在手机端展示，可以设为 flex 但高度固定 */
  }
  .form-panel {
    padding: 40px 20px;
  }
}
</style>