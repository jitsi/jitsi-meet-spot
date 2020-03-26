package com.spot.tv.di

import com.spot.tv.config.Config
import com.spot.tv.domain.Logger
import com.spot.tv.domain.service.AudioService
import com.spot.tv.domain.service.MeetingService
import com.spot.tv.domain.service.PairingService
import dagger.BindsOptionalOf
import dagger.Module

@Module
interface OptionalModule {
    @BindsOptionalOf
    fun bindOptionalMeetingService(): MeetingService

    @BindsOptionalOf
    fun bindOptionalLogger(): Logger

    @BindsOptionalOf
    fun bindsOptionalConfig(): Config

    @BindsOptionalOf
    fun bindsOptionalAudioHandler(): AudioService.AudioHandler

    @BindsOptionalOf
    fun bindsOptionalPairingCodeHandler(): PairingService.PairingCodeHandler
}