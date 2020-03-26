package com.spot.tv.config

interface Config {
    val baseUrl
        get() = "https://spot.8x8.vc/tv"

    val skipPairRemote
        get() = false

    val skipSelectMedia
        get() = false

    val volumeControlSupported
        get() = true
}

class DefaultConfig : Config