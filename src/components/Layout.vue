<template>
  <div class="layout">
    <el-container class="app-container">
      <el-aside width="128px" class="sidebar glass-sidebar">
        <div class="brand-section">
          <div class="brand-logo">
            <el-icon><Platform /></el-icon>
          </div>
          <h1 class="brand-text">宠物信息<br/>管理</h1>
        </div>

        <el-menu
          :default-active="activeMenu"
          class="custom-menu"
          background-color="transparent"
          text-color="#5D4037"
          active-text-color="#ffffff"
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
          <el-menu-item index="vaccine-records" class="menu-item-custom">
            <el-icon><FirstAidKit /></el-icon>
            <span>疫苗记录</span>
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
        
        <div class="sidebar-footer-new">
          <div class="footer-illustration-wrapper">
            <img src="@/assets/pet1.png" alt="Pet" class="footer-pet-img"/>
            <!-- <img src="https://lh3.googleusercontent.com/aida-public/AB6AXuChgnVrxI6QfPbxTfPylL1rdsM7dyzsgWZmW31nMt65HWYIdByIEx0-h7FNmCpB1IqGCVc7cJdXak-99gVaQNjOm2NV4Hwc_T_qF0nfj97R1PscYUh3PUYaRHYozrE1wUNG2WDfmL4IQSaRiIrFWxA5VcQxK5cb0UZ8jY1iZ0DzRUmVpA--vfFsZqw5ad9JEX-GdXp_tPjRIU-49-Iv2OJS_QVP2w8HQmmCgHSNQR-oDnnlb5FR8Pi9NjJgP2kmXSj3vg6t3nI9Sqoh" alt="Pet" class="footer-pet-img"/> -->
            <div class="floating-bubble"></div>
          </div>
          <p class="wish-text">愿宝贝健康成长</p>
          <span class="version-tag-new">v1.0.0 Beta</span>
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
import { House, Document, List, Money, User, Platform, Avatar, FirstAidKit } from '@element-plus/icons-vue'
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
      isAdmin.value = user.role.toUpperCase() === 'ADMIN'
    } catch (e) {}
  }
  // 同步当前路由高亮
  const path = route.path.split('/').pop() || 'pets'
  activeMenu.value = path
})

const pageTitle = computed(() => {
  const map = {
    'pets': '宠物档案中心',
    'health-records': '宠物健康日志',
    'services': '医疗服务管理',
    'expenses': '账单费用核算',
    'doctors': '宠物专家团队',
    'vaccine-records': '宠物疫苗档案',
    'users': '系统用户管理'
  }
  return map[activeMenu.value] || '宠物关怀管理系统'
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
.sidebar {
  display: flex;
  flex-direction: column;
  transition: all 0.3s;
  z-index: 10;
  border-right: 1px solid rgba(255, 255, 255, 0.3);
}

.glass-sidebar {
  background: rgba(255, 255, 255, 0.45);
  backdrop-filter: blur(20px);
  -webkit-backdrop-filter: blur(20px);
  box-shadow: 10px 0 30px rgba(0, 0, 0, 0.05);
}

.brand-section {
  padding: 32px 0 24px;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 8px;
}

.brand-logo {
  width: 48px;
  height: 48px;
  background: #FF8A3D;
  border-radius: 16px;
  display: flex;
  align-items: center;
  justify-content: center;
  color: #fff;
  font-size: 24px;
  box-shadow: 0 4px 12px rgba(255, 138, 61, 0.3);
}

.brand-text {
  font-size: 13px;
  font-weight: 800;
  color: #5D4037;
  text-align: center;
  line-height: 1.2;
}

.custom-menu {
  flex: 1;
  border-right: none;
  padding: 0 12px;
}

.menu-item-custom {
  height: auto !important;
  line-height: normal !important;
  padding: 16px 8px !important;
  display: flex !important;
  flex-direction: column !important;
  align-items: center !important;
  justify-content: center !important;
  border-radius: 16px !important;
  margin-bottom: 12px !important;
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1) !important;
}

.menu-item-custom :deep(.el-icon) {
  margin-right: 0 !important;
  margin-bottom: 6px;
  font-size: 22px;
  opacity: 0.7;
}

.menu-item-custom span {
  font-size: 11px;
  font-weight: 600;
}

.menu-item-custom:hover {
  background-color: rgba(255, 255, 255, 0.5) !important;
  transform: translateY(-2px);
}

.menu-item-custom.is-active {
  background: linear-gradient(135deg, #FF8A3D 0%, #FF6B00 100%) !important;
  color: #ffffff !important;
  box-shadow: 0 8px 16px rgba(255, 107, 0, 0.35) !important;
}

.menu-item-custom.is-active :deep(.el-icon) {
  opacity: 1;
}

.sidebar-footer-new {
  padding: 24px 12px;
  display: flex;
  flex-direction: column;
  align-items: center;
  border-top: 1px solid rgba(255, 255, 255, 0.2);
}

.footer-illustration-wrapper {
  position: relative;
  margin-bottom: 8px;
}

.footer-pet-img {
  width: 56px;
  height: 48px;
  object-fit: contain;
  transition: transform 0.3s ease;
}

.footer-illustration-wrapper:hover .footer-pet-img {
  transform: scale(1.1);
}

.floating-bubble {
  position: absolute;
  top: -4px;
  right: -4px;
  width: 10px;
  height: 10px;
  background: #FF8A3D;
  border-radius: 50%;
  border: 2px solid #fff;
  animation: bounce 2s infinite;
}

.wish-text {
  color: #5D4037;
  font-size: 10px;
  font-weight: 600;
  opacity: 0.8;
  margin: 0 0 4px;
}

.version-tag-new {
  font-size: 8px;
  color: rgba(93, 64, 55, 0.5);
  font-family: monospace;
  letter-spacing: 1px;
}

@keyframes bounce {
  0%, 100% { transform: translateY(0); }
  50% { transform: translateY(-6px); }
}

.fade-enter-active, .fade-leave-active {
  transition: opacity 0.3s;
}
.fade-enter-from, .fade-leave-to {
  opacity: 0;
}

/* Background for the whole layout to support glass effect */
.layout {
  height: 100vh;
  width: 100vw;
  overflow: hidden;
  background: linear-gradient(135deg, #fff7ed 0%, #ffedd5 100%);
}

.app-container {
  height: 100%;
}

.main-container {
  display: flex;
  flex-direction: column;
  background-color: transparent;
}

.header {
  height: 80px;
  background-color: rgba(255, 255, 255, 0.6);
  backdrop-filter: blur(10px);
  -webkit-backdrop-filter: blur(10px);
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