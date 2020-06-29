// 高德地图
import Vue from 'vue';
import VueAMap from 'vue-amap';
Vue.use(VueAMap);
VueAMap.initAMapApiLoader({
  key: 'ed73167ac23649b1861e5fb315280ff9',
  plugin: ["AMap.Autocomplete", "AMap.PlaceSearch","AMap.Geocoder"],
  // 默认高德 sdk 版本为 1.4.4
  v: '1.4.4'
});