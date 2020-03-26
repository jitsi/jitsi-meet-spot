package com.spot.tv.domain.service

import com.spot.tv.domain.ConsoleLogger

class PairingService(
    private val broadcastingService: BroadcastingService,
    private val logger: ConsoleLogger,
    private val pairingCodeHandler: PairingCodeHandler?
) {
    private var shortJoinCode: String? = null

    internal fun onJoinCodeUpdated(code: String?) {
        logger.log(tag, "update join code: $code")
        pairingCodeHandler?.onJoinCodeUpdated(code)
    }

    internal fun onShortJoinCodeUpdated(code: String?) {
        logger.log(tag, "update short join code: $code")
        code?.let {
            if (it != shortJoinCode) {
                shortJoinCode = it

                if (!shortJoinCode.isNullOrEmpty()) {
                    broadcastingService.broadcastJoinCode(it)
                }

                pairingCodeHandler?.onShortJoinCodeUpdated(it)
            }
        }
    }

    internal fun onSpotPageLoaded() {
        logger.log(tag, "spot page loaded")
        pairingCodeHandler?.onSpotPageLoaded()
    }

    internal fun onReset() {
        pairingCodeHandler?.onReset()
        broadcastingService.stopBroadcasting()
    }

    interface PairingCodeHandler {
        fun onJoinCodeUpdated(code: String?) = Unit
        fun onShortJoinCodeUpdated(code: String?) = Unit
        fun onSpotPageLoaded() = Unit
        fun onReset() = Unit
    }

    companion object {
        private val tag = PairingService::class.java.simpleName
    }
}

