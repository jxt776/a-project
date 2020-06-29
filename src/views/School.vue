<template>
  <div>
    <!-- 头部 -->
    <el-row>
      <el-col :span="9">
        <el-button @click="addClick" class="col_btn" type="success">新增</el-button>
      </el-col>
      <el-col :span="14">
        <el-input class="search" v-model="queryInfo.keyword" maxlength="100" placeholder="请输入内容">
          <el-button slot="append" icon="el-icon-search" @click="searchClick"></el-button>
        </el-input>
      </el-col>
    </el-row>
    <!-- 表格 -->
    <el-table border stripe :data="schoolData" style="width: 100%">
      <el-table-column prop="_id" width="220" label="id"></el-table-column>
      <el-table-column prop="name" label="名称"></el-table-column>
      <el-table-column prop="gaoDeLon" width="100" label="经度"></el-table-column>
      <el-table-column prop="gaoDeLat" width="100" label="维度"></el-table-column>
      <el-table-column prop="count" width="100" label="访问量"></el-table-column>
      <el-table-column prop="updateTime" width="200" label="更新时间"></el-table-column>
      <el-table-column label="操作" width="400">
        <template slot-scope="scope">
          <el-button type="success" size="mini" @click="lookClick(scope.row)">预览</el-button>
          <el-button type="success" size="mini" @click="spot(scope.row._id)">管理标注点</el-button>
          <el-button @click="editClick(scope.row)" size="mini" type="primary">修改</el-button>
          <el-popconfirm
            class="delete"
            @onCancel="cancelDelete"
            @onConfirm="deleteSchoolInfo(scope.row._id)"
            title="确定删除该账户吗？"
            placement="top"
          >
            <el-button slot="reference" type="danger" size="mini">删除</el-button>
          </el-popconfirm>
        </template>
      </el-table-column>
    </el-table>
    <!-- 分页 -->
    <el-pagination
      @size-change="handleSizeChange"
      @current-change="handleCurrentChange"
      :current-page="queryInfo.pageIndex"
      :page-sizes="[8, 10, 20]"
      :page-size="queryInfo.pageSize"
      layout="total, sizes, prev, pager, next, jumper"
      :total="total"
    ></el-pagination>
    <!-- 弹窗 -->
    <el-drawer @close="addClose" title="新增/修改" :visible.sync="drawerVisible">
      <!-- 表单 -->
      <el-form
        :inline="true"
        :model="addForm"
        :rules="addFormrules"
        ref="addFormRef"
        label-width="100px"
        label-position="top"
      >
        <el-form-item label="名称" prop="name">
          <el-input v-model="addForm.name" style="width:650px"></el-input>
        </el-form-item>
        <el-form-item label="经度" prop="gaoDeLon" class="gaoDeLonItem">
          <el-input readonly v-model="addForm.gaoDeLon" style="width:300px"></el-input>
        </el-form-item>
        <el-form-item label="纬度" prop="gaoDeLat">
          <el-input readonly v-model="addForm.gaoDeLat" style="width:300px "></el-input>
        </el-form-item>
        <!-- 地图 -->
        <div class="amap">
          <a-map :location-array="locationArray" @locationChange="locationChange"></a-map>
        </div>
        <el-form-item>
          <el-button @click="drawerVisible=false">取消</el-button>
          <el-button @click="saveSchoolData" type="primary">提交</el-button>
        </el-form-item>
      </el-form>
    </el-drawer>
  </div>
</template>

<script>
import AMap from "./common/AMap";
export default {
  data() {
    return {
      locationArray: [],
      schoolData: [],
      queryInfo: {
        keyword: "",
        pageIndex: 1,
        pageSize: 8
      },
      //   总条数
      total: 0,
      arr: [],
      //  新增按钮弹窗开关
      drawerVisible: false,
      //   新增表单
      addForm: {
        name: "",
        gaoDeLon: "",
        gaoDeLat: "",
        _id: ""
      },
      //   新增表单规则
      addFormrules: {
        name: { required: true, message: "请输入名称", trigger: "blur" },
        gaoDeLon: { required: true, message: "请输入经度", trigger: "blur" },
        gaoDeLat: { required: true, message: "请输入纬度", trigger: "blur" }
      }
    };
  },
  components: {
    AMap
  },
  created() {
    this.getSchoolData();
  },
  methods: {
    // 经纬度获取
    locationChange(location) {
      this.addForm.gaoDeLon = location.lng;
      this.addForm.gaoDeLat = location.lat;
    },
    //   获取数据
    async getSchoolData() {
      const { data: res } = await this.$http.get("/school/query", {
        params: this.queryInfo
      });
      if (!res.success) return this.$message.error("数据获取失败");
      this.schoolData = res.data.arrays;
      this.total = res.data.totalCount;
    },
    //   搜索
    searchClick() {
      this.queryInfo.pageIndex = 1;
      this.getSchoolData();
    },
    // 点击修改按钮
    editClick(row) {
      this.addForm._id = row._id;
      this.addForm.name = row.name;
      this.addForm.gaoDeLon = row.gaoDeLon;
      this.addForm.gaoDeLat = row.gaoDeLat;
      this.locationArray = [row.gaoDeLon, row.gaoDeLat];
      this.drawerVisible = true;
    },
    // 新增
    addClick() {
      (this.addForm.name = ""),
        (this.addForm.gaoDeLon = ""),
        (this.addForm.gaoDeLat = ""),
        (this.addForm._id = "");
      this.drawerVisible = true;
    },
    // 添加表单关闭时清空
    addClose() {
      this.$refs.addFormRef.resetFields();
    },
    // 提交
    saveSchoolData() {
      this.$refs.addFormRef.validate(async valid => {
        if (!valid) return this.$message.error("请输入正确信息");
        const { data: res } = await this.$http.post(
          `/school/update`,
          this.addForm
        );
        if (!res.success) return this.$message.error("提交失败");
        this.$message.success("提交成功");
        this.drawerVisible = false;
        this.$refs.addFormRef.resetFields();
        this.getSchoolData();
      });
    },
    // 换每页多少条
    handleSizeChange(newSize) {
      this.queryInfo.pageSize = newSize;
      this.getSchoolData();
    },
    // 换页
    handleCurrentChange(newPage) {
      this.queryInfo.pageIndex = newPage;
      this.getSchoolData();
    },
    // 删除 确定
    async deleteSchoolInfo(id) {
      const { data: res } = await this.$http.delete(`/school/destroy/${id}`);
      if (!res.success) return this.$message.error("删除失败");

      this.schoolData.forEach(item => {
        this.arr.push(item._id);
      });
      const i = this.arr.indexOf(id);
      this.schoolData.splice(i, 1);
      this.$message.success("已删除");
    },
    // 取消删除
    cancelDelete() {
      this.$message.info("已取消删除");
    },
    spot(id) {
      this.$router.push({
        name: "Spot",
        params: {
          id
        }
      });
    },
    lookClick(row) {
      this.$http.get(`/school/visit/${row._id}`).then(res => {
        this.getSchoolData();
      });
      window.open(`${this.$http.defaults.baseURL}/?pid=${row._id}`);
    }
  }
};
</script>

<style scoped>
.amap {
  width: 98%;
  height: 300px;
  margin-bottom: 80px;
}
.el-pagination {
  margin-top: 20px;
  display: flex;
  justify-content: center;
}
.search {
  margin-left: 30px;
}
.col_btn {
  width: 100%;
  padding: 7px 20px !important;
}
.el-table {
  margin-top: 20px;
}
.el-form-item {
  margin-right: 50px !important;
}
.delete {
  margin-left: 10px;
}
</style>