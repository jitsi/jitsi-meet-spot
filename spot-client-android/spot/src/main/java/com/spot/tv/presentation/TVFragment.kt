package com.spot.tv.presentation

import android.Manifest
import android.annotation.SuppressLint
import android.net.Uri
import android.os.Bundle
import android.view.LayoutInflater
import android.view.View
import android.view.ViewGroup
import android.webkit.*
import android.webkit.WebMessagePort.WebMessageCallback
import androidx.databinding.Observable
import androidx.fragment.app.Fragment
import com.spot.tv.R
import com.spot.tv.di.ComponentHolder
import com.spot.tv.di.SpotComponent
import com.spot.tv.domain.ConsoleLogger
import kotlinx.android.synthetic.main.fragment_tv.*
import javax.inject.Inject

class TVFragment : Fragment() {

    @Inject
    lateinit var viewModel: TVViewModel

    @Inject
    lateinit var logger: ConsoleLogger

    override fun onCreate(savedInstanceState: Bundle?) {
        inject()
        super.onCreate(savedInstanceState)
        lifecycle.addObserver(viewModel)

        val joinCode = arguments?.getString(PAIRING_CODE_KEY)
        viewModel.onPairincCodeChanged(joinCode)
    }

    override fun onCreateView(
        inflater: LayoutInflater, container: ViewGroup?,
        savedInstanceState: Bundle?
    ): View? {
        return inflater.inflate(R.layout.fragment_tv, container, false)
    }

    override fun onViewCreated(view: View, savedInstanceState: Bundle?) {
        super.onViewCreated(view, savedInstanceState)

        requestPermissions(arrayOf(Manifest.permission.CAMERA, Manifest.permission.RECORD_AUDIO), 1)

        setupWebView(viewModel.tvUrl.get())
        viewModel.tvUrl.addOnPropertyChangedCallback(object :
            Observable.OnPropertyChangedCallback() {
            override fun onPropertyChanged(sender: Observable?, propertyId: Int) {
                viewModel.tvUrl.get()?.let {
                    activity?.runOnUiThread {
                        webView.loadUrl(it)
                    }
                }
            }
        })
    }

    override fun onDestroy() {
        activity?.let {
            (it as ComponentHolder).clearComponent(
                SpotComponent::class.java)
        }

        super.onDestroy()
    }

    fun setMuteState(isMuted: Boolean) {
        activity?.runOnUiThread {
            webView.postWebMessage(
                WebMessage(
                    "{\"channelName\": \"meetingCommand\", \"command\": \"setAudioMute\", \"args\": {\"mute\": $isMuted}}"
                ), Uri.EMPTY
            )
        }
    }

    @SuppressLint("SetJavaScriptEnabled")
    private fun setupWebView(url: String?) {
        url.let {
            webView.settings.javaScriptEnabled = true
            webView.settings.domStorageEnabled = true

            val newUA = webView.settings.userAgentString.replace("Mobile", "eliboM")
                .replace("Android", "diordnA")

            webView.settings.userAgentString = newUA

            webView.settings.useWideViewPort = true
            webView.settings.loadWithOverviewMode = true
            webView.settings.setSupportZoom(false)
            webView.settings.builtInZoomControls = false
            webView.settings.mediaPlaybackRequiresUserGesture = false

            webView.webViewClient = object : WebViewClient() {
                override fun shouldOverrideUrlLoading(
                    view: WebView?,
                    request: WebResourceRequest?
                ): Boolean {
                    return false
                }

                override fun onPageFinished(view: WebView?, url: String?) {
                    super.onPageFinished(view, url)

                    webView?.let {
                        it.visibility = View.VISIBLE
                        initPort()
                        viewModel.onPageLoaded()
                    }
                }
            }

            webView.webChromeClient =
                object : WebChromeClient() {
                    override fun onPermissionRequest(request: PermissionRequest) {
                        request.grant(request.resources)
                    }
                }

            webView.loadUrl(it)
        }
    }

    private fun initPort() {
        val channel = webView?.createWebMessageChannel()
        val port = channel?.get(0)

        port?.setWebMessageCallback(object : WebMessageCallback() {
            override fun onMessage(port: WebMessagePort, message: WebMessage) {
                logger.log(fragmentTag, "message received: ${message}")
                MessageHandler.constructMessage(
                    message
                )?.let {
                    when (it.type) {
                        MessageHandler.Type.AUDIO_MUTED -> viewModel.onMuteEvent((it as MessageHandler.AudioMutedMessage).isMuted)
                        MessageHandler.Type.UPDATE_JOIN_CODE -> viewModel.onUpdateJoinCode((it as MessageHandler.UpdateLongLivedPairingCodeMessage).joinCode)
                        MessageHandler.Type.ADJUST_VOLUME -> viewModel.onAdjustVolume((it as MessageHandler.AdjustVolumeMessage).getDirection())
                        MessageHandler.Type.RESET -> viewModel.onReset()
                        MessageHandler.Type.MEETING_STATUS -> viewModel.onMeetingStatusUpdated((it as MessageHandler.MeetingStatusMessage).getStatus())
                        MessageHandler.Type.UPDATE_SHORT_JOIN_CODE -> viewModel.onUpdateShortJoinCode(
                            (it as MessageHandler.ShortJoinCodeMessage).joinCode
                        )
                    }
                }
            }
        })

        val transport = channel?.get(1)

        webView?.postWebMessage(
            WebMessage("Initialize message communication port", arrayOf(transport)),
            Uri.EMPTY
        )
    }

    private fun inject() {
        activity?.let {
            (it as ComponentHolder).getComponent(
                SpotComponent::class.java, this)?.inject(this)
        }
    }

    companion object {
        const val PAIRING_CODE_KEY = "pairingCodeKey"
        private val fragmentTag = TVFragment::class.java.simpleName
    }
}