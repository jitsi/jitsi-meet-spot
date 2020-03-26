package com.spot.tv.domain.service

import android.bluetooth.le.AdvertiseSettings
import android.content.Context
import org.altbeacon.beacon.Beacon
import org.altbeacon.beacon.BeaconParser
import org.altbeacon.beacon.BeaconTransmitter
import java.lang.Integer.parseInt

class BroadcastingService(context: Context) {
    private val beaconTransmitter: BeaconTransmitter

    init {
        val beaconParser: BeaconParser = BeaconParser()
            .setBeaconLayout(I_BEACON_LAYOUT)
        beaconTransmitter = BeaconTransmitter(context, beaconParser)
        beaconTransmitter.advertiseMode = AdvertiseSettings.ADVERTISE_MODE_BALANCED
    }

    fun broadcastJoinCode(joinCode: String) {
        val hexValues = splitToHexValues(joinCode)

        if (hexValues.count() == 2) {
            val beacon: Beacon = Beacon.Builder()
                .setId1(ALT_BEACON_UUID)
                .setId2("0x" + hexValues[0])
                .setId3("0x" + hexValues[1])
                .setDataFields(listOf(0L))
                .setManufacturer(0x004C)
                .setTxPower(-59)
                .build()

            beaconTransmitter.startAdvertising(beacon)
        }
    }

    fun stopBroadcasting() {
        beaconTransmitter.stopAdvertising()
    }

    private fun splitToHexValues(joinCode: String): List<String> {
        val hexValue = parseInt(joinCode, 36).toString(16)
        return hexValue.chunked(hexValue.length / 2)
    }

    companion object {
        const val ALT_BEACON_UUID = "bf23c311-24ae-414b-b153-cf097836947f"
        const val I_BEACON_LAYOUT = "m:2-3=0215,i:4-19,i:20-21,i:22-23,p:24-24"
    }
}