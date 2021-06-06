<template>
  <el-container>
    <el-header>
      <div>
        <el-avatar
          src="https://cube.elemecdn.com/0/88/03b0d39583f48206768a7534e55bcpng.png"
        ></el-avatar>
      </div>
      <div>
        <el-input v-model="channelName" placeholder="请输入房间号">
          <el-button
            slot="append"
            icon="el-icon-search"
            @click="joinVideoRoom(channelName)"
            >确定</el-button
          >
        </el-input>
      </div>
    </el-header>
    <el-container>
      <el-aside width="auto">
        <div class="recommend-aside">
          <div style="height:20px"></div>
          <div><p>猜你想聊</p></div>
          <div v-for="item in recommend" :key="item.id">
            <div class="user">
            <div class="avatar">
              <el-avatar
                src="https://cube.elemecdn.com/0/88/03b0d39583f48206768a7534e55bcpng.png"
              ></el-avatar>
            </div>
            <div class="aside">
              <div class="label">{{item.username}} <span>在线</span></div>
              <div class="info">
                <div>你们看过{{item.numbers}}部相同的作品</div>
                <div>
                  你们共同的标签 
                    <el-tag v-for="i in item.tags" :key="i" type="info">{{i}}</el-tag>
                </div>
                <div>ta正在看<b>《{{item.viewing}}》</b></div>
                <div class="join-button"><el-button @click="joinVideoRoom(item.room)">加入房间</el-button></div>
              </div>
            </div>
          </div>
          </div>
          
          <div class="control">
            <el-button type="primary" icon="el-icon-refresh-right"
              >换一批</el-button
            >
            <el-divider></el-divider>
            <el-switch
              style="display: block"
              v-model="visiableSwitcher"
              active-color="#13ce66"
              inactive-color="#ff4949"
              active-text=""
              inactive-text="允许其他用户看到你"
            >
            </el-switch>
          </div>
        </div>
      </el-aside>
      <el-main>
        <div class="carousel">
          <el-carousel indicator-position="outside" type="card">
            <el-carousel-item v-for="item in carouselData" :key="item.id + 18">
              <div>
                <el-image fit="fit" :src="'/server/' + item.image">
                  <div slot="placeholder" class="image-slot">
                    加载中<span class="dot">...</span>
                  </div></el-image
                >
              </div>
            </el-carousel-item>
          </el-carousel>
        </div>
        <div class="title-row">
          <div :class="tabIndex==1?'title-button':'title-button-normal'">
            <el-button @click="chooseTab(1)">热门影视</el-button>
            </div>
          <div class="blank"></div>
          <div :class="tabIndex==2?'title-button':'title-button-normal'">
            <el-button @click="chooseTab(2)">热门游戏</el-button>
            </div>
          <div class="blank"></div>
          <div :class="tabIndex==3?'title-button':'title-button-normal'"
          ><el-button @click="chooseTab(3)">直播频道</el-button>
          </div>
          <div class="blank"></div>
          <div :class="tabIndex==4?'title-button':'title-button-normal'"
          ><el-button @click="chooseTab(4)">共享影院</el-button>
          </div>
        </div>
        <div style="height:10px"></div>
        <div class="container" v-if="tabIndex==1">
          <div
            v-for="item in containerData.movie_list"
            :key="item.id"
            class="content"
          >
            <div @click="createVideoPage(item.id)">
              <el-image fit="fit" :src="'/server/' + item.image">
                <div slot="placeholder" class="image-slot">
                  加载中<span class="dot">...</span>
                </div></el-image
              >
              <div class="info">
                <div>
                  {{ item.name }}
                  <el-tag v-for="t in item.type" :key="t" type="info">{{
                    t
                  }}</el-tag>
                </div>
              </div>
            </div>
          </div>
        </div>
        <div class="container" v-if="tabIndex==2">
          <div
            v-for="item in containerData.game_list"
            :key="item.id"
            class="content"
          >
            <div @click="createVideoPage(item.id)">
              <el-image fit="fit" :src="'/server/' + item.image">
                <div slot="placeholder" class="image-slot">
                  加载中<span class="dot">...</span>
                </div></el-image
              >
              <div class="info">
                <div>
                  {{ item.name }}
                  <el-tag v-for="t in item.type" :key="t" type="info">{{
                    t
                  }}</el-tag>
                </div>
              </div>
            </div>
          </div>
        </div>
        <div class="upload" v-if="tabIndex==4">
          <div class="content">
          <UploadView></UploadView>
          </div>
        </div>
      </el-main>
    </el-container>
  </el-container>
</template>

<script>
import axios from "axios";
import { message } from "../../components/message";
import UploadView from './upload'

export default {
  name: "main",
  components:{UploadView},
  data() {
    return {
      carouselData: [],
      containerData: [],
      channelName: "",
      visiableSwitcher: true,
      recommend: [],

      // tab
      tabIndex: 1 // 1 影视 2 游戏 3 直播 4 私人
    };
  },
  created(){
    let arr = ["./aliyun-upload-sdk/lib/es6-promise.min.js",
      "./aliyun-upload-sdk/lib/aliyun-oss-sdk-6.13.0.min.js",
      "./aliyun-upload-sdk/aliyun-upload-sdk-1.5.2.min.js",
      "./sha256.js"];
    arr.map((item) => {
      let script = document.createElement("script");
      script.type = "text/javascript";
      script.src = item;
      document.getElementsByTagName("body")[0].appendChild(script);
    });
  },
  mounted() {
    axios
      .get("/server/api/videolist")
      .then((res) => {
        this.containerData = res.data;
        this.carouselData = res.data.ad_list;
      })
      .catch((err) => console.log(err));

    axios
      .get("/server/api/recommend")
      .then((res) => {
        this.recommend = res.data
      })
  },
  methods: {
    chooseTab(index){
      this.tabIndex = index
    },
    createVideoPage(id) {
      let channelName = Math.random().toFixed(5).slice(-5);
      // 连接同步视频socket
      let socket = this.$socketio;
      this.$socketio.on("my_response", function (msg, cb) {
        console.log("socket_response", msg);
      });
      this.$socketio.emit("join", { room: channelName, id: id});
      const { path = "single" } = this.$route.query;
      this.$router.push({
        path: `/${path}`,
        query: { channelName, id},
      });
    },
    joinVideoRoom(channelName) {
      console.log(channelName);
      let socket = this.$socketio;
      let that = this;
      this.$socketio.on("id_response", function (msg, cb) {
        console.log("id_response", msg);
        if (msg.err == 1) {
          let data = msg.data
          if(data['id']!=undefined){
            let id = data.id;
            const { path = "single" } = that.$route.query;
            that.$router.push({
              path: `/${path}`,
              query: { channelName, id },
            });
          }else if(data['videoId']!=undefined){
            let videoId = data.videoId
            const { path = "private_single" } = that.$route.query;
            that.$router.push({
                path: `/${path}`,
                query: { channelName, videoId },
            });
          }

        } else {
          message("当前无该房间！");
        }
      });
      this.$socketio.emit("join", { room: channelName });
    },
  },
};
</script>

<style lang="less" scoped>
.el-header {
  display: flex;
  align-items: center;
  padding: 0 20px;
  background: #c5daeb;

  div {
    margin: 0 10px 0 10px;
  }
}

.el-aside {
  width: unset;
  max-width: 28%;
}

.recommend-aside {
  margin: 10px 10px 10px 32px;
  padding: 0 20px 20px 20px;
  //background: white;
  border: solid gainsboro 1px;
  border-radius: 4px;
  .user {
    display: flex;
    padding: 10px;

    .avatar {
      height: 100%;
      text-align: justify;
      margin-right: 10px;
      //padding-right: 10px;
    }

    .aside {
      display: inline-flex;
      flex-direction: column;

      .label {
        width: 100%;
        height: 20px;
        font-size: 15px;
        color: gray;

        span {
          color: #409eff;
        }
      }
      .info {
        font-size: 13px;

        div {
          margin: 5px 0 5px 0;
        }

        .join-button {
          text-align: right;

          button {
            padding: 0;
            background: none;
            border: none;
            color: #409eff;
          }
        }
      }
    }
  }

  .control {
    .el-button {
      background: none;
      border: none;
      color: #409eff;
      padding: 0;
    }

    .el-divider {
      margin: 10px;
    }
    .el-switch {
      text-align: right;
    }
  }
}

.el-main {
  display: flex;
  align-items: flex-start;
  flex-direction: column;
  margin-left: 32px;
}
.carousel {
  display: block;
  width: 80%;
  min-width: 1200px;

  .el-carousel__item h3 {
    color: #475669;
    font-size: 18px;
    opacity: 0.75;
    line-height: 300px;
    margin: 0;
  }

  .el-carousel__item:nth-child(2n) {
    background-color: #99a9bf;
    border-radius: 8px;
  }

  .el-carousel__item:nth-child(2n + 1) {
    background-color: #d3dce6;
    border-radius: 8px;
  }
}
.title-row{
  display: flex;
  align-items:flex-end;
  .title-button {
    border-bottom: 5px solid #c5daeb;
    button {
      text-align: left;
      font-size: 30px;
      font-family: "Segoe UI", Tahoma, Geneva, Verdana, sans-serif;
      margin: 50px 0 10px 0;
      align-self: center;
      padding: 0;
      background: none;
      border: none;
      color: #000000;
    }
  }

  .title-button-normal {
    button {
      text-align: left;
      font-size: 25px;
      font-family: "Segoe UI", Tahoma, Geneva, Verdana, sans-serif;
      margin: 50px 0 10px 0;
      align-self: auto;
      padding: 0;
      background: none;
      border: none;
      color: #000000;
    }
  }

  .blank{
    width: 30px
  }
}


.title {
  font-size: 30px;
  font-family: "Segoe UI", Tahoma, Geneva, Verdana, sans-serif;
  margin: 50px 0 10px 0;
  align-self: auto;
  width: 80%;
  min-width: 1200px;
}

.container {
  display: flex;
  flex-wrap: wrap;
  width: 80%;
  min-width: 1200px;
  justify-content: space-between;

  .content {
    width: 28%;
    height: auto;
    margin: 0 0 20px 0;
    cursor: pointer;

    .el-image {
      border-radius: 8px;
    }

    .info {
      margin: 5px 0 0 0;
      .el-tag {
        border: none;
      }
    }
  }
}

.upload{
  width: 80%;
  background-color: #ffffff;
  align-content: center;
  align-items: center;
  .content{
    width: 70%;
    margin-top: 10px;
    margin-left: 5%;
    margin-right: 5%;
    margin-bottom: 10px;
  }
}
</style>