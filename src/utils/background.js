export const BACKGROUND_IMAGE_URL
    = 'https://static.pexels.com/photos/4827/nature-forest-trees-fog.jpeg';

export default {
    loadBackground() {
        return new Promise((resolve, reject) => {
            const image = new Image();

            image.onload = resolve;
            image.onerror = reject;

            image.src = BACKGROUND_IMAGE_URL;
        });
    },

    getBackgroundUrl() {
        return BACKGROUND_IMAGE_URL;
    }
};
