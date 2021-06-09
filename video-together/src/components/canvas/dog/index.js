import { JeelizResizer } from "./jeelizResizer.js";
import { JeelizThreeHelper } from "./jeelizThreeHelper.js";
import * as THREE from "three";
import { JEELIZFACEFILTER, NN_DEFAULT } from "facefilter";

const FlexMaterial = function(spec) {
  const _worldMatrixDelayed = new THREE["Matrix4"]();

  //same handy function
  function mix(a, b, t) {
    a.set(
      b.x * t + a.x * (1 - t),
      b.y * t + a.y * (1 - t),
      b.z * t + a.z * (1 - t)
    );
  }

  //tweak shaders helpers
  function tweak_shaderAdd(code, chunk, glslCode) {
    return code.replace(chunk, chunk + "\n" + glslCode);
  }
  function tweak_shaderDel(code, chunk) {
    return code.replace(chunk, "");
  }
  function tweak_shaderRepl(code, chunk, glslCode) {
    return code.replace(chunk, glslCode);
  }

  //get PHONG shader and tweak it :
  const phongShader = THREE.ShaderLib.phong;
  let vertexShaderSource = phongShader.vertexShader;
  vertexShaderSource = tweak_shaderAdd(
    vertexShaderSource,
    "#include <common>",
    "uniform mat4 modelMatrixDelayed;\n" + "uniform sampler2D flexMap;\n"
  );
  vertexShaderSource = tweak_shaderDel(
    vertexShaderSource,
    "#include <worldpos_vertex>"
  );
  vertexShaderSource = tweak_shaderRepl(
    vertexShaderSource,
    "#include <project_vertex>",
    "vec4 worldPosition = modelMatrix * vec4( transformed, 1.0 );\n\
    vec4 worldPositionDelayed = modelMatrixDelayed * vec4( transformed, 1.0 );\n\
    worldPosition = mix(worldPosition, worldPositionDelayed, texture2D(flexMap, uv).r);\n\
    vec4 mvPosition = viewMatrix* worldPosition;\n\
    gl_Position = projectionMatrix * mvPosition;"
  );

  const uniforms0 = {
    modelMatrixDelayed: {
      value: _worldMatrixDelayed,
    },
    flexMap: {
      value: spec.flexMap,
    },
    opacity: {
      value: typeof spec.opacity !== "undefined" ? spec.opacity : 1,
    },
  };
  const uniforms = Object.assign({}, phongShader.uniforms, uniforms0);

  const isMorphs = spec.morphTargets ? true : false;
  const mat = new THREE.ShaderMaterial({
    vertexShader: vertexShaderSource,
    fragmentShader: phongShader.fragmentShader,
    uniforms: uniforms,
    transparent: spec.transparent ? true : false,
    lights: true,
    morphTargets: isMorphs,
    morphNormals: isMorphs,
  });
  mat.flexMap = spec.flexMap;
  mat.opacity = mat.uniforms.opacity; // shortcut

  if (typeof spec.map !== "undefined") {
    uniforms.map = { value: spec.map };
    mat.map = spec.map;
  }
  if (typeof spec.alphaMap !== "undefined") {
    uniforms.alphaMap = { value: spec.alphaMap };
    mat.transparent = true;
    mat.alphaMap = spec.alphaMap;
  }

  if (typeof spec.bumpMap !== "undefined") {
    uniforms.bumpMap = { value: spec.bumpMap };
    mat.bumpMap = spec.bumpMap;
  }

  if (typeof spec.bumpScale !== "undefined") {
    uniforms.bumpScale = { value: spec.bumpScale };
    mat.bumpScale = spec.bumpScale;
  }

  if (typeof spec.shininess !== "undefined") {
    uniforms.shininess = { value: spec.shininess };
    mat.shininess = spec.shininess;
  }

  const _positionDelayed = new THREE.Vector3();
  const _scaleDelayed = new THREE.Vector3();
  const _eulerDelayed = new THREE["Euler"]();
  let _initialized = false;

  mat.set_amortized = function(
    positionTarget,
    scaleTarget,
    eulerTarget,
    parentMatrix,
    amortization
  ) {
    if (!_initialized) {
      if (positionTarget) {
        _positionDelayed.copy(positionTarget);
      }
      if (scaleTarget) {
        _scaleDelayed.copy(scaleTarget);
      }
      if (eulerTarget) {
        _eulerDelayed.copy(eulerTarget);
      }
      _initialized = true;
    }

    if (eulerTarget) {
      mix(_eulerDelayed, eulerTarget, amortization);
      _worldMatrixDelayed["makeRotationFromEuler"](_eulerDelayed);
    }

    if (positionTarget) {
      mix(_positionDelayed, positionTarget, amortization);
      _worldMatrixDelayed["setPosition"](_positionDelayed);
    }

    if (scaleTarget) {
      mix(_scaleDelayed, scaleTarget, amortization);
      _worldMatrixDelayed["scale"](_scaleDelayed);
    }

    if (parentMatrix) {
      _worldMatrixDelayed.multiplyMatrices(parentMatrix, _worldMatrixDelayed);
    }
  };

  return mat;
};

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

  const addDragEventListener = (function() {
    const _states = {
      idle: 0,
      loading: 1,
      dragging: 2,
    };
    let _state = _states.idle; // MT217 : initialize your state always (even with a loading value)

    let _dP = new THREE.Vector3();
    let _x0 = -1;
    let _y0 = -1;
    let _scenes = null;
    let _boundFunction = null;

    function updateMeshPosition(canvas, event) {
      const MOUSEVECTOR = new THREE.Vector3();
      const DIRECTIONVECTOR = new THREE.Vector3();
      const VIEWPORTVECTOR = new THREE.Vector3();
      const _headCenterZ = -1;

      if (_state !== _states.dragging) return; // MT217

      const isTouch = !!(event.touches && event.touches.length); // MT217 is touch or mouse event ?

      const xPx = isTouch ? event.touches[0].clientX : event.clientX; // MT217 : make the distinction between touch and mouse event
      const yPx = isTouch ? event.touches[0].clientY : event.clientY; // if touch event, consider only the first finger

      const dxPx = xPx - _x0; // in pixels
      const dyPx = yPx - _y0; // in pixels too

      _x0 = xPx;
      _y0 = yPx;

      // calcul des coo de dxPx, dyPx dans le viewport
      // les offsets du canvas s'annulent -> que facteur d'échelle a appliquer
      const dx = -dxPx / canvas.offsetWidth;
      const dy = -dyPx / canvas.offsetHeight;

      // Only check intersects if object is visible
      // If there is only 1 object, we don't check intersections too
      const mesh =
        _scenes.length === 1
          ? _scenes[0]
          : _scenes.find(function(scene) {
              if (!scene.parent.visible) {
                return false;
              }
              // TODO: Check if a child geometry is an occlusion object. If so remove it from the intersection list
              MOUSEVECTOR.set(
                -(xPx / canvas.offsetWidth) * 2 + 1,
                -(yPx / canvas.offsetHeight) * 2 + 1,
                0.5
              );
              const raycaster = new THREE.Raycaster();
              raycaster.setFromCamera(MOUSEVECTOR, THREECAMERA);

              const intersects = raycaster.intersectObjects(scene.children);
              return intersects.length > 0;
            });

      if (!mesh) {
        return;
      }

      VIEWPORTVECTOR.set(dx, dy, 1);

      DIRECTIONVECTOR.copy(VIEWPORTVECTOR);
      if (!THREECAMERA) {
        throw new Error(
          "Cannot find the THREE.js camera. Please check that THREECAMERA is the default scene camera"
        );
      }
      DIRECTIONVECTOR.unproject(THREECAMERA);
      DIRECTIONVECTOR.sub(THREECAMERA.position);
      DIRECTIONVECTOR.normalize();

      // we calculate the coefficient that will allow us to find our mesh's position
      const k = _headCenterZ / DIRECTIONVECTOR.z;

      // _dP = displacement in the scene (=world) ref :
      _dP.copy(DIRECTIONVECTOR).multiplyScalar(k);
      _dP.setZ(0); // bcoz we only want to displace in the (0xy) plane

      const _quat = new THREE.Quaternion();
      const _eul = new THREE.Euler();
      _eul.setFromQuaternion(_quat);

      // convert _dP to mesh ref to apply it directly to mesh.position :
      // _dP is a vector so apply only the rotation part (not the translation)
      _dP.applyEuler(mesh.getWorldQuaternion(_eul));

      // Boost movement to follow better the mouse/touch
      _dP.multiplyScalar(10);

      // apply _dP
      mesh.position.add(_dP);
    }

    function setMousePosition0(event) {
      // save initial position of the mouse
      const isTouch = !!(event.touches && event.touches.length); // MT217 is touch or mouse event ?

      if (isTouch && event.touches.length > 1) return; // MT217 if the user put a second finger while dragging

      _x0 = isTouch ? event.touches[0].clientX : event.clientX; // MT217
      _y0 = isTouch ? event.touches[0].clientY : event.clientY;
    }

    function mouseDown(event) {
      setMousePosition0(event); // MANTIS201
      _state = _states.dragging;
    }

    function mouseUp() {
      _state = _states.idle;
    }

    const that = {
      addDragEventListener: function(scenes, canvasId, remove) {
        _scenes = Array.isArray(scenes) ? scenes : [scenes];
        const canvas = document.getElementById(
          typeof canvasId === "undefined" ? "jeeFaceFilterCanvas" : canvasId
        );

        _state = _states.idle; // MT217 : initialize your state always (even with a loading value)

        _dP = new THREE.Vector3();
        _x0 = undefined;
        _y0 = undefined;
        if (remove) {
          // REMOVE OUR LISTENERS
          canvas.removeEventListener("mousemove", _boundFunction, true);
          canvas.removeEventListener("touchmove", _boundFunction, true);

          // BEGINNING OF THE INTERACTION
          canvas.removeEventListener("mousedown", mouseDown);
          canvas.removeEventListener("touchstart", mouseDown);

          // END OF THE INTERACTION
          canvas.removeEventListener("mouseup", mouseUp);
          canvas.removeEventListener("touchend", mouseUp);

          // ALSO END BUT IN CASE LEAVING CANVAS OR ALERT BOX ECT...
          canvas.removeEventListener("mouseout", mouseUp);
          canvas.removeEventListener("touchcancel", mouseUp);
        } else {
          // SET OUR LISTENERS
          _boundFunction = updateMeshPosition.bind(this, canvas);
          canvas.addEventListener("mousemove", _boundFunction, true);
          // canvas.addEventListener('touchmove', createTouchEvent, true)
          canvas.addEventListener("touchmove", _boundFunction, true); // MT217

          // BEGINNING OF THE INTERACTION
          canvas.addEventListener("mousedown", mouseDown);
          canvas.addEventListener("touchstart", mouseDown);

          // END OF THE INTERACTION
          canvas.addEventListener("mouseup", mouseUp);
          canvas.addEventListener("touchend", mouseUp);

          // ALSO END BUT IN CASE LEAVING CANVAS OR ALERT BOX ECT...
          canvas.addEventListener("mouseout", mouseUp);
          canvas.addEventListener("touchcancel", mouseUp);
        }
      },
    };
    return that;
  })();

  // callback: launched if a face is detected or lost
  function detect_callback(isDetected) {
    if (isDetected) {
      console.log("INFO in detect_callback(): DETECTED");
    } else {
      console.log("INFO in detect_callback(): LOST");
    }
  }

  function create_mat2d(threeTexture, isTransparent) {
    // MT216: we put the creation of the video material in a func because we will also use it for the frame
    return new THREE.RawShaderMaterial({
      depthWrite: false,
      depthTest: false,
      transparent: isTransparent,
      vertexShader:
        "attribute vec2 position;\n\
      varying vec2 vUV;\n\
      void main(void){\n\
        gl_Position = vec4(position, 0., 1.);\n\
        vUV = 0.5 + 0.5 * position;\n\
      }",
      fragmentShader:
        "precision lowp float;\n\
      uniform sampler2D samplerVideo;\n\
      varying vec2 vUV;\n\
      void main(void){\n\
        gl_FragColor = texture2D(samplerVideo, vUV);\n\
      }",
      uniforms: {
        samplerVideo: { value: threeTexture },
      },
    });
  }

  // build the 3D. called once when Jeeliz Face Filter is OK
  function init_threeScene(spec) {
    // INIT THE THREE.JS context
    const threeStuffs = JeelizThreeHelper.init(spec, detect_callback);
    _videoGeometry = threeStuffs.videoMesh.geometry;

    // CREATE OUR DOG EARS:

    // let's begin by creating a loading manager that will allow us to
    // have more control over the three parts of our dog model
    const loadingManager = new THREE.LoadingManager();

    const loaderEars = new THREE.BufferGeometryLoader(loadingManager);

    loaderEars.load("/server/assets/models/dog/dog_ears.json", function(
      geometry
    ) {
      const mat = new FlexMaterial({
        map: new THREE.TextureLoader().load(
          "/server/assets/models/dog/texture_ears.jpg"
        ),
        flexMap: new THREE.TextureLoader().load(
          "/server/assets/models/dog/flex_ears_256.jpg"
        ),
        alphaMap: new THREE.TextureLoader().load(
          "/server/assets/models/dog/alpha_ears_256.jpg"
        ),
        transparent: true,
        opacity: 1,
        bumpMap: new THREE.TextureLoader().load(
          "/server/assets/models/dog/normal_ears.jpg"
        ),
        bumpScale: 0.0075,
        shininess: 1.5,
        specular: 0xffffff,
      });

      EARMESH = new THREE.Mesh(geometry, mat);
      EARMESH.scale.multiplyScalar(0.025);
      EARMESH.position.setY(-0.3);
      EARMESH.frustumCulled = false;
      EARMESH.renderOrder = 10000;
      EARMESH.material.opacity.value = 1;
    });
    // CREATE OUR DOG NOSE
    const loaderNose = new THREE.BufferGeometryLoader(loadingManager);

    loaderNose.load("/server/assets/models/dog/dog_nose.json", function(
      geometry
    ) {
      const mat = new THREE.MeshPhongMaterial({
        map: new THREE.TextureLoader().load(
          "/server/assets/models/dog/texture_nose.jpg"
        ),
        shininess: 1.5,
        specular: 0xffffff,
        bumpMap: new THREE.TextureLoader().load(
          "/server/assets/models/dog/normal_nose.jpg"
        ),
        bumpScale: 0.005,
      });

      NOSEMESH = new THREE.Mesh(geometry, mat);
      NOSEMESH.scale.multiplyScalar(0.018);
      NOSEMESH.position.setY(-0.05);
      NOSEMESH.position.setZ(0.15);
      NOSEMESH.frustumCulled = false;
      NOSEMESH.renderOrder = 10000;
    });

    loadingManager.onLoad = () => {
      DOGOBJ3D.add(EARMESH);
      DOGOBJ3D.add(NOSEMESH);

      addDragEventListener.addDragEventListener(DOGOBJ3D);

      threeStuffs.faceObject.add(DOGOBJ3D);
    };

    // CREATE AN AMBIENT LIGHT
    const ambient = new THREE.AmbientLight(0xffffff, 0.8);
    threeStuffs.scene.add(ambient);

    // CREAT A DIRECTIONALLIGHT
    const dirLight = new THREE.DirectionalLight(0xffffff, 0.5);
    dirLight.position.set(100, 1000, 1000);
    threeStuffs.scene.add(dirLight);

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

        if (ISDETECTED) {
          const _quat = new THREE.Quaternion();
          const _eul = new THREE.Euler();
          _eul.setFromQuaternion(_quat);

          // flex ears material:
          if (EARMESH && EARMESH.material.set_amortized) {
            EARMESH.material.set_amortized(
              EARMESH.getWorldPosition(new THREE.Vector3(0, 0, 0)),
              EARMESH.getWorldScale(new THREE.Vector3(0, 0, 0)),
              EARMESH.getWorldQuaternion(_eul),
              false,
              0.1
            );
          }

          if (detectState.expressions[0] >= 0.85 && !ISOVERTHRESHOLD) {
            ISOVERTHRESHOLD = true;
            ISUNDERTRESHOLD = false;
            ISANIMATIONOVER = false;
          }
          if (detectState.expressions[0] <= 0.1 && !ISUNDERTRESHOLD) {
            ISOVERTHRESHOLD = false;
            ISUNDERTRESHOLD = true;
            ISANIMATIONOVER = false;
          }
        }

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
  };
  return that;
})();

export const faceDogRender = superThat;
