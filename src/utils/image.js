export function preloadImage(imageSrc) {
    return new Promise((resolve, reject) => {
        const image = new Image();

        image.onload = resolve;
        image.onerror = reject;

        image.src = imageSrc;
    });
}
