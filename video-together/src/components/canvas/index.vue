<template>
  <div class="canvasContainer" v-show="!stopCamera">
    <canvas
      height="200px"
      id="jeeFaceFilterCanvas"
      ref="jeeFaceFilterCanvas"
    ></canvas>
    <canvas
      id="jeeFaceFilterCanvas1"
      ref="jeeFaceFilterCanvas1"
      hidden
    ></canvas>
    <div id="filter"></div>
  </div>
</template>

<script>
import { faceDogRender } from "./dog/index.js";
import { faceFoxRender } from "./fox/index.js";
import { faceRender } from "./face/index.js";
import axios from 'axios'
import { Form } from 'element-ui';

export default {
  name: "CanvasView",
  props: {
    type: {
      type: Number,
      required: true,
    },
    isRecord:{
      type: Number,
      required: true,
    },
  },
  data() {
    return {
      recorder: null,
      audioRecorder: null,
      stream: null,
      chunks: [],
      audioChunks: [],
      formData:null,
      screenStream:null,
      title:'',
      imageFile:null,
      stopCamera: false
    };
  },
  watch:{
    isRecord:function(val){
      console.log("isRecord",this.isRescord);
      if(val==1){
        this.recordInit();
      }
      // else if(val==0){
      //   this.saveRecord();
      // }
    }
  },
  mounted() {
    this.$nextTick(() => {
      this.changeRender(this.type);
      // window.addEventListener('beforeunload', e => {

      // })
      this.stream = this.$refs.jeeFaceFilterCanvas.captureStream(25);
      this.$emit("onLoad", this.stream);
    });
  },
  methods: {
    recordInit(){
      let _this = this;
      _this.formData = new FormData();

      //screen + webaudio
      navigator.mediaDevices.getDisplayMedia({audio:true, video:true}).then(stream=>{
        this.screenStream = stream
        this.recorder = new MediaRecorder(stream)
        this.recorder.ondataavailable = function(e){
          _this.chunks.push(e.data);
          let videoBlob = new Blob(_this.chunks, {'type':'video/webm'});
          _this.formData.append('file', videoBlob);
          console.log('formData', _this.formData.get('file'));
          
        }


      })

      //microphone auido
      navigator.mediaDevices.getUserMedia({audio:true}).then(stream=>{
        this.audioRecorder = new MediaRecorder(stream)
        this.audioRecorder.ondataavailable = function(e){
          _this.audioChunks.push(e.data);
          let audioBlob = new Blob(_this.audioChunks, {'type':'audio/ogg; codecs=opus'});
          _this.formData.append('file', audioBlob);
          _this.recorder.stop();
        }
        this.recorder.start();
        this.audioRecorder.start();
      })
    },
    saveRecord(){
      this.audioRecorder.stop();
    },
    postRecord(title, image){
      this.title = title
      this.imageFile = image
      console.log(title, image)
      this.formData.append('image', this.imageFile)
      this.formData.append('title', this.title)
      axios({
        method: 'post',
        url: "/server/api/downloadBlob",
        data: this.formData,
        headers:{
          'Content-Type': 'multipart/form-data'
        },
      })
      .then((res) => {
        })
      .catch((err) => console.log(err));
      let tracks = this.screenStream.getTracks()
      tracks.forEach(track => track.stop());
      this.chunks = []
      this.audioChunks = []
      this.formData = null
    },
    changeRender(type) {
      switch (type) {
        case 0:
          this.muteCamera();
          faceRender.main();
          this.stopCamera = false
          break;
        case 1:
          this.muteCamera();
          faceDogRender.main();
          this.stopCamera = false
          break;
        case 2:
          this.muteCamera();
          faceFoxRender.main();
          this.stopCamera = false
          break;
      }
    },
    muteCamera(flag) {
      if (!flag){
        this.stopCamera = true
        faceRender.destroy();
        faceDogRender.destroy();
        faceFoxRender.destroy();
      }else{
        this.stopCamera = false
        this.changeRender(0)
      }

    },
  },
};
</script>

<style scoped>
a {
  color: #eee;
  text-decoration: none;
}
a:hover {
  color: blue;
}
body {
  overflow: auto;
  overflow-y: auto;
  background-color: white;
  /* background-image: url("bg.png"); */
  background-attachment: fixed;
  background-position: center;
  background-size: contain;
  margin: 0px;
}

#jeeFaceFilterCanvas {
  z-index: 10;
  position: absolute;
  max-height: 100%;
  max-width: 100%;
  left: 50%;
  top: 50%;
  width: 100vmin;
  transform: translate(-50%, -50%) rotateY(180deg);
}

#threeCanvas {
  z-index: 11;
  position: absolute;
  max-height: 100%;
  max-width: 100%;
  left: 50%;
  top: 50%;
  width: 100vmin;
  transform: translate(-50%, -50%) rotateY(180deg);
}

@media (max-width: 787px) {
  #jeeFaceFilterCanvas {
    right: 0px;
    top: 60px;
    transform: rotateY(180deg);
  }
}
.canvasContainer {
  position: relative;
  margin: 0 auto;
  text-align: center;
}
#jeeFaceFilterCanvas {
  z-index: 0;
  max-height: 100%;
  left: auto;
  top: auto;
  width: 100vmin;
  transform: translate(0, 0) rotateY(180deg);
  position: static;
}
img {
  max-width: 100%;
}
#filter {
  position: absolute;
  z-index: 0;
  max-height: 100%;
  width: 100vmin;
  top: 0;
  left: 50%;
  transform: translate(-50%);
  opacity: 0.15;
}
#filter canvas {
  width: 100%;
  height: 100%;
}
</style>