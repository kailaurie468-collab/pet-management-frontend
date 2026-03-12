<template>
  <div class="layout">
    <el-container class="app-container">
      <el-aside width="240px" class="sidebar">
        <div class="logo-container">
          <el-icon class="logo-icon"><Platform /></el-icon>
          <span class="logo-text">宠物信息管理</span>
        </div>
        <el-menu
          :default-active="activeMenu"
          class="custom-menu"
          background-color="transparent"
          text-color="#94a3b8"
          active-text-color="#fff"
          @select="handleMenuSelect"
        >
          <el-menu-item index="pets" class="menu-item-custom">
            <el-icon><House /></el-icon>
            <span>宠物档案</span>
          </el-menu-item>
          <el-menu-item index="health-records" class="menu-item-custom">
            <el-icon><Document /></el-icon>
            <span>健康记录</span>
          </el-menu-item>
          <el-menu-item index="doctors" class="menu-item-custom">
            <el-icon><Avatar /></el-icon>
            <span>专家名录</span>
          </el-menu-item>
          <el-menu-item index="services" class="menu-item-custom">
            <el-icon><List /></el-icon>
            <span>服务管理</span>
          </el-menu-item>
          <el-menu-item index="expenses" class="menu-item-custom">
            <el-icon><Money /></el-icon>
            <span>费用核算</span>
          </el-menu-item>
          <el-menu-item index="users" class="menu-item-custom" v-if="isAdmin">
            <el-icon><User /></el-icon>
            <span>系统管理</span>
          </el-menu-item>
        </el-menu>
        
        <div class="sidebar-footer">
          <div class="version-tag">v1.0.0 Beta</div>
        </div>
      </el-aside>
      
      <el-container class="main-container">
        <el-header class="header">
          <div class="header-left">
            <h2 class="page-title">{{ pageTitle }}</h2>
          </div>
          <div class="header-right">
            <div class="user-profile">
              <el-avatar :size="32" src="https://cube.elemecdn.com/3/7c/3ea6beec64369c2642b92c6726f1epng.png" />
              <div class="user-info">
                <span class="welcome-text">欢迎回来,</span>
                <span class="user-name">{{ userName }}</span>
              </div>
            </div>
            <el-button class="logout-btn" type="danger" plain size="small" @click="handleLogout">
              退出登录
            </el-button>
          </div>
        </el-header>
        
        <el-main class="main-content">
          <router-view v-slot="{ Component }">
            <transition name="fade" mode="out-in">
              <component :is="Component" />
            </transition>
          </router-view>
        </el-main>
      </el-container>
    </el-container>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import { House, Document, List, Money, User, Platform, Avatar } from '@element-plus/icons-vue'
import request from '@/utils/request'
import { ElMessage } from 'element-plus'

const router = useRouter()
const route = useRoute()
const activeMenu = ref('pets')
const userName = ref('Admin')
const isAdmin = ref(false)

onMounted(() => {
  const userStr = localStorage.getItem('user')
  if (userStr) {
    try {
      const user = JSON.parse(userStr)
      userName.value = user.name || user.username
      isAdmin.value = user.role === 'admin'
    } catch (e) {}
  }
  // 同步当前路由高亮
  const path = route.path.substring(1)
  if (path) {
    activeMenu.value = path
  }
})

const pageTitle = computed(() => {
  const map = {
    'pets': '宠物档案',
    'health-records': '健康记录',
    'services': '服务管理',
    'expenses': '费用核算',
    'doctors': '专家名录',
    'users': '系统管理'
  }
  return map[activeMenu.value] || '宠物管理系统'
})

const handleMenuSelect = (key) => {
  activeMenu.value = key
  router.push(`/${key}`)
}

const handleLogout = async () => {
  try {
    await request.post('/api/logout')
  } catch(e) {}
  localStorage.removeItem('token')
  localStorage.removeItem('user')
  ElMessage.success('已安全登出')
  router.push('/login')
}
</script>

<style scoped>
.layout {
  height: 100vh;
  width: 100vw;
  overflow: hidden;
  background-color: var(--el-bg-color-page);
}

.app-container {
  height: 100%;
}

.sidebar {
  background: #0f172a; /* 深蓝黑现代色 */
  display: flex;
  flex-direction: column;
  transition: all 0.3s;
  box-shadow: 4px 0 24px rgba(0,0,0,0.05);
  z-index: 10;
}

.logo-container {
  height: 80px;
  display: flex;
  align-items: center;
  padding: 0 24px;
  gap: 12px;
  border-bottom: 1px solid rgba(255,255,255,0.05);
}

.logo-icon {
  font-size: 28px;
  color: var(--el-color-primary-light-3);
}

.logo-text {
  font-size: 20px;
  font-weight: 800;
  color: #fff;
  letter-spacing: -0.5px;
}

.custom-menu {
  flex: 1;
  border-right: none;
  padding: 16px 12px;
}

.menu-item-custom {
  border-radius: 12px;
  margin-bottom: 8px;
  font-weight: 500;
  transition: all 0.3s ease;
}

.menu-item-custom:hover {
  background-color: rgba(255,255,255,0.05) !important;
  color: #fff !important;
}

.menu-item-custom.is-active {
  background: linear-gradient(135deg, var(--el-color-primary) 0%, var(--el-color-primary-dark-2) 100%) !important;
  color: #fff !important;
  box-shadow: 0 4px 12px rgba(79, 70, 229, 0.4);
}

.sidebar-footer {
  padding: 24px;
  font-size: 12px;
}

.version-tag {
  background: rgba(255,255,255,0.1);
  color: #94a3b8;
  padding: 6px 12px;
  border-radius: 20px;
  text-align: center;
  font-weight: 600;
}

.main-container {
  display: flex;
  flex-direction: column;
  background-color: #f1f5f9;
}

.header {
  height: 80px;
  background-color: rgba(255,255,255,0.8);
  backdrop-filter: blur(20px);
  -webkit-backdrop-filter: blur(20px);
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 0 40px;
  border-bottom: 1px solid rgba(0,0,0,0.04);
  z-index: 5;
}

.header-left {
  display: flex;
  align-items: center;
}

.page-title {
  font-size: 22px;
  font-weight: 700;
  color: #1e293b;
  margin: 0;
}

.header-right {
  display: flex;
  align-items: center;
  gap: 24px;
}

.user-profile {
  display: flex;
  align-items: center;
  gap: 12px;
}

.user-info {
  display: flex;
  flex-direction: column;
}

.welcome-text {
  font-size: 12px;
  color: #64748b;
  line-height: 1;
}

.user-name {
  font-size: 14px;
  font-weight: 600;
  color: #1e293b;
  margin-top: 4px;
}

.logout-btn {
  border-radius: 8px;
  font-weight: 600;
}

.main-content {
  padding: 32px 40px;
  overflow-y: auto;
  position: relative;
}
</style>