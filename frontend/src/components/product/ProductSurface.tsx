import { useState } from "react";
import { ArrowRight, HeartHandshake, MapPin } from "lucide-react";
import { Link, useLocation } from "react-router-dom";
import { SaferPathMap } from "../map/SaferPathMap";
import { useAuth } from "../../context/AuthContext";
import { RouteWorkspace } from "./RouteWorkspace";
import { ReportsWorkspace } from "./ReportsWorkspace";
import { HelpNearbyWorkspace } from "./HelpNearbyWorkspace";
import { TripsWorkspace } from "./TripsWorkspace";
import { Shield } from "lucide-react";

const routeData = [
  { id:"harbour", name:"Harbour walk", time:"24 min", label:"Good context", note:"Lighting and active frontage reported along most of the route.", stroke:"#16756c", context:"good" as const, coordinates:[[72.822,19.046],[72.829,19.053],[72.842,19.061]] as [number,number][] },
  { id:"station", name:"Station link", time:"20 min", label:"Mixed context", note:"A shorter route with one lower-activity segment after 10 PM.", stroke:"#9a6400", context:"mixed" as const, coordinates:[[72.822,19.046],[72.837,19.048],[72.842,19.061]] as [number,number][] },
  { id:"market", name:"Market lane", time:"22 min", label:"Limited data", note:"Less recent evidence is available for the final section.", stroke:"#65746d", context:"limited" as const, coordinates:[[72.822,19.046],[72.824,19.06],[72.842,19.061]] as [number,number][] },
export { RouteWorkspace, ReportsWorkspace, HelpNearbyWorkspace, TripsWorkspace };

const navLinks = [
  ["Home", "/home"],
  ["Plan route", "/plan"],
  ["Trips", "/trips"],
  ["Reports", "/reports"],
  ["Help nearby", "/help"],
  ["Privacy", "/privacy"],
  ["Profile", "/profile"],
];
const helpPoints = [{id:"police",name:"Bandra Police Station",category:"police" as const,coordinate:[72.828,19.054] as [number,number],freshness:"Source checked Sep 2026"},{id:"hospital",name:"Lilavati Hospital",category:"hospital" as const,coordinate:[72.83,19.05] as [number,number],freshness:"Source checked Aug 2026"}];
const links = [["Home","/home"],["Plan route","/plan"],["Trips","/trips"],["Reports","/reports"],["Help nearby","/help"],["Privacy","/privacy"],["Profile","/profile"]];

export function ProductShell({ children }: { children: React.ReactNode }) {
 const p=useLocation().pathname;
 return <div className="min-h-screen bg-[#f7f6f1] text-[#14231d]"><aside className="fixed inset-y-0 hidden w-60 border-r border-[#d8ddd7] bg-[#fffefb] p-5 md:block"><Link to="/home" className="mb-10 flex items-center gap-2 font-bold"><span className="grid h-8 w-8 place-items-center bg-[#16756c] text-white">S</span>SaferPath</Link><nav className="space-y-1">{links.map(([x,h])=><Link key={h} to={h} className={`block px-3 py-2 text-sm ${p===h?"bg-[#dcefe9] font-semibold text-[#075b53]":"text-[#53615a] hover:bg-[#f0f2ed]"}`}>{x}</Link>)}</nav><p className="absolute bottom-6 pr-6 text-xs leading-5 text-[#62706a]">Context, not a guarantee. Your choices remain yours.</p></aside><header className="sticky top-0 z-10 flex h-14 items-center justify-between border-b border-[#d8ddd7] bg-[#fffefb]/95 px-5 backdrop-blur md:ml-60"><Link to="/home" className="font-bold md:hidden">SaferPath</Link><span className="text-xs text-[#62706a]">Fixture mode · no data is sent</span><Link className="text-sm font-semibold" to="/profile">Account</Link></header><main className="mx-auto max-w-7xl p-5 pb-24 md:ml-60 md:p-9">{children}</main></div>
  const location = useLocation();
  const currentPath = location.pathname;
  const { account } = useAuth();

  return (
    <div className="min-h-screen bg-[#f7f6f1] text-[#14231d]">
      {/* ── Sidebar Navigation ── */}
      <aside className="fixed inset-y-0 hidden w-64 border-r border-[#d8ddd7] bg-[#fffefb] p-6 md:block">
        <Link to="/home" className="mb-8 flex items-center gap-2.5 font-bold tracking-tight text-[#14231d]">
          <span className="grid h-8 w-8 place-items-center bg-[#16756c] font-bold text-white shadow-sm">
            S
          </span>
          <span className="font-serif text-lg font-semibold">SaferPath</span>
        </Link>

        <nav className="space-y-1">
          {navLinks.map(([label, href]) => {
            const isActive = currentPath === href || (href === "/home" && currentPath === "/");
            return (
              <Link
                key={href}
                to={href}
                className={`block px-3.5 py-2.5 text-xs font-medium transition-colors ${
                  isActive
                    ? "bg-[#dcefe9] font-semibold text-[#075b53]"
                    : "text-[#53615a] hover:bg-[#f0f2ed] hover:text-[#14231d]"
                }`}
              >
                {label}
              </Link>
            );
          })}
        </nav>

        <div className="absolute bottom-6 pr-8">
          <div className="flex items-center gap-2 text-[11px] font-semibold text-[#16756c]">
            <Shield className="h-3.5 w-3.5" />
            Zero-Surveillance Pilot
          </div>
          <p className="mt-1 text-[11px] leading-4 text-[#62706a]">
            Contextual evidence, never guarantees. Your choices remain yours.
          </p>
        </div>
      </aside>

      {/* ── Top Header ── */}
      <header className="sticky top-0 z-20 flex h-14 items-center justify-between border-b border-[#d8ddd7] bg-[#fffefb]/95 px-6 backdrop-blur md:ml-64">
        <div className="flex items-center gap-3">
          <Link to="/home" className="font-serif text-lg font-bold md:hidden">
            SaferPath
          </Link>
          <span className="hidden items-center gap-1.5 text-xs text-[#62706a] sm:flex">
            <span className="h-2 w-2 rounded-full bg-[#16756c]"></span>
            Live backend connected · Mumbai pilot corridor
          </span>
        </div>

        <div className="flex items-center gap-4">
          <Link
            to="/profile"
            className="text-xs font-semibold text-[#53615a] transition hover:text-[#14231d]"
          >
            {account?.display_name || "My Account"}
          </Link>
          <Link
            to="/privacy"
            className="border border-[#d8ddd7] px-2.5 py-1 text-[11px] font-medium text-[#62706a] hover:bg-[#f0f2ed]"
          >
            Privacy Center
          </Link>
        </div>
      </header>

      {/* ── Main Content Area ── */}
      <main className="mx-auto max-w-7xl p-5 pb-24 md:ml-64 md:p-8">
        {children}
      </main>
    </div>
  );
}

export function RouteWorkspace(){const [selected,setSelected]=useState(0);const [time,setTime]=useState(1);const [point,setPoint]=useState<string|null>(null);const r=routeData[selected];const times=["6:00 PM","9:00 PM","11:30 PM"];return <ProductShell><div className="mb-7 flex flex-wrap items-end justify-between gap-4"><div><p className="text-xs font-semibold uppercase tracking-[.14em] text-[#16756c]">Route planning</p><h1 className="mt-1 text-3xl font-semibold tracking-tight">Choose with more context.</h1></div><button className="bg-[#16756c] px-4 py-2.5 text-sm font-semibold text-white">Plan route <ArrowRight className="ml-1 inline h-4"/></button></div><section className="grid gap-5 lg:grid-cols-[.85fr_1.15fr]"><div className="border border-[#d8ddd7] bg-[#fffefb] p-5"><label className="text-xs font-semibold">FROM</label><div className="mt-2 border-b border-[#d8ddd7] py-3 text-sm"><MapPin className="mr-2 inline h-4 text-[#16756c]"/>Current location or saved place</div><label className="mt-5 block text-xs font-semibold">TO</label><div className="mt-2 border-b border-[#d8ddd7] py-3 text-sm"><MapPin className="mr-2 inline h-4 text-[#b6433d]"/>Bandra Station</div><div className="mt-5 flex gap-2">{times.map((x,i)=><button key={x} onClick={()=>setTime(i)} className={`border px-3 py-2 text-xs ${time===i?"border-[#16756c] bg-[#dcefe9]":"border-[#d8ddd7]"}`}>{x}</button>)}</div><p className="mt-5 text-xs leading-5 text-[#62706a]">At {times[time]}, evidence changes deterministically. Location is only used when you choose it.</p></div><div><SaferPathMap className="h-72" routes={routeData} selectedRoute={r.id} helpPoints={helpPoints} onSelectRoute={id=>setSelected(routeData.findIndex(x=>x.id===id))} onSelectHelp={setPoint}/>{point&&<p className="mt-2 text-xs text-[#53615a]">Selected help point: {helpPoints.find(x=>x.id===point)?.name} · {helpPoints.find(x=>x.id===point)?.freshness}</p>}<div className="mt-4 flex gap-2 overflow-x-auto">{routeData.map((x,i)=><button key={x.name} onClick={()=>setSelected(i)} className={`min-w-52 border p-3 text-left ${i===selected?"border-[#16756c] bg-[#dcefe9]":"border-[#d8ddd7] bg-[#fffefb]"}`}><b className="block text-sm">{x.name} · {x.time}</b><span className="mt-1 block text-xs">{x.label}</span></button>)}</div></div></section><section className="mt-6 grid gap-5 lg:grid-cols-3"><article className="border-t-2 border-[#16756c] bg-[#fffefb] p-5 lg:col-span-2"><p className="text-xs font-semibold uppercase tracking-[.14em] text-[#16756c]">Why this route</p><h2 className="mt-2 text-xl font-semibold">{r.name} — {r.label}</h2><p className="mt-2 text-sm leading-6 text-[#53615a]">{r.note}</p><dl className="mt-5 grid grid-cols-2 gap-4 text-sm"><div><dt className="text-[#62706a]">What supports it</dt><dd className="font-medium">Help point nearby · recent lighting evidence</dd></div><div><dt className="text-[#62706a]">What is uncertain</dt><dd className="font-medium">Conditions can change; reports are not real-time</dd></div></dl></article><aside className="border border-[#d8ddd7] bg-[#fffefb] p-5"><HeartHandshake className="h-5 text-[#16756c]"/><h2 className="mt-3 font-semibold">Need help nearby?</h2><p className="mt-2 text-sm text-[#62706a]">Police, hospitals and facilities with source and freshness shown clearly.</p><Link className="mt-4 inline-block text-sm font-semibold text-[#075b53]" to="/help">View help points →</Link></aside></section></ProductShell>}

export function SimplePage({kind}:{kind:string}){const data:Record<string,[string,string,string[]]>={trips:["Trips","A calm check-in companion — never continuous tracking by default.",["Trip ready · sharing is off","Check-in due · confirm when ready","Network degraded · last update shown clearly"]],reports:["Reports","Share a time and coarse location. Pending reports do not automatically change route context.",["Create report","Review before submit","Your identity is not displayed"]],help:["Help nearby","Facilities shown with source, freshness and available details.",["Bandra Police Station · 0.8 km","Lilavati Hospital · 1.2 km","Apollo Pharmacy · 0.5 km"]],privacy:["Privacy center","Permissions are distinct, explicit and easy to revise.",["Route-planning location — Off","Active-trip location — Off","Trusted contact sharing — Off"]],profile:["Profile & settings","Your profile is optional and can stay minimal.",["Notifications","Accessibility","Private saved places"]]};const [title,lead,items]=data[kind]||data.profile;return <ProductShell><p className="text-xs font-semibold uppercase tracking-[.14em] text-[#16756c]">Your SaferPath</p><h1 className="mt-1 text-3xl font-semibold">{title}</h1><p className="mt-3 max-w-xl leading-7 text-[#53615a]">{lead}</p><div className="mt-8 divide-y border-y border-[#d8ddd7] bg-[#fffefb]">{items.map((x,i)=><button className="flex w-full items-center justify-between p-5 text-left hover:bg-[#f0f2ed]" key={x}><span><b className="block text-sm">{x}</b><span className="mt-1 block text-xs text-[#62706a]">{i===0?"Manage and understand this setting":"Local fixture state"}</span></span><ArrowRight className="h-4 text-[#62706a]"/></button>)}</div></ProductShell>}
export function SimplePage({ kind }: { kind: string }) {
  if (kind === "trips") return <ProductShell><TripsWorkspace /></ProductShell>;
  if (kind === "reports") return <ProductShell><ReportsWorkspace /></ProductShell>;
  if (kind === "help") return <ProductShell><HelpNearbyWorkspace /></ProductShell>;
  return <ProductShell><RouteWorkspace /></ProductShell>;
}
