"use strict";
import { JeelizWebojiThreeHelper } from "./JeelizWebojiThreeHelper.js";
import * as JEELIZFACEEXPRESSIONS from "./dist/jeelizFaceExpressions.module.js";
const neuralNetworkModel = require("./dist/jeelizFaceExpressionsNNC.json");

const superThat = (function() {
  // entry point:
  const that = {
    main: function() {
      JeelizWebojiThreeHelper.init({
        canvasThreeId: "jeeFaceFilterCanvas",
        canvasId: "jeeFaceFilterCanvas1",

        assetsParentPath: "/server/assets/models/fox/",
        NNC: neuralNetworkModel,

        // RACCOON:
        meshURL: "meshes/fox11_v0.json",
        matParameters: {
          diffuseMapURL: "textures/Fox_albedo.png",
          specularMapURL: "textures/Fox_specular.png",
          flexMapURL: "textures/Fox_flex.png",
        },

        position: [0, -80, 0],
        scale: 1.2,
      });
    },
    destroy: function() {
      JEELIZFACEEXPRESSIONS.destroy();
    },
  };
  return that;
})();

export const faceFoxRender = superThat;
