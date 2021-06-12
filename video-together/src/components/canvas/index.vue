<template>
  <div class="canvasContainer">
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

export default {
  name: "CanvasView",
  props: {
    type: {
      type: Number,
      required: true,
    },
  },
  data() {
    return {};
  },
  mounted() {
    this.$nextTick(() => {
      this.changeRender(this.type);
      // window.addEventListener('beforeunload', e => {

      // })
      const stream = this.$refs.jeeFaceFilterCanvas.captureStream(25);
      this.$emit("onLoad", stream);
    });
  },
  methods: {
    changeRender(type) {
      switch (type) {
        case 0:
          this.muteCamera();
          faceRender.main();
          break;
        case 1:
          this.muteCamera();
          faceDogRender.main();
          break;
        case 2:
          this.muteCamera();
          faceFoxRender.main();
          break;
      }
    },
    muteCamera() {
      faceRender.destroy();
      faceDogRender.destroy();
      faceFoxRender.destroy();
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