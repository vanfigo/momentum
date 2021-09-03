package com.bucketdev.momentum;

import android.os.Bundle;

import com.capacitorjs.plugins.storage.Storage;
import com.capacitorjs.plugins.storage.StoragePlugin;
import com.getcapacitor.BridgeActivity;
import com.getcapacitor.Plugin;

import java.util.ArrayList;
import com.codetrixstudio.capacitor.GoogleAuth.GoogleAuth;
import com.getcapacitor.community.admob.AdMob;

public class MainActivity extends BridgeActivity {

  @Override
  protected void onCreate(Bundle savedInstanceState) {
    super.onCreate(savedInstanceState);
    this.init(savedInstanceState, new ArrayList<Class<? extends Plugin>>() {{
      add(GoogleAuth.class);
      add(StoragePlugin.class);
      add(AdMob.class);
    }});
  }
}
