package com.spot.tv.domain

import android.util.Log

class ConsoleLogger(private val externalLogger: Logger?) {
    fun log(tag: String, message: String) {
        Log.i(tag, message)
        externalLogger?.log(tag, message)
    }
}

interface Logger {
    fun log(tag: String, message: String)
}