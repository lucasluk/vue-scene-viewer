<template>
  <div class="app-container">
    <scene-viewer :viewerOptions="viewerOptions"></scene-viewer>
  </div>
</template>

<script>
import SceneViewer from "../src/index";

export default {
  name: "App",

  components: { SceneViewer },

  data() {
    return {
      viewerOptions: {
        src: require("./assets/example-img.jpg").default,
        backdrop: false,
        button: false,
        navbar: false,
        toolbar: false,
        title: false,
        inline: true,
        keyboard: false,
        toggleOnDblclick: false,
        rotatable: false,
        slideOnTouch: false,
        zIndexInline: 18,
        // maxZoomRatio: 0.75,
        maxZoomRatio: 2,
        minZoomRatio: 0.2,
        movable: true,
        anchors: {
          anchor1: {
            uid: "anchor1",
            x: 2050,
            y: 850,
            name: "五彩盘子",
            goodNum: "100w",
            isGood: false,
            offset: "right",
            icon: "default",
            index: "6",
            focusImageData: {
              ratio: 0.4,
              // left: -1217.07,
              // top: -608.48,
            },
          },
          anchor2: {
            uid: "anchor2",
            x: 700,
            y: 900,
            name: "动物套娃",
            goodNum: "100w",
            isGood: false,
            offset: "right",
            icon: "default",
            index: "7",
            focusImageData: {
              ratio: 0.4,
              left: -1217.07,
              top: -608.48,
            },
          },
          anchor3: {
            uid: "anchor3",
            x: 1450,
            y: 2600,
            name: "超薄笔记本",
            goodNum: "100w",
            isGood: false,
            offset: "left",
            icon: "default",
            index: "1",
            focusImageData: {
              ratio: 0.671,
              left: -200.542,
              top: -514.233,
            },
          },
          anchor4: {
            uid: "anchor4",
            x: 3300,
            y: 2800,
            name: "条纹马克杯",
            goodNum: "100w",
            isGood: true,
            offset: "left",
            icon: "default",
            index: "4",
            focusImageData: {
              ratio: 0.413,
              left: -640.837,
              top: -590.235,
            },
          },
          anchor5: {
            uid: "anchor5",
            x: 4200,
            y: 2000,
            name: "复古地球仪",
            goodNum: "100w",
            isGood: false,
            offset: "right",
            icon: "default",
            index: "3",
            focusImageData: {
              ratio: 0.4,
              left: -602.054,
              top: -166.676,
            },
          },
        },
      },
    };
  },

  mounted() {},
};
</script>

<style lang="scss">
.app-container {
  width: 100vw;
  height: 100vh;
}
</style>
