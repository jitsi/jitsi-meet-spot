package com.example.spotTv.presentation.viewModel

import androidx.lifecycle.Lifecycle
import androidx.lifecycle.LifecycleObserver
import androidx.lifecycle.OnLifecycleEvent
import com.spot.tv.domain.Logger
import com.example.spotTv.presentation.navigator.MainNavigationService

class HomeViewModel(
    private val mainNavigationService: MainNavigationService,
    private val logger: Logger
) : LifecycleObserver {
    @OnLifecycleEvent(Lifecycle.Event.ON_CREATE)
    fun onCreateEvent() {
        logger.log(tag, "created")
    }

    @OnLifecycleEvent(Lifecycle.Event.ON_START)
    fun onStartEvent() {
        logger.log(tag, "started")
    }

    @OnLifecycleEvent(Lifecycle.Event.ON_STOP)
    fun onStopEvent() {
        logger.log(tag, "stopped")
    }

    fun onEnterCodeClicked() {
        logger.log(tag, "enter code clicked")
        mainNavigationService.navigateToTvFragment()
    }

    private fun onPairingCodeReceived(pairingCode: String) {
        logger.log(tag, "pairing code received: $pairingCode")
        mainNavigationService.navigateToTvFragment(pairingCode)
    }

    companion object {
        private val tag = HomeViewModel::class.java.simpleName
    }
}