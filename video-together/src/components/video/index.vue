<template>
  <div>
    <video-player
      class="video-player vjs-custom-skin"
      ref="videoPlayer"
      :playsinline="true"
      :options="playerOptions"
      @ready="playerReadied"
    ></video-player>
  </div>
</template>

<script>
import axios from "axios";

export default {
  name: "VideoPage",
  props: {
    src: {
      type: String,
      required: true,
    },
    content: {
      type: String,
      required: true,
    },
    uid: {
      type: Number,
      required: true,
    },
  },
  data() {
    return {
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
      lock: false,
      localUid: this.uid,
    };
  },
  mounted() {},
  watch: {
    src: {
      handler: function (newval, oldval) {
        if (newval === "" || newval == undefined) {
          console.log("newval", newval);
          return;
        }
        axios.get("server/api/videos?name=" + newval).then((res) => {
          console.log(res.data);
          this.playerOptions.sources[0].type="video/mp4"
          this.playerOptions.sources[0].src =
            res.data.PlayInfoList.PlayInfo[0].PlayURL;
        });
      },
      immediate: true,
    },
    content: {
      handler: function (newval, oldval) {
        if (newval === "" || newval == undefined) {
          console.log("content newval", newval);
          return;
        }
        this.playerOptions.sources[0].type="application/x-mpegURL"
          this.playerOptions.sources[0].src = newval;
      },
      immediate: true,
    },
  },
  methods: {
    playerReadied(player) {
      let socket = this.$socketio;
      let channel = this.$route.query.channelName;
      let _this = this;
      console.log("why not?", socket, player, this.lock);
      // 进度条跳转
      socket.on("seeking_response", function (msg, cb) {
        if (msg.uid == _this.localUid) return;
        _this.lock = true;
        player.currentTime(msg.time);
        setTimeout(function () {
          _this.lock = false;
        }, 500);
      });
      player.on("seeking", function () {
        if (_this.lock) return;
        let time = this.currentTime();
        console.log("video_seeking", time);
        socket.emit("video_seeking", {
          room: channel,
          time: time,
          uid: _this.localUid,
        });
      });

      // 播放
      socket.on("play_response", function (msg, cb) {
        if (msg.uid == _this.localUid) return;
        _this.lock = true;
        player.play();
        setTimeout(function () {
          _this.lock = false;
        }, 500);
      });
      player.on("play", function () {
        if (_this.lock) return;

        socket.emit("video_play", { room: channel, uid: _this.localUid });
      });
      // 暂停
      socket.on("pause_response", function (msg, cb) {
        if (msg.uid == _this.localUid) return;
        _this.lock = true;
        player.pause();
        setTimeout(function () {
          _this.lock = false;
        }, 500);
      });
      player.on("pause", function () {
        if (_this.lock) return;
        console.log("video_pause");
        socket.emit("video_pause", { room: channel, uid: _this.localUid });
      });
    },
  },
};
</script>

<!-- Add "scoped" attribute to limit CSS to this component only -->
<style scoped lang="scss">
</style>
