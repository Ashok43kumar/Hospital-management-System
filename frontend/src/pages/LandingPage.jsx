import React from 'react';
import { Link } from 'react-router-dom';

const LandingPage = () => {
  return (
    <div className="bg-background text-on-surface min-h-screen flex flex-col">
      <header className="fixed top-0 w-full z-50 bg-surface/80 backdrop-blur-md dark:bg-surface/80 border-b border-outline-variant/30">
        <div className="flex justify-between items-center px-6 py-3 w-full max-w-max-width mx-auto">
          <div className="font-headline-md text-headline-md font-bold text-primary dark:text-primary-fixed-dim">Vitalis HMS</div>
          <nav className="hidden md:flex gap-6">
            <Link className="font-headline-sm text-headline-sm tracking-tight text-on-surface-variant hover:text-on-surface transition-colors hover:bg-surface-variant/50 transition-all duration-200 px-3 py-1 rounded" to="/patient-login">Patient Portal</Link>
            <Link className="font-headline-sm text-headline-sm tracking-tight text-on-surface-variant hover:text-on-surface transition-colors hover:bg-surface-variant/50 transition-all duration-200 px-3 py-1 rounded" to="/admin-login">Staff Portal</Link>
            <a className="font-headline-sm text-headline-sm tracking-tight text-on-surface-variant hover:text-on-surface transition-colors hover:bg-surface-variant/50 transition-all duration-200 px-3 py-1 rounded" href="#modules">Modules</a>
            <a className="font-headline-sm text-headline-sm tracking-tight text-on-surface-variant hover:text-on-surface transition-colors hover:bg-surface-variant/50 transition-all duration-200 px-3 py-1 rounded" href="#metrics">Metrics</a>
          </nav>
          <div className="flex items-center gap-4">
            <button className="hidden md:block font-label-md text-label-md text-on-surface-variant border border-outline-variant hover:bg-surface-variant/50 px-4 py-2 rounded-DEFAULT transition-all">Support</button>
            <button className="font-label-md text-label-md bg-error text-on-error hover:opacity-90 px-4 py-2 rounded-DEFAULT transition-all">Emergency</button>
            <img alt="Chief Medical Officer Profile" className="w-10 h-10 rounded-full border border-outline-variant" src="https://lh3.googleusercontent.com/aida-public/AB6AXuA_gmp9Zx93v7bPUEs2PSsQ1OqNLQGXXeM8xqwEFvHwFIfiBnFafj3rmCjat9IKD2PPWjP70ucBgS1kXURyM87kAMlfjrWTm8jl_Ch54QPSAb5KZxllaWoPjL3JR7PP4PuFX6MjsQynF9qtUtGhLGqMqSAVnBak1UvE3rOajAsdlr8skj-g635q9gW_s7ITcvJ2HDCwpmOb6epBcLhn9tvdd-cQAHc6YOvvUUw-IFXyanhj-3rJs4f33v7ZRF3kw2zpmVE-IoAj9nTD"/>
          </div>
        </div>
      </header>

      <main className="flex-grow">
        <section className="relative pt-20 pb-32 overflow-hidden max-w-max-width mx-auto px-margin-mobile md:px-margin-desktop">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-xl items-center">
            <div className="z-10 flex flex-col gap-lg">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-surface-container-high border border-outline-variant/50 w-fit">
                <span className="w-2 h-2 rounded-full bg-primary animate-pulse"></span>
                <span className="font-label-sm text-label-sm text-on-surface-variant uppercase tracking-wider">Precision Care Unit v2.4</span>
              </div>
              <h1 className="font-headline-xl text-headline-xl text-on-surface leading-tight">
                Advancing Clinical Outcomes Through <span className="text-primary">Data Precision</span>
              </h1>
              <p className="font-body-lg text-body-lg text-on-surface-variant max-w-2xl">
                Vitalis HMS integrates predictive analytics with core hospital operations. Empower your staff, streamline patient workflows, and ensure critical data is available at the point of care.
              </p>
              <div className="flex flex-wrap gap-4 pt-sm">
                <Link to="/patient-login" className="bg-primary text-on-primary font-label-md text-label-md px-6 py-3 rounded-DEFAULT hover:opacity-90 transition-opacity">Patient Login</Link>
                <Link to="/admin-login" className="border border-outline-variant text-on-surface font-label-md text-label-md px-6 py-3 rounded-DEFAULT hover:bg-surface-variant transition-colors">Staff Login</Link>
              </div>
            </div>
            <div className="relative z-10 h-[500px] w-full rounded-xl overflow-hidden border border-outline-variant/30">
              <img alt="Medical dashboard visualization" className="absolute inset-0 w-full h-full object-cover" src="https://lh3.googleusercontent.com/aida-public/AB6AXuBD50FwvmVjvsX7GpeAe5Uv-TXf_VONLN4w5ITnZYGWOUUMmLxmEQ6kIQYJV6ZuDsbAEy3px1isuiJSAUQgvMwg-WNA5VIorB-ms8leGRKyyWa1rWJjbSQgdsJn3OWy2MC-UmnVMfgJ6eu6Z-at_Qo0HCFikesLeVxTvH8tZMRCd7ZlmHBDxBW7MNm7xtO2Y6m23Zbp6c9U-E1xeg6NOqgrg2JaskredbIbUQTs0F2CpH01eohVW83asoDg8hGz6dskpAa2XDSjA1JL"/>
              <div className="absolute inset-0 bg-gradient-to-t from-background via-transparent to-transparent"></div>
            </div>
          </div>
        </section>

        <section id="metrics" className="border-y border-outline-variant/30 bg-surface-container-low py-12">
          <div className="max-w-max-width mx-auto px-margin-mobile md:px-margin-desktop grid grid-cols-2 md:grid-cols-4 gap-lg">
            <div className="flex flex-col gap-2">
              <span className="font-headline-lg text-headline-lg text-primary">99.9%</span>
              <span className="font-label-md text-label-md text-on-surface-variant">System Uptime</span>
            </div>
            <div className="flex flex-col gap-2">
              <span className="font-headline-lg text-headline-lg text-primary">2.4M</span>
              <span className="font-label-md text-label-md text-on-surface-variant">Patient Records Secured</span>
            </div>
            <div className="flex flex-col gap-2">
              <span className="font-headline-lg text-headline-lg text-primary">-40%</span>
              <span className="font-label-md text-label-md text-on-surface-variant">Admin Processing Time</span>
            </div>
            <div className="flex flex-col gap-2">
              <span className="font-headline-lg text-headline-lg text-primary">150+</span>
              <span className="font-label-md text-label-md text-on-surface-variant">Clinical Integrations</span>
            </div>
          </div>
        </section>

        <section id="modules" className="py-32 max-w-max-width mx-auto px-margin-mobile md:px-margin-desktop">
          <div className="text-center max-w-3xl mx-auto mb-20">
            <h2 className="font-headline-lg text-headline-lg text-on-surface mb-4">Core Operational Modules</h2>
            <p className="font-body-md text-body-md text-on-surface-variant">Integrated solutions designed for high-stakes medical environments, ensuring clarity, speed, and trust across all departments.</p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">

            <div className="bg-surface-container border border-outline-variant/50 rounded-xl p-6 hover:border-primary transition-colors group">
              <div className="w-12 h-12 rounded-lg bg-surface-variant flex items-center justify-center mb-6 group-hover:bg-primary/20 transition-colors">
                <span className="material-symbols-outlined text-primary" data-icon="monitor_heart" data-weight="fill" >monitor_heart</span>
              </div>
              <h3 className="font-headline-sm text-headline-sm text-on-surface mb-2">Real-time Vitals</h3>
              <p className="font-body-sm text-body-sm text-on-surface-variant">Continuous monitoring integration with ICU telemetry, providing predictive alerts for critical patient status changes.</p>
            </div>

            <div className="bg-surface-container border border-outline-variant/50 rounded-xl p-6 hover:border-primary transition-colors group">
              <div className="w-12 h-12 rounded-lg bg-surface-variant flex items-center justify-center mb-6 group-hover:bg-primary/20 transition-colors">
                <span className="material-symbols-outlined text-primary" data-icon="folder_shared" data-weight="fill" >folder_shared</span>
              </div>
              <h3 className="font-headline-sm text-headline-sm text-on-surface mb-2">Electronic Health Records</h3>
              <p className="font-body-sm text-body-sm text-on-surface-variant">Secure, instant access to comprehensive patient histories, diagnostic imaging, and laboratory results across the network.</p>
            </div>

            <div className="bg-surface-container border border-outline-variant/50 rounded-xl p-6 hover:border-primary transition-colors group">
              <div className="w-12 h-12 rounded-lg bg-surface-variant flex items-center justify-center mb-6 group-hover:bg-primary/20 transition-colors">
                <span className="material-symbols-outlined text-primary" data-icon="medication" data-weight="fill" >medication</span>
              </div>
              <h3 className="font-headline-sm text-headline-sm text-on-surface mb-2">Pharmacy Logistics</h3>
              <p className="font-body-sm text-body-sm text-on-surface-variant">Automated inventory tracking, cross-reference dispensing alerts, and streamlined reordering for critical medications.</p>
            </div>
          </div>
        </section>
      </main>

      <footer className="bg-surface-container-lowest dark:bg-surface-container-lowest w-full py-xl mt-auto border-t border-outline-variant/20">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-lg px-margin-desktop max-w-max-width mx-auto">
          <div className="col-span-1 md:col-span-2">
            <div className="font-headline-sm text-headline-sm font-extrabold text-on-surface mb-4 text-primary dark:text-primary-fixed-dim">Vitalis HMS</div>
            <p className="font-body-sm text-body-sm text-on-surface-variant max-w-md">
              © 2024 Vitalis Health Systems. All clinical data encrypted.
            </p>
          </div>
          <div className="col-span-1">
            <nav className="flex flex-col gap-3">
              <a className="font-body-sm text-body-sm text-on-surface-variant hover:text-primary transition-colors hover:opacity-80 transition-opacity duration-300" href="#">Privacy Protocol</a>
              <a className="font-body-sm text-body-sm text-on-surface-variant hover:text-primary transition-colors hover:opacity-80 transition-opacity duration-300" href="#">Terms of Service</a>
            </nav>
          </div>
          <div className="col-span-1">
            <nav className="flex flex-col gap-3">
              <a className="font-body-sm text-body-sm text-on-surface-variant hover:text-primary transition-colors hover:opacity-80 transition-opacity duration-300" href="#">HIPAA Compliance</a>
              <a className="font-body-sm text-body-sm text-on-surface-variant hover:text-primary transition-colors hover:opacity-80 transition-opacity duration-300" href="#">Contact Security</a>
            </nav>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default LandingPage;
