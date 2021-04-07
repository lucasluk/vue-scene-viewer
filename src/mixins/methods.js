import {
  EVENT_ZOOM,
  EVENT_ZOOMED,
} from '../constants';
import {
  addListener,
  dispatchEvent,
  forEach,
  getOffset,
  getPointersCenter,
  isFunction,
  isNumber,
  isUndefined,
} from '../utils';
import {
  clamp
} from 'lodash';

export default {
  methods: {
    /**
     * Move the image with relative offsets.
     * @param {number} offsetX - The relative offset distance on the x-axis.
     * @param {number} offsetY - The relative offset distance on the y-axis.
     * @returns {Viewer} this
     */
    move(offsetX, offsetY) {
      const {
        imageData
      } = this;
      const {
        anchorsData
      } = this;

      this.moveTo(
        isUndefined(offsetX) ? offsetX : imageData.left + Number(offsetX),
        isUndefined(offsetY) ? offsetY : imageData.top + Number(offsetY),
      );

      return this;
    },

    /**
     * Move the image to an absolute point.
     * @param {number} x - The x-axis coordinate.
     * @param {number} [y=x] - The y-axis coordinate.
     * @returns {Viewer} this
     */
    moveTo(x, y = x) {
      const {
        imageData,
        viewerData
      } = this;

      x = Number(x);
      y = Number(y);

      if (this.options.movable) {
        let changed = false;

        if (isNumber(x)) {
          imageData.left = clamp(x, -Math.abs((viewerData.width - imageData.width)), 0);
          changed = true;
        }

        if (isNumber(y)) {
          imageData.top = clamp(y, -Math.abs((viewerData.height - imageData.height)), 0);;
          changed = true;
        }

        if (changed) {
          this.renderImage();
        }
      }

      return this;
    },

    /**
     * Zoom the image with a relative ratio.
     * @param {number} ratio - The target ratio.
     * @param {boolean} [hasTooltip=false] - Indicates if it has a tooltip or not.
     * @param {Event} [_originalEvent=null] - The original event if any.
     * @returns {Viewer} this
     */
    zoom(ratio, hasTooltip = false, _originalEvent = null) {
      const {
        imageData
      } = this;

      ratio = Number(ratio);

      if (ratio < 0) {
        ratio = 1 / (1 - ratio);
      } else {
        ratio = 1 + ratio;
      }

      this.zoomTo((imageData.width * ratio) / imageData.naturalWidth, hasTooltip, _originalEvent);

      return this;
    },

    /**
     * Zoom the image to an absolute ratio.
     * @param {number} ratio - The target ratio.
     * @param {boolean} [hasTooltip=false] - Indicates if it has a tooltip or not.
     * @param {Event} [_originalEvent=null] - The original event if any.
     * @param {Event} [_zoomable=false] - Indicates if the current zoom is available or not.
     * @returns {Viewer} this
     */
    zoomTo(ratio, hasTooltip = false, _originalEvent = null, _zoomable = false) {
      const {
        element,
        options,
        pointers,
        imageData,
        anchorsData,
        viewerData,
      } = this;
      const {
        width,
        height,
        left,
        top,
        naturalWidth,
        naturalHeight,
        aspectRatio,
      } = imageData;

      ratio = Math.max(0, ratio);

      if (isNumber(ratio) && (_zoomable || options.zoomable)) {
        if (!_zoomable) {
          const minZoomRatio = Math.max(0.01, options.minZoomRatio);
          const maxZoomRatio = Math.min(100, options.maxZoomRatio);

          ratio = Math.min(Math.max(ratio, minZoomRatio), maxZoomRatio);
        }

        if (_originalEvent && options.zoomRatio >= 0.055 && ratio > 0.95 && ratio < 1.05) {
          ratio = 1;
        }

        let newWidth = naturalWidth * ratio;
        let newHeight = naturalHeight * ratio;
        const oldRatio = width / naturalWidth;

        if (newWidth < viewerData.width || newHeight < viewerData.height) {
          newWidth = viewerData.width;
          newHeight = viewerData.height;

          if (viewerData.width / aspectRatio < viewerData.height) {
            newWidth = viewerData.height * aspectRatio;
          } else {
            newHeight = viewerData.width / aspectRatio;
          }

          ratio = newWidth / naturalWidth;
        }

        if (isFunction(options.zoom)) {
          addListener(element, EVENT_ZOOM, options.zoom, {
            once: true,
          });
        }

        if (dispatchEvent(element, EVENT_ZOOM, {
          ratio,
          oldRatio,
          originalEvent: _originalEvent,
        }) === false) {
          return this;
        }

        this.zooming = true;

        let offsetLeft;
        let offsetTop;
        const offsetWidth = newWidth - width;
        const offsetHeight = newHeight - height;

        if (_originalEvent) {
          const offset = getOffset(this.viewer);

          const center = pointers && Object.keys(pointers).length ? getPointersCenter(pointers) : {
            pageX: _originalEvent.pageX,
            pageY: _originalEvent.pageY,
          };

          // Zoom from the triggering point of the event
          offsetLeft = offsetWidth * (((center.pageX - offset.left) - left) / width);
          offsetTop = offsetHeight * (((center.pageY - offset.top) - top) / height);
        } else {
          // Zoom from the center of the image
          offsetLeft = offsetWidth / 2;
          offsetTop = offsetHeight / 2;
        }

        offsetLeft = clamp(offsetLeft, imageData.left, Math.abs(viewerData.width - newWidth) + imageData.left);
        offsetTop = clamp(offsetTop, imageData.top, Math.abs(viewerData.height - newHeight) + imageData.top);

        imageData.left -= offsetLeft;
        imageData.top -= offsetTop;

        forEach(anchorsData, (anchorData) => {
          anchorData.left += offsetLeft;
          anchorData.top += offsetTop;
        });

        imageData.width = newWidth;
        imageData.height = newHeight;
        imageData.ratio = ratio;
        this.renderImage(() => {
          this.zooming = false;

          if (isFunction(options.zoomed)) {
            addListener(element, EVENT_ZOOMED, options.zoomed, {
              once: true,
            });
          }

          dispatchEvent(element, EVENT_ZOOMED, {
            ratio,
            oldRatio,
            originalEvent: _originalEvent,
          });
        });
      }

      return this;
    },

    focusOn(focusImageData) {
      if (!focusImageData) return;

      this.zoomTo(focusImageData.ratio);
      this.moveTo(focusImageData.left, focusImageData.top);
    }
  }
};
