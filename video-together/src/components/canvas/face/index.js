import { JeelizResizer } from "./jeelizResizer.js";
import { JeelizThreeHelper } from "./jeelizThreeHelper.js";
import * as THREE from "three";
import { JEELIZFACEFILTER, NN_DEFAULT } from "facefilter";

const superThat = (function() {
  // some globalz:
  let THREECAMERA = null;
  let ISDETECTED = false;
  let NOSEMESH = null,
    EARMESH = null;
  let DOGOBJ3D = null,
    FRAMEOBJ3D = null;

  let ISOVERTHRESHOLD = false,
    ISUNDERTRESHOLD = true;

  let _flexParts = [];
  let _videoGeometry = null;

  // callback: launched if a face is detected or lost
  function detect_callback(isDetected) {
    if (isDetected) {
      console.log("INFO in detect_callback(): DETECTED");
    } else {
      console.log("INFO in detect_callback(): LOST");
    }
  }

  // build the 3D. called once when Jeeliz Face Filter is OK
  function init_threeScene(spec) {
    // INIT THE THREE.JS context
    const threeStuffs = JeelizThreeHelper.init(spec, detect_callback);
    _videoGeometry = threeStuffs.videoMesh.geometry;

    threeStuffs.faceObject.add(DOGOBJ3D);

    // CREATE THE CAMERA
    THREECAMERA = JeelizThreeHelper.create_camera();

    threeStuffs.scene.add(FRAMEOBJ3D);
  } // end init_threeScene()

  function init_faceFilter(videoSettings) {
    JEELIZFACEFILTER.init({
      canvasId: "jeeFaceFilterCanvas",
      NNC: NN_DEFAULT, // root of NN_DEFAULT.json file
      videoSettings: videoSettings,
      callbackReady: function(errCode, spec) {
        if (errCode) {
          console.log("AN ERROR HAPPENS. SORRY BRO :( . ERR =", errCode);
          return;
        }

        console.log("INFO: JEELIZFACEFILTER IS READY");
        init_threeScene(spec);
      }, // end callbackReady()

      // called at each render iteration (drawing loop)
      callbackTrack: function(detectState) {
        ISDETECTED = JeelizThreeHelper.get_isDetected();

        JeelizThreeHelper.render(detectState, THREECAMERA);
        //JEELIZFACEFILTER.render_video();
      }, // end callbackTrack()
    }); // end JEELIZFACEFILTER.init call
  }

  const that = {
    // Entry point: launched by body.onload()
    main: function() {
      DOGOBJ3D = new THREE.Object3D();
      FRAMEOBJ3D = new THREE.Object3D();

      JeelizResizer.size_canvas({
        canvasId: "jeeFaceFilterCanvas",
        callback: function(isError, bestVideoSettings) {
          init_faceFilter(bestVideoSettings);
        },
      });
    },
    destroy: function() {
      JEELIZFACEFILTER.destroy();
    },
  };
  return that;
})();

export const faceRender = superThat;
