<template>
  <el-container>
    <el-header>
      <el-menu
        router
        :active-text-color="'#2d8cf0'"
        :default-active="'User'"
        mode="horizontal"
        menu-trigger="hover"
        @select="handleSelect">
        <el-menu-item index="User">
          <template slot="title">
            <i class="el-icon-s-custom"></i>用户管理
          </template>
        </el-menu-item>
        <el-menu-item index="School">
          <template slot="title">
            <i class="el-icon-s-order"></i>内容管理
          </template>
        </el-menu-item>
        <el-menu-item index="Logs">
          <template slot="title">
            <i class="el-icon-s-order"></i>实时日志
          </template>
        </el-menu-item>
        <el-submenu index="4">
          <template slot="title">
            <i class="el-icon-s-help"></i>admin
          </template>
          <el-menu-item index="4-1" @click="quit">退出</el-menu-item>
        </el-submenu>
      </el-menu>
    </el-header>
    <el-main>
        <router-view></router-view>
    </el-main>
    <el-footer>Footer</el-footer>
  </el-container>
</template>

<script>
export default {
  data() {
    return {
    };
  },
  methods: {
    handleSelect(index) {
      this.activeIndex = index;
      console.log(this.activeIndex);
    },
    quit() {
      window.sessionStorage.clear();
      this.$router.push("/login");
    }
  }
};
</script>

<style scoped>
</style>