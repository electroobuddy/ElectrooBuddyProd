import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { motion } from "framer-motion";
import { Truck, Settings, Save, RotateCcw, CheckCircle, AlertCircle, Package } from "lucide-react";
import { toast } from "sonner";

const AdminShippingSettings = () => {
  const [loading, setLoading] = useState(false);
  const [testingConnection, setTestingConnection] = useState(false);
  const [config, setConfig] = useState({
    enabled: false,
    auto_create_shipment: true,
    email: '',
    password: '',
    webhook_url: '',
    default_weight: 1,
    default_length: 10,
    default_breadth: 10,
    default_height: 10,
  });

  useEffect(() => {
    fetchSettings();
  }, []);

  const fetchSettings = async () => {
    try {
      const { data, error } = await supabase
        .from('shipping_settings')
        .select('*')
        .single();

      if (data) {
        setConfig({
          enabled: data.enabled ?? false,
          auto_create_shipment: data.auto_create_shipment ?? true,
          email: data.email ?? '',
          password: data.password ?? '',
          webhook_url: data.webhook_url ?? '',
          default_weight: data.default_weight ?? 1,
          default_length: data.default_length ?? 10,
          default_breadth: data.default_breadth ?? 10,
          default_height: data.default_height ?? 10,
        });
      }
    } catch (error) {
      console.error('Error fetching settings:', error);
    }
  };

  const saveSettings = async () => {
    setLoading(true);
    try {
      const { error } = await supabase.from('shipping_settings').upsert({
        id: 1,
        ...config,
        updated_at: new Date().toISOString(),
      } as any);

      if (error) throw error;
      toast.success('Shipping settings saved successfully!');
    } catch (error: any) {
      toast.error(`Failed to save settings: ${error.message}`);
    } finally {
      setLoading(false);
    }
  };

  const testConnection = async () => {
    setTestingConnection(true);
    try {
      // Test Shiprocket authentication
      const response = await fetch('https://apiv2.shiprocket.in/v1/external/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email: config.email || 'electroobuddy@gmail.com',
          password: config.password || 'Buddy@123',
        }),
      });

      const data = await response.json();

      if (data.token) {
        toast.success('✅ Connection successful! Shiprocket credentials are valid.');
      } else {
        toast.error('❌ Connection failed. Please check your credentials.');
      }
    } catch (error: any) {
      toast.error(`❌ Connection error: ${error.message}`);
    } finally {
      setTestingConnection(false);
    }
  };

  const resetSettings = () => {
    setConfig({
      enabled: false,
      auto_create_shipment: true,
      email: '',
      password: '',
      webhook_url: `https://vgsfkkmbkgdeireqliuq.supabase.co/functions/v1/shiprocket-webhook`,
      default_weight: 1,
      default_length: 10,
      default_breadth: 10,
      default_height: 10,
    });
    toast.info('Settings reset to defaults');
  };

  return (
    <div className="p-6">
      <div className="mb-6">
        <div className="flex items-center gap-3 mb-2">
          <Truck className="w-8 h-8 text-primary" />
          <h1 className="text-3xl font-bold">Shipping Settings</h1>
        </div>
        <p className="text-muted-foreground">Configure Shiprocket integration and shipping preferences</p>
      </div>

      {/* Status Card */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-gradient-to-r from-primary/10 to-primary/5 border rounded-xl p-6 mb-6"
      >
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-lg font-semibold mb-1">Shiprocket Integration Status</h3>
            <p className="text-muted-foreground">
              {config.enabled ? '✅ Active and ready to create shipments' : '⚠️ Currently disabled'}
            </p>
          </div>
          <div className={`px-4 py-2 rounded-full font-medium ${
            config.enabled ? 'bg-green-100 text-green-800' : 'bg-yellow-100 text-yellow-800'
          }`}>
            {config.enabled ? 'Enabled' : 'Disabled'}
          </div>
        </div>
      </motion.div>

      <div className="grid gap-6">
        {/* Basic Configuration */}
        <div className="bg-card border rounded-xl p-6">
          <h2 className="text-xl font-bold mb-4 flex items-center gap-2">
            <Settings className="w-5 h-5" />
            Shiprocket API Configuration
          </h2>

          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium mb-2">
                Shiprocket Email *
              </label>
              <input
                type="email"
                value={config.email}
                onChange={(e) => setConfig({ ...config, email: e.target.value })}
                placeholder="your@email.com"
                className="w-full px-4 py-2 rounded-lg border border-border bg-background focus:outline-none focus:ring-2 focus:ring-primary/20"
              />
              <p className="text-xs text-muted-foreground mt-1">
                Your registered email with Shiprocket
              </p>
            </div>

            <div>
              <label className="block text-sm font-medium mb-2">
                Shiprocket Password *
              </label>
              <input
                type="password"
                value={config.password}
                onChange={(e) => setConfig({ ...config, password: e.target.value })}
                placeholder="••••••••"
                className="w-full px-4 py-2 rounded-lg border border-border bg-background focus:outline-none focus:ring-2 focus:ring-primary/20"
              />
              <p className="text-xs text-muted-foreground mt-1">
                Your Shiprocket account password
              </p>
            </div>

            <button
              onClick={testConnection}
              disabled={testingConnection || !config.email || !config.password}
              className="btn-secondary flex items-center gap-2"
            >
              {testingConnection ? (
                <>
                  <RotateCcw className="w-4 h-4 animate-spin" />
                  Testing...
                </>
              ) : (
                <>
                  <CheckCircle className="w-4 h-4" />
                  Test Connection
                </>
              )}
            </button>
          </div>
        </div>

        {/* Shipping Preferences */}
        <div className="bg-card border rounded-xl p-6">
          <h2 className="text-xl font-bold mb-4 flex items-center gap-2">
            <Package className="w-5 h-5" />
            Shipping Preferences
          </h2>

          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <label className="font-medium">Enable Shiprocket Integration</label>
                <p className="text-sm text-muted-foreground">
                  Automatically create shipments for new orders
                </p>
              </div>
              <button
                onClick={() => setConfig({ ...config, enabled: !config.enabled })}
                className={`relative w-14 h-7 rounded-full transition-colors ${
                  config.enabled ? 'bg-primary' : 'bg-muted'
                }`}
              >
                <div
                  className={`absolute top-1 w-5 h-5 bg-white rounded-full shadow transition-transform ${
                    config.enabled ? 'left-8' : 'left-1'
                  }`}
                />
              </button>
            </div>

            <div className="flex items-center justify-between">
              <div>
                <label className="font-medium">Auto-Create Shipment</label>
                <p className="text-sm text-muted-foreground">
                  Create shipment automatically after payment
                </p>
              </div>
              <button
                onClick={() => setConfig({ ...config, auto_create_shipment: !config.auto_create_shipment })}
                className={`relative w-14 h-7 rounded-full transition-colors ${
                  config.auto_create_shipment ? 'bg-primary' : 'bg-muted'
                }`}
              >
                <div
                  className={`absolute top-1 w-5 h-5 bg-white rounded-full shadow transition-transform ${
                    config.auto_create_shipment ? 'left-8' : 'left-1'
                  }`}
                />
              </button>
            </div>
          </div>
        </div>

        {/* Package Defaults */}
        <div className="bg-card border rounded-xl p-6">
          <h2 className="text-xl font-bold mb-4 flex items-center gap-2">
            <Package className="w-5 h-5" />
            Default Package Dimensions
          </h2>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div>
              <label className="block text-sm font-medium mb-2">Weight (kg)</label>
              <input
                type="number"
                step="0.1"
                value={config.default_weight}
                onChange={(e) => setConfig({ ...config, default_weight: parseFloat(e.target.value) || 0 })}
                className="w-full px-4 py-2 rounded-lg border border-border bg-background focus:outline-none focus:ring-2 focus:ring-primary/20"
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-2">Length (cm)</label>
              <input
                type="number"
                value={config.default_length}
                onChange={(e) => setConfig({ ...config, default_length: parseFloat(e.target.value) || 0 })}
                className="w-full px-4 py-2 rounded-lg border border-border bg-background focus:outline-none focus:ring-2 focus:ring-primary/20"
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-2">Breadth (cm)</label>
              <input
                type="number"
                value={config.default_breadth}
                onChange={(e) => setConfig({ ...config, default_breadth: parseFloat(e.target.value) || 0 })}
                className="w-full px-4 py-2 rounded-lg border border-border bg-background focus:outline-none focus:ring-2 focus:ring-primary/20"
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-2">Height (cm)</label>
              <input
                type="number"
                value={config.default_height}
                onChange={(e) => setConfig({ ...config, default_height: parseFloat(e.target.value) || 0 })}
                className="w-full px-4 py-2 rounded-lg border border-border bg-background focus:outline-none focus:ring-2 focus:ring-primary/20"
              />
            </div>
          </div>
        </div>

        {/* Webhook Information */}
        <div className="bg-card border rounded-xl p-6">
          <h2 className="text-xl font-bold mb-4 flex items-center gap-2">
            <AlertCircle className="w-5 h-5" />
            Webhook Configuration
          </h2>

          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium mb-2">Webhook URL</label>
              <div className="relative">
                <input
                  type="text"
                  value={config.webhook_url}
                  readOnly
                  className="w-full px-4 py-2 rounded-lg border border-border bg-muted/50 font-mono text-sm"
                />
                <button
                  onClick={() => {
                    navigator.clipboard.writeText(config.webhook_url);
                    toast.success('Webhook URL copied to clipboard');
                  }}
                  className="absolute right-2 top-1/2 -translate-y-1/2 text-primary hover:text-primary/80 text-sm font-medium"
                >
                  Copy
                </button>
              </div>
              <p className="text-xs text-muted-foreground mt-2">
                Configure this URL in your Shiprocket dashboard under Settings → Webhooks
              </p>
              <div className="mt-3 p-3 bg-blue-50 border border-blue-200 rounded-lg">
                <p className="text-sm font-medium text-blue-900 mb-1">Events to enable:</p>
                <ul className="text-xs text-blue-800 space-y-1">
                  <li>✓ Order Picked Up</li>
                  <li>✓ In Transit</li>
                  <li>✓ Out for Delivery</li>
                  <li>✓ Delivered</li>
                  <li>✓ Failed Attempt</li>
                  <li>✓ RTO (Return to Origin)</li>
                </ul>
              </div>
            </div>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex gap-4">
          <button
            onClick={saveSettings}
            disabled={loading}
            className="btn-primary flex items-center gap-2 flex-1"
          >
            <Save className="w-4 h-4" />
            {loading ? 'Saving...' : 'Save Settings'}
          </button>
          <button
            onClick={resetSettings}
            className="btn-secondary flex items-center gap-2"
          >
            <RotateCcw className="w-4 h-4" />
            Reset
          </button>
        </div>
      </div>
    </div>
  );
};

export default AdminShippingSettings;
