import {
  ACTION_MOVE,
  ACTION_ZOOM,
} from '../constants';
import {
  forEach,
  getMaxZoomRatio,
} from '../utils';

export default {
  methods: {
    change(event) {
      const {
        options,
        pointers
      } = this;
      const pointer = pointers[Object.keys(pointers)[0]];
      const offsetX = pointer.endX - pointer.startX;
      const offsetY = pointer.endY - pointer.startY;

      switch (this.action) {
        // Move the current image
        case ACTION_MOVE:
          this.move(offsetX, offsetY);
          break;

        // Zoom the current image
        case ACTION_ZOOM:
          this.zoom(getMaxZoomRatio(pointers), false, event);
          break;

        default:
      }

      // Override
      forEach(pointers, (p) => {
        p.startX = p.endX;
        p.startY = p.endY;
      });
    },

    correctZoom() {
      const {
        imageData,
        viewerData,
        anchorsData,
      } = this;

      if ( (!this.isFull && (imageData.width <= viewerData.width || imageData.height <= viewerData.height))
        || (this.isFull && (imageData.width < viewerData.width))
        ) {
        let {
          width,
          height,
          ratio,
          left,
          top
        } = imageData;
        let offsetLeft = 0;
        let offsetTop = 0;

        !this.isFull && (this.isFull = !this.isFull);
        width = viewerData.width;
        height = width / imageData.aspectRatio;
        left = 0;
        top = (viewerData.height - height) * 0.5;
        offsetLeft = width - imageData.width;
        offsetTop = height - imageData.height;
        ratio = width / imageData.naturalWidth;

        forEach(anchorsData, (anchorData) => {
          anchorData.left += offsetLeft;
          anchorData.top += offsetTop;
        });

        imageData.width = width;
        imageData.height = height;
        imageData.left = left;
        imageData.top = top;
        ratio && (imageData.ratio = ratio);

        this.renderImage();
      } else if (this.isFull && (imageData.width > viewerData.width)) {
        this.initImage(() => {
          this.initAnchors();
          this.renderImage();
          this.isFull && (this.isFull = !this.isFull);
        });
      }
    }
  }
};
