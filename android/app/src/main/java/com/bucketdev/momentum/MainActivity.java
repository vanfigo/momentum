package com.bucketdev.momentum;

import android.os.Bundle;

import com.getcapacitor.BridgeActivity;
import com.getcapacitor.Plugin;

import java.util.ArrayList;
import com.codetrixstudio.capacitor.GoogleAuth.GoogleAuth;

public class MainActivity extends BridgeActivity {

  @Override
  protected void onCreate(Bundle savedInstanceState) {
    super.onCreate(savedInstanceState);
    this.init(savedInstanceState, new ArrayList<Class<? extends Plugin>>() {{
      add(GoogleAuth.class);
    }});
  }
}
