import Vue from 'vue'
import App from './App.vue'
import router from './router'
import axios from 'axios'
import './assets/css/global.css'

import ElementUI from 'element-ui';
import 'element-ui/lib/theme-chalk/index.css';
Vue.use(ElementUI);

Vue.config.productionTip = false

axios.defaults.baseURL = 'https://school.zhuzhida.vip'
Vue.prototype.$http = axios

axios.interceptors.request.use(config=>{
  // console.log(config)
  config.headers.token = window.sessionStorage.getItem('token')
  return config
})

new Vue({
  router,
  render: h => h(App)
}).$mount('#app')
