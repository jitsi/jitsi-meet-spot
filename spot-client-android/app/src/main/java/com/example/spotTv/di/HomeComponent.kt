package com.example.spotTv.di

import com.example.spotTv.presentation.view.MainActivity
import dagger.Subcomponent

@Subcomponent(modules = [HomeModule::class])
interface HomeComponent {
    fun inject(mainActivity: MainActivity)
}