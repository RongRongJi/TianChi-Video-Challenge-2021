<template>
  <el-container style="height: 100%" direction="vertical">
    <el-header>
      <div>
        <el-avatar
          src="https://cube.elemecdn.com/0/88/03b0d39583f48206768a7534e55bcpng.png"
        ></el-avatar>
      </div>
      <div>
        <el-breadcrumb separator="/">
          <el-breadcrumb-item :to="{ path: '/' }">首页</el-breadcrumb-item>
          <el-breadcrumb-item
            >房间 {{ $route.query.channelName }}</el-breadcrumb-item
          >
        </el-breadcrumb>
      </div>
    </el-header>
    <el-container>
      <el-main>
        <div class="video_chat" ref="videoChat" v-resize="onResize">
          <div class="video">
            <VideoPage
              :src="src"
              :content="liveUrl"
              :uid="this.localUid"
            ></VideoPage>
          </div>
          <div class="intro">
            <div class="title" :v-if="content.name != undefined">
              <b>{{ content.name }}</b>
              <el-tag v-for="t in content.type" :key="t" type="info">{{
                t
              }}</el-tag>
            </div>
            <div style="margin-bottom: 10px; margin-top: 5px">
              <div
                style="
                  margin-right: 10px;
                  font-size: 14px;
                  font-weight: bold;
                  margin-bottom: 5px;
                "
              >
                {{ content.info }}
              </div>

              <div class="hor">
                <el-image
                  :v-if="img != ''"
                  :src="img"
                  style="width: 240px; height: 135px"
                  fit="fit"
                ></el-image>
                <div style="flex: 1; margin-left: 10px">
                  {{ content.content }}
                </div>
              </div>
            </div>
          </div>
        </div>
        <div class="content" ref="content" :style="{ height: chatHeight }">
          <div class="tab-bar">
            <el-button-group>
              <el-button
                type="info"
                v-if="isSilence"
                icon="iconfont icon-jingyin"
                @click="setOrRelieveSilence"
                circle
              ></el-button>
              <el-button
                type="info"
                v-else
                icon="iconfont icon-maikefeng"
                @click="setOrRelieveSilence"
                circle
              ></el-button>
              <el-button
                type="danger"
                icon="iconfont icon-guaduan"
                @click="goBack"
                circle
              ></el-button>
              <el-button
                type="info"
                v-if="isStop"
                icon="iconfont icon-shexiangtou-guanbi"
                @click="stopOrOpenVideo"
                circle
              ></el-button>
              <el-button
                type="info"
                v-else
                icon="iconfont icon-shexiangtou"
                @click="stopOrOpenVideo"
                circle
              ></el-button>
            </el-button-group>
            <el-divider direction="vertical"></el-divider>
            <el-button-group>
              <el-button
                type="info"
                icon="iconfont icon-fox"
                @click="canvasViewType = 2"
                circle
              ></el-button>
              <el-button
                type="info"
                icon="iconfont icon-gou"
                @click="canvasViewType = 1"
                circle
              ></el-button>
              <el-button
                type="info"
                icon="iconfont icon-glasses"
                @click="canvasViewType = 0"
                circle
              ></el-button>
            </el-button-group>
            <el-divider direction="vertical"></el-divider>
            <el-button-group>
              <el-button
                type="info"
                icon="iconfont icon-luzhi1"
                v-if="isRecord == -1"
                circle
                @click="recordDialog = true"
              ></el-button>
              <el-button
                type="info"
                icon="iconfont icon-luzhi"
                v-if="isRecord != -1"
                circle
                @click="()=>{submitDialog = true;this.$refs.canvasView.saveRecord()}"
              ></el-button>
            </el-button-group>
            <el-dialog
              title="生成反应视频"
              :visible.sync="recordDialog"
              width="30%"
            >
              <span
                >此功能将开启屏幕录制，再次点击录制按钮将自动为您生成反应视频</span
              >
              <span slot="footer" class="dialog-footer">
                <el-button @click="recordDialog = false">取 消</el-button>
                <el-button type="primary" @click="startRecorder()"
                  >确 定</el-button
                >
              </span>
            </el-dialog>
            <el-dialog
              title="生成反应视频"
              :visible.sync="submitDialog"
              width="30%"
            >
              <span
                >反应视频录制成功！请完善视频的标题与封面</span
              >
              <el-form :model="form">
              <el-form-item label="视频标题" label-width="120px">
                <el-input v-model="form.title" autocomplete="off"></el-input>
              </el-form-item>
              <el-form-item label="视频封面" label-width="120px">
                <input type="file" accept="image/*" @change="e=>{form.image=e.target.files[0]}"/>
              </el-form-item>
              </el-form>
              <span slot="footer" class="dialog-footer">
                <el-button @click="submitDialog = false">取 消</el-button>
                <el-button type="primary" @click="createRecorder()"
                  >确 定</el-button
                >
              </span>
            </el-dialog>
          </div>
          <div class="videochat-window">
            <CanvasView
              @onLoad="getLocalStream"
              ref="canvasView"
              :type="canvasViewType"
              :key="canvasViewKey"
              :isRecord="isRecord"
            ></CanvasView>
            <!--画面div-->
            <!-- <video class="main-window" :id="userId" ref="large"></video> -->
            <!--对方画面div-->
            <video
              class="main-window"
              v-for="v in userList"
              :key="v.userId"
              :id="v.userId"
              ref="small"
              autoplay
            ></video>
          </div>
          <ChatView
            :uid="this.localUid"
            :room="this.$route.query.channelName"
          ></ChatView>
        </div>
      </el-main>
    </el-container>
  </el-container>
</template>
<script>
import RTCClient from "../../core/rtc-client";
import Util from "../../core/util/utils";
import { message } from "../../components/message";
import { getToken } from "../../common";
import axios from "axios";
import "../../assets/icon/iconfont.css";
import resize from "vue-resize-directive";

export default {
  name: "single",
  directives: {
    resize,
  },
  created() {
    let arr = ["./sha256.js"];
    arr.map((item) => {
      let script = document.createElement("script");
      script.type = "text/javascript";
      script.src = item;
      document.getElementsByTagName("body")[0].appendChild(script);
    });
  },
  data() {
    return {
      isSilence: false,
      isDesc: true,
      isStop: false,
      room: this.$route.query.channelName,
      //displayName: this.$route.query.displayName,
      desc: "等待对方进入...",
      audio: true,
      video: true,
      userId: null, // userId
      client: null,
      localUid: Math.ceil(Math.random() * 1e5),
      localStream: null,
      remoteStream: null,
      videoData: [],
      src: "",
      description: "",
      type: [],
      name: "",
      img: "",
      content: {},
      liveUrl: "",
      chatHeight: 0,
      popover_visible: false,
      userList: [],
      canvasViewType: 0,
      canvasViewKey: 0,
      isInit: false,
      isRecord: -1,
      recordDialog: false,
      submitDialog: false,
      form:{
        title:'',
        image:null
      }
    };
  },
  mounted() {
    // 获取后台数据
    window.self = this;
    axios
      .get("/server/api/videolist")
      .then((res) => {
        this.videoData = res.data.game_list
          .concat(res.data.movie_list)
          .concat(res.data.live_list);
        console.log("videoData", this.videoData);
        this.createVideoPage(this.$route.query.id);
      })
      .catch((err) => console.log(err));

    // 初始化音视频实例
    console.warn("初始化音视频sdk");
    // this.$nextTick(() => {
    //   this.chatHeight = this.$refs.videoChat.clientHeight + "px";
    // });
    // const that = this;
    // window.addEventListener("resize", () => {
    //   that.chatHeight = that.$refs.videoChat.clientHeight + "px";
    // });
  },
  destroyed() {
    try {
      this.goBack();
    } catch (e) {
      // 为了兼容低版本，用try catch包裹一下
    }
  },
  methods: {
    onResize() {
      console.log("resize");
      this.chatHeight = this.$refs.videoChat.clientHeight + "px";
    },
    startRecorder() {
      this.isRecord = 1;
      this.recordDialog = false;
    },
    createRecorder() {
      this.isRecord = 0;
      this.$refs.canvasView.postRecord(this.form.title, this.form.image)
      this.submitDialog = false;
      this.$message("反应视频正在后台制作中，请稍后查看...");
      setTimeout(() => {
        this.isRecord = -1
      }, 500);
    },
    getLocalStream(stream) {
      this.$nextTick(() => {
        console.log("get local stream", stream);
        this.localStream = stream;
        window.rtcClient = RTCClient.instance;
        // this.$refs.large.srcObject = stream;
        // console.log(this.$refs.large.srcObject);
        this.init();
      });
    },
    createVideoPage(id) {
      console.log(id);
      console.log(this.videoData[id - 1]);
      if (this.videoData[id - 1].url != undefined) {
        this.liveUrl = this.videoData[id - 1].url;
      } else {
        this.liveUrl = "";
      }
      if (this.videoData[id - 1].videoId != undefined) {
        this.src = this.videoData[id - 1].videoId;
      } else {
        this.src = "";
      }
      this.content = this.videoData[id - 1];
      this.img = "/server/" + this.content.image;
      console.log("img123", this.img);
    },
    returnJoin(time = 2000) {
      setTimeout(() => {
        this.$router.push({
          path: "/",
        });
      }, time);
    },
    init() {
      if (!this.isInit) {
        this.registerCallBack();
        RTCClient.instance.setAutoPublishSubscribe(false, true);
        RTCClient.instance
          .login(this.room, this.localUid)
          .then((userId) => {
            if (RTCClient.instance.getRoomUserList().length === 0) {
              this.$message("你可以将房间码发给其他人");
            }
            this.isSwitchScreen = false;
            this.userId = userId;
          })
          .then((res) => {
            const tracks = this.localStream.getVideoTracks();
            console.log(tracks);
            RTCClient.instance
              .setExternalMediaTrack(tracks[0], 1)
              .then((e) => {
                console.log("setExternalMediaTrack success", e);
                RTCClient.instance
                  .publish()
                  .then((e) => {
                    console.log("publish success", e);
                    this.isPublish = true;
                    this.isInit = true;
                  })
                  .catch((e) => {
                    console.log("publish failed", e);
                  });
              })
              .catch((err) => {
                console.log("setExternalMediaTrack failed", err);
              });
            // console.log("userId: ", this.userId);
            // console.log(document.getElementById(this.userId));
            // Util.startPreview(document.getElementById(this.userId)).then((re) => {
            //   RTCClient.instance.setDisplayLocalVideo(
            //     document.getElementById("localVideo"),
            //     1
            //   );
            // });
          })
          .catch((err) => {
            this.$message(err.message);
          });

      } else {
        RTCClient.instance
          .unPublish()
          .then((e) => {
            console.log("unPublish success", e);
            this.isPublish = false;
            const tracks = this.localStream.getVideoTracks();
            console.log(tracks);
            RTCClient.instance
              .setExternalMediaTrack(tracks[0], 1)
              .then((e) => {
                console.log("setExternalMediaTrack success", e);
                RTCClient.instance
                  .publish()
                  .then((e) => {
                    console.log("publish success", e);
                    this.isPublish = true;
                    if(this.isSilence){
                      console.log("now let's silence!")
                      RTCClient.instance.muteLocalMic(true)
                    }
                  })
                  .catch((e) => {
                    console.log("publish failed", e);
                  });
              })
              .catch((err) => {
                console.log("setExternalMediaTrack failed", err);
              });
          })
          .catch((e) => {
            console.log("unPublish failed", e);
          });

      }
    },
    // 注册回调
    registerCallBack() {
      RTCClient.instance.registerCallBack((eventName, data) => {
        switch (eventName) {
          case "onJoin":
          case "onPublisher":
          case "onUnPublisher":
          case "onNotify":
            this.userList = RTCClient.instance.getRoomUserList();
            break;
          case "onSubscribeResult":
            //Util.showRemoteVideo(data);
            console.log("showRemote: ", data.userId);
            let video = document.getElementById(data.userId);
            RTCClient.instance.setDisplayRemoteVideo(
              data.userId,
              video,
              data.code
            );
            break;
          case "onUserVideoMuted":
            break;
          case "onUserAudioMuted":
            break;
          case "onError":
            Util.showErrorMsg(data);
            break;
          case "onBye":
            Util.onByeMessage(data);
            break;
          case "onLeave":
            this.userList = RTCClient.instance.getRoomUserList();
            break;
        }
      });
    },
    goBack() {
      RTCClient.instance
        .logout()
        .then(() => {})
        .catch((err) => {})
        .then(() => {
          this.isPublishScreen = false;
          this.isPublish = false;
          this.isPreview = RTCClient.instance.isPreview;
        });
      //this.isRecord = 0;
      this.$refs.canvasView.muteCamera(false);
      this.if_room = false;
      this.returnJoin(1);
    },
    // 控制本地麦克风采集
    muteLocalMic() {
      if (!this.isPublish) {
        //this.$message("未推流");
        return;
      }
      RTCClient.instance.muteLocalMic(!this.audio);
      this.audio = !this.audio;
    },
    setOrRelieveSilence() {
      const { isSilence } = this;
      this.isSilence = !isSilence;
      this.muteLocalMic();
    },
    stopOrOpenVideo() {
      const { isStop } = this;
      this.isStop = !isStop;
      this.muteLocalCamera();
    },
    // 摄像头禁止
    muteLocalCamera() {
      if (!this.isPublish) {
        //this.$message("未推流");
        return;
      }
      this.$refs.canvasView.muteCamera(!this.video);
      // RTCClient.instance
      //   .muteLocalCamera(document.getElementById(RTCClient.instance.userId))
      //   .then((re) => {
      //     RTCClient.instance.setDisplayLocalVideo(
      //       document.getElementById(RTCClient.instance.userId)
      //     );
      //   });
      this.video = !this.video;
    },
  },
  watch: {
    canvasViewType: function () {
      this.canvasViewKey += 1;
    },
  },
};
</script>

<style scoped lang="less">
.el-container {
  /*设置内部填充为0，几个布局元素之间没有间距*/
  padding: 0px;
  /*外部间距也是如此设置*/
  margin: 0px;
  /*统一设置高度为100%*/
  height: 100%;
}

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
  background-color: #e9eef3;
  color: white;
  line-height: 30px;
  display: flex;
  flex-direction: column;
}

.el-main {
  display: flex;
  flex-direction: row;
  justify-content: center;
  background-color: #f2f5f6;
  align-items: flex-start;

  .content {
    width: 20%;
    min-width: 325px;
    margin: 0 20px 0 20px;
    background: #f2f5f6;
    border: solid gainsboro 1px;
    border-radius: 4px;
    display: flex;
    flex-direction: column;
    justify-content: space-between;
  }
}

.videochat-window {
  display: flex;
  flex-direction: column;
  max-height: 60%;
  overflow: hidden auto;

  .main-window {
    width: 100%;
    height: auto;
    //width: 37vw;
    //width: 427px;
    margin: 0 auto;
    //background: #25252d;
  }
}

.video_chat {
  display: flex;
  flex-direction: column;
  justify-content: center;
  width: 60%;

  .video {
  }
}
.intro {
  padding: 10px;
  background: white;
  border-width: 2px;
  border-radius: 4px;
  //width: 80%;

  .title {
    b {
      font-size: 25px;
      margin-right: 10px;
    }
    .el-tag {
      border: none;
      background-color: white;
    }
  }
}

.hor {
  display: flex;
  flex-direction: row;
  align-items: center;

  .el-button {
    padding: 0;
    line-height: unset;
  }
}

.tab-bar {
  flex: inherit;
  height: 54px;
  background-color: #c9dee4;
  box-shadow: 0 0 0 0 rgba(255, 255, 255, 0.3);
  list-style: none;
  display: flex;
  // justify-content: center;
  justify-content: space-between;
  align-items: center;
  color: #fff;

  li {
    height: 54px;
    width: 125px;
    cursor: pointer;
    //静音
    &.silence {
      background: url("../../assets/img/icon/silence.png") no-repeat center;
      background-size: 60px 54px;

      &:hover {
        background: url("../../assets/img/icon/silence-hover.png") no-repeat
          center;
        background-size: 60px 54px;
      }

      &:active {
        background: url("../../assets/img/icon/silence-click.png") no-repeat
          center;
        background-size: 60px 54px;
      }

      &.isSilence {
        //已经开启静音
        background: url("../../assets/img/icon/relieve-silence.png") no-repeat
          center;
        background-size: 60px 54px;

        &:hover {
          background: url("../../assets/img/icon/relieve-silence-hover.png")
            no-repeat center;
          background-size: 60px 54px;
        }

        &:active {
          background: url("../../assets/img/icon/relieve-silence-click.png")
            no-repeat center;
          background-size: 60px 54px;
        }
      }
    }

    //结束按钮
    &.over {
      background: url("../../assets/img/icon/over.png") no-repeat center;
      background-size: 68px 36px;

      &:hover {
        background: url("../../assets/img/icon/over-hover.png") no-repeat center;
        background-size: 68px 36px;
      }

      &:active {
        background: url("../../assets/img/icon/over-click.png") no-repeat center;
        background-size: 68px 36px;
      }
    }

    // 停止按钮
    &.stop {
      background: url("../../assets/img/icon/stop.png") no-repeat center;
      background-size: 60px 54px;

      &:hover {
        background: url("../../assets/img/icon/stop-hover.png") no-repeat center;
        background-size: 60px 54px;
      }

      &:active {
        background: url("../../assets/img/icon/stop-click.png") no-repeat center;
        background-size: 60px 54px;
      }

      //已经是停止状态
      &.isStop {
        background: url("../../assets/img/icon/open.png") no-repeat center;
        background-size: 60px 54px;

        &:hover {
          background: url("../../assets/img/icon/open-hover.png") no-repeat
            center;
          background-size: 60px 54px;
        }

        &:active {
          background: url("../../assets/img/icon/open-click.png") no-repeat
            center;
          background-size: 60px 54px;
        }
      }
    }
  }
}
</style>
