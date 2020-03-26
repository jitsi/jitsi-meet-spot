package com.example.spotTv.di

import androidx.appcompat.app.AppCompatActivity
import com.spot.tv.domain.Logger
import com.example.spotTv.presentation.navigator.MainNavigationService
import com.example.spotTv.presentation.viewModel.HomeViewModel
import com.example.spotTv.presentation.viewModel.MainViewModel
import dagger.Module
import dagger.Provides

@Module
class HomeModule(private val activity: AppCompatActivity) {
    @Provides
    fun provideHomeViewModel(
        mainNavigationService: MainNavigationService,
        logger: Logger
    ): HomeViewModel {
        return HomeViewModel(mainNavigationService, logger)
    }

    @Provides
    fun provideMainViewModel(
        mainNavigationService: MainNavigationService,
        logger: Logger
    ): MainViewModel {
        return MainViewModel(mainNavigationService, logger)
    }

    @Provides
    fun provideMainNavigationService(): MainNavigationService {
        return MainNavigationService(activity)
    }
}