<template>
    <div class="login">
        <div class="login-box">
            <div class="title">
                <p>登录 导览图管理后台</p>
            </div>
            <div class="userInfo">
                <el-form label-position="top" :model="loginForm" :rules="loginFormRules" ref="loginFormRef" label-width="50px">
                    <el-form-item label="账号" prop="username">
                        <el-input v-model="loginForm.username">
                            <i slot="prefix" class="el-input__icon el-icon-user"></i>
                        </el-input>
                    </el-form-item>
                    <el-form-item label="密码" prop="password">
                        <el-input show-password v-model="loginForm.password">
                            <i slot="prefix" class="el-input__icon el-icon-more-outline"></i>
                        </el-input>
                    </el-form-item>
                </el-form>
                <el-button @click="getLoginData" type="success">登录</el-button>
            </div>
        </div>
    </div>
</template>

<script>
export default {
   data() {
      return {
          loginForm:{
              username:'admin',
              password:'admin1234'
          },
          loginFormRules:{
              username:[
                { required: true, message: '请输入账号', trigger: 'blur' },
                { min: 3, max: 5, message: '长度在 3 到 5 个字符', trigger: 'blur' }
              ],
              password:[
                { required: true, message: '请输入密码', trigger: 'blur' },
                { min: 6, max: 10, message: '长度在 6 到 10 个字符', trigger: 'blur' }
              ]
          }
      }
   },
   methods: {
        getLoginData(){
           this.$refs.loginFormRef.validate( async valid=>{
               if(!valid) return
               const {data:res} = await this.$http.post(`common/login`,this.loginForm)
                if(!res.success) return this.$message.error(res.errorMsg)
                this.$message.success('登录成功')
                window.sessionStorage.setItem('token',res.data.token)
                this.$router.push('/Main')
           })
           
       }
   },
}
</script>

<style scoped>
.userInfo{
    margin-top:10px ;
}
.login{
    background:url('../assets/bg.jpeg') no-repeat center;
    background-size: 100% 100%;
    width:100%;
    height:100%;
}
.login-box{
    width: 400px;
    background-color: #fff;
    border-radius: 5px;
    position:absolute;
    top: 50%;
    left: 50%;
    transform: translate(-50%,-50%);
    padding: 15px;
}
.title{
    border-bottom: 1px solid #e8eaec;
    padding:0 20px 15px;
}
.title p{
    font-weight: 700;
    margin: 0;
    font-size: 16px;
}
.el-form-item{
    padding: 0 20px;
}
.el-button{
    text-align: center;
    margin-left:20px ;
    width: 90%;
    background-color: #19be6b;
}

</style>