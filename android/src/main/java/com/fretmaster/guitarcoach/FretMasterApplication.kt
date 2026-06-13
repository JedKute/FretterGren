package com.fretmaster.guitarcoach

import android.app.Application
import com.google.firebase.FirebaseApp

class FretMasterApplication : Application() {

    override fun onCreate() {
        super.onCreate()
        FirebaseApp.initializeApp(this)
    }
}