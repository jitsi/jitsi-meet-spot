import AbstractMuteController from './AbstractMuteController';

/**
 * Listens for video mute changes by observing the Zoom UI.
 */
export default class VideoMuteController extends AbstractMuteController {
    static VIDEO_MUTE_BUTTON = '[aria-label="stop sending my video"]';
    static VIDEO_UNMUTE_BUTTON = '[aria-label="start sending my video"]';

    /**
     * Sets video mute to the desired state.
     *
     * @inheritdoc
     */
    setMute(mute) {
        this._clickIfExists(
            mute
                ? VideoMuteController.VIDEO_MUTE_BUTTON
                : VideoMuteController.VIDEO_UNMUTE_BUTTON
        );
    }

    /**
     * Returns whether or not video is currently muted.
     *
     * @inheritdoc
     */
    _getCurrentMuteState() {
        const muteButton = document.querySelector(VideoMuteController.VIDEO_MUTE_BUTTON);
        const unmuteButton = document.querySelector(VideoMuteController.VIDEO_UNMUTE_BUTTON);

        // The buttons are present then return the state represented by the buttons.
        if (unmuteButton || muteButton) {
            return Boolean(unmuteButton);
        }

        // Otherwise default to returning muted.
        return true;
    }

    /**
     * Returns the HTMLElement which updates known video mute state.
     *
     * @inheritdoc
     */
    _getElementToObserve() {
        return document.querySelector(VideoMuteController.VIDEO_UNMUTE_BUTTON)
            || document.querySelector(VideoMuteController.VIDEO_MUTE_BUTTON);
    }
}
