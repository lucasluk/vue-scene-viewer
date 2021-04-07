<template>
  <div class="h-image-viewer" ref="viewer">
    <div class="h-image-viewer-container" ref="container">
      <div class="h-image-viewer-canvas" ref="canvas" @click="onClick($event)">
        <img
          class="h-image-viewer-img"
          :src="options.src"
          @click="onSceneClick"
          @touchstart="function () {}"
          @mousedown="function () {}"
          ref="img"
        />

        <scene-viewer-anchor
          v-for="(anchor, uid) in options.anchors"
          :options="anchor"
          :key="uid">
          <p class="good-box">
            <img
              src=""
              class="ml8 vm"
              width="14"
              alt="">
            <span class="good-num">{{  }}</span>
          </p>
        </scene-viewer-anchor>
      </div>
    </div>
  </div>
</template>

<script>
import { cloneDeep } from "lodash";
import SceneViewerAnchor from "./scene-viewer-anchor.vue";
import {
  EVENT_CLICK,
  EVENT_DBLCLICK,
  EVENT_POINTER_DOWN,
  EVENT_POINTER_MOVE,
  EVENT_POINTER_UP,
  EVENT_WHEEL,
  ACTION_MOVE,
  ACTION_SWITCH,
  ACTION_ZOOM,
  IS_TOUCH_DEVICE,
} from "./constants";
import {
  addClass,
  addListener,
  removeListener,
  assign,
  dispatchEvent,
  forEach,
  getImageNaturalSizes,
  getPointer,
  isUndefined,
  isNumber,
  removeClass,
  closestByClass,
} from "./utils";

import { RenderMixin, MethodsMixin, OthersMixin } from "./mixins";

const defaultOptions = {
  movable: true,
  zoomable: true,
  zoomOnTouch: true,
  zoomOnWheel: true,
  transition: true,
  url: "src",
  // defaultRatio: 0.31,
  // defaultLeft: -134.93,
  // defaultTop: -217.11,
};

export default {
  name: "SceneViewer",

  mixins: [RenderMixin, MethodsMixin, OthersMixin],

  components: {
    SceneViewerAnchor,
  },

  props: {
    viewerOptions: {
      type: Object,
    },
    focusImageData: Object,
  },

  filters: {
    goodNum: function ({ goodNum, isLike }) {
      if (isLike) {
        goodNum++;
      }
      if (goodNum >= 100 * 100) {
        goodNum = goodNum.toString();
        goodNum = goodNum.substring(0, goodNum.length - 4) + "w";
      }
      return goodNum || 100;
    },
  },

  data() {
    return {
      // options: cloneDeep(assign(defaultOptions, this.viewerOptions)),
      parent: false,
      parentData: {},
      pointers: {},
      viewer: false,
      viewerData: {},
      image: false,
      initImageData: {},
      imageData: false,
      anchors: {},
      anchorsData: {},
      imageInitializing: false,
      imageRendering: false,
      zooming: false,
      wheeling: false,
      action: "",
    };
  },

  computed: {
    options() {
      return cloneDeep(assign(defaultOptions, this.viewerOptions));
    },
  },

  mounted() {
    this.init();
    window.v = this;
  },

  beforeDestroy() {
    this.unbind();
    this.removeSubscribe();
  },

  methods: {
    onSceneClick() {
      // this.$store.commit('updateState', { UIVisible: !this.$store.state.UIVisible });
      // this.delayUIVisible();
    },
    /* delayUIVisible() {
      this._uiTimer && clearTimeout(this._uiTimer);
      this._uiTimer = setTimeout(() => {
        if (!this.$store.state.UIVisible) {
          this.$store.commit('updateState', { UIVisible: true });
        }
      }, 5000);
    }, */
    init() {
      console.log("init");
      this.parent = this.$el.parentNode;
      this.element = this.$el;
      this.image = this.$refs["img"];
      this.viewer = this.$refs["container"];

      this.initViewer();
      this.initImage(() => {
        this.initAnchors();
        this.renderImage();

        const ratio = this.viewerData.height / 2485; // NOTE: 2485 is the height of the foucs area under natural size
        const defaultImageData = {
          ratio,
          left: -2550 * ratio + this.viewerData.width * 0.5, // NOTE: -2550 is the left of the foucs area under natural size
          top: -770 * ratio, // NOTE: -770 is the top of the foucs area under natural size
        };

        let focusImageData = this.focusImageData || defaultImageData;

        // if (this.$store.state.focusAnchorId !== '') {
        //   const focusAnchorId = this.$store.state.focusAnchorId;
        //   focusImageData = this.options.anchors && this.options.anchors[focusAnchorId] ? this.options.anchors[focusAnchorId].focusImageData : undefined;
        //   this.$store.commit('updateState', { focusAnchorId: '' })
        // }

        this.focusOn(focusImageData);

        // this.removeSubscribe = this.$store.subscribe((mutation, state) => {
        //   if (mutation.type !== 'updateState' || isNil(mutation.payload) || isNil(mutation.payload.focusAnchorId) || mutation.payload.focusAnchorId === '') return;

        //   const { focusAnchorId } = mutation.payload;
        //   const focusImageData = this.options.anchors && this.options.anchors[focusAnchorId] ? this.options.anchors[focusAnchorId].focusImageData : undefined;

        //   this.focusOn(focusImageData);
        //   this.$store.commit('updateState', { focusAnchorId: '' });
        // });
      });

      this.bind();
    },

    bind() {
      const { options } = this;

      addListener(
        this.$refs["canvas"],
        EVENT_POINTER_DOWN,
        (this.onPointerDown = this.pointerdown.bind(this))
      );
      addListener(
        this.$el.ownerDocument,
        EVENT_POINTER_MOVE,
        (this.onPointerMove = this.pointermove.bind(this))
      );
      addListener(
        this.$el.ownerDocument,
        EVENT_POINTER_UP,
        (this.onPointerUp = this.pointerup.bind(this))
      );

      if (options.zoomable && options.zoomOnWheel) {
        addListener(
          this.viewer,
          EVENT_WHEEL,
          (this.onWheel = this.wheel.bind(this)),
          {
            passive: false,
            capture: true,
          }
        );
      }
    },

    unbind() {
      const { options } = this;

      removeListener(
        this.$refs["canvas"],
        EVENT_POINTER_DOWN,
        this.onPointerDown
      );
      removeListener(
        this.$el.ownerDocument,
        EVENT_POINTER_MOVE,
        this.onPointerMove
      );
      removeListener(
        this.$el.ownerDocument,
        EVENT_POINTER_UP,
        this.onPointerUp
      );

      if (options.zoomable && options.zoomOnWheel) {
        removeListener(this.viewer, EVENT_WHEEL, this.onWheel, {
          passive: false,
          capture: true,
        });
      }
    },

    pointerdown(event) {
      const { options, pointers } = this;
      const { buttons, button } = event;

      if (
        (event.type === "mousedown" ||
          (event.type === "pointerdown" && event.pointerType === "mouse")) &&
        // No primary button (Usually the left button)
        ((isNumber(buttons) && buttons !== 1) ||
          (isNumber(button) && button !== 0) ||
          // Open context menu
          event.ctrlKey)
      ) {
        return;
      }

      // Prevent default behaviours as page zooming in touch devices.
      event.preventDefault();

      if (event.changedTouches) {
        forEach(event.changedTouches, (touch) => {
          pointers[touch.identifier] = getPointer(touch);
        });
      } else {
        pointers[event.pointerId || 0] = getPointer(event);
      }

      let action = options.movable ? ACTION_MOVE : false;

      if (
        options.zoomOnTouch &&
        options.zoomable &&
        Object.keys(pointers).length > 1
      ) {
        action = ACTION_ZOOM;
      } else if (
        options.slideOnTouch &&
        (event.pointerType === "touch" || event.type === "touchstart") &&
        this.isSwitchable()
      ) {
        action = ACTION_SWITCH;
      }

      this.action = action;
    },

    pointermove(event) {
      const { pointers, action } = this;

      if (!action) {
        return;
      }

      event.preventDefault();

      if (event.changedTouches) {
        forEach(event.changedTouches, (touch) => {
          assign(pointers[touch.identifier] || {}, getPointer(touch, true));
        });
      } else {
        assign(pointers[event.pointerId || 0] || {}, getPointer(event, true));
      }

      this.change(event);
    },

    pointerup(event) {
      const { options, action, pointers } = this;
      let pointer;

      if (event.changedTouches) {
        forEach(event.changedTouches, (touch) => {
          pointer = pointers[touch.identifier];
          delete pointers[touch.identifier];
        });
      } else {
        pointer = pointers[event.pointerId || 0];
        delete pointers[event.pointerId || 0];
      }

      if (!action) {
        return;
      }

      event.preventDefault();

      /* if (action === ACTION_ZOOM) {
        this.correctZoom();
      } */

      this.action = false;

      // Emulate click and double click in touch devices to support backdrop and image zooming (#210).
      if (
        IS_TOUCH_DEVICE &&
        action !== ACTION_ZOOM &&
        pointer &&
        Date.now() - pointer.timeStamp < 500
      ) {
        clearTimeout(this.clickCanvasTimeout);
        clearTimeout(this.doubleClickImageTimeout);

        if (
          options.toggleOnDblclick &&
          this.viewed &&
          event.target === this.image
        ) {
          if (this.imageClicked) {
            this.imageClicked = false;

            // This timeout will be cleared later when a native dblclick event is triggering
            this.doubleClickImageTimeout = setTimeout(() => {
              dispatchEvent(this.image, EVENT_DBLCLICK);
            }, 50);
          } else {
            this.imageClicked = true;

            // The default timing of a double click in Windows is 500 ms
            this.doubleClickImageTimeout = setTimeout(() => {
              this.imageClicked = false;
            }, 500);
          }
        } else {
          this.imageClicked = false;

          if (
            options.backdrop &&
            options.backdrop !== "static" &&
            event.target === this.canvas
          ) {
            // This timeout will be cleared later when a native click event is triggering
            this.clickCanvasTimeout = setTimeout(() => {
              dispatchEvent(this.canvas, EVENT_CLICK);
            }, 50);
          }
        }
      }
    },

    wheel(event) {
      event.preventDefault();

      // Limit wheel speed to prevent zoom too fast
      if (this.wheeling) {
        return;
      }

      this.wheeling = true;

      setTimeout(() => {
        this.wheeling = false;
      }, 50);

      const ratio = Number(this.options.zoomRatio) || 0.1;
      let delta = 1;

      if (event.deltaY) {
        delta = event.deltaY > 0 ? 1 : -1;
      } else if (event.wheelDelta) {
        delta = -event.wheelDelta / 120;
      } else if (event.detail) {
        delta = event.detail > 0 ? 1 : -1;
      }

      this.zoom(-delta * ratio, false, event);
    },

    initViewer() {
      const { options, parent } = this;
      let viewerData;

      viewerData = {
        width: Math.max(
          parent.offsetWidth,
          isNumber(options.minWidth) ? options.minWidth : 0
        ),
        height: Math.max(
          parent.offsetHeight,
          isNumber(options.minHeight) ? options.minHeight : 0
        ),
      };

      this.parentData = viewerData;
      this.viewerData = assign({}, viewerData);
    },

    initImage(done) {
      const { options, image, viewerData } = this;
      const viewerWidth = viewerData.width;
      const viewerHeight = viewerData.height;
      const oldImageData = this.imageData || {};
      let sizingImage;

      this.imageInitializing = {
        abort: () => {
          sizingImage.onload = null;
        },
      };

      sizingImage = getImageNaturalSizes(
        image,
        options,
        (naturalWidth, naturalHeight) => {
          const aspectRatio = naturalWidth / naturalHeight;
          let width = viewerWidth;
          let height = viewerHeight;
          let ratio;

          this.imageInitializing = false;

          if (options.defaultRatio) {
            width = naturalWidth * options.defaultRatio;
            height = naturalHeight * options.defaultRatio;
            ratio = options.defaultRatio;
          } else {
            if (viewerData.width / aspectRatio < viewerData.height) {
              width = viewerData.height * aspectRatio;
            } else {
              height = viewerData.width / aspectRatio;
            }

            ratio = width / naturalWidth;
          }

          const imageData = {
            naturalWidth,
            naturalHeight,
            aspectRatio,
            ratio: ratio,
            width,
            height,
            left: isUndefined(options.defaultLeft)
              ? (viewerWidth - width) / 2
              : options.defaultLeft,
            top: isUndefined(options.defaultTop)
              ? (viewerHeight - height) / 2
              : options.defaultTop,
          };
          const initialImageData = assign({}, imageData);

          this.imageData = imageData;
          this.initialImageData = initialImageData;

          if (done) {
            done();
          }
        }
      );
    },

    initAnchors() {
      const { anchors: anchorsOption } = this.options;
      const { left, top } = this.imageData;

      forEach(anchorsOption, (anchorOption) => {
        const { uid, x, y } = anchorOption;

        this.anchors[uid] = this.$el.querySelector(`[uid=${uid}]`);
        this.anchorsData[uid] = assign(
          {},
          {
            uid,
            offsetLeft: x,
            offsetTop: y,
            left: left + x,
            top: top + y,
          }
        );
      });
    },

    onClick(event) {
      const { srcElement } = event;
      const anchorEle = closestByClass(srcElement, "h-image-viewer-anchor");

      if (!anchorEle) return;

      const uid = anchorEle.getAttribute("uid");

      this.$emit("pick", uid);
    },
  },
};
</script>

<style lang="scss" scoped>
.h-image-viewer {
  bottom: 0;
  direction: ltr;
  font-size: 0;
  left: 0;
  line-height: 0;
  overflow: hidden;
  position: absolute;
  right: 0;
  -webkit-tap-highlight-color: transparent;
  top: 0;
  touch-action: none;
  -webkit-touch-callout: none;
  user-select: none;
  z-index: 18;

  &::selection,
  & *::selection {
    background-color: transparent;
  }

  & img {
    display: block;
    height: auto;
    max-height: none !important;
    max-width: none !important;
    min-height: 0 !important;
    min-width: 0 !important;
    width: 100%;
  }

  &-canvas {
    bottom: 0;
    left: 0;
    overflow: hidden;
    position: absolute;
    right: 0;
    top: 0;

    & > img {
      height: auto;
      max-width: none;
      width: auto;
    }
  }

  &-img {
    cursor: grab;
  }

  .viewer-transition {
    transition: all 0.01s;
  }

  .good-box {
    display: flex;
    align-items: center;

    img {
      width: 14px;
    }
  }

  .good-num {
    font-size: 12px;
    transform-origin: right center;
    transform: scale(0.85);
    // margin-bottom: -2px;
    margin-left: 2px;
  }
}
</style>
