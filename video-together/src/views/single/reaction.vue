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
            >反应视频</el-breadcrumb-item
          >
        </el-breadcrumb>
      </div>
    </el-header>
    <el-container>
      <el-main>
        <div class="video_chat">
          <div class="video">
            <video-player
                class="video-player vjs-custom-skin"
                ref="videoPlayer"
                :playsinline="true"
                :options="playerOptions"
            ></video-player>
          </div>
          <div class="intro">
            <div class="title">
              <b>{{ title }}</b>
            </div>
            <div class="hor">
                <el-image
                  v-if="image!='' && image!=undefined"
                  :src="'/server/'+image"
                  style="width: 240px; height: 135px"
                  fit="fit"
                ></el-image>
                <div style="flex: 1; margin-left: 10px">
                  {{ }}
                </div>
              </div>
          </div>
        </div>
      </el-main>
    </el-container>
  </el-container>
</template>
<script>
export default{
    name: "ReactionVideo",
    props:['title','image','video'],
    watch:{
        video(newval, oldval){
            if(newval==''){
                return
            }
            this.playerOptions.sources[0].src = '/server/'+newval
            console.log(newval)
        }
    },
    mounted(){
        this.playerOptions.sources[0].src = '/server/'+this.video
    },
    data(){
        return{
            playerOptions: {
                autoplay: false,
                muted: false,
                loop: false,
                preload: "auto",
                language: "zh-CN",
                aspectRatio: "16:9",
                fluid: true,
                sources: [
                {
                    type: "video/mp4",
                    src: "",
                },
                ],
                techOrder: ["html5", "flash"],
                width: document.documentElement.clientWidth,
                hls: true,
                notSupportedMessage: '视频加载中...',
            },
        }
    }
}
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


.el-main {
  display: flex;
  flex-direction: row;
  justify-content: center;
  background-color: #f2f5f6;
  width: 100%;

  .content {
    width: 80%;
    margin: 0 20px 0 20px;
    background: #f2f5f6;
    border: solid gainsboro 1px;
    border-radius: 4px;
    display: flex;
    flex-direction: column;
  }
}

.video_chat {
  display: flex;
  flex-direction: column;
  justify-content: center;
  width: 80%;

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
</style>
