package com.example.spotTv.config

import com.spot.tv.config.Config

class AppConfig : Config {
    override val skipSelectMedia: Boolean
        get() = true
}