package com.example.spotTv.presentation.viewModel

import androidx.lifecycle.Lifecycle
import androidx.lifecycle.LifecycleObserver
import androidx.lifecycle.OnLifecycleEvent
import com.spot.tv.domain.Logger
import com.example.spotTv.presentation.navigator.MainNavigationService

class MainViewModel(
    private val mainNavigationService: MainNavigationService,
    private val logger: Logger
) : LifecycleObserver {
    @OnLifecycleEvent(Lifecycle.Event.ON_CREATE)
    fun onCreateEvent() {
        logger.log(tag, "created")

        mainNavigationService.navigateToTvFragment()
    }

    companion object {
        private val tag = MainViewModel::class.java.simpleName
    }
}