<template>
  <div class="canvasContainer">
    <canvas
      width="600"
      height="600"
      id="jeeFaceFilterCanvas"
      ref="jeeFaceFilterCanvas"
    ></canvas>
    <div id="filter"></div>
  </div>
</template>

<script>
import { CanvasRender } from "./index.js";

export default {
  name: "CanvasView",
  props: {},
  data() {
    return {};
  },
  mounted() {
    this.$nextTick(() => {
      CanvasRender.main();
      const stream = this.$refs.jeeFaceFilterCanvas.captureStream(25);
      this.$emit("onLoad", stream);
    });
  },
  methods: {},
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