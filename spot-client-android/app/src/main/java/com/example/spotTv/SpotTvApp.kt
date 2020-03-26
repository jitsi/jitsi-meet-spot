package com.example.spotTv

import android.app.Application
import com.spot.tv.di.ComponentHolder

class SpotTvApp : Application(), ComponentHolder {

    private val componentHolder: ComponentHolder by lazy { com.example.spotTv.di.ComponentHolder(this) }

    override fun <C> getComponent(clz: Class<C>, arg: Any?): C? {
        return componentHolder.getComponent(clz, arg)
    }

    override fun clearComponent(clz: Class<*>?) {
        componentHolder.clearComponent(clz)
    }
}