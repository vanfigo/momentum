package com.bucketdev.momentum;

import android.os.Bundle;

import com.capacitorjs.plugins.storage.StoragePlugin;
import com.codetrixstudio.capacitor.GoogleAuth.GoogleAuth;
import com.getcapacitor.BridgeActivity;
import com.getcapacitor.Plugin;
import com.getcapacitor.community.admob.AdMob;
import com.getcapacitor.community.facebooklogin.FacebookLogin;

import java.util.ArrayList;

public class MainActivity extends BridgeActivity {

  @Override
  protected void onCreate(Bundle savedInstanceState) {
    super.onCreate(savedInstanceState);
    this.init(savedInstanceState, new ArrayList<Class<? extends Plugin>>() {{
      add(StoragePlugin.class);
      add(GoogleAuth.class);
      add(FacebookLogin.class);
      add(AdMob.class);
    }});
  }
}
