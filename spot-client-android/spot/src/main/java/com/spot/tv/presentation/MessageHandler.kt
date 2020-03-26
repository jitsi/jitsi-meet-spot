package com.spot.tv.presentation

import android.webkit.WebMessage
import com.spot.tv.domain.MeetingStatus
import com.spot.tv.domain.VolumeAdjustDirection
import org.json.JSONObject

class MessageHandler {

    companion object {

        private const val AUDIO_MUTED_STATE_COMMAND = "audioMutedState"
        private const val UPDATE_LONG_LIVED_PAIRING_CODE_COMMAND = "updateLongLivedPairingCode"
        private const val ADJUST_VOLUME_COMMAND = "adjustVolume"
        private const val RESET_COMMAND = "resetApp"
        private const val MEETING_STATUS_COMMAND = "meetingStatus"
        private const val SHORT_JOIN_CODE_COMMAND = "updateJoinCode"

        fun constructMessage(webMessage: WebMessage): Message? {
            val webMessageData =
                WebMessageData(
                    webMessage
                )

            return when (webMessageData.command) {
                AUDIO_MUTED_STATE_COMMAND -> AudioMutedMessage(
                    webMessageData.args
                )
                UPDATE_LONG_LIVED_PAIRING_CODE_COMMAND -> UpdateLongLivedPairingCodeMessage(
                    webMessageData.args
                )
                ADJUST_VOLUME_COMMAND -> AdjustVolumeMessage(
                    webMessageData.args
                )
                RESET_COMMAND -> ResetMessage()
                MEETING_STATUS_COMMAND -> MeetingStatusMessage(
                    webMessageData.args
                )
                SHORT_JOIN_CODE_COMMAND -> ShortJoinCodeMessage(
                    webMessageData.args
                )
                else -> null
            }
        }

        private class WebMessageData(webMessage: WebMessage) : JSONObject(webMessage.data) {
            val command: String? = this.optString("command")
            val args: String? = this.optString("args")
        }
    }

    class AudioMutedMessage(args: String?) : Message() {
        val isMuted = args?.toBoolean()

        override val type: Type
            get() = Type.AUDIO_MUTED
    }

    class UpdateLongLivedPairingCodeMessage(args: String?) : Message() {
        val joinCode: String? =
            if (args != null) JSONObject(args).optString("longLivedPairingCode") else null

        override val type: Type
            get() = Type.UPDATE_JOIN_CODE
    }

    class ShortJoinCodeMessage(args: String?) : Message() {
        val joinCode: String? =
            if (args != null) JSONObject(args).optString("remoteJoinCode") else null

        override val type: Type
            get() = Type.UPDATE_SHORT_JOIN_CODE
    }

    class ResetMessage : Message() {
        override val type: Type
            get() = Type.RESET
    }

    class AdjustVolumeMessage(private val args: String?) : Message() {
        override val type: Type
            get() = Type.ADJUST_VOLUME

        fun getDirection(): VolumeAdjustDirection {
            if (args == null) {
                return VolumeAdjustDirection.NONE
            }

            return when (JSONObject(args).optString("direction")) {
                "up" -> VolumeAdjustDirection.UP
                "down" -> VolumeAdjustDirection.DOWN
                else -> VolumeAdjustDirection.NONE
            }
        }
    }

    class MeetingStatusMessage(private val args: String?) : Message() {
        override val type: Type
            get() = Type.MEETING_STATUS

        fun getStatus(): MeetingStatus {
            if (args == null) {
                return MeetingStatus.NONE
            }

            return when (JSONObject(args).optString("status")) {
                "0" -> MeetingStatus.IDLE
                "1" -> MeetingStatus.IN_MEETING
                else -> MeetingStatus.NONE
            }
        }
    }

    abstract class Message {
        abstract val type: Type
    }

    enum class Type {
        AUDIO_MUTED,
        UPDATE_JOIN_CODE,
        ADJUST_VOLUME,
        RESET,
        MEETING_STATUS,
        UPDATE_SHORT_JOIN_CODE
    }
}