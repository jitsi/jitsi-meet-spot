package com.spot.tv.domain.service

import android.content.Context
import android.media.AudioManager
import com.spot.tv.domain.ConsoleLogger
import com.spot.tv.domain.VolumeAdjustDirection
import io.reactivex.disposables.Disposable
import java.lang.ref.WeakReference

class AudioService(
    context: Context,
    private val logger: ConsoleLogger,
    private val audioHandler: AudioHandler?
) {

    private val contextReference = WeakReference(context)

    fun registerForMicMuteStateChange(onMicMuteStateChanged: (Boolean) -> Unit): Disposable? =
        audioHandler?.registerForMicMuteStateChange(onMicMuteStateChanged)

    fun setMuteState(isMuted: Boolean?) = audioHandler?.setMuteState(isMuted)

    fun adjustVolume(direction: VolumeAdjustDirection) {
        logger.log(tag, "adjust volume: $direction")

        contextReference.get()?.let {
            val audioManager = it.getSystemService(Context.AUDIO_SERVICE) as AudioManager
            audioManager.adjustStreamVolume(
                AudioManager.STREAM_MUSIC,
                direction.value,
                AudioManager.FLAG_SHOW_UI
            )
        }
    }

    interface AudioHandler {
        fun registerForMicMuteStateChange(onMicMuteStateChanged: (Boolean) -> Unit): Disposable? =
            null

        fun setMuteState(isMuted: Boolean?) = Unit
    }

    companion object {
        private val tag = AudioService::class.java.simpleName
    }
}