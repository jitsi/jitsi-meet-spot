/**
 * Asynchronously loads a script tag.
 *
 * @param src - The URL for the script to load.
 * @returns
 */
export function loadScript(src: string): Promise<Event> {
    return new Promise((resolve, reject) => {
        const script = document.createElement('script');

        script.type = 'text/javascript';
        script.async = true;
        script.onload = resolve;
        script.onerror = reject;

        script.src = src;

        const firstScript = document.getElementsByTagName('script')[0];

        firstScript.parentNode?.insertBefore(script, firstScript);
    });
}
