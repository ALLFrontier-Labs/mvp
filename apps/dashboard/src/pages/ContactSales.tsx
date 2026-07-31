import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { ArrowRight, CheckCircle2, Building2, Globe, Mail, Phone, Shield, ArrowUpRight } from 'lucide-react';

export const ContactSales: React.FC = () => {
  const [formData, setFormData] = useState({
    company: '',
    website: '',
    firstName: '',
    lastName: '',
    email: '',
    countryCode: '+1',
    phone: '',
    role: '',
    country: '',
    message: '',
    monthlySpend: '',
    euRouting: false,
    dpa: false,
  });

  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitted(true);
  };

  return (
    <div className="min-h-screen font-sans py-12 px-4 sm:px-6 lg:px-8 transition-colors duration-200" style={{ backgroundColor: 'var(--bg)', color: 'var(--text-primary)' }}>
      <div className="max-w-4xl mx-auto space-y-8">

        {/* ── Top Support Banner ───────────────────────────────────────────── */}
        <div 
          className="p-5 rounded-2xl border flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4"
          style={{ backgroundColor: 'var(--bg-card)', borderColor: 'var(--border)' }}
        >
          <div>
            <h4 className="text-sm font-bold" style={{ color: 'var(--text-primary)' }}>Need help?</h4>
            <p className="text-xs" style={{ color: 'var(--text-secondary)' }}>Browse our help center or open a support ticket.</p>
          </div>
          <Link
            to="/docs"
            className="px-4 py-2 rounded-xl text-xs font-extrabold flex items-center gap-1.5 transition-all shadow-sm shrink-0"
            style={{ backgroundColor: 'var(--accent)', color: '#09090b' }}
          >
            <span>Visit Support</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>

        {/* ── Main Form Container ──────────────────────────────────────────── */}
        <div 
          className="p-8 sm:p-10 rounded-3xl border shadow-2xl space-y-8"
          style={{ backgroundColor: 'var(--bg-card)', borderColor: 'var(--border)' }}
        >
          <div className="space-y-2">
            <h1 className="text-3xl sm:text-4xl font-extrabold tracking-tight" style={{ color: 'var(--text-primary)' }}>
              Contact Sales
            </h1>
            <p className="text-xs sm:text-sm leading-relaxed max-w-2xl" style={{ color: 'var(--text-secondary)' }}>
              We'd love to hear from you! Please fill out the form and we'll get back to you as soon as possible.
              If you already have an account set up and need assistance, please reach out on our <Link to="/docs" className="underline hover:text-white">support page</Link>.
            </p>
          </div>

          {submitted ? (
            <div className="p-8 rounded-2xl border text-center space-y-4" style={{ backgroundColor: 'var(--bg-secondary)', borderColor: 'var(--accent)' }}>
              <CheckCircle2 className="w-12 h-12 text-emerald-400 mx-auto" />
              <h3 className="text-xl font-bold" style={{ color: 'var(--text-primary)' }}>Thank You!</h3>
              <p className="text-xs text-zinc-400 max-w-md mx-auto">
                Your inquiry has been received. Our enterprise sales team will get back to you within 24 hours.
              </p>
              <Link
                to="/"
                className="inline-block px-5 py-2.5 rounded-xl text-xs font-bold transition-all shadow-sm"
                style={{ backgroundColor: 'var(--accent)', color: '#09090b' }}
              >
                Back To Home
              </Link>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-6 text-xs">
              
              {/* Row 1: Company & Website */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                <div className="space-y-1.5">
                  <label className="font-semibold flex items-center gap-1" style={{ color: 'var(--text-primary)' }}>
                    Company <span className="text-rose-500">*</span>
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="Acme Inc."
                    value={formData.company}
                    onChange={(e) => setFormData({ ...formData, company: e.target.value })}
                    className="w-full px-4 py-3 rounded-xl border text-xs outline-none focus:ring-2 focus:ring-emerald-500/40"
                    style={{ backgroundColor: 'var(--bg-secondary)', borderColor: 'var(--border)', color: 'var(--text-primary)' }}
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="font-semibold flex items-center gap-1" style={{ color: 'var(--text-primary)' }}>
                    Website <span className="text-rose-500">*</span>
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="acme.com"
                    value={formData.website}
                    onChange={(e) => setFormData({ ...formData, website: e.target.value })}
                    className="w-full px-4 py-3 rounded-xl border text-xs outline-none focus:ring-2 focus:ring-emerald-500/40"
                    style={{ backgroundColor: 'var(--bg-secondary)', borderColor: 'var(--border)', color: 'var(--text-primary)' }}
                  />
                </div>
              </div>

              {/* Row 2: First Name & Last Name */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                <div className="space-y-1.5">
                  <label className="font-semibold flex items-center gap-1" style={{ color: 'var(--text-primary)' }}>
                    First Name <span className="text-rose-500">*</span>
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="Jane"
                    value={formData.firstName}
                    onChange={(e) => setFormData({ ...formData, firstName: e.target.value })}
                    className="w-full px-4 py-3 rounded-xl border text-xs outline-none focus:ring-2 focus:ring-emerald-500/40"
                    style={{ backgroundColor: 'var(--bg-secondary)', borderColor: 'var(--border)', color: 'var(--text-primary)' }}
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="font-semibold flex items-center gap-1" style={{ color: 'var(--text-primary)' }}>
                    Last Name <span className="text-rose-500">*</span>
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="Doe"
                    value={formData.lastName}
                    onChange={(e) => setFormData({ ...formData, lastName: e.target.value })}
                    className="w-full px-4 py-3 rounded-xl border text-xs outline-none focus:ring-2 focus:ring-emerald-500/40"
                    style={{ backgroundColor: 'var(--bg-secondary)', borderColor: 'var(--border)', color: 'var(--text-primary)' }}
                  />
                </div>
              </div>

              {/* Row 3: Email & Phone Number */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                <div className="space-y-1.5">
                  <label className="font-semibold flex items-center gap-1" style={{ color: 'var(--text-primary)' }}>
                    Contact Email <span className="text-rose-500">*</span>
                  </label>
                  <input
                    type="email"
                    required
                    placeholder="jane@acme.com"
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    className="w-full px-4 py-3 rounded-xl border text-xs outline-none focus:ring-2 focus:ring-emerald-500/40"
                    style={{ backgroundColor: 'var(--bg-secondary)', borderColor: 'var(--border)', color: 'var(--text-primary)' }}
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="font-semibold flex items-center gap-1" style={{ color: 'var(--text-primary)' }}>
                    Phone Number <span className="text-rose-500">*</span>
                  </label>
                  <div className="flex gap-2">
                    <select
                      value={formData.countryCode}
                      onChange={(e) => setFormData({ ...formData, countryCode: e.target.value })}
                      className="px-3 py-3 rounded-xl border text-xs outline-none font-mono cursor-pointer"
                      style={{ backgroundColor: 'var(--bg-secondary)', borderColor: 'var(--border)', color: 'var(--text-primary)' }}
                    >
                      <option value="+1">us +1</option>
                      <option value="+44">uk +44</option>
                      <option value="+49">de +49</option>
                      <option value="+91">in +91</option>
                      <option value="+81">jp +81</option>
                      <option value="+61">au +61</option>
                    </select>
                    <input
                      type="tel"
                      required
                      placeholder="(201) 555-0123"
                      value={formData.phone}
                      onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                      className="w-full px-4 py-3 rounded-xl border text-xs outline-none focus:ring-2 focus:ring-emerald-500/40 flex-1"
                      style={{ backgroundColor: 'var(--bg-secondary)', borderColor: 'var(--border)', color: 'var(--text-primary)' }}
                    />
                  </div>
                </div>
              </div>

              {/* Row 4: Role / Title */}
              <div className="space-y-1.5">
                <label className="font-semibold flex items-center gap-1" style={{ color: 'var(--text-primary)' }}>
                  Role / Title <span className="text-rose-500">*</span>
                </label>
                <input
                  type="text"
                  required
                  placeholder="Head of Engineering"
                  value={formData.role}
                  onChange={(e) => setFormData({ ...formData, role: e.target.value })}
                  className="w-full px-4 py-3 rounded-xl border text-xs outline-none focus:ring-2 focus:ring-emerald-500/40"
                  style={{ backgroundColor: 'var(--bg-secondary)', borderColor: 'var(--border)', color: 'var(--text-primary)' }}
                />
              </div>

              {/* Row 5: Country */}
              <div className="space-y-1.5">
                <label className="font-semibold flex items-center gap-1" style={{ color: 'var(--text-primary)' }}>
                  Country <span className="text-rose-500">*</span>
                </label>
                <select
                  required
                  value={formData.country}
                  onChange={(e) => setFormData({ ...formData, country: e.target.value })}
                  className="w-full px-4 py-3 rounded-xl border text-xs outline-none cursor-pointer"
                  style={{ backgroundColor: 'var(--bg-secondary)', borderColor: 'var(--border)', color: 'var(--text-primary)' }}
                >
                  <option value="">Select your country</option>
                  <option value="US">United States</option>
                  <option value="CA">Canada</option>
                  <option value="GB">United Kingdom</option>
                  <option value="DE">Germany</option>
                  <option value="IN">India</option>
                  <option value="JP">Japan</option>
                  <option value="AU">Australia</option>
                  <option value="OTHER">Other Country</option>
                </select>
              </div>

              {/* Row 6: Help Description with Live 2000 Char Counter */}
              <div className="space-y-1.5">
                <label className="font-semibold flex items-center gap-1" style={{ color: 'var(--text-primary)' }}>
                  What can our sales team help you with? <span className="text-rose-500">*</span>
                </label>
                <textarea
                  required
                  rows={4}
                  maxLength={2000}
                  placeholder="e.g. Exploring enterprise pricing, scaling our team's usage, setting up dedicated proxy routing or ZDR, evaluating LiteDaemon for our agent platform..."
                  value={formData.message}
                  onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                  className="w-full px-4 py-3 rounded-xl border text-xs outline-none focus:ring-2 focus:ring-emerald-500/40 resize-none font-sans"
                  style={{ backgroundColor: 'var(--bg-secondary)', borderColor: 'var(--border)', color: 'var(--text-primary)' }}
                />
                <div className="text-right text-[11px] font-mono" style={{ color: 'var(--text-muted)' }}>
                  {formData.message.length}/2000 characters
                </div>
              </div>

              {/* Row 7: Monthly Spend & Compliance Checkboxes */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-5 pt-2">
                <div className="space-y-1.5">
                  <label className="font-semibold flex items-center gap-1" style={{ color: 'var(--text-primary)' }}>
                    Current monthly tool spend across all gateways <span className="text-rose-500">*</span>
                  </label>
                  <select
                    required
                    value={formData.monthlySpend}
                    onChange={(e) => setFormData({ ...formData, monthlySpend: e.target.value })}
                    className="w-full px-4 py-3 rounded-xl border text-xs outline-none cursor-pointer"
                    style={{ backgroundColor: 'var(--bg-secondary)', borderColor: 'var(--border)', color: 'var(--text-primary)' }}
                  >
                    <option value="">Select a range</option>
                    <option value="<1k">&lt; $1,000 / month</option>
                    <option value="1k-5k">$1,000 - $5,000 / month</option>
                    <option value="5k-25k">$5,000 - $25,000 / month</option>
                    <option value="25k+">$25,000+ / month</option>
                  </select>
                </div>

                <div className="space-y-2">
                  <label className="font-semibold block" style={{ color: 'var(--text-primary)' }}>
                    Do you have any compliance or security requirements?
                  </label>
                  <div className="space-y-2 pt-1">
                    <label className="flex items-center gap-2 cursor-pointer text-xs" style={{ color: 'var(--text-secondary)' }}>
                      <input
                        type="checkbox"
                        checked={formData.euRouting}
                        onChange={(e) => setFormData({ ...formData, euRouting: e.target.checked })}
                        className="rounded border text-emerald-500 focus:ring-emerald-500"
                      />
                      <span>EU in-region routing</span>
                    </label>

                    <label className="flex items-center gap-2 cursor-pointer text-xs" style={{ color: 'var(--text-secondary)' }}>
                      <input
                        type="checkbox"
                        checked={formData.dpa}
                        onChange={(e) => setFormData({ ...formData, dpa: e.target.checked })}
                        className="rounded border text-emerald-500 focus:ring-emerald-500"
                      />
                      <span>Data Processing Agreement (DPA)</span>
                    </label>
                  </div>
                </div>
              </div>

              {/* Submit Button */}
              <div className="pt-4 text-right">
                <button
                  type="submit"
                  className="px-8 py-3 rounded-xl text-sm font-extrabold transition-all shadow-md cursor-pointer hover:opacity-90"
                  style={{ backgroundColor: 'var(--accent)', color: '#09090b' }}
                >
                  Submit
                </button>
              </div>

            </form>
          )}

        </div>

      </div>
    </div>
  );
};
