<template>
  <div ref="div" class="spot">
    <!-- 头部 -->
    <el-row>
      <!-- 新增 -->
      <el-col :span="9">
        <el-button type="success" class="addbtn" @click="addClick">新增</el-button>
      </el-col>
      <!-- 搜索 -->
      <el-col :span="14">
        <el-input placeholder="请输入内容" v-model="queryInfo.keyword">
          <el-button slot="append" icon="el-icon-search" @click="searchClick"></el-button>
        </el-input>
      </el-col>
    </el-row>
    <!-- 表格 -->
    <el-table :data="spotData" style="width: 100%" border stripe>
      <el-table-column prop="_id" label="id" width="230"></el-table-column>
      <el-table-column prop="name" label="名称"></el-table-column>
      <el-table-column prop="gaoDeLon" label="经度"></el-table-column>
      <el-table-column prop="gaoDeLat" label="纬度"></el-table-column>
      <el-table-column prop="distance" label="智能播放距离"></el-table-column>
      <el-table-column prop="count" label="播放量"></el-table-column>
      <el-table-column label="音频">
        <template slot-scope="scope">
          <el-button type="success" icon="el-icon-message-solid" circle @click="open(scope.row)"></el-button>
        </template>
      </el-table-column>
      <el-table-column prop="updateTime" label="更新时间" width="230"></el-table-column>
      <el-table-column label="操作" width="180">
        <template slot-scope="scope">
          <el-button type="success" size="mini" @click="editClick(scope.row)">修改</el-button>
          <el-popconfirm
            title="确定删除吗？"
            placement="top"
            @onCancel="cancelDelete"
            @onConfirm="deleteClick(scope.row._id)"
          >
            <el-button class="delete" slot="reference" type="danger" size="mini">删除</el-button>
          </el-popconfirm>
        </template>
      </el-table-column>
    </el-table>
    <!-- 分页 -->
    <el-pagination
      @size-change="handleSizeChange"
      @current-change="handleCurrentChange"
      :current-page="queryInfo.pageIndex"
      :page-sizes="[5, 10, 20]"
      :page-size="queryInfo.pageSize"
      layout="total, sizes, prev, pager, next, jumper"
      :total="total"
    ></el-pagination>
    <!-- 弹窗 -->
    <el-drawer @close="addClose" title="新增/修改" :visible.sync="addDialog">
      <!-- 表单 -->
      <el-form
        :inline="true"
        :model="addRuleForm"
        :rules="addRules"
        ref="addRuleFormRef"
        label-width="100px"
        label-position="top"
      >
        <el-form-item class="spotInput" label="名称" prop="name">
          <el-input v-model="addRuleForm.name" style="width:300px "></el-input>
        </el-form-item>
        <el-form-item class="spotInput" label="距离" prop="distance">
          <el-input v-model="addRuleForm.distance" style="width:300px"></el-input>
        </el-form-item>
        <el-form-item class="spotInput" label="经度" prop="gaoDeLon">
          <el-input readonly v-model="addRuleForm.gaoDeLon" style="width:300px"></el-input>
        </el-form-item>
        <el-form-item class="spotInput" label="纬度" prop="gaoDeLat">
          <el-input readonly v-model="addRuleForm.gaoDeLat" style="width:300px "></el-input>
        </el-form-item>
        <!-- 上传 -->
        <el-upload
          ref="uploadRef"
          drag
          :action="uploadUrl"
          :headers="uploadHeaders"
          :before-upload="beforeUpload"
          :file-list="uploadList"
          :on-success="handleSuccess"
          :on-error="handleError"
          :limit=1
          :on-exceed="onExceed"
        >
          <i class="el-icon-upload"></i>
          <div class="el-upload__text">
            将文件拖到此处，或
            <em>点击上传</em>
          </div>
        </el-upload>
        <!-- 地图 -->
        <div class="amap">
          <a-map :location-array="locationArray" @locationChange="locationChange"></a-map>
        </div>
        <el-form-item class="footer">
          <el-button @click="cancelClick">取消</el-button>
          <el-button @click="saveClick" type="primary">提交</el-button>
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
      locationArray:[],
      addDialog: false,
      addRuleForm: {
        _id: "",
        pid: "",
        name: "",
        voiceUrl: "",
        gaoDeLon: "",
        gaoDeLat: "",
        distance: ""
      },
      addRules: {
        name: [{ required: true, message: "请输入名称", trigger: "blur" }],
        distance: [
          { required: true, message: "请输入自动播放距离", trigger: "blur" }
        ],
        gaoDeLon: [{ required: true, message: "请输入经度", trigger: "blur" }],
        gaoDeLat: [{ required: true, message: "请输入纬度", trigger: "blur" }]
      },
      spotData: [],
      queryInfo: {
        pid: "",
        keyword: "",
        pageIndex: 1,
        pageSize: 5
      },
      total: 0,
      arr: [],
      uploadList: [],
      uploadUrl: this.$http.defaults.baseURL + `/common/upload`,
      uploadHeaders: {
        token: window.sessionStorage.getItem("token")
      }
    };
  },
  components: {
    AMap
  },
  created() {
    this.queryInfo.pid = this.$router.history.current.params.id;
    this.addRuleForm.pid = this.$router.history.current.params.id;
    this.getSpotData();
  },
  methods: {
    onExceed(files, fileList){
      this.$message.error('只能上传1个文件')
    },
    handleSuccess(response, file, fileList) {
      if (response.success) {
        this.addRuleForm.voiceUrl = response.data;
        this.uploadList = [
          {
            name: file.name,
            url: response.data
          }
        ];
        this.$message.success('上传成功')
      }else{
        this.$message.error('上传失败')
      }
    },
    handleError(err, file, fileList) {
      this.$message.error('服务器出问题了，请稍后再试')
    },
    beforeUpload(file) {
      var radioLast = file.name.substring(file.name.lastIndexOf(".") + 1);
      const msg = radioLast === "mp3";
      if (!msg) {
        this.$message({
          message: "上传文件只能是mp3格式！",
          type: "error"
        });
      }
      return msg;
    },
    getSpotData() {
      this.$http
        .get("/spot/query", {
          params: this.queryInfo
        })
        .then(res => {
          if ((res.status = 200)) {
            this.spotData = res.data.data.arrays;
            this.total = res.data.data.totalCount;
          }
        });
    },
    searchClick() {
      this.queryInfo.pageIndex = 1;
      this.getSpotData();
    },
    open(row) {
      this.$alert(
        `<div><audio id="audio" controls autoplay src="${this.$http.defaults.baseURL}${row.voiceUrl}"></audio></div>`,
        `${row.name}`,
        {
          dangerouslyUseHTMLString: true,
          showClose: false,
          confirmButtonText: "关闭",
          beforeClose: function(action, instance, done) {
            var audio = document.getElementById("audio");
            audio.pause();
            done();
          }
        }
      );
      this.$http.get(`/spot/visit/${row._id}`).then(res => {
        this.getSpotData();
      });
    },
    addClick() {
      (this.addRuleForm._id = ""),
        (this.addRuleForm.name = ""),
        (this.addRuleForm.gaoDeLon = ""),
        (this.addRuleForm.gaoDeLat = ""),
        (this.addRuleForm.voiceUrl = ""),
        (this.addRuleForm.distance = ""),
        (this.addDialog = true);
    },
    locationChange(location) {
      this.addRuleForm.gaoDeLon = location.lng;
      this.addRuleForm.gaoDeLat = location.Lat;
    },
    editClick(row) {
      (this.addRuleForm._id = row._id),
        (this.addRuleForm.name = row.name),
        (this.addRuleForm.voiceUrl = row.voiceUrl),
        (this.addRuleForm.distance = row.distance),
        (this.addRuleForm.gaoDeLon = row.gaoDeLon),
        (this.addRuleForm.gaoDeLat = row.gaoDeLat);
        this.uploadList=[{
          name:row.name,
          url:row.voiceUrl
        }]
        this.locationArray = [row.gaoDeLon,row.gaoDeLat]
      this.addDialog = true;
    },
    saveClick() {
      this.$refs.addRuleFormRef.validate(async valid => {
        if (!valid) return;
        const { data: res } = await this.$http.post(
          `/spot/update`,
          this.addRuleForm
        );
        if (!res.success) return this.$message.error("更新失败");
        this.$message.success("更新成功");
        this.$refs.uploadRef.clearFiles()
        this.addDialog = false;
        this.getSpotData();
      });
    },
    cancelClick(){
      this.addDialog = false
      this.$refs.uploadRef.clearFiles()
    },
    handleSizeChange(newSize) {
      this.queryInfo.pageSize = newSize;
      this.getSpotData();
    },
    handleCurrentChange(newPage) {
      this.queryInfo.pageIndex = newPage;
      this.getSpotData();
    },
    addClose() {
      this.$refs.uploadRef.clearFiles()
      this.$refs.addRuleFormRef.resetFields();
    },
    deleteClick(id) {
      this.$http.delete(`spot/destroy/${id}`).then(res => {
        if (!res.data.success) return this.$message.error("删除失败");
        this.spotData.forEach(item => {
          this.arr.push(item._id);
        });
        const i = this.arr.indexOf(id);
        this.spotData.splice(i, 1);
        this.$message.success("删除成功");
      });
    },
    cancelDelete() {
      this.$message.info("已取消");
    }
  }
};
</script>

<style scoped>
.addbtn {
  width: 100%;
  padding: 7px 20px;
  margin-right: 20px;
}
.el-col-9 {
  margin-right: 30px;
}
.el-table {
  margin-top: 30px;
}
.spotInput {
  width: 320px !important;
}
.el-form .spotInput:nth-of-type(odd) {
  margin-right: 40px;
}
.footer {
  margin-top: 30px;
}
.el-pagination {
  margin-top: 20px;
  display: flex;
  justify-content: center;
}
.delete {
  margin-left: 10px;
}
</style>