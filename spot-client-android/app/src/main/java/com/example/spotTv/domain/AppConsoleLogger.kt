package com.example.spotTv.domain

import android.util.Log
import com.spot.tv.domain.Logger

class AppConsoleLogger : Logger {
    override fun log(tag: String, message: String) {
        Log.i(tag, message)
    }
}