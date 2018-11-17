import { DEFAULT_BACKGROUND_IMAGE_URL } from 'config';

export default {
    loadBackground(imageUrl) {
        return new Promise((resolve, reject) => {
            const image = new Image();

            image.onload = resolve;
            image.onerror = reject;

            image.src = imageUrl;
        });
    },

    getBackgroundUrl() {
        return DEFAULT_BACKGROUND_IMAGE_URL;
    }
};
