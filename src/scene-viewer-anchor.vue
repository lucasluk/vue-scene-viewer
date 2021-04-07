<template>
  <div
    class="h-image-viewer-anchor"
    :class="[options.offset, options.icon]"
    :uid="options.uid"
    @click="$emit('click', $event)"
  >
    <div class="h-image-viewer-anchor-attachment">
      <div class="name">
        <span>{{ options.name }}</span>
        <slot></slot>
      </div>
    </div>
  </div>
</template>

<script>
export default {
  name: "SceneViewerAnchor",
  props: {
    options: {
      type: Object,
    },
  },
  data() {
    return {};
  },
  methods: {},
};
</script>

<style lang="scss" scoped>
@mixin anchor-icon($size: 10px, $color: #ce0e2d) {
  content: "";
  width: $size;
  height: $size;
  box-sizing: border-box;
  border-radius: 50%;
  border: 3px solid rgba($color, 1);
  background: white;
  transform-origin: center center;
  animation: fade 2s linear infinite alternate-reverse;
}

@mixin anchor-icon2($size: 12px) {
  content: "";
  width: $size;
  height: $size;
  box-sizing: border-box;
  border-radius: 50%;
  background-repeat: no-repeat;
  background-position: center center;
  background-size: cover;
  transform-origin: center center;
  animation: fade 2s linear infinite alternate-reverse;
}

@keyframes fade {
  0% {
    transform: scale(1);
  }
  50% {
    transform: scale(1.3);
  }
  100% {
    transform: scale(1.3);
  }
}
@keyframes fade2 {
  0% {
    transform: scale(1);
  }
  50% {
    transform: scale(1.2);
  }
  100% {
    transform: scale(1.2);
  }
}

.h-image-viewer-anchor {
  position: absolute;
  top: 0;
  left: 0;
  display: flex;
  align-items: center;
  z-index: 20; // FIX: invisible in UC Browser

  &-attachment {
    position: absolute;
    // top: 0;
    // left: 0;
    display: flex;
    align-items: center;
  }

  &.default {
    .h-image-viewer-anchor-attachment {
      top: -5px;
      left: -5px;
      &:before,
      &:after {
        @include anchor-icon();
        display: none;
      }
    }
  }

  &.react {
    .h-image-viewer-anchor-attachment {
      top: -6px;
      left: -6px;
      &:before,
      &:after {
        @include anchor-icon2();
        display: none;
        // background-image: url('../../assets/icon/ic-react.png');
      }
    }
  }

  .name {
    display: flex;
    align-items: center;
    font-size: 12px;
    // height: 20px;
    line-height: 20px;
    border-radius: 24px;
    color: white;
    padding: 0 8px;
    box-shadow: 0 0 0 1px rgba($color: white, $alpha: 0.6);
    background-color: rgba($color: #000000, $alpha: 0.38);
    white-space: nowrap;
  }

  &.left {
    .h-image-viewer-anchor-attachment {
      transform: translateX(-100%);
      &:after {
        margin-left: 5px;
        display: inline-block;
      }
    }
  }
  &.right {
    .h-image-viewer-anchor-attachment {
      &:before {
        margin-right: 5px;
        display: inline-block;
      }
    }
  }
  &.top {
    .h-image-viewer-anchor-attachment {
      &:before {
        margin-bottom: 5px;
        display: inline-block;
      }
    }
  }
  &.bottom {
    .h-image-viewer-anchor-attachment {
      &:after {
        margin-top: 5px;
        display: inline-block;
      }
    }
  }
}
</style>
