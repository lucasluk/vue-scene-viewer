import {
  EVENT_TRANSITION_END,
} from '../constants';
import {
  addListener,
  assign,
  forEach,
  getTransforms,
  removeListener,
  setStyle,
} from '../utils';

export default {
  methods: {
    renderImage(done) {
      const {
        image,
        imageData
      } = this;

      setStyle(image, assign({
        width: imageData.width,
        height: imageData.height,

        // XXX: Not to use translateX/Y to avoid image shaking when zooming
        marginLeft: imageData.left,
        marginTop: imageData.top,
      }, getTransforms(imageData)));

      this.renderAnchors();

      if (done) {
        if (this.zooming && this.options.transition) {
          const onTransitionEnd = () => {
            this.imageRendering = false;
            done();
          };

          this.imageRendering = {
            abort: () => {
              removeListener(image, EVENT_TRANSITION_END, onTransitionEnd);
            },
          };

          addListener(image, EVENT_TRANSITION_END, onTransitionEnd, {
            once: true,
          });
        } else {
          done();
        }
      }
    },

    renderAnchor(uid) {
      const anchor = this.anchors[uid];
      const anchorData = this.anchorsData[uid];
      const {
        left,
        top,
        ratio
      } = this.imageData;

      if (!anchor || !anchorData) return;

      setStyle(anchor, assign({
        marginLeft: left + (anchorData.offsetLeft * ratio),
        marginTop: top + (anchorData.offsetTop * ratio),
      }), getTransforms(anchorData));
    },

    renderAnchors() {
      const {
        anchorsData
      } = this;

      forEach(anchorsData, (anchorData) => {
        const {
          uid
        } = anchorData;

        this.renderAnchor(uid);
      });
    },
  }
};
