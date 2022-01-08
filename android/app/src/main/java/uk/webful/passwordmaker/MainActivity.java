package uk.webful.passwordmaker;

import android.os.Bundle;
import com.bkon.capacitor.DarkMode.DarkMode;
import com.getcapacitor.BridgeActivity;

public class MainActivity extends BridgeActivity {
    @Override
    public void onCreate(Bundle savedInstanceState) {
        super.onCreate(savedInstanceState);
        registerPlugin(DarkMode.class);
    }
}
