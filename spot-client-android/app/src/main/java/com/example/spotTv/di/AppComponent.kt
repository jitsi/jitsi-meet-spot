package com.example.spotTv.di

import com.spot.tv.di.SpotComponent
import com.spot.tv.di.SpotModule
import dagger.Component
import javax.inject.Singleton

@Singleton
@Component(modules = [AppModule::class])
interface AppComponent {
    fun spotComponent(spotModule: SpotModule): SpotComponent

    fun homeComponent(homeModule: HomeModule): HomeComponent
}