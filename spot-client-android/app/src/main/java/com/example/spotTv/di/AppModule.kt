package com.example.spotTv.di

import android.content.Context
import com.spot.tv.config.Config
import com.spot.tv.domain.Logger
import com.example.spotTv.config.AppConfig
import com.example.spotTv.domain.AppConsoleLogger
import dagger.Module
import dagger.Provides
import javax.inject.Singleton

@Module
class AppModule(private val context: Context) {
    @Singleton
    @Provides
    fun providesLogger(): Logger {
        return AppConsoleLogger()
    }

    @Singleton
    @Provides
    fun providesConfig(): Config {
        return AppConfig()
    }
}