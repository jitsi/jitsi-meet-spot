package com.example.spotTv.di

import android.content.Context
import androidx.appcompat.app.AppCompatActivity
import com.spot.tv.di.ComponentHolder
import com.spot.tv.di.SpotComponent
import com.spot.tv.di.SpotModule
import com.spot.tv.presentation.TVFragment
import java.util.HashMap

class ComponentHolder(private val context: Context) :
    ComponentHolder {

    private val container: HashMap<String, Any> = HashMap()

    override fun <C : Any?> getComponent(clz: Class<C>, arg: Any?): C? {
        val classParamName = clz.canonicalName

        var component = container[classParamName!!]
        if (component == null) {
            component = when (clz) {
                AppComponent::class.java -> {
                    DaggerAppComponent.builder()
                        .appModule(AppModule(context))
                        .build() as C
                }
                SpotComponent::class.java -> {
                    val fragment = arg as TVFragment
                    getComponent(AppComponent::class.java)?.spotComponent(
                        SpotModule(
                            context,
                            fragment
                        )
                    ) as C
                }
                HomeComponent::class.java -> {
                    val activity = arg as AppCompatActivity
                    getComponent(AppComponent::class.java)?.homeComponent(HomeModule(activity)) as C
                }
                else -> null
            }
            component?.let {
                container[classParamName] = component
            }
        }

        return component!! as C
    }

    override fun clearComponent(clz: Class<*>?) {
        container.remove(clz?.canonicalName)
    }
}