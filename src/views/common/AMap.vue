<template>
  <div class="map">
    <p>小提示：地图上单击鼠标即可完成经纬度设置</p>
    <div class="amap">
      <div id="container"></div>
      <div id="tip">
        <input type="text" id="keyword" placeholder="请输入关键字：(选定后搜索)"/>
      </div>
    </div>
  </div>
</template>

<script>
import Amap from "../../plugin/amap";
export default {
  data() {
    return {};
  },
  props: {
    locationArray: {
      type: Array,
      default: () => {
        return [];
      }
    }
  },
  watch: {
    locationArray(locationArray) {
      this.locationArray = locationArray;
      if (locationArray.length) {
        this.setMarkerEvent(locationArray);
      }
    }
  },
  mounted() {
    this.initMap();
    this.setMarkerEvent(this.locationArray);
  },
  methods: {
    setMarkerEvent(locationArray) {
      this.map.remove(this.markers);
      var marker = new AMap.Marker({
        position: locationArray,
        map: this.map
      });
      this.markers.push(marker);
      this.map.setFitView();
    },
    initMap() {
      const self = this;
      self.markers = [];
      self.map = new AMap.Map("container", {
        resizeEnable: true, //是否监控地图容器尺寸变化
        zoom: 11, //初始化地图层级
        center: [116.397428, 39.90923], //初始化地图中心点
        keyboardEnable: false
      });
      //点击地图获得坐标
      self.map.on("click", e => {
        this.$emit("locationChange", e.lnglat);
        regeoCode(e.lnglat);
      });
      // 搜索
      AMap.plugin(["AMap.Autocomplete", "AMap.PlaceSearch"], function() {
        var autoComplete = new AMap.Autocomplete({
          city: "北京", //城市，默认全国
          input: "keyword" //使用联想输入的input的id
        });
        var placeSearch = new AMap.PlaceSearch({
          city: "010", // 兴趣点城市
          map: self.map // 展现结果的地图实例
        });
        AMap.event.addListener(autoComplete, "select", select); //注册监听，当选中某条记录时会触发
        function select(e) {
          placeSearch.search(e.poi.name, function(status, result) {
            if (status === "complete" && result.info === "OK") {
              keywordSearch_CallBack(result.poiList.pois);
            }
          }); //关键字查询查询
        }
      });
      function regeoCode(lnglat) {
        var geocoder = new AMap.Geocoder({
          radius: 1000, //范围，默认：500
          extensions: "all" //取值为all返回地址信息
        });
        // 获取位置信息
        geocoder.getAddress(lnglat, function(status, result) {
          if (status === "complete" && result.info === "OK") {
            geocoder_callback(result, lnglat);
          } else {
            log.error("根据经纬度查询地址失败");
          }
        });
      }
      // 设置地址，城市，窗口
      function geocoder_callback(result, lnglat) {
        // 删除标记
        removeMarkes();
        var address = result.regeocode.formattedAddress;
        var city =
          result.regeocode.addressComponent.city ||
          result.regeocode.addressComponent.province;
        var infoWindow = new AMap.InfoWindow({
          offset: new AMap.Pixel(0, -30)
        });
        // 添加标记点
        var marker = new AMap.Marker({
          map: self.map,
          position: lnglat
        });
        // 给标记赋值
        (marker.city = city),
          (marker.address = address),
          (marker.infoWindow = infoWindow),
          (marker.content = "选中<<" + address + ">>地址!");
        marker.on("click", markerClick(marker));

        // 添加标记
        self.markers.push(marker);
        self.map.setFitView();
      }
      // 删除标记
      function removeMarkes() {
        self.map.remove(self.markers);
        self.markers = [];
      }
      //标点信息弹窗
      function markerClick(e) {
        e.infoWindow.setContent(e.content);
        e.infoWindow.open(self.map, e.getPosition());
      }
      // 搜索回调
      function keywordSearch_CallBack(pois) {
        removeMarkes();
        setView(pois);
      }
      //初始点窗口信息
      function setView(pois) {
       var lnglats = pois
       var infoWindow = new AMap.InfoWindow({
         offset:new AMap.Pixel(0,-30)
       })
       for(var i=0;i<lnglats.length;i++){
         var marker = new AMap.Marker({
           map:self.map,
           position:lnglats[i].location
         })
         marker.address = lnglats[i].address
         marker.city = lnglats[i].cityname
         marker.content = 
         "选中《" + lnglats[i].cityname + lnglats[i].address + "》为活动地址"
         marker.infoWindow = infoWindow
         marker.on("click",markerClick(marker))
         self.markers.push(marker)
         break
       }
      }
    }
  }
};
</script>

<style scoped>
#container {
  width: 100%;
  height: 300px;
}
.amap {
  position: relative;
}
#tip {
  background-color: #fff;
  color: #333;
  border: 1px solid silver;
  box-shadow: 3px 4px 3px 0px silver;
  position: absolute;
  top: 10px;
  left: 10px;
  width: 300px;
  border-radius: 5px;
  overflow: hidden;
  line-height: 20px;
}
#tip input[type="text"] {
  height: 25px;
  border: 0;
  padding-left: 5px;
  width: 280px;
  border-radius: 3px;
  outline: none;
}
</style>