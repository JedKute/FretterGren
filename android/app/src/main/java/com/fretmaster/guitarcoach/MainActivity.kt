package com.fretmaster.guitarcoach

import android.os.Bundle
import android.webkit.WebChromeClient
import android.webkit.WebResourceError
import android.webkit.WebSettings
import android.webkit.WebView
import android.webkit.WebViewClient
import androidx.appcompat.app.AppCompatActivity
import com.fretmaster.guitarcoach.databinding.ActivityMainBinding

class MainActivity : AppCompatActivity() {

    private lateinit var binding: ActivityMainBinding
    private lateinit var webView: WebView

    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)
        binding = ActivityMainBinding.inflate(layoutInflater)
        setContentView(binding.root)

        webView = binding.webView
        setupWebView()
        loadWebApp()
    }

    private fun setupWebView() {
        val settings = webView.settings
        settings.javaScriptEnabled = true
        settings.domStorageEnabled = true
        settings.databaseEnabled = true
        // AppCache deprecated in API 33+, use standard cache mode
        settings.cacheMode = WebSettings.LOAD_DEFAULT
        settings.allowFileAccess = true
        settings.allowContentAccess = true
        settings.mixedContentMode = WebSettings.MIXED_CONTENT_ALWAYS_ALLOW
        settings.mediaPlaybackRequiresUserGesture = false
        settings.javaScriptCanOpenWindowsAutomatically = true
        settings.setSupportMultipleWindows(true)
        settings.setLayoutAlgorithm(WebSettings.LayoutAlgorithm.NORMAL)
        settings.useWideViewPort = true
        settings.loadWithOverviewMode = true
        settings.builtInZoomControls = false
        settings.displayZoomControls = false

        webView.webViewClient = object : WebViewClient() {
            override fun shouldOverrideUrlLoading(view: WebView?, url: String?): Boolean {
                if (url != null) {
                    if (url.startsWith("http://") || url.startsWith("https://")) {
                        view?.loadUrl(url)
                    } else if (url.startsWith("fretmaster://")) {
                        handleDeepLink(url)
                    }
                    return true
                }
                return false
            }

            override fun onPageFinished(view: WebView?, url: String?) {
                super.onPageFinished(view, url)
                binding.progressBar.visibility = android.view.View.GONE
            }

            override fun onReceivedError(view: WebView?, request: android.webkit.WebResourceRequest?, error: WebResourceError?) {
                super.onReceivedError(view, request, error)
                binding.progressBar.visibility = android.view.View.GONE
                if (error != null && error.errorCode == ERROR_FILE_NOT_FOUND) {
                    loadOfflinePage()
                }
            }
        }

        webView.webChromeClient = object : WebChromeClient() {
            override fun onProgressChanged(view: WebView?, newProgress: Int) {
                super.onProgressChanged(view, newProgress)
                binding.progressBar.progress = newProgress
                if (newProgress == 100) {
                    binding.progressBar.visibility = android.view.View.GONE
                } else {
                    binding.progressBar.visibility = android.view.View.VISIBLE
                }
            }

            override fun onPermissionRequest(request: android.webkit.PermissionRequest?) {
                super.onPermissionRequest(request)
                request?.grant(request.resources)
            }
        }

        webView.addJavascriptInterface(AndroidBridge(), "Android")
    }

    private fun loadWebApp() {
        // Load from local assets for offline support, or from remote URL
        val baseUrl = "file:///android_asset/"
        webView.loadUrl("${baseUrl}index.html")
    }

    private fun loadOfflinePage() {
        webView.loadUrl("file:///android_asset/offline.html")
    }

    private fun handleDeepLink(url: String) {
        // Handle deep links from the web app
    }

    override fun onBackPressed() {
        if (webView.canGoBack()) {
            webView.goBack()
        } else {
            super.onBackPressed()
        }
    }

    override fun onDestroy() {
        webView.destroy()
        super.onDestroy()
    }

    class AndroidBridge {
        @android.webkit.JavascriptInterface
        fun showToast(message: String) {
            // Show toast message
        }

        @android.webkit.JavascriptInterface
        fun getDeviceInfo(): String {
            return """{"platform": "android", "version": "${android.os.Build.VERSION.RELEASE}"}"""
        }

        @android.webkit.JavascriptInterface
        fun requestAudioPermission() {
            // Request audio permission for microphone access
        }
    }
}