package com.spot.tv.di

import android.content.Context
import com.spot.tv.config.Config
import com.spot.tv.domain.ConsoleLogger
import com.spot.tv.config.DefaultConfig
import com.spot.tv.domain.Logger
import com.spot.tv.domain.service.*
import com.spot.tv.presentation.TVFragment
import com.spot.tv.presentation.TVNavigationService
import com.spot.tv.presentation.TVViewModel
import dagger.Module
import dagger.Provides
import java.util.*

@Module
class SpotModule(
    private val context: Context,
    private val tvFragment: TVFragment
) {

    @Provides
    fun provideTVNavigationService(): TVNavigationService {
        return TVNavigationService(tvFragment)
    }

    @Provides
    fun provideBroadcastingService(): BroadcastingService {
        return BroadcastingService(context)
    }

    @Provides
    fun providePairingService(
        logger: ConsoleLogger,
        broadcastingService: BroadcastingService,
        pairingCodeHandlerOptional: Optional<PairingService.PairingCodeHandler>
    ): PairingService {
        val pairingCodeHandler =
            if (pairingCodeHandlerOptional.isPresent) pairingCodeHandlerOptional.get() else null
        return PairingService(
            broadcastingService,
            logger,
            pairingCodeHandler
        )
    }

    @Provides
    fun provideConsoleLogger(loggerOptional: Optional<Logger>): ConsoleLogger {
        val logger = if (loggerOptional.isPresent) loggerOptional.get() else null
        return ConsoleLogger(logger)
    }

    @Provides
    fun provideAudioService(
        logger: ConsoleLogger,
        audioHandlerOptional: Optional<AudioService.AudioHandler>
    ): AudioService {
        val audioHandler = if (audioHandlerOptional.isPresent) audioHandlerOptional.get() else null
        return AudioService(
            context,
            logger,
            audioHandler
        )
    }

    @Provides
    fun provideTVViewModel(
        configOptional: Optional<Config>,
        tvNavigationService: TVNavigationService,
        pairingService: PairingService,
        logger: ConsoleLogger,
        meetingServiceOptional: Optional<MeetingService>,
        audioService: AudioService
    ): TVViewModel {
        val config = if (configOptional.isPresent) configOptional.get() else DefaultConfig()

        val meetingService =
            if (meetingServiceOptional.isPresent) meetingServiceOptional.get() else DefaultMeetingService()

        return TVViewModel(
            config,
            tvNavigationService,
            pairingService,
            logger,
            meetingService,
            audioService
        )
    }
}