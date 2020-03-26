package com.example.spotTv.presentation.navigator

import android.os.Bundle
import androidx.appcompat.app.AppCompatActivity
import com.spot.tv.presentation.TVFragment
import com.example.spotTv.R
import java.lang.ref.WeakReference

class MainNavigationService(activity: AppCompatActivity) {
    private val activityReference = WeakReference(activity)

    fun navigateToTvFragment(pairingCode: String? = null) {
        activityReference.get()?.let {
            val fragment = TVFragment()

            pairingCode?.let {
                val bundle = Bundle()
                bundle.putString(TVFragment.PAIRING_CODE_KEY, it)
                fragment.arguments = bundle
            }

            it.supportFragmentManager
                .beginTransaction()
                .add(R.id.main_container, fragment)
                .addToBackStack(fragment.javaClass.simpleName)
                .commitAllowingStateLoss()
        }
    }
}