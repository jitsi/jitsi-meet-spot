package com.spot.tv.presentation

import androidx.databinding.ObservableField
import androidx.lifecycle.Lifecycle
import androidx.lifecycle.LifecycleObserver
import androidx.lifecycle.OnLifecycleEvent
import com.spot.tv.domain.ConsoleLogger
import com.spot.tv.domain.MeetingStatus
import com.spot.tv.domain.VolumeAdjustDirection
import com.spot.tv.domain.service.AudioService
import com.spot.tv.config.Config
import com.spot.tv.domain.service.MeetingService
import com.spot.tv.domain.service.PairingService
import io.reactivex.disposables.Disposable

class TVViewModel(
    private val config: Config,
    private val tvNavigationService: TVNavigationService,
    private val pairingService: PairingService,
    private val logger: ConsoleLogger,
    private val meetingService: MeetingService,
    private val audioService: AudioService
) : LifecycleObserver {

    private var micMuteStateChangeSubcription: Disposable? = null

    val tvUrl = ObservableField<String>()

    fun onPairincCodeChanged(code: String?) {
        logger.log(tag, "on pairing code changed: $code")
        val url = contructSpotTvUrl(code)
        tvUrl.set(url)
    }

    @OnLifecycleEvent(Lifecycle.Event.ON_CREATE)
    fun onCreateEvent() {
        logger.log(tag, "created")
    }

    @OnLifecycleEvent(Lifecycle.Event.ON_START)
    fun onStartEvent() {
        logger.log(tag, "started")
        micMuteStateChangeSubcription =
            audioService.registerForMicMuteStateChange { onMicMuteStateChanged(it) }
    }

    @OnLifecycleEvent(Lifecycle.Event.ON_STOP)
    fun onStopEvent() {
        logger.log(tag, "stopped")
        micMuteStateChangeSubcription?.dispose()
    }

    fun onPageLoaded() {
        logger.log(tag, "page loaded")
        pairingService.onSpotPageLoaded()
    }

    fun onMuteEvent(isMuted: Boolean?) {
        logger.log(tag, "mute event: $isMuted")
        audioService.setMuteState(isMuted)
    }

    fun onUpdateJoinCode(code: String?) {
        logger.log(tag, "update join code: $code")
        pairingService.onJoinCodeUpdated(code)
    }

    fun onUpdateShortJoinCode(code: String?) {
        logger.log(tag, "update short join code: $code")
        pairingService.onShortJoinCodeUpdated(code)
    }

    fun onAdjustVolume(direction: VolumeAdjustDirection) {
        logger.log(tag, "adjust volume: $direction")
        audioService.adjustVolume(direction)
    }

    fun onReset() {
        logger.log(tag, "reset")
        pairingService.onReset()
        tvNavigationService.navigateBack()
    }

    fun onMeetingStatusUpdated(status: MeetingStatus) {
        logger.log(tag, "meeting status updated: $status")
        meetingService.setMeetingStatus(status)
    }

    private fun onMicMuteStateChanged(isMuted: Boolean) {
        logger.log(tag, "mic mute state changed: $isMuted")
        tvNavigationService.setMuteState(isMuted)
    }

    private fun contructSpotTvUrl(code: String?): String {
        var url = "${config.baseUrl}?"

        code?.let {
            url += "llpc=$code&"
        }

        url += "skipPairRemote=${config.skipPairRemote}&"
        url += "skipSelectMedia=${config.skipSelectMedia}&"
        url += "volumeControlSupported=${config.volumeControlSupported}"

        return url
    }

    companion object {
        private val tag = TVViewModel::class.java.simpleName
    }
}