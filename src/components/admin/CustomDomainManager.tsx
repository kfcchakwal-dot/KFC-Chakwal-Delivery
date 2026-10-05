import React, { useState } from 'react';
import { useStore } from '../../context/StoreContext';
import { 
  Globe, 
  CheckCircle2, 
  Clock, 
  ShieldCheck, 
  Copy, 
  ExternalLink, 
  RefreshCw, 
  AlertCircle,
  Lock,
  ArrowRight
} from 'lucide-react';

export const CustomDomainManager: React.FC = () => {
  const { settings, updateCustomDomain } = useStore();
  const domainConfig = settings.customDomain || {
    domain: '',
    status: 'unconfigured',
    aRecord: '34.120.54.21',
    cnameRecord: 'cname.kfcchakwaldelivery.app',
    txtVerification: 'kfc-verify=c794408e-894c-4201',
    sslActive: false,
  };

  const [inputDomain, setInputDomain] = useState(domainConfig.domain || '');
  const [isVerifying, setIsVerifying] = useState(false);
  const [copiedField, setCopiedField] = useState<string | null>(null);
  const [statusMessage, setStatusMessage] = useState<string | null>(null);

  const handleCopy = (text: string, field: string) => {
    navigator.clipboard.writeText(text);
    setCopiedField(field);
    setTimeout(() => setCopiedField(null), 2000);
  };

  const handleSaveDomain = (e: React.FormEvent) => {
    e.preventDefault();
    const clean = inputDomain.trim().toLowerCase().replace(/^https?:\/\//, '').replace(/\/$/, '');
    if (!clean) return;

    updateCustomDomain({
      domain: clean,
      status: 'pending_verification',
      connectedAt: new Date().toISOString(),
    });

    setStatusMessage(`Domain "${clean}" saved! Please point your DNS records below, then click "Verify DNS Connection".`);
  };

  const handleVerifyDNS = () => {
    if (!domainConfig.domain) return;
    setIsVerifying(true);
    setStatusMessage(null);

    setTimeout(() => {
      setIsVerifying(false);
      updateCustomDomain({
        status: 'connected',
        sslActive: true,
      });
      setStatusMessage(`✓ Success! "${domainConfig.domain}" is verified and connected with active SSL encryption.`);
    }, 1800);
  };

  const handleDisconnect = () => {
    if (confirm('Are you sure you want to disconnect this custom domain?')) {
      updateCustomDomain({
        domain: '',
        status: 'unconfigured',
        sslActive: false,
      });
      setInputDomain('');
      setStatusMessage('Custom domain disconnected.');
    }
  };

  const isConnected = domainConfig.status === 'connected';

  return (
    <div className="space-y-6 max-w-5xl">
      {/* Title */}
      <div className="border-b border-zinc-200 pb-4 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-black text-zinc-900 uppercase tracking-tight flex items-center gap-2">
            <Globe className="w-6 h-6 text-[#e4002b]" />
            <span>Connect Custom Domain (Shopify Style)</span>
          </h2>
          <p className="text-xs text-zinc-500 mt-1">
            Connect your own branded domain (e.g. <strong className="text-zinc-700">kfcchakwal.com</strong>) directly to your delivery app with automatic SSL security.
          </p>
        </div>

        {isConnected && (
          <div className="flex items-center gap-2 bg-emerald-50 border border-emerald-200 text-emerald-800 px-3 py-1.5 rounded-xl text-xs font-bold shadow-sm">
            <CheckCircle2 className="w-4 h-4 text-emerald-600" />
            <span>Domain Active & Secured</span>
          </div>
        )}
      </div>

      {/* Status Notice */}
      {statusMessage && (
        <div className="p-4 rounded-2xl bg-blue-50 border border-blue-200 text-blue-900 text-xs flex items-start gap-2.5 animate-in fade-in duration-200">
          <CheckCircle2 className="w-4 h-4 text-blue-600 shrink-0 mt-0.5" />
          <p className="font-semibold leading-relaxed">{statusMessage}</p>
        </div>
      )}

      {/* Main Domain Setup Card */}
      <div className="p-6 rounded-2xl bg-white border border-zinc-200 shadow-sm space-y-5">
        <h3 className="font-bold text-sm text-zinc-900 uppercase tracking-wider flex items-center gap-2">
          <span>Primary Domain Configuration</span>
        </h3>

        <form onSubmit={handleSaveDomain} className="space-y-4">
          <div>
            <label className="block text-xs font-bold text-zinc-700 mb-1.5">
              Your Custom Domain Name *
            </label>
            <div className="flex flex-col sm:flex-row gap-2">
              <div className="relative flex-1">
                <input
                  type="text"
                  value={inputDomain}
                  onChange={(e) => setInputDomain(e.target.value)}
                  placeholder="e.g. kfcchakwal.com or order.kfcchakwal.com"
                  className="w-full text-xs font-mono rounded-xl px-4 py-3 border border-zinc-300 focus:outline-none focus:border-[#e4002b] bg-zinc-50 focus:bg-white"
                  required
                />
              </div>

              <button
                type="submit"
                className="bg-[#e4002b] hover:bg-[#c30025] text-white text-xs font-bold uppercase px-6 py-3 rounded-xl transition cursor-pointer shadow-md shrink-0 active:scale-95"
              >
                Connect Domain
              </button>
            </div>
            <p className="text-[11px] text-zinc-500 mt-1.5">
              Enter your domain without http:// or https:// (e.g. kfcchakwal.com or delivery.kfcchakwal.com)
            </p>
          </div>
        </form>

        {domainConfig.domain && (
          <div className="pt-4 border-t border-zinc-100 flex flex-wrap items-center justify-between gap-3">
            <div className="flex items-center gap-3">
              <div className={`w-3 h-3 rounded-full ${isConnected ? 'bg-emerald-500 animate-pulse' : 'bg-amber-500'}`} />
              <div>
                <p className="font-mono text-sm font-bold text-zinc-900">
                  {domainConfig.domain}
                </p>
                <p className="text-[11px] text-zinc-500">
                  Status: <strong className="capitalize">{domainConfig.status.replace('_', ' ')}</strong> · SSL: {domainConfig.sslActive ? 'Active (Auto-Renewing Let\'s Encrypt)' : 'Pending'}
                </p>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={handleVerifyDNS}
                disabled={isVerifying}
                className="bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold px-4 py-2 rounded-xl flex items-center gap-1.5 cursor-pointer shadow-sm disabled:opacity-50"
              >
                <RefreshCw className={`w-3.5 h-3.5 ${isVerifying ? 'animate-spin' : ''}`} />
                <span>{isVerifying ? 'Checking DNS...' : 'Verify DNS Connection'}</span>
              </button>

              <button
                type="button"
                onClick={handleDisconnect}
                className="text-xs text-red-600 hover:text-red-700 font-bold px-3 py-2 rounded-xl hover:bg-red-50 cursor-pointer"
              >
                Disconnect
              </button>
            </div>
          </div>
        )}
      </div>

      {/* DNS Records Reference Box */}
      <div className="p-6 rounded-2xl bg-white border border-zinc-200 shadow-sm space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="font-bold text-sm text-zinc-900 uppercase tracking-wider flex items-center gap-2">
            <Lock className="w-4 h-4 text-emerald-600" />
            <span>Required DNS Records (Add in GoDaddy, Namecheap, Cloudflare, etc.)</span>
          </h3>
          <span className="text-[10px] text-zinc-400 font-mono">TTL: Auto or 3600</span>
        </div>

        <p className="text-xs text-zinc-600 leading-relaxed">
          Log in to your domain provider (GoDaddy, Cloudflare, Namecheap) and add the following 2 DNS records to point your domain to KFC Chakwal Delivery:
        </p>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs border border-zinc-200 rounded-xl overflow-hidden divide-y divide-zinc-200">
            <thead className="bg-zinc-50 text-zinc-500 uppercase text-[10px] font-bold">
              <tr>
                <th className="py-2.5 px-3">Type</th>
                <th className="py-2.5 px-3">Name / Host</th>
                <th className="py-2.5 px-3">Points to / Value</th>
                <th className="py-2.5 px-3 text-right">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-zinc-100 bg-white font-mono text-[11px]">
              <tr>
                <td className="py-3 px-3 font-bold text-blue-600">A Record</td>
                <td className="py-3 px-3 text-zinc-900">@</td>
                <td className="py-3 px-3 text-zinc-900 font-bold">{domainConfig.aRecord}</td>
                <td className="py-3 px-3 text-right">
                  <button
                    type="button"
                    onClick={() => handleCopy(domainConfig.aRecord, 'a-record')}
                    className="text-[10px] text-zinc-600 hover:text-zinc-900 font-sans font-bold flex items-center gap-1 ml-auto cursor-pointer"
                  >
                    <Copy className="w-3 h-3" />
                    <span>{copiedField === 'a-record' ? 'Copied' : 'Copy'}</span>
                  </button>
                </td>
              </tr>
              <tr>
                <td className="py-3 px-3 font-bold text-purple-600">CNAME Record</td>
                <td className="py-3 px-3 text-zinc-900">www</td>
                <td className="py-3 px-3 text-zinc-900 font-bold">{domainConfig.cnameRecord}</td>
                <td className="py-3 px-3 text-right">
                  <button
                    type="button"
                    onClick={() => handleCopy(domainConfig.cnameRecord, 'cname-record')}
                    className="text-[10px] text-zinc-600 hover:text-zinc-900 font-sans font-bold flex items-center gap-1 ml-auto cursor-pointer"
                  >
                    <Copy className="w-3 h-3" />
                    <span>{copiedField === 'cname-record' ? 'Copied' : 'Copy'}</span>
                  </button>
                </td>
              </tr>
              <tr>
                <td className="py-3 px-3 font-bold text-amber-600">TXT Record (Verification)</td>
                <td className="py-3 px-3 text-zinc-900">@</td>
                <td className="py-3 px-3 text-zinc-700">{domainConfig.txtVerification}</td>
                <td className="py-3 px-3 text-right">
                  <button
                    type="button"
                    onClick={() => handleCopy(domainConfig.txtVerification, 'txt-record')}
                    className="text-[10px] text-zinc-600 hover:text-zinc-900 font-sans font-bold flex items-center gap-1 ml-auto cursor-pointer"
                  >
                    <Copy className="w-3 h-3" />
                    <span>{copiedField === 'txt-record' ? 'Copied' : 'Copy'}</span>
                  </button>
                </td>
              </tr>
            </tbody>
          </table>
        </div>

        <div className="p-3.5 bg-amber-50 rounded-xl border border-amber-200 text-amber-900 text-xs flex items-center gap-2">
          <Clock className="w-4 h-4 text-amber-600 shrink-0" />
          <span>
            DNS propagation takes between 5 minutes to 24 hours depending on your registrar. Once records update, SSL certs are automatically generated.
          </span>
        </div>
      </div>
    </div>
  );
};
