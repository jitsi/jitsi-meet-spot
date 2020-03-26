package com.spot.tv.presentation

class TVNavigationService(private val tvFragment: TVFragment) {
    fun setMuteState(isMuted: Boolean) {
        tvFragment.setMuteState(isMuted)
    }

    fun navigateBack() {
        tvFragment.activity?.onBackPressed()
    }
}