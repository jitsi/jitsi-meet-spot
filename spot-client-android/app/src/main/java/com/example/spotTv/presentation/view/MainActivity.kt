package com.example.spotTv.presentation.view

import android.os.Bundle
import androidx.appcompat.app.AppCompatActivity
import com.spot.tv.di.ComponentHolder
import com.example.spotTv.R
import com.example.spotTv.SpotTvApp
import com.example.spotTv.di.HomeComponent
import com.example.spotTv.presentation.viewModel.MainViewModel
import javax.inject.Inject

class MainActivity : AppCompatActivity(), ComponentHolder {
    @Inject
    lateinit var viewModel: MainViewModel

    override fun onCreate(savedInstanceState: Bundle?) {
        inject()
        super.onCreate(savedInstanceState)
        setContentView(R.layout.activity_main)
        lifecycle.addObserver(viewModel)
    }

    override fun onDestroy() {
        clearComponent(HomeComponent::class.java)
        super.onDestroy()
    }

    override fun <C> getComponent(clz: Class<C>, arg: Any?): C? {
        return clz.cast((application as SpotTvApp).getComponent(clz, arg))
    }

    override fun clearComponent(clz: Class<*>?) {
        (application as SpotTvApp).clearComponent(clz)
    }

    private fun inject() {
        getComponent(HomeComponent::class.java, this)?.inject(this)
    }
}