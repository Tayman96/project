import React, { useMemo, useState, useEffect } from "react";
import { motion } from "framer-motion";
import {
  Computer,
  Cpu,
  Cpu,
  HardDrive,
  MemoryStick,
  MousePointerClick,
  ShieldCheck,
  Truck,
  BadgeCheck,
  Wrench,
  Calendar,
  MapPin,
  Phone,
  Mail,
  DollarSign,
  Download,
  Star,
  Timer,
  Cog,
} from "lucide-react";

/**
 * UtahPCs — Single-file React site tailored for a local (Utah) custom PC business.
 */

// ---- OWNER SETTINGS --------------------------------------------------------
const COMPANY_NAME = "UtahPCs";
const COMPANY_CITY = "Salt Lake City";
const COMPANY_PHONE = "(801) 555-0137";
const COMPANY_EMAIL = "builds@utahpcs.example";
const COMPANY_TAGLINE = "Custom PCs, Local Expertise, Fair Pricing";
const SALES_TAX_RATE = 0.0775;

// Service ZIPs (sample UT zips)
const UTAH_CORE_ZIPS = [
  "84003","84004","84010","84020","84043","84047","84057","84058","84060",
  "84081","84088","84092","84093","84095","84096","84101","84102","84103",
  "84104","84105","84106","84107","84108","84109","84111","84112","84113",
  "84115","84116","84117","84118","84119","84120","84121","84123","84124","84128",
];

// ---- CONFIG DATA -----------------------------------------------------------
const TIERS = {
  cpu: [
    { id: "r5", label: "Ryzen 5 / Core i5", price: 180 },
    { id: "r7", label: "Ryzen 7 / Core i7", price: 310 },
    { id: "r9", label: "Ryzen 9 / Core i9", price: 520 },
  ],
  gpu: [
    { id: "none", label: "Integrated / None", price: 0 },
    { id: "4060", label: "GeForce RTX 4060 / RX 7600XT", price: 320 },
    { id: "4070s", label: "GeForce RTX 4070 Super", price: 560 },
    { id: "4080s", label: "GeForce RTX 4080 Super", price: 980 },
    { id: "4090", label: "GeForce RTX 4090", price: 1690 },
  ],
  ram: [
    { id: "16", label: "16GB DDR5", price: 60 },
    { id: "32", label: "32GB DDR5", price: 100 },
    { id: "64", label: "64GB DDR5", price: 220 },
  ],
  storage: [
    { id: "1tb", label: "1TB NVMe SSD", price: 80 },
    { id: "2tb", label: "2TB NVMe SSD", price: 140 },
    { id: "4tb", label: "4TB NVMe SSD", price: 290 },
  ],
  case: [
    { id: "air", label: "Airflow Mid Tower", price: 110 },
    { id: "silent", label: "Silent Mid Tower", price: 130 },
    { id: "mesh", label: "High-Airflow Mesh", price: 160 },
  ],
  psu: [
    { id: "650", label: "650W 80+ Gold", price: 85 },
    { id: "750", label: "750W 80+ Gold", price: 110 },
    { id: "850", label: "850W 80+ Gold", price: 130 },
    { id: "1000", label: "1000W 80+ Gold", price: 180 },
  ],
};

const EXTRAS = [
  { id: "os", label: "Windows install & license", price: 150 },
  { id: "rgb", label: "RGB fans / strips", price: 60 },
  { id: "wifi", label: "Wi‑Fi / BT card", price: 45 },
  { id: "aio", label: "240mm AIO liquid cooler", price: 120 },
  { id: "cable", label: "Pro cable management", price: 45 },
  { id: "rush", label: "Rush build (48–72h)", price: 120 },
  { id: "delivery", label: "Local delivery & setup", price: 80 },
];

const LABOR_BUILD = 200;
const LABOR_OS_TUNING = 45;

const PRESETS = [
  { id: "gaming1080", name: "Gaming (1080p/144Hz)",
    picks: { cpu: "r5", gpu: "4060", ram: "16", storage: "1tb", case: "mesh", psu: "650" }, extras: ["os", "cable"] },
  { id: "gaming1440", name: "Gaming (1440p/High)",
    picks: { cpu: "r7", gpu: "4070s", ram: "32", storage: "2tb", case: "mesh", psu: "750" }, extras: ["os", "aio", "cable"] },
  { id: "creator4k", name: "Creator (4K / AI)",
    picks: { cpu: "r9", gpu: "4080s", ram: "64", storage: "4tb", case: "silent", psu: "1000" }, extras: ["os", "aio", "wifi"] },
  { id: "office", name: "Home / Office",
    picks: { cpu: "r5", gpu: "none", ram: "16", storage: "1tb", case: "air", psu: "650" }, extras: ["os"] },
];

// ---- UI HELPERS ------------------------------------------------------------
const Section = ({ id, children, className = "" }) => (
  <section id={id} className={`max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 ${className}`}>{children}</section>
);
const Card = ({ children, className = "" }) => (
  <div className={`rounded-2xl shadow-lg bg-white/80 backdrop-blur border border-white/40 ${className}`}>{children}</div>
);
const H2 = ({ children }) => (
  <h2 className="text-2xl sm:text-3xl font-semibold tracking-tight text-gray-900">{children}</h2>
);
const Pill = ({ icon: Icon, children, className = "" }) => (
  <span className={`inline-flex items-center gap-2 rounded-full border px-3 py-1 text-sm ${className}`}><Icon className="h-4 w-4" /> {children}</span>
);

// ---- PRICE ENGINE ----------------------------------------------------------
function findPrice(category, id) { return TIERS[category].find((x) => x.id === id)?.price ?? 0; }
function calcPrice(selections, selectedExtras) {
  const parts = Object.entries(selections).reduce((s, [k,v]) => s + findPrice(k, v), 0);
  const extras = EXTRAS.filter((e) => selectedExtras.includes(e.id)).reduce((s, e) => s + e.price, 0);
  const labor = LABOR_BUILD + LABOR_OS_TUNING;
  const subtotal = parts + extras + labor;
  const tax = SALES_TAX_RATE > 0 ? subtotal * SALES_TAX_RATE : 0;
  const total = subtotal + tax;
  return { parts, extras, labor, subtotal, tax, total };
}

// ---- MAIN APP --------------------------------------------------------------
export default function App() {
  const [selections, setSelections] = useState({ cpu: "r5", gpu: "none", ram: "16", storage: "1tb", case: "air", psu: "650" });
  const [extras, setExtras] = useState(["os"]);
  const [zip, setZip] = useState("");
  const [customer, setCustomer] = useState({ name: "", email: "", phone: "", notes: "", date: "" });
  const [preset, setPreset] = useState("");
  const totals = useMemo(() => calcPrice(selections, extras), [selections, extras]);

  useEffect(() => {
    if (preset) {
      const chosen = PRESETS.find((p) => p.id === preset);
      if (chosen) { setSelections(chosen.picks); setExtras(chosen.extras); }
    }
  }, [preset]);

  const utahZip = useMemo(() => /^84\\d{3}$/.test(zip) || UTAH_CORE_ZIPS.includes(zip), [zip]);

  const mailtoHref = useMemo(() => {
    const safe = (s, m=200) => String(s ?? "").replace(/[\\r\\n]/g, " ").slice(0, m).trim();
    const subject = encodeURIComponent(`${COMPANY_NAME} Build Request — ${safe(customer.name, 100) || "New Lead"}`);
    const lines = [
      `Name: ${safe(customer.name, 100)}`, `Email: ${safe(customer.email, 254)}`, `Phone: ${safe(customer.phone, 30)}`,
      `Preferred Date: ${safe(customer.date, 30)}`, `ZIP: ${safe(zip, 5)}${utahZip ? " (UT local)" : ""}`, "", "Configuration:",
      `CPU: ${TIERS.cpu.find((x) => x.id === selections.cpu)?.label}`, `GPU: ${TIERS.gpu.find((x) => x.id === selections.gpu)?.label}`,
      `RAM: ${TIERS.ram.find((x) => x.id === selections.ram)?.label}`, `Storage: ${TIERS.storage.find((x) => x.id === selections.storage)?.label}`,
      `Case: ${TIERS.case.find((x) => x.id === selections.case)?.label}`, `PSU: ${TIERS.psu.find((x) => x.id === selections.psu)?.label}`,
      `Extras: ${EXTRAS.filter((e) => extras.includes(e.id)).map((e) => e.label).join(", ") || "None"}`, "",
      `Estimate (pre-tax): $${(totals.subtotal - totals.tax).toFixed(2)}`, `Tax: $${totals.tax.toFixed(2)}`, `Total: $${totals.total.toFixed(2)}`,
      "", `Notes: ${safe(customer.notes, 2000)}`,
    ].join("\\n");
    return `mailto:${COMPANY_EMAIL}?subject=${subject}&body=${encodeURIComponent(lines)}`;
  }, [customer, selections, extras, zip, utahZip, totals]);

  function downloadJSON() {
    const payload = { company: COMPANY_NAME, when: new Date().toISOString(), lead: { ...customer, zip }, selections, extras, totals };
    const blob = new Blob([JSON.stringify(payload, null, 2)], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a"); a.href = url; a.download = `${COMPANY_NAME}-build-request.json`; a.click(); URL.revokeObjectURL(url);
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-orange-50 via-white to-amber-50 text-gray-900">
      <header className="sticky top-0 z-40 backdrop-blur bg-white/70 border-b">
        <Section className="flex items-center justify-between py-3">
          <div className="flex items-center gap-3">
            <motion.div initial={{ rotate: -8, scale: 0.9 }} animate={{ rotate: 0, scale: 1 }} transition={{ type: "spring", stiffness: 200 }} className="p-2 rounded-xl bg-orange-100 border">
              <Computer className="h-6 w-6" />
            </motion.div>
            <div>
              <div className="font-bold text-lg tracking-tight">{COMPANY_NAME}</div>
              <div className="text-xs text-gray-600">{COMPANY_CITY}, Utah</div>
            </div>
          </div>
          <nav className="hidden md:flex items-center gap-6 text-sm">
            <a href="#build" className="hover:underline">Build</a><a href="#pricing" className="hover:underline">Pricing</a>
            <a href="#booking" className="hover:underline">Booking</a><a href="#trust" className="hover:underline">Why Local</a>
            <a href="#faq" className="hover:underline">FAQ</a><a href="#contact" className="hover:underline">Contact</a>
          </nav>
          <a href="#booking" className="inline-flex items-center gap-2 rounded-xl bg-black text-white px-4 py-2 shadow hover:opacity-90">
            <Calendar className="h-4 w-4" /> Book Now
          </a>
        </Section>
      </header>

      <Section className="py-12 sm:py-16">
        <div className="grid md:grid-cols-2 gap-8 items-center">
          <div>
            <Pill icon={BadgeCheck} className="mb-3 bg-emerald-50 border-emerald-200 text-emerald-900">Utah‑Local • Pick‑up, Delivery & On‑Site Setup</Pill>
            <h1 className="text-4xl sm:text-5xl font-extrabold leading-tight">
              Build your perfect PC — <span className="text-orange-600">locally</span> in Utah
            </h1>
            <p className="mt-4 text-gray-700 text-lg">{COMPANY_TAGLINE}. We consult, source, assemble, and tune — then hand‑deliver with lifetime local support.</p>
            <div className="mt-6 flex flex-wrap gap-3">
              <a href="#build" className="inline-flex items-center gap-2 rounded-xl bg-black text-white px-4 py-3 shadow hover:opacity-90"><Cpu className="h-4 w-4"/>Start a build</a>
              <a href="#pricing" className="inline-flex items-center gap-2 rounded-xl border px-4 py-3 bg-white"><DollarSign className="h-4 w-4"/>See pricing</a>
            </div>
            <div className="mt-6 flex items-center gap-4 text-sm text-gray-600">
              <Pill icon={ShieldCheck} className="bg-white">1‑year workmanship warranty</Pill>
              <Pill icon={Timer} className="bg-white">Typical 3–7 day turnaround</Pill>
              <Pill icon={Truck} className="bg-white">Wasatch Front delivery</Pill>
            </div>
          </div>
          <Card className="p-5">
            <div className="grid grid-cols-3 gap-3">
              {[["CPU / GPU Fitment", Cpu],["Thermals & Noise", Cog],["Memory & Storage", MemoryStick],["Cable Clean‑up", Wrench],["Driver Tuning", BadgeCheck],["Game / App Profiles", MousePointerClick]].map(
                ([label, Icon], i) => (
                  <motion.div key={i} initial={{ opacity: 0, y: 10 }} whileInView={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.05 * i }} className="rounded-xl border bg-white p-4 text-center">
                    <Icon className="h-6 w-6 mx-auto" />
                    <div className="mt-2 text-xs text-gray-700">{label}</div>
                  </motion.div>
              ))}
            </div>
          </Card>
        </div>
      </Section>

      <Section id="build" className="py-10">
        <div className="flex items-center justify-between mb-4">
          <H2>Build Configurator</H2>
          <div className="flex gap-2">
            <select value={preset} onChange={(e) => setPreset(e.target.value)} className="rounded-xl border px-3 py-2 bg-white" aria-label="Choose preset">
              <option value="">Presets…</option>
              {PRESETS.map((p) => (<option key={p.id} value={p.id}>{p.name}</option>))}
            </select>
            <button onClick={() => { setSelections({ cpu: "r5", gpu: "none", ram: "16", storage: "1tb", case: "air", psu: "650" }); setExtras(["os"]); setPreset(""); }} className="rounded-xl border px-4 py-2 bg-white">Reset</button>
          </div>
        </div>

        <div className="grid lg:grid-cols-3 gap-6">
          <Card className="p-5 lg:col-span-2">
            <div className="grid sm:grid-cols-2 gap-5">
              <Selector label="CPU" icon={<Cpu className="h-4 w-4"/>} name="cpu" items={TIERS.cpu} value={selections.cpu} onChange={setSelections} />
              <Selector label="GPU" icon={<Cpu className="h-4 w-4"/>} name="gpu" items={TIERS.gpu} value={selections.gpu} onChange={setSelections} />
              <Selector label="Memory" icon={<MemoryStick className="h-4 w-4"/>} name="ram" items={TIERS.ram} value={selections.ram} onChange={setSelections} />
              <Selector label="Storage" icon={<HardDrive className="h-4 w-4"/>} name="storage" items={TIERS.storage} value={selections.storage} onChange={setSelections} />
              <Selector label="Case" icon={<Computer className="h-4 w-4"/>} name="case" items={TIERS.case} value={selections.case} onChange={setSelections} />
              <Selector label="Power" icon={<BatteryIcon/>} name="psu" items={TIERS.psu} value={selections.psu} onChange={setSelections} />
            </div>

            <div className="mt-6">
              <div className="text-sm font-medium mb-2">Extras</div>
              <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-3">
                {EXTRAS.map((x) => (
                  <label key={x.id} className="flex items-center gap-3 rounded-xl border bg-white px-3 py-3 cursor-pointer select-none">
                    <input type="checkbox" checked={extras.includes(x.id)} onChange={(e) => setExtras((cur) => (e.target.checked ? [...cur, x.id] : cur.filter((i) => i !== x.id)))} className="h-4 w-4"/>
                    <span className="flex-1">{x.label}</span>
                    <span className="font-medium">+${x.price}</span>
                  </label>
                ))}
              </div>
            </div>
          </Card>

          <Card className="p-5 lg:col-span-1">
            <div className="flex items-center justify-between"><div className="text-lg font-semibold">Live Estimate</div><DollarSign className="h-5 w-5" /></div>
            <dl className="mt-4 space-y-2 text-sm">
              <Row label="Parts" value={`$${totals.parts.toFixed(2)}`} />
              <Row label="Extras" value={`$${totals.extras.toFixed(2)}`} />
              <Row label="Labor" value={`$${totals.labor.toFixed(2)}`} />
              <div className="border-t my-3" />
              <Row label="Subtotal" value={`$${(totals.subtotal - totals.tax).toFixed(2)}`} />
              {SALES_TAX_RATE > 0 && <Row label={`Sales Tax (${(SALES_TAX_RATE * 100).toFixed(2)}%)`} value={`$${totals.tax.toFixed(2)}`} />}
              <div className="border-t my-3" />
              <Row label={<strong>Total</strong>} value={<strong>${totals.total.toFixed(2)}</strong>} />
            </dl>
            <p className="mt-3 text-xs text-gray-600">Pricing shown is an estimate based on common market pricing and may vary with part availability. You'll receive a final quote after a quick consult.</p>
          </Card>
        </div>
      </Section>

      <Section id="pricing" className="py-12">
        <H2>Transparent Pricing</H2>
        <p className="mt-2 text-gray-700">No pressure, no mystery fees. We price parts at cost + a fair build fee.</p>
        <div className="mt-6 grid md:grid-cols-3 gap-6">
          <PackageCard title="Essentials" price="200" tagline="Assembly, testing & optimization" items={["Thermal paste & cable management","BIOS/firmware updates","Driver install & tuning"]} />
          <PackageCard title="Performance" price="325" tagline="Everything in Essentials + extras" items={["Fan curves & noise tuning","Game/app profiles","Benchmarks & report"]} highlighted />
          <PackageCard title="On‑Site Setup" price="80" tagline="Local delivery & setup" items={["Desk setup & cable routing","Windows first‑run tips","Basic data transfer"]} />
        </div>
      </Section>

      <Section id="booking" className="py-12">
        <div className="grid lg:grid-cols-2 gap-6 items-start">
          <div>
            <H2>Request a Build & Booking</H2>
            <p className="mt-2 text-gray-700">Send us your build and preferred date. We’ll confirm parts, timing, and final quote.</p>
            <Card className="p-5 mt-4">
              <div className="grid sm:grid-cols-2 gap-4">
                <TextInput label="Full name" value={customer.name} onChange={(v) => setCustomer((c) => ({ ...c, name: v }))} required maxLength={100} autoComplete="name" />
                <TextInput label="Email" type="email" value={customer.email} onChange={(v) => setCustomer((c) => ({ ...c, email: v }))} required maxLength={254} autoComplete="email" />
                <TextInput label="Phone" value={customer.phone} onChange={(v) => setCustomer((c) => ({ ...c, phone: v }))} maxLength={30} pattern="[0-9+()\\-\\s]{7,30}" autoComplete="tel" />
                <TextInput label="Preferred date" type="date" value={customer.date} onChange={(v) => setCustomer((c) => ({ ...c, date: v }))} autoComplete="off" />
                <TextInput label="ZIP (Utah)" value={zip} onChange={(v) => setZip(v.replace(/\\D/g, '').slice(0, 5))} placeholder="e.g., 84101" maxLength={5} inputMode="numeric" pattern="^84\\d{3}$" autoComplete="postal-code" />
                <div className="flex items-center gap-2 text-sm text-gray-600">
                  <MapPin className={`h-4 w-4 ${zip ? (utahZip ? "text-emerald-600" : "text-red-500") : ""}`} />
                  {zip ? (utahZip ? "Local service area" : "Service limited to Utah ZIP codes (84xxx).") : "Enter ZIP to verify local perks"}
                </div>
                <div className="sm:col-span-2">
                  <label className="text-sm font-medium">Notes</label>
                  <textarea value={customer.notes} onChange={(e) => setCustomer((c) => ({ ...c, notes: e.target.value }))} rows={4} placeholder="Games/Apps, budget target, aesthetic, special requests…" className="mt-1 w-full rounded-xl border px-3 py-2 bg-white" maxLength={2000} />
                </div>
              </div>
              <div className="mt-5 flex flex-wrap gap-3">
                <a href={mailtoHref} className="inline-flex items-center gap-2 rounded-xl bg-black text-white px-4 py-3"><Mail className="h-4 w-4"/> Email my request</a>
                <button onClick={downloadJSON} className="inline-flex items-center gap-2 rounded-xl border px-4 py-3 bg-white"><Download className="h-4 w-4"/> Download request (.json)</button>
              </div>
            </Card>
          </div>

          <div>
            <H2>Why Utah‑Local?</H2>
            <div className="mt-4 grid gap-4">
              {[{ title: "Faster turnaround", desc: "Skip shipping delays. Typical builds complete in 3–7 days; rush options available.", icon: Timer },
                { title: "Human support", desc: "Talk to a tech who built your PC. Lifetime local advice for upgrades and issues.", icon: Phone },
                { title: "Trust & transparency", desc: "We send part lists, benchmarks, and thermal snapshots with every build.", icon: ShieldCheck }].map((b, i) => (
                <Card key={i} className="p-4">
                  <div className="flex items-start gap-3">
                    <b.icon className="h-5 w-5 mt-0.5" />
                    <div>
                      <div className="font-semibold">{b.title}</div>
                      <p className="text-sm text-gray-700 mt-1">{b.desc}</p>
                    </div>
                  </div>
                </Card>
              ))}
            </div>
            <div className="mt-6">
              <Pill icon={MapPin} className="bg-white">Serving SLC • Provo • Orem • Lehi • Draper • Sandy • Park City</Pill>
            </div>
          </div>
        </div>
      </Section>

      <Section id="trust" className="py-12">
        <H2>Recent Local Builds</H2>
        <p className="mt-2 text-gray-700">A few of our favorite Utah builds and what customers said.</p>
        <div className="mt-6 grid md:grid-cols-3 gap-6">
          {[1,2,3].map((i) => (
            <Card key={i} className="p-5">
              <div className="aspect-video rounded-xl bg-gradient-to-br from-gray-100 to-white border" />
              <div className="flex items-center gap-1 mt-3 text-amber-500" aria-label="5 star rating">
                {Array.from({ length: 5 }).map((_, j) => <Star key={j} className="h-4 w-4 fill-current" />)}
              </div>
              <div className="mt-2 text-sm text-gray-700">“Thermals are fantastic and it’s whisper‑quiet. Same‑week delivery in {COMPANY_CITY}!”</div>
              <div className="mt-2 text-sm font-medium">— Utah customer #{i}</div>
            </Card>
          ))}
        </div>
      </Section>

      <Section id="faq" className="py-12">
        <H2>FAQ</H2>
        <div className="mt-4 grid md:grid-cols-2 gap-6">
          <Faq q="Do you price‑match online parts?" a="We source from multiple vendors and usually meet or beat big‑box pricing. If you have a cart, send it — we’ll compare." />
          <Faq q="Can I bring my own parts?" a="Yes! We’ll verify compatibility and build at a reduced labor rate." />
          <Faq q="What’s your warranty?" a="1‑year workmanship on assembly. Individual parts follow manufacturer warranty (we help with RMA if needed)." />
          <Faq q="Do you do water‑cooling?" a="Yes — AIO (all‑in‑one) options only. We do not offer custom water loops." />
        </div>
      </Section>

      <Section id="contact" className="py-12">
        <Card className="p-6">
          <div className="grid md:grid-cols-2 gap-6 items-center">
            <div>
              <H2>Contact</H2>
              <p className="mt-2 text-gray-700">Questions? Want a quick consult? We’re happy to help.</p>
              <div className="mt-4 space-y-2 text-sm">
                <div className="flex items-center gap-2"><Phone className="h-4 w-4"/> {COMPANY_PHONE}</div>
                <div className="flex items-center gap-2"><Mail className="h-4 w-4"/> {COMPANY_EMAIL}</div>
                <div className="flex items-center gap-2"><MapPin className="h-4 w-4"/> {COMPANY_CITY}, Utah</div>
              </div>
            </div>
            <div>
              <div className="rounded-2xl border bg-white p-4">
                <div className="aspect-video rounded-xl bg-gradient-to-br from-orange-100 to-amber-50 border flex items-center justify-center text-sm text-gray-600">
                  Utah service area map placeholder
                </div>
                <div className="mt-3 text-xs text-gray-600">We serve Salt Lake, Utah, Davis, and Summit counties.</div>
              </div>
            </div>
          </div>
        </Card>
      </Section>

      <footer className="py-8 text-center text-xs text-gray-600">© {new Date().getFullYear()} {COMPANY_NAME}. All rights reserved. Built with love in Utah.</footer>
    </div>
  );
}

// ---- SMALL COMPONENTS ------------------------------------------------------
function Selector({ label, name, items, value, onChange, icon }) {
  return (
    <div>
      <label className="text-sm font-medium flex items-center gap-2">{icon}{label}</label>
      <select value={value} onChange={(e) => onChange((s) => ({ ...s, [name]: e.target.value }))} className="mt-1 w-full rounded-xl border px-3 py-2 bg-white">
        {items.map((x) => (<option key={x.id} value={x.id}>{x.label} — ${x.price}</option>))}
      </select>
    </div>
  );
}

const BatteryIcon = () => (<svg viewBox="0 0 24 24" className="h-4 w-4" aria-hidden="true"><path fill="currentColor" d="M16,7H3C1.9,7,1,7.9,1,9v6c0,1.1,0.9,2,2,2h13c1.1,0,2-0.9,2-2v-1h2v-4h-2V9C18,7.9,17.1,7,16,7z"/></svg>);

function Row({ label, value }) {
  return (<div className="flex items-center justify-between"><dt className="text-gray-700">{label}</dt><dd className="font-medium">{value}</dd></div>);
}

function PackageCard({ title, price, tagline, items, highlighted }) {
  return (
    <Card className={`p-5 ${highlighted ? "ring-2 ring-orange-500" : ""}`}>
      <div className="flex items-center justify-between">
        <div>
          <div className="text-lg font-semibold">{title}</div>
          <div className="text-sm text-gray-700">{tagline}</div>
        </div>
        <div className="text-2xl font-extrabold">${price}</div>
      </div>
      <ul className="mt-3 space-y-2 text-sm list-disc pl-5">{items.map((it, i) => <li key={i}>{it}</li>)}</ul>
    </Card>
  );
}

function TextInput({ label, value, onChange, type = "text", placeholder = "", required = false, ...rest }) {
  const id = label.toLowerCase().replace(/[^a-z0-9]+/g, "-");
  return (
    <div>
      <label htmlFor={id} className="text-sm font-medium">{label}{required && <span className="text-red-500">*</span>}</label>
      <input id={id} type={type} value={value} onChange={(e) => onChange(e.target.value)} placeholder={placeholder} required={required} className="mt-1 w-full rounded-xl border px-3 py-2 bg-white" {...rest} />
    </div>
  );
}

function Faq({ q, a }) {
  const [open, setOpen] = useState(false);
  return (
    <div className="rounded-2xl border bg-white">
      <button className="w-full text-left px-4 py-3 flex items-center justify-between" onClick={() => setOpen(!open)}>
        <span className="font-medium">{q}</span>
        <span className="text-sm text-gray-600">{open ? "–" : "+"}</span>
      </button>
      {open && <div className="px-4 pb-4 text-sm text-gray-700">{a}</div>}
    </div>
  );
}
