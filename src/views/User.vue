<template>
  <div>
    <!-- 头部 -->
    <el-row>
      <el-col :span="9">
        <el-button @click="addClick" class="col_btn" type="success">新增</el-button>
      </el-col>
      <el-col :span="14">
        <el-input class="search" maxlength="100" placeholder="请输入内容" v-model="queryInfo.keyword">
          <el-button @click="getUserData" slot="append" icon="el-icon-search"></el-button>
        </el-input>
      </el-col>
    </el-row>
    <!-- 表格 -->
    <el-table stripe border :data="userData" style="width: 100%">
      <el-table-column prop="_id" label="id" width="260"></el-table-column>
      <el-table-column prop="username" label="账号"></el-table-column>
      <el-table-column prop="password" label="密码"></el-table-column>
      <el-table-column prop="phone" label="手机号"></el-table-column>
      <el-table-column width="260" prop="updateTime" label="更新时间"></el-table-column>
      <el-table-column width="200" label="操作">
        <template slot-scope="scope">
          <el-button @click="editUserInfo(scope.row)" type="primary" size="mini">修改</el-button>
          <el-popconfirm @onCancel="cancelDelete" @onConfirm='deleteUserInfo(scope.row._id)' title="确定删除该账户吗？" placement="top">
            <el-button slot="reference" type="danger" size="mini">删除
            </el-button>
          </el-popconfirm>
        </template>
      </el-table-column>
    </el-table>
    <!-- 分页 -->
    <el-pagination
      @size-change="handleSizeChange"
      @current-change="handleCurrentChange"
      :current-page="queryInfo.pageIndex"
      :page-sizes="[2, 4, 6, 8]"
      :page-size="queryInfo.pageSize"
      layout="total, sizes, prev, pager, next"
      :total="totalCount"
    ></el-pagination>
    <!-- 新增 -->
    <el-drawer
      title="新增/修改"
      :visible.sync="drawerVisible"
      ref="drawerRef">
      <div class="demo-drawer__content">
        <el-form
          :inline="true"
          :model="userForm"
          :rules="userFormRules"
          ref="userFormRef"
          label-width="100px"
          label-position="top"
        >
          <el-form-item style="width:40%" label="账户名称" prop="username">
            <el-input v-model="userForm.username" placeholder="请输入账户名称"></el-input>
          </el-form-item>
          <el-form-item style="width:40%" label="密码" prop="password">
            <el-input v-model="userForm.password" placeholder="请输入密码" show-password></el-input>
          </el-form-item>
          <el-form-item style="width:40%" label="手机号" prop="phone">
            <el-input v-model="userForm.phone" placeholder="请输入手机号"></el-input>
          </el-form-item>
        </el-form>
        <div class="demo-drawer__footer">
          <el-button @click="drawerVisible = false">取 消</el-button>
          <el-button @click="saveUserInfo" type="primary">提交</el-button>
        </div>
      </div>
    </el-drawer>
    <!-- 编辑 -->
    <el-drawer
      @close ="editClose"
      title="新增/修改"
      :visible.sync="drawerVisible">
      <div class="demo-drawer__content">
        <el-form
          :inline="true"
          :model="userForm"
          :rules="userFormRules"
          ref="editUserFormRef"
          label-width="100px"
          label-position="top"
        >
          <el-form-item style="width:40%" label="账户名称" prop="username">
            <el-input v-model="userForm.username" placeholder="请输入账户名称"></el-input>
          </el-form-item>
          <el-form-item style="width:40%" label="密码" prop="password">
            <el-input v-model="userForm.password" placeholder="请输入密码" show-password></el-input>
          </el-form-item>
          <el-form-item style="width:40%" label="手机号" prop="phone">
            <el-input v-model="userForm.phone" placeholder="请输入手机号"></el-input>
          </el-form-item>
        </el-form>
        <div class="demo-drawer__footer">
          <el-button @click="drawerVisible = false">取 消</el-button>
          <el-button @click="editUserClick" type="primary">提交</el-button>
        </div>
      </div>
    </el-drawer>
  </div>
</template>

<script>
export default {
  data() {
    var checkMobile = (rule, value, cb) => {
      const mobileRule = /^(?:(?:\+|00)86)?1[3-9]\d{9}$/;
      if (mobileRule.test(value)) {
        return cb();
      }
      cb(new Error("请输入正确的手机号"));
    };
    return {
      //  新增 用户表单
      userForm: {
        username: "",
        password: "",
        phone: "",
        _id:""
      },
      //  新增 用户表单规则
      userFormRules: {
        username: [
          { required: true, message: "请输入账户名称", trigger: "blur" },
          { min: 3, max: 10, message: "长度在 3 到 10 个字符", trigger: "blur" }
        ],
        password: [
          { required: true, message: "请输入密码", trigger: "blur" },
          { min: 3, max: 10, message: "长度在 3 到 10 个字符", trigger: "blur" }
        ],
        phone: [
          {
            required: true,
            message: "请输入手机号",
            trigger: "blur",
            validator: checkMobile
          }
        ]
      },
      //   用户数据
      userData: [],
      //   传入参数
      queryInfo: {
        keyword: "",
        pageIndex: 1,
        pageSize: 8
      },
      //   drawer开关
      drawerVisible: false,
      //   数量
      totalCount: 0,
      // 临时数组
      arr : [],
      // 修改表单
      editUserForm:{
        username: "",
        password: "",
        phone: ""
        }
    };
  },
  created() {
    this.getUserData();
  },
  methods: {
    async getUserData() {
      const { data: res } = await this.$http.get("/user/query", {
        params: this.queryInfo
      });

      if (!res.success) return this.$message.error(res.errorMsg);
      this.userData = [];
      this.userData = res.data.arrays;
      this.totalCount = res.data.totalCount;
    },
    // 点击新增按钮
    addClick() {
      this.userForm={
        username: "",
        password: "",
        phone: "",
        _id:""
      }
      this.drawerVisible = true;
    },
    // 点击drawer叉号关闭
    async drawerHandleClose() {
      const confirmResult = await this.$confirm("确认关闭？").catch(err => err);
      if (confirmResult == "cancel") return;
      this.drawerVisible = false;
    },
    // 换每页多少条数据
    handleSizeChange(newSize) {
      this.queryInfo.pageSize = newSize;
      this.getUserData();
    },
    // 换页
    handleCurrentChange(newPage) {
      this.queryInfo.pageIndex = newPage;
      this.getUserData();
    },
    // 提交
    saveUserInfo() {
      this.$refs.userFormRef.validate(async valid => {
        if (!valid) return this.$message.error('请输入正确的信息');
        const { data: res } = await this.$http.post("/user/update", {
          username: this.userForm.username,
          password: this.userForm.password,
          phone: this.userForm.phone
        });
        if (!res.success) return this.$message.error("提交失败");
        this.$message.success("添加成功");
        this.getUserData();
        this.drawerVisible = false;
      });
    },
    // 删除 确定
    async deleteUserInfo(id) {
      const {data:res} = await this.$http.delete(`/user/destroy/${id}`)
      
      if(!res.success) return this.$message.error('删除失败')
      this.$message.success('删除成功')
      
      this.userData.forEach(item=>{
        this.arr.push(item._id)
      })
      const i = this.arr.indexOf(id)
      this.userData.splice(i,1) //虚拟删除
    },
    // 删除 取消
    cancelDelete(){
      this.$message.info('已取消')
    },
    // 编辑
    editUserInfo(row){
      this.userForm.username = row.username
      this.userForm.password = row.password
      this.userForm.phone = row.phone
      this.userForm._id = row._id
      this.drawerVisible = true
    },
     // 新增表单关闭
    editClose(){
      this.$refs.userFormRef.resetFields()
    },
    // 编辑表单关闭
    editClose(){
      this.$refs.editUserFormRef.resetFields()
    },
    // 保存编辑表单 提交按钮
    editUserClick(){
        this.$refs.editUserFormRef.validate(async valid=>{
          if (!valid) return this.$message.error('请输入正确的信息');
            const { data: res } = await this.$http.post(`/user/update`,{
              _id:this.userForm._id,
              username: this.userForm.username,
              password: this.userForm.password,
              phone: this.userForm.phone
            });
          if (!res.success) return this.$message.error("提交失败");
          this.$message.success("修改成功");
          this.getUserData();
          this.drawerVisible = false;
        })
    }
  }
};
</script>

<style scoped>
.el-pagination {
  margin-top: 10px;
  display: flex;
  justify-content: center;
}
.col_btn {
  width: 100%;
  padding: 7px 20px !important;
}
.el-table {
  margin-top: 20px;
}
.search {
  margin-left: 30px;
}
.el-button--mini{
  margin-right:10px ;
}
</style>