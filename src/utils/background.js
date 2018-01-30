const BACKGROUND_IMAGE_URL = '';

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
        return BACKGROUND_IMAGE_URL;
    }
};
