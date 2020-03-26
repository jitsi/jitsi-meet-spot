package com.spot.tv.di

import com.spot.tv.presentation.TVFragment
import dagger.Subcomponent

@Subcomponent(modules = [SpotModule::class, OptionalModule::class])
interface SpotComponent {
    fun inject(tvFragment: TVFragment)
}