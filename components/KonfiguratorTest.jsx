'use client';
import { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import {
  Type, Ruler, Sun, Lightbulb, Sparkles, Layers, Square, ShoppingBag,
  MessageSquare, FileText, RotateCcw, Check, Info, Image as ImageIcon, ZoomIn, X, Upload, ChevronDown,
} from 'lucide-react';
import {
  Archivo_Black, Playfair_Display, Oswald, Baloo_2,
  Montserrat, Poppins, Raleway, Russo_One,
  Bebas_Neue, Anton, Fjalla_One, Staatliches,
  Nunito, Quicksand, Comfortaa, Fredoka, Lilita_One,
  Abril_Fatface, DM_Serif_Display, Cinzel, Roboto_Slab, Alfa_Slab_One,
  Bungee, Righteous, Bangers, Luckiest_Guy, Titan_One,
  Orbitron, Audiowide, Black_Ops_One, Saira_Stencil_One,
  // Erweiterung (LED-taugliche Google-Fonts — kräftig/mit Körper, keine dünnen Schreibschriften)
  Rubik, Work_Sans, Barlow, Mulish, Manrope, Sora, Exo_2, Lexend, Kanit, Prompt, Jost,
  Archivo_Narrow, Barlow_Condensed, Saira_Condensed, Teko, Khand, Rajdhani, Pathway_Gothic_One,
  Varela_Round, Chewy, Sniglet, Paytone_One, Concert_One,
  Merriweather, Lora, PT_Serif, Zilla_Slab, Yeseva_One, Bitter,
  Passion_One, Bowlby_One, Ultra, Sigmar_One, Rowdies, Fugaz_One,
  Michroma, Syncopate,
} from 'next/font/google';
import {
  ACRYL_COLORS, CHROM_COLORS, CHROM_SURFACES, CHROM_SIDE_IDS, LIGHT_COLORS, WANDABSTAND,
  SURFACES, DEPTHS, BODY_MAT_RUECK, RUECK_CHROM_IDS, RUECK_LACK_IDS, RUECK_WAND_AKRYL_IDS, BACK_PANELS,
  SIDE_MAT_FRONT, UNBEL_MAT, LIGHT_DIRS, TABELLE_TYPES,
  buildCfg, priceForState, detail3, recommendDepth, sizeAssessment, estimateSize, sanitizeV3Config,
  KONFIG_LIMITS, KONFIG_FONTS, KONFIG_MONTAGE, LOGO_LIMITS, normalizeLogo,
  normalizeCubukLed, cubukLedPieces, CUBUK_LED_LIMITS,
} from '@/data/konfigurator3';
import { maxLetterHeight, KONFIG_FONT_CATS } from '@/data/konfigurator';
import { fmtEur } from '@/data/categories';
import { supabase } from '@/utils/supabaseClient';
import { KONFIG_RAL } from '@/data/konfigurator';
import { useCartStore } from '@/store/cartStore';
import { useT, useLocale } from '@/components/LocaleProvider';

const fontModern = Archivo_Black({ weight: '400', subsets: ['latin'] });
const fontElegant = Playfair_Display({ weight: '700', subsets: ['latin'] });
const fontSchmal = Oswald({ weight: '600', subsets: ['latin'] });
const fontRund = Baloo_2({ weight: '700', subsets: ['latin'] });
// Weitere Schnittschriften — preload:false, damit nicht 30+ Preload-Links den Seitenstart bremsen
// (geladen wird erst beim Rendern der Font-Auswahl, display:swap).
const fMontserrat = Montserrat({ weight: '800', subsets: ['latin'], preload: false });
const fPoppins = Poppins({ weight: '700', subsets: ['latin'], preload: false });
const fRaleway = Raleway({ weight: '800', subsets: ['latin'], preload: false });
const fRusso = Russo_One({ weight: '400', subsets: ['latin'], preload: false });
const fBebas = Bebas_Neue({ weight: '400', subsets: ['latin'], preload: false });
const fAnton = Anton({ weight: '400', subsets: ['latin'], preload: false });
const fFjalla = Fjalla_One({ weight: '400', subsets: ['latin'], preload: false });
const fStaatliches = Staatliches({ weight: '400', subsets: ['latin'], preload: false });
const fNunito = Nunito({ weight: '800', subsets: ['latin'], preload: false });
const fQuicksand = Quicksand({ weight: '700', subsets: ['latin'], preload: false });
const fComfortaa = Comfortaa({ weight: '700', subsets: ['latin'], preload: false });
const fFredoka = Fredoka({ weight: '600', subsets: ['latin'], preload: false });
const fLilita = Lilita_One({ weight: '400', subsets: ['latin'], preload: false });
const fAbril = Abril_Fatface({ weight: '400', subsets: ['latin'], preload: false });
const fDmSerif = DM_Serif_Display({ weight: '400', subsets: ['latin'], preload: false });
const fCinzel = Cinzel({ weight: '700', subsets: ['latin'], preload: false });
const fRobotoSlab = Roboto_Slab({ weight: '700', subsets: ['latin'], preload: false });
const fAlfaSlab = Alfa_Slab_One({ weight: '400', subsets: ['latin'], preload: false });
const fBungee = Bungee({ weight: '400', subsets: ['latin'], preload: false });
const fRighteous = Righteous({ weight: '400', subsets: ['latin'], preload: false });
const fBangers = Bangers({ weight: '400', subsets: ['latin'], preload: false });
const fLuckiest = Luckiest_Guy({ weight: '400', subsets: ['latin'], preload: false });
const fTitan = Titan_One({ weight: '400', subsets: ['latin'], preload: false });
const fOrbitron = Orbitron({ weight: '700', subsets: ['latin'], preload: false });
const fAudiowide = Audiowide({ weight: '400', subsets: ['latin'], preload: false });
const fBlackOps = Black_Ops_One({ weight: '400', subsets: ['latin'], preload: false });
const fSairaStencil = Saira_Stencil_One({ weight: '400', subsets: ['latin'], preload: false });
// ── Erweiterte LED-taugliche Schriften (kräftig/mit Körper) ──────────────────
const fRubik = Rubik({ weight: '700', subsets: ['latin'], preload: false });
const fWorkSans = Work_Sans({ weight: '700', subsets: ['latin'], preload: false });
const fBarlow = Barlow({ weight: '700', subsets: ['latin'], preload: false });
const fMulish = Mulish({ weight: '800', subsets: ['latin'], preload: false });
const fManrope = Manrope({ weight: '700', subsets: ['latin'], preload: false });
const fSora = Sora({ weight: '700', subsets: ['latin'], preload: false });
const fExo2 = Exo_2({ weight: '700', subsets: ['latin'], preload: false });
const fLexend = Lexend({ weight: '700', subsets: ['latin'], preload: false });
const fKanit = Kanit({ weight: '700', subsets: ['latin'], preload: false });
const fPrompt = Prompt({ weight: '700', subsets: ['latin'], preload: false });
const fJost = Jost({ weight: '600', subsets: ['latin'], preload: false });
const fArchivoNarrow = Archivo_Narrow({ weight: '400', subsets: ['latin'], preload: false });
const fBarlowCond = Barlow_Condensed({ weight: '700', subsets: ['latin'], preload: false });
const fSairaCond = Saira_Condensed({ weight: '700', subsets: ['latin'], preload: false });
const fTeko = Teko({ weight: '700', subsets: ['latin'], preload: false });
const fKhand = Khand({ weight: '700', subsets: ['latin'], preload: false });
const fRajdhani = Rajdhani({ weight: '700', subsets: ['latin'], preload: false });
const fPathwayGothic = Pathway_Gothic_One({ weight: '400', subsets: ['latin'], preload: false });
const fVarelaRound = Varela_Round({ weight: '400', subsets: ['latin'], preload: false });
const fChewy = Chewy({ weight: '400', subsets: ['latin'], preload: false });
const fSniglet = Sniglet({ weight: '800', subsets: ['latin'], preload: false });
const fPaytone = Paytone_One({ weight: '400', subsets: ['latin'], preload: false });
const fConcertOne = Concert_One({ weight: '400', subsets: ['latin'], preload: false });
const fMerriweather = Merriweather({ weight: '700', subsets: ['latin'], preload: false });
const fLora = Lora({ weight: '700', subsets: ['latin'], preload: false });
const fPtSerif = PT_Serif({ weight: '700', subsets: ['latin'], preload: false });
const fZillaSlab = Zilla_Slab({ weight: '700', subsets: ['latin'], preload: false });
const fYeseva = Yeseva_One({ weight: '400', subsets: ['latin'], preload: false });
const fBitter = Bitter({ weight: '700', subsets: ['latin'], preload: false });
const fPassionOne = Passion_One({ weight: '700', subsets: ['latin'], preload: false });
const fBowlby = Bowlby_One({ weight: '400', subsets: ['latin'], preload: false });
const fUltra = Ultra({ weight: '400', subsets: ['latin'], preload: false });
const fSigmar = Sigmar_One({ weight: '400', subsets: ['latin'], preload: false });
const fRowdies = Rowdies({ weight: '700', subsets: ['latin'], preload: false });
const fFugaz = Fugaz_One({ weight: '400', subsets: ['latin'], preload: false });
const fMichroma = Michroma({ weight: '400', subsets: ['latin'], preload: false });
const fSyncopate = Syncopate({ weight: '700', subsets: ['latin'], preload: false });

const FONT_CLASS = {
  modern: fontModern.className, elegant: fontElegant.className, schmal: fontSchmal.className,
  rund: fontRund.className,
  montserrat: fMontserrat.className, poppins: fPoppins.className, raleway: fRaleway.className, russo: fRusso.className,
  bebas: fBebas.className, anton: fAnton.className, fjalla: fFjalla.className, staatliches: fStaatliches.className,
  nunito: fNunito.className, quicksand: fQuicksand.className, comfortaa: fComfortaa.className, fredoka: fFredoka.className, lilita: fLilita.className,
  abril: fAbril.className, dmserif: fDmSerif.className, cinzel: fCinzel.className, robotoslab: fRobotoSlab.className, alfaslab: fAlfaSlab.className,
  bungee: fBungee.className, righteous: fRighteous.className, bangers: fBangers.className, luckiest: fLuckiest.className, titan: fTitan.className,
  orbitron: fOrbitron.className, audiowide: fAudiowide.className, blackops: fBlackOps.className, sairastencil: fSairaStencil.className,
  rubik: fRubik.className, worksans: fWorkSans.className, barlow: fBarlow.className, mulish: fMulish.className, manrope: fManrope.className, sora: fSora.className, exo2: fExo2.className, lexend: fLexend.className, kanit: fKanit.className, prompt: fPrompt.className, jost: fJost.className,
  archivonarrow: fArchivoNarrow.className, barlowcond: fBarlowCond.className, sairacond: fSairaCond.className, teko: fTeko.className, khand: fKhand.className, rajdhani: fRajdhani.className, pathwaygothic: fPathwayGothic.className,
  varelaround: fVarelaRound.className, chewy: fChewy.className, sniglet: fSniglet.className, paytone: fPaytone.className, concertone: fConcertOne.className,
  merriweather: fMerriweather.className, lora: fLora.className, ptserif: fPtSerif.className, zillaslab: fZillaSlab.className, yeseva: fYeseva.className, bitter: fBitter.className,
  passionone: fPassionOne.className, bowlby: fBowlby.className, ultra: fUltra.className, sigmar: fSigmar.className, rowdies: fRowdies.className, fugaz: fFugaz.className,
  michroma: fMichroma.className, syncopate: fSyncopate.className,
};

// Google-Font-Name + Gewicht fürs Angebots-Popup (lädt dieselbe Schrift per CSS-Link).
const FONT_PDF = {
  modern: ['Archivo Black', 400], elegant: ['Playfair Display', 700], schmal: ['Oswald', 600], rund: ['Baloo 2', 700],
  montserrat: ['Montserrat', 800], poppins: ['Poppins', 700], raleway: ['Raleway', 800], russo: ['Russo One', 400],
  bebas: ['Bebas Neue', 400], anton: ['Anton', 400], fjalla: ['Fjalla One', 400], staatliches: ['Staatliches', 400],
  nunito: ['Nunito', 800], quicksand: ['Quicksand', 700], comfortaa: ['Comfortaa', 700], fredoka: ['Fredoka', 600], lilita: ['Lilita One', 400],
  abril: ['Abril Fatface', 400], dmserif: ['DM Serif Display', 400], cinzel: ['Cinzel', 700], robotoslab: ['Roboto Slab', 700], alfaslab: ['Alfa Slab One', 400],
  bungee: ['Bungee', 400], righteous: ['Righteous', 400], bangers: ['Bangers', 400], luckiest: ['Luckiest Guy', 400], titan: ['Titan One', 400],
  orbitron: ['Orbitron', 700], audiowide: ['Audiowide', 400], blackops: ['Black Ops One', 400], sairastencil: ['Saira Stencil One', 400],
  rubik: ['Rubik', 700], worksans: ['Work Sans', 700], barlow: ['Barlow', 700], mulish: ['Mulish', 800], manrope: ['Manrope', 700], sora: ['Sora', 700], exo2: ['Exo 2', 700], lexend: ['Lexend', 700], kanit: ['Kanit', 700], prompt: ['Prompt', 700], jost: ['Jost', 600],
  archivonarrow: ['Archivo Narrow', 400], barlowcond: ['Barlow Condensed', 700], sairacond: ['Saira Condensed', 700], teko: ['Teko', 700], khand: ['Khand', 700], rajdhani: ['Rajdhani', 700], pathwaygothic: ['Pathway Gothic One', 400],
  varelaround: ['Varela Round', 400], chewy: ['Chewy', 400], sniglet: ['Sniglet', 800], paytone: ['Paytone One', 400], concertone: ['Concert One', 400],
  merriweather: ['Merriweather', 700], lora: ['Lora', 700], ptserif: ['PT Serif', 700], zillaslab: ['Zilla Slab', 700], yeseva: ['Yeseva One', 400], bitter: ['Bitter', 700],
  passionone: ['Passion One', 700], bowlby: ['Bowlby One', 400], ultra: ['Ultra', 400], sigmar: ['Sigmar One', 400], rowdies: ['Rowdies', 700], fugaz: ['Fugaz One', 400],
  michroma: ['Michroma', 400], syncopate: ['Syncopate', 700],
};

// Schriftfamilie der hochgeladenen Kundenschrift (FontFace-API, nur im Browser registriert)
const CUSTOM_FONT_FAMILY = 'KutuharfCustom';

const DIR_ICON = { rueck: Lightbulb, front: Sun, front_seite: Layers, seite: Sparkles };

const DEFAULTS = {
  text: 'IHR SCHRIFTZUG', fontId: 'modern', customFontName: '',
  logoWidthCm: '', logoHeightCm: '', logoName: '', logoUrl: '',
  logoShape: 'rect', logoDiameterCm: '', // rect = En × Boy · circle = Ø çap (en = boy = çap)
  logoMode: '3d', // '3d' = harflerle aynı kutu · 'uv' = düz baskı logo (m² fiyatı)
  uvBaski: false, // UV Baskı (HARF): harf ön yüzüne baskı — YALNIZ önden akrilik ürünlerde (face = pleksi)
  logoUv: false, // UV Baskı (LOGO): 3D logo ön yüzüne baskı
  cubukUv: false, // UV Baskı (ÇUBUK LED): çubuk ön yüzüne baskı
  cubukLedCm: '', cubukLedHeightCm: '', // Çubuk LED (isteğe bağlı): uzunluk × yükseklik — 150 cm'lik parçalara bölünür, fiyata harfler gibi girer
  availWidth: '', availHeight: '', heightCm: 30,
  lit: '', lightDir: '', lightColor: 'warmweiss',
  bodyMaterial: 'edelstahl_chrom', sideMaterial: 'aluminium', unbelMaterial: 'plexi',
  acrylFront: 'weiss', acrylSide: 'weiss', acrylFrontKontakt: false, acrylSideKontakt: false,
  chromColor: 'silber', chromSurface: 'glaenzend', ralCode: '', backPanelSize: '8',
  unbelAcryl: 'weiss', unbelAcrylKontakt: false,
  faceMetal: 'silber', faceRal: '', sideMetal: 'schwarz', sideRal: '', baseColor: 'schwarz',
  wandabstand: '30', surface: 'matt', depth: '50', unbelRal: '', montageId: 'selbst',
  bohrschablone: false, // Montaj Delme Şablonu (bağımsız, admin-fiyatlı ek ürün)
  traeger: 'wand', // Montageuntergrund: wand | grundplatte | profil — Platte/Profil nur per Projekt-Anfrage
  wallColor: '#1b2140', // Vorschau-Wandfarbe (nur Darstellung — Kunde kombiniert mit seiner Fassade)
};

const TRAEGER_OPTIONS = ['wand', 'grundplatte', 'profil'];

// Wandfarben-Presets für die Vektor-Vorschau (Putz hell/grau, Beton, Sand, Klinker,
// Anthrazit, Nachtblau, Schwarz) + freie Farbwahl über <input type="color">.
const WALL_COLORS = ['#f2f0eb', '#c9ccd1', '#8d9096', '#d9c7a7', '#8a4a3a', '#383e42', '#1b2140', '#17181c'];

const box = 'bg-white border border-linegray';
const inputCls = 'p-3 text-base font-sans border border-inputline bg-white text-charcoal w-full';

function Num({ n }) { return <span className="w-8 h-8 bg-accent text-white text-[14px] font-black flex items-center justify-center flex-shrink-0">{n}</span>; }
function Head({ n, icon: Icon, children }) {
  // Numerische Schritte bekommen eine Anker-ID für die Schrittleiste (Scrollspy + Sprung)
  const id = typeof n === 'number' ? `kh-step-${n}` : undefined;
  return <h3 id={id} className="flex items-center gap-3 text-[18px] font-extrabold text-charcoal scroll-mt-24"><Num n={n} />{Icon && <Icon size={18} className="text-accent" />}{children}</h3>;
}

// Yapışkan adım çubuğu (hero mockup'ındaki 1–7 şeridi, bizim akışa uyarlanmış):
// scroll konumuna göre aktif adım yanar, tıklayınca ilgili bölüme kayar. Salt görsel.
// Sıra bölüm numaralarıyla (Head n → id kh-step-n) eşleşmeli: 1 Yazı, 2 Ölçü, 3 Vektör, 4 Tabela, 5 Logo, 6 Montaj, 7 Sonuç.
const STEP_KEYS = ['secText', 'secArea', 'secVector', 'secType', 'secLogo', 'secMontage', 'secResult'];

function StepBar() {
  const t = useT();
  const [active, setActive] = useState(1);
  useEffect(() => {
    const onScroll = () => {
      let cur = 1;
      for (let i = 1; i <= STEP_KEYS.length; i++) {
        const el = document.getElementById(`kh-step-${i}`);
        if (el && el.getBoundingClientRect().top <= window.innerHeight * 0.38) cur = i;
      }
      setActive(cur);
    };
    onScroll();
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);
  const go = (i) => document.getElementById(`kh-step-${i}`)?.scrollIntoView({ behavior: 'smooth', block: 'start' });
  return (
    <nav className="sticky top-0 z-30 -mt-2 mb-6 border-b border-linegray bg-sectionlight/90" style={{ backdropFilter: 'blur(10px)' }} aria-label="Schritte">
      <div className="flex items-center gap-1.5 overflow-x-auto px-1 py-3">
        {STEP_KEYS.map((key, idx) => {
          const i = idx + 1;
          const isActive = i === active;
          const done = i < active;
          return (
            <div key={key} className="flex items-center gap-1.5 flex-shrink-0">
              <button onClick={() => go(i)}
                className="flex items-center gap-2 bg-transparent border-0 cursor-pointer px-1 group">
                <span className={`w-7 h-7 rounded-full flex items-center justify-center text-[13px] font-extrabold flex-shrink-0 transition-colors ${
                  isActive ? 'bg-accent text-[#080A0D] shadow-[0_0_14px_rgba(215,255,39,0.45)]'
                  : done ? 'bg-accent/20 text-accent'
                  : 'bg-white border border-inputline text-textmut group-hover:border-accent'}`}>
                  {i}
                </span>
                <span className={`text-[12px] font-bold whitespace-nowrap ${isActive ? 'text-accent inline' : 'hidden min-[1100px]:inline ' + (done ? 'text-textsec' : 'text-textmut')}`}>
                  {t(`konfig3.${key}`)}
                </span>
              </button>
              {i < STEP_KEYS.length && <span className={`h-[2px] w-5 min-[1200px]:w-8 flex-shrink-0 ${done ? 'bg-accent' : 'bg-linegray'}`} />}
            </div>
          );
        })}
      </div>
    </nav>
  );
}

// Bildkarte mit Fallback-Platzhalter (Bild aus /public/configurator/…).
// Nur die Lupe öffnet die Großansicht; jeder andere Klick (inkl. Foto) wählt aus.
function ImgChoice({ folder, img, title, sub, alt, active, onClick }) {
  const [err, setErr] = useState(false);
  const [zoom, setZoom] = useState(false);
  const src = `/configurator/${folder}/${img}.jpg`;
  return (
    <>
      <button onClick={onClick}
        className={`text-left border-2 cursor-pointer overflow-hidden transition flex flex-col ${active ? 'border-accent bg-accent/5' : 'border-inputline hover:border-accent'}`}>
        <div className="relative w-full h-[92px] bg-sectionlight flex items-center justify-center overflow-hidden border-b border-linegray">
          {!err ? (
            <>
              <img src={src} alt={alt || title} loading="lazy" decoding="async" width={800} height={600} onError={() => setErr(true)} className="w-full h-full object-cover" />
              <span onClick={(e) => { e.stopPropagation(); setZoom(true); }} title="Vergrößern"
                className="absolute right-1 top-1 w-7 h-7 flex items-center justify-center cursor-zoom-in">
                <ZoomIn size={15} className="text-white drop-shadow-[0_1px_2px_rgba(0,0,0,0.7)]" />
              </span>
            </>
          ) : (
            <ImageIcon size={26} className="text-textmut/50" />
          )}
        </div>
        <div className="px-3 py-2.5 flex flex-col gap-0.5">
          <span className="font-bold text-[14px] text-charcoal leading-tight">{title}</span>
          {sub && <span className="text-[11px] text-textmut leading-snug">{sub}</span>}
        </div>
      </button>
      {zoom && !err && (
        <div className="fixed inset-0 z-[100] bg-black/75 flex flex-col items-center justify-center p-6 cursor-zoom-out" onClick={() => setZoom(false)}>
          <img src={src} alt={alt || title} className="max-w-[92vw] max-h-[82vh] object-contain shadow-2xl" />
          <span className="mt-3 text-white text-[15px] font-semibold">{title}</span>
          <button aria-label="Schließen" onClick={() => setZoom(false)} className="absolute top-4 right-4 w-10 h-10 flex items-center justify-center bg-white/15 hover:bg-white/30 text-white cursor-pointer border-0">
            <X size={22} />
          </button>
        </div>
      )}
    </>
  );
}

function Swatch({ c, label, active, onClick }) {
  return (
    <button onClick={onClick} title={label || c.label}
      className={`flex items-center gap-2 pl-1.5 pr-3 py-1.5 text-[13px] font-semibold border-2 cursor-pointer ${active ? 'border-accent bg-accent/5' : 'border-inputline hover:border-accent'}`}>
      {c.img ? (
        <img src={c.img} alt={label || c.label} loading="lazy" decoding="async" width={240} height={240} className="w-7 h-7 border border-black/15 flex-shrink-0 object-cover" />
      ) : (
        <span className="w-5 h-5 border border-black/15 flex-shrink-0" style={{ background: c.hex }} />
      )}
      {label || c.label}
    </button>
  );
}

function Field({ label, children }) {
  return <div className="flex flex-col gap-2"><span className="text-[13px] font-bold text-charcoal">{label}</span>{children}</div>;
}

// SVG technische Vektor-Maßzeichnung (maßstäblich zur eingegebenen Fläche).
// Blau gestrichelt = verfügbare Fläche (falls angegeben) · Rot = Buchstabenhöhe · Schwarz = Breite.
// Buchstaben sitzen real skaliert im Flächen-Rahmen (unten-links).
// Relative Luminanz eines Hex-Farbwerts (0–1) — helle Schriftfarben bekommen eine Kontur.
function hexLum(hex) {
  const m = /^#?([0-9a-f]{6})$/i.exec(hex || '');
  if (!m) return 0;
  const n = parseInt(m[1], 16);
  return (0.2126 * (n >> 16 & 255) + 0.7152 * (n >> 8 & 255) + 0.0722 * (n & 255)) / 255;
}

function VectorMass({ text, fontClass, fontFamily, widthCm, heightCm, availWidth, availHeight, frameLabel, color, wallColor, lightDir, glowColor, logo }) {
  if (!widthCm || !heightCm) return null;
  // Studio-Zeichnung: dunkles Panel, Wandfarbe hinter dem Schriftzug (Kunde kombiniert
  // mit seiner Fassade), 3D-Extrusion + Glow je Lichtrichtung. Maße bleiben exakt.
  const RED = '#ff5a52', INK = '#e6e8ee', FRAME = '#7d9bff', PANEL = '#0d0e17';
  const fill = color || '#2a2d33';
  const wall = /^#[0-9a-f]{6}$/i.test(wallColor || '') ? wallColor : '#1b2140';
  // Kontrast Buchstabe↔Wand: bei ähnlicher Helligkeit dezente Konturlinie
  const outline = Math.abs(hexLum(fill) - hexLum(wall)) < 0.18;
  const wallDark = hexLum(wall) < 0.45;
  const halo = lightDir === 'rueck' && glowColor;
  const faceFill = halo ? (wallDark ? '#23262f' : '#2b2e38') : fill;
  const edge = '#05060b';
  const aw = Number(availWidth) > 0 ? Number(availWidth) : 0;
  const ah = Number(availHeight) > 0 ? Number(availHeight) : 0;
  const hasFrame = aw > 0 || ah > 0;

  // Logo (optional): sitzt LINKS vom Schriftzug, real skaliert (cm), vertikal auf die
  // Buchstaben-Mitte zentriert — ein größeres Logo ragt oben/unten gleichmäßig über
  // ((Logohöhe − Buchstabenhöhe) / 2), es wird NICHT auf die Buchstabenhöhe verkleinert.
  const hasLogo = logo && logo.widthCm > 0 && logo.heightCm > 0;
  const gapCm = hasLogo ? Math.max(8, heightCm * 0.3) : 0;   // Abstand Logo ↔ Schriftzug
  const blockWcm = widthCm + (hasLogo ? logo.widthCm + gapCm : 0);

  // Rahmen umfasst mindestens die Buchstaben (falls Fläche kleiner wäre).
  const frameW = Math.max(aw, blockWcm);
  const frameH = Math.max(ah, heightCm);
  const scale = Math.min(150 / Math.max(frameH, hasLogo ? logo.heightCm : 0), 600 / frameW, 6);
  const lw = Math.max(24, widthCm * scale);   // Buchstabenbreite px
  const lh = Math.max(20, heightCm * scale);  // Buchstabenhöhe px
  const logoW = hasLogo ? logo.widthCm * scale : 0;
  const logoH = hasLogo ? logo.heightCm * scale : 0;
  const gapPx = gapCm * scale;
  const fw = Math.max(lw + (hasLogo ? logoW + gapPx : 0), frameW * scale); // Rahmenbreite px
  const fh = Math.max(lh, frameH * scale);    // Rahmenhöhe px
  const fontSize = lh / 0.72;

  // Logo-Überstand über den Rahmen (Mitte = Rahmen-/Buchstabenmitte) → Panel wächst mit.
  const logoOver = hasLogo ? Math.max(0, (logoH - fh) / 2) : 0;
  const padL = 78, padT = (hasFrame ? 36 : 22) + logoOver, padR = hasFrame ? 62 : 24;
  const ox = padL, oy = padT;                 // Rahmen oben-links
  // Logo + Schriftzug bilden EINEN Block — der Block sitzt MITTIG im Rahmen.
  const blockW = lw + (hasLogo ? logoW + gapPx : 0);
  const bx = ox + (fw - blockW) / 2;           // Block-Start (Logo links)
  const yCap = oy + (fh - lh) / 2;             // Buchstaben vertikal zentriert
  const yBase = yCap + lh;                     // Grundlinie
  const lx = bx + (hasLogo ? logoW + gapPx : 0); // Schriftzug rechts vom Logo
  const cy = yCap + lh / 2;                    // vertikale Mitte des Schriftzugs
  const logoY = cy - logoH / 2;                // Logo-Mitte = Schriftzug-Mitte

  // Bemaßung: rote Buchstabenhöhe sitzt direkt NEBEN den Buchstaben (links, wenn genug
  // Abstand zur blauen Flächenhöhe am Rahmen, sonst rechts; mit Logo immer rechts).
  // Flächenmaße (blau) und Buchstabenmaße (rot/schwarz) sind getrennte Linien.
  const redLeft = !hasLogo && (!hasFrame || lx - ox >= 80);
  const redX = redLeft ? lx - 14 : lx + lw + 14;
  const showFrameH = hasFrame && ah > 0;
  const showFrameW = hasFrame && aw > 0;
  const yLW = yBase + 22;                              // schwarze Buchstabenbreite unter den Buchstaben
  const yFW = Math.max(yLW + 30, oy + fh + 26);        // blaue Flächenbreite darunter
  const W = ox + fw + padR;
  const H = Math.max(showFrameW ? yFW : yLW, oy + fh, hasLogo ? logoY + logoH : 0) + 26;

  return (
    <svg data-vektormass viewBox={`0 0 ${W} ${H}`} width={W} className="block mx-auto h-auto" style={{ maxWidth: '100%', maxHeight: 360 }}>
      <defs>
        <marker id="vmRed" markerWidth="8" markerHeight="8" refX="4" refY="4" orient="auto"><path d="M0,0 L8,4 L0,8 Z" fill={RED} /></marker>
        <marker id="vmInk" markerWidth="9" markerHeight="9" refX="4.5" refY="4.5" orient="auto"><path d="M0,0 L9,4.5 L0,9 Z" fill={INK} /></marker>
        <marker id="vmBlue" markerWidth="8" markerHeight="8" refX="4" refY="4" orient="auto"><path d="M0,0 L8,4 L0,8 Z" fill={FRAME} /></marker>
        <filter id="vmGlowSoft" x="-40%" y="-40%" width="180%" height="180%"><feGaussianBlur stdDeviation="4" /></filter>
        <filter id="vmGlowWide" x="-60%" y="-60%" width="220%" height="220%"><feGaussianBlur stdDeviation="9" /></filter>
        <linearGradient id="vmWallShade" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#ffffff" stopOpacity="0.10" />
          <stop offset="55%" stopColor="#ffffff" stopOpacity="0" />
          <stop offset="100%" stopColor="#000000" stopOpacity="0.22" />
        </linearGradient>
        {hasLogo && logo.shape === 'circle' && (
          <clipPath id="vmLogoClip"><circle cx={bx + logoW / 2} cy={cy} r={Math.min(logoW, logoH) / 2} /></clipPath>
        )}
      </defs>

      {/* Panel-Hintergrund: eigenständig dunkel — bleibt auch im PDF-Klon lesbar */}
      <rect x="0" y="0" width={W} height={H} rx="6" fill={PANEL} />

      {/* Wandfläche in Kundenfarbe (Fläche, sonst Bereich um Logo + Buchstaben) + Lichtschattierung */}
      {(() => {
        const wx = hasFrame ? ox : bx - 18;
        const wy = hasFrame ? oy : Math.min(yCap, hasLogo ? logoY : yCap) - 18;
        const ww = hasFrame ? fw : blockW + 36;
        const wh = hasFrame ? fh : (Math.max(yBase, hasLogo ? logoY + logoH : yBase) - Math.min(yCap, hasLogo ? logoY : yCap)) + 36;
        return (
          <>
            <rect x={wx} y={wy} width={ww} height={wh} fill={wall} />
            <rect x={wx} y={wy} width={ww} height={wh} fill="url(#vmWallShade)" />
          </>
        );
      })()}

      {/* Verfügbare-Fläche-Rahmen (maßstäblich) mit eigenen blauen Maßlinien */}
      {hasFrame && (
        <>
          <rect x={ox} y={oy} width={fw} height={fh} fill="none" stroke={FRAME} strokeWidth="1.6" strokeDasharray="6 4" />
          <text x={ox + fw / 2} y={oy - 9} textAnchor="middle" fill={FRAME} style={{ fontSize: 13, fontWeight: 700 }}>{frameLabel}</text>
          {showFrameH && (
            <>
              <line x1={ox - 16} y1={oy} x2={ox - 16} y2={oy + fh} stroke={FRAME} strokeWidth="1.6" markerStart="url(#vmBlue)" markerEnd="url(#vmBlue)" />
              <text x={ox - 22} y={oy + fh / 2} textAnchor="end" dominantBaseline="central" fill={FRAME} style={{ fontSize: 13, fontWeight: 700 }}>{ah}cm</text>
            </>
          )}
          {showFrameW && (
            <>
              <line x1={ox} y1={yFW} x2={ox + fw} y2={yFW} stroke={FRAME} strokeWidth="1.6" markerStart="url(#vmBlue)" markerEnd="url(#vmBlue)" />
              <rect x={ox + fw / 2 - 28} y={yFW - 10} width={56} height={20} fill={PANEL} />
              <text x={ox + fw / 2} y={yFW} textAnchor="middle" dominantBaseline="central" fill={FRAME} style={{ fontSize: 13, fontWeight: 700 }}>{aw}cm</text>
            </>
          )}
        </>
      )}

      {/* Kundenlogo — real skaliert LINKS vom Schriftzug, Mitte auf der Buchstaben-Mitte.
          Mit Bild: das hochgeladene Logo (rund beschnitten bei Ø); ohne Bild: Maß-Platzhalter. */}
      {hasLogo && (logo.href ? (
        <image href={logo.href} x={bx} y={logoY} width={logoW} height={logoH} preserveAspectRatio="xMidYMid meet"
          clipPath={logo.shape === 'circle' ? 'url(#vmLogoClip)' : undefined} />
      ) : (
        <g>
          {logo.shape === 'circle'
            ? <circle cx={bx + logoW / 2} cy={cy} r={Math.min(logoW, logoH) / 2} fill="rgba(125,155,255,0.10)" stroke={INK} strokeWidth="1.6" strokeDasharray="5 4" />
            : <rect x={bx} y={logoY} width={logoW} height={logoH} fill="rgba(125,155,255,0.10)" stroke={INK} strokeWidth="1.6" strokeDasharray="5 4" />}
          <text x={bx + logoW / 2} y={cy} textAnchor="middle" dominantBaseline="central" fill={INK} style={{ fontSize: Math.max(10, Math.min(16, logoH / 5)), fontWeight: 700 }}>{logo.label || 'Logo'}</text>
        </g>
      ))}
      {hasLogo && (
        <text x={bx + logoW / 2} y={logoY + logoH + 14} textAnchor="middle" fill={INK} opacity="0.85" style={{ fontSize: 12, fontWeight: 700 }}>
          {logo.shape === 'circle' ? `Ø ${Math.round(logo.heightCm)}cm` : `${Math.round(logo.widthCm)}×${Math.round(logo.heightCm)}cm`}
        </text>
      )}

      {/* Schriftzug — auf die berechnete Breite (lw) gestaucht.
          Aufbau (hinten → vorn): Glow je Lichtrichtung → 3D-Extrusion → Front. */}
      {glowColor && lightDir === 'rueck' && (
        <text x={lx} y={yBase} className={fontClass} fill={glowColor} opacity="0.95" filter="url(#vmGlowWide)" style={{ fontSize, ...(fontFamily ? { fontFamily } : {}) }} textLength={lw} lengthAdjust="spacingAndGlyphs">{text || 'Test'}</text>
      )}
      {glowColor && (lightDir === 'front' || lightDir === 'front_seite') && (
        <text x={lx} y={yBase} className={fontClass} fill={glowColor} opacity="0.75" filter="url(#vmGlowSoft)" style={{ fontSize, ...(fontFamily ? { fontFamily } : {}) }} textLength={lw} lengthAdjust="spacingAndGlyphs">{text || 'Test'}</text>
      )}
      {glowColor && (lightDir === 'seite' || lightDir === 'front_seite') && (
        <text x={lx} y={yBase} className={fontClass} fill="none" stroke={glowColor} strokeWidth="5" opacity="0.85" filter="url(#vmGlowSoft)" style={{ fontSize, ...(fontFamily ? { fontFamily } : {}) }} textLength={lw} lengthAdjust="spacingAndGlyphs">{text || 'Test'}</text>
      )}
      {[5, 4, 3, 2, 1].map((i) => (
        <text key={i} x={lx + i * 1.1} y={yBase + i * 0.9} className={fontClass} fill={edge} style={{ fontSize, ...(fontFamily ? { fontFamily } : {}) }} textLength={lw} lengthAdjust="spacingAndGlyphs">{text || 'Test'}</text>
      ))}
      <text x={lx} y={yBase} className={fontClass} fill={faceFill} stroke={outline ? (wallDark ? '#9aa0ab' : '#4a4e58') : 'none'} strokeWidth={outline ? 1 : 0} style={{ fontSize, ...(fontFamily ? { fontFamily } : {}) }} textLength={lw} lengthAdjust="spacingAndGlyphs">{text || 'Test'}</text>

      {/* rote Höhenbemaßung — direkt neben den Buchstaben */}
      <line x1={redX} y1={yCap} x2={redX} y2={yBase} stroke={RED} strokeWidth="1.6" markerStart="url(#vmRed)" markerEnd="url(#vmRed)" />
      <text x={redLeft ? redX - 6 : redX + 6} y={(yCap + yBase) / 2} textAnchor={redLeft ? 'end' : 'start'} dominantBaseline="central" fill={RED} style={{ fontSize: 15, fontWeight: 700 }}>{Math.round(heightCm)}cm</text>

      {/* schwarze Breitenbemaßung (direkt unter den Buchstaben) */}
      <line x1={lx} y1={yLW} x2={lx + lw} y2={yLW} stroke={INK} strokeWidth="1.6" markerStart="url(#vmInk)" markerEnd="url(#vmInk)" />
      <rect x={lx + lw / 2 - 28} y={yLW - 10} width={56} height={20} fill={PANEL} />
      <text x={lx + lw / 2} y={yLW} textAnchor="middle" dominantBaseline="central" fill={INK} style={{ fontSize: 14, fontWeight: 700 }}>{Math.round(widthCm)}cm</text>
    </svg>
  );
}

// Voreingestellte Beispieltexte je Sprache — dienen zur Erkennung „unberührter" Eingaben.
const DEFAULT_TEXTS = ['IHR SCHRIFTZUG', 'YAZINIZ', 'YOUR TEXT'];

export default function KonfiguratorTest() {
  const t = useT();
  const { locale } = useLocale();
  const router = useRouter();
  const addItem = useCartStore((s) => s.addItem);
  const cartItems = useCartStore((s) => s.items); // Özet panelindeki mini-sepet listesi için
  const removeItem = useCartStore((s) => s.removeItem); // sonuç bölümündeki ürün kutusundan kaldırma
  const [sel, setSel] = useState(DEFAULTS);
  const [partAdded, setPartAdded] = useState(false); // çok parçalı proje: "sepete eklendi" bildirimi
  const [hydrated, setHydrated] = useState(false); // mini-sepet SSR/CSR uyumsuzluğunu önlemek için
  const [logoOpen, setLogoOpen] = useState(false); // Logo bölümü: varsayılan gizli, tıklayınca açılır
  const [cubukOpen, setCubukOpen] = useState(false); // Çubuk LED bölümü: varsayılan gizli, tıklayınca açılır
  const set = (patch) => setSel((s) => ({ ...s, ...patch }));

  // Font-Kategoriefilter + hochgeladene Kundenschrift
  const [fontCat, setFontCat] = useState('alle');
  const [customFont, setCustomFont] = useState(null); // { name, dataUrl, url|null }
  const [fontBusy, setFontBusy] = useState(false);
  const [fontErr, setFontErr] = useState(false);

  // Kundenschrift laden: sofort im Browser registrieren (Live-Vorschau) und —
  // falls Storage konfiguriert — als Bestell-Anhang in den Upload-Bucket legen.
  const onFontFile = async (file) => {
    if (!file) return;
    setFontErr(false);
    if (file.size > 5 * 1024 * 1024 || !/\.(ttf|otf|woff2?)$/i.test(file.name)) { setFontErr(true); return; }
    setFontBusy(true);
    try {
      const buf = await file.arrayBuffer();
      const face = new FontFace(CUSTOM_FONT_FAMILY, buf);
      await face.load();
      // Alte Kundenschrift ersetzen
      document.fonts.forEach((f) => { if (f.family === CUSTOM_FONT_FAMILY) document.fonts.delete(f); });
      document.fonts.add(face);
      const dataUrl = await new Promise((res, rej) => {
        const r = new FileReader();
        r.onload = () => res(r.result); r.onerror = rej;
        r.readAsDataURL(file);
      });
      let url = null;
      const path = `fonts/${Date.now()}-${file.name.replace(/[^a-zA-Z0-9._-]/g, '_')}`;
      const { error } = await supabase.storage.from('uploads').upload(path, file, { upsert: false });
      if (!error) url = supabase.storage.from('uploads').getPublicUrl(path).data.publicUrl;
      setCustomFont({ name: file.name, dataUrl, url });
      set({ fontId: 'custom', customFontName: file.name });
    } catch {
      setFontErr(true);
    }
    setFontBusy(false);
  };

  // Kundenlogo (optional): Vorschau als Daten-URL (nur Bildformate) und — falls
  // Storage konfiguriert — Upload in den uploads-Bucket. Preis kommt aus den
  // eingegebenen Logo-Maßen (auch ohne Datei möglich, z. B. Logo per E-Mail).
  const [logoFile, setLogoFile] = useState(null); // { name, dataUrl|null, url|null }
  const [logoBusy, setLogoBusy] = useState(false);
  const [logoErr, setLogoErr] = useState(false);

  const onLogoFile = async (file) => {
    if (!file) return;
    setLogoErr(false);
    if (file.size > 10 * 1024 * 1024 || !/\.(svg|pdf|ai|eps|png|jpe?g)$/i.test(file.name)) { setLogoErr(true); return; }
    setLogoBusy(true);
    try {
      let dataUrl = null;
      if (/\.(svg|png|jpe?g)$/i.test(file.name)) {
        dataUrl = await new Promise((res, rej) => {
          const r = new FileReader();
          r.onload = () => res(r.result); r.onerror = rej;
          r.readAsDataURL(file);
        });
      }
      let url = null;
      const path = `logos/${Date.now()}-${file.name.replace(/[^a-zA-Z0-9._-]/g, '_')}`;
      const { error } = await supabase.storage.from('uploads').upload(path, file, { upsert: false });
      if (!error) url = supabase.storage.from('uploads').getPublicUrl(path).data.publicUrl;
      setLogoFile({ name: file.name, dataUrl, url });
      set({ logoName: file.name, logoUrl: url || '' });
    } catch {
      setLogoErr(true);
    }
    setLogoBusy(false);
  };

  const removeLogo = () => {
    setLogoFile(null); setLogoErr(false);
    set({ logoName: '', logoUrl: '', logoWidthCm: '', logoHeightCm: '', logoDiameterCm: '' });
  };

  // Detaillierte Projektzeichnung (nur bei angebotspflichtiger Montage/Untergrund):
  // Upload in den uploads-Bucket, wird als Positions-Datei an die Bestellung/Anfrage gehängt.
  const [projektFile, setProjektFile] = useState(null); // { name, url }
  const [projektBusy, setProjektBusy] = useState(false);
  const [projektErr, setProjektErr] = useState(false);

  const onProjektFile = async (file) => {
    if (!file) return;
    setProjektErr(false);
    if (file.size > 20 * 1024 * 1024 || !/\.(pdf|png|jpe?g|svg|ai|eps|dwg|dxf|zip)$/i.test(file.name)) { setProjektErr(true); return; }
    setProjektBusy(true);
    try {
      const path = `projekte/${Date.now()}-${file.name.replace(/[^a-zA-Z0-9._-]/g, '_')}`;
      const { error } = await supabase.storage.from('uploads').upload(path, file, { upsert: false });
      const url = error ? null : supabase.storage.from('uploads').getPublicUrl(path).data.publicUrl;
      if (!url) { setProjektErr(true); setProjektBusy(false); return; }
      setProjektFile({ name: file.name, url });
    } catch {
      setProjektErr(true);
    }
    setProjektBusy(false);
  };

  const removeProjekt = () => { setProjektFile(null); setProjektErr(false); };

  // Pflicht-Bestätigung, wenn die Buchstabenhöhe die Flächenhöhe komplett ausfüllt
  const [flushOk, setFlushOk] = useState(false);

  // Empfängerdaten fürs Angebot — vor dem Erstellen abgefragt, lokal gemerkt
  const [buyer, setBuyer] = useState({ firma: '', name: '', strasse: '', plzOrt: '', email: '', telefon: '' });
  const [buyerOpen, setBuyerOpen] = useState(false);
  const setB = (patch) => setBuyer((b) => ({ ...b, ...patch }));
  useEffect(() => {
    try { const s = JSON.parse(localStorage.getItem('rs-angebot-buyer') || 'null'); if (s && typeof s === 'object') setBuyer((b) => ({ ...b, ...s })); } catch {}
  }, []);

  // Konfiguration über Reloads erhalten: sel in localStorage spiegeln und beim Start
  // wiederherstellen (Merge über DEFAULTS — neue Felder bekommen ihren Default).
  // Datei-Previews (Logo-Bild, Kundenschrift) sind bewusst ausgenommen; ihre Metadaten
  // (Maße/Name/Upload-URL) stecken bereits in sel und bleiben damit erhalten.
  useEffect(() => {
    try {
      const s = JSON.parse(localStorage.getItem('kh-konfig') || 'null');
      if (s && typeof s === 'object') setSel((cur) => ({ ...cur, ...s }));
    } catch { /* defekter Eintrag → Defaults */ }
  }, []);
  useEffect(() => {
    try { localStorage.setItem('kh-konfig', JSON.stringify(sel)); } catch { /* Speicher voll/gesperrt */ }
  }, [sel]);
  useEffect(() => setHydrated(true), []);

  // Unbeleuchteter Edelstahl/Chrom bietet keine RAL-Lackierung: hängt eine frühere
  // RAL-Wahl im State, auf Silber zurücksetzen — sonst flösse der Lackier-Aufpreis
  // (kromBoyama) fälschlich in den Preis ein.
  useEffect(() => {
    if (sel.lit === 'unbeleuchtet' && sel.unbelMaterial === 'edelstahl_chrom' && sel.chromColor === 'ral') {
      set({ chromColor: 'silber' });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [sel.lit, sel.unbelMaterial, sel.chromColor]);

  // Sprache gewechselt → Beispieltext übersetzen, sofern der Nutzer ihn nicht selbst geändert hat.
  useEffect(() => {
    const localized = t('konfig3.defaultText');
    setSel((s) => (DEFAULT_TEXTS.includes(s.text.trim().toUpperCase()) && s.text !== localized ? { ...s, text: localized } : s));
  }, [locale]);

  // Übersetzungs-Helfer für Optionslisten (Fallback = deutsches Label aus der Datenliste)
  const oLabel = (map, item) => t(`konfig3.${map}.${item.id}`, null, item.label);   // flache Maps
  const oL = (map, item) => t(`konfig3.${map}.${item.id}.l`, null, item.label);     // { l } verschachtelt
  const oS = (map, item) => t(`konfig3.${map}.${item.id}.s`, null, item.sub);       // { s } Untertitel
  const oD = (map, item) => t(`konfig3.${map}.${item.id}.d`, null, item.desc);      // { d } Beschreibung

  const lit = sel.lit === 'beleuchtet';

  // Schriftfarbe für die Vektorzeichnung — folgt der gewählten Acryl-/Chromfarbe des Zweigs
  const hexOf = (list, id) => list.find((c) => c.id === id)?.hex;
  const letterColor = (() => {
    if (sel.lit === 'beleuchtet') {
      if (sel.lightDir === 'front' || sel.lightDir === 'front_seite') return hexOf(ACRYL_COLORS, sel.acrylFront);
      if (sel.lightDir === 'seite') return hexOf(CHROM_COLORS, sel.chromColor);
      if (sel.lightDir === 'rueck') return RUECK_CHROM_IDS.includes(sel.bodyMaterial) ? hexOf(CHROM_COLORS, sel.chromColor) : undefined;
    } else if (sel.lit === 'unbeleuchtet') {
      if (sel.unbelMaterial === 'plexi') return hexOf(ACRYL_COLORS, sel.unbelAcryl);
      if (sel.unbelMaterial === 'edelstahl_chrom') return hexOf(CHROM_COLORS, sel.chromColor);
    }
    return undefined;
  })();
  const cfg = buildCfg(sel);
  // Önden akrilik ürün mü? (ön yüz = pleksi) — UV Baskı yalnız bunlarda sunulur.
  // Işıklı: Frontleuchtend / Acryl leuchtend · Işıksız: tam akril (plexi).
  const frontAcrylic = sel.lit === 'unbeleuchtet'
    ? sel.unbelMaterial === 'plexi'
    : sel.lit === 'beleuchtet' && (sel.lightDir === 'front' || sel.lightDir === 'front_seite');
  // HARF UV aktif mi? Yalnız harf UV, HARFİN kendi ön yüzünün akrilik olmasını gerektirir →
  // aktifse harfin ışık yönü / malzeme seçenekleri UV'ye uygun (akrilik ön yüz) olanlarla sınırlanır.
  // Logo/çubuk UV kendi ayrı kutularının ön yüzüyle ilgilidir; harfi kısıtlamaz.
  const uvActive = sel.uvBaski;
  // Harf önden akrilik değilse yalnız HARF UV geçersiz → kapat. Logo + çubuk UV bağımsız, dokunma.
  useEffect(() => { if (!frontAcrylic) setSel((s) => (s.uvBaski ? { ...s, uvBaski: false } : s)); }, [frontAcrylic]);
  // Ürün etiketi: metin varsa metin, yoksa harfsiz ürün türü (Logo / Çubuk LED / ikisi).
  const konfLabel = (k) => (k?.text)
    || (k?.logo && k?.cubukLed ? `${t('konfig3.rLogo')} + ${t('konfig3.cubukLedRow')}`
      : k?.logo ? t('konfig3.rLogo') : k?.cubukLed ? t('konfig3.cubukLedRow') : '');
  // Serverseitige Validierung (identische Funktion wie /api/order) schon im Client
  // spiegeln → Warenkorb wird nur freigegeben, wenn die Bestellung auch durchgeht.
  // Häufigster Fall: lackierte Seiten/Rückwand ohne gewählte RAL-Farbe.
  const cfgCheck = sanitizeV3Config(cfg);
  const configIncomplete = !cfgCheck.ok;
  const needRalMissing = !cfgCheck.ok && (cfgCheck.errors.includes('ralCode') || cfgCheck.errors.includes('unbelRal'));
  // Preis: sofort die lokale Formel anzeigen (kein Flackern), dann serverseitig
  // verfeinern (/api/price — Kostenmotor mit echten Materialpreisen; Rohkosten
  // bleiben auf dem Server). Fehler/Timeout → lokale Formel bleibt stehen.
  const localPrice = priceForState(sel);
  const [serverPrice, setServerPrice] = useState(null);
  const priceKey = JSON.stringify([cfg.text, cfg.heightCm, cfg.lightMode, cfg.lightingId, cfg.constructionId, cfg.fontId, cfg.montageId, cfg.trafo, cfg.logo, cfg.logoPrint, cfg.uvBaski, cfg.logoUv, cfg.cubukUv, cfg.unbelMaterial, cfg.chromColor, cfg.depth, cfg.bohrschablone, cfg.cubukLed]);
  useEffect(() => {
    setServerPrice(null);
    if (!localPrice) return;
    const ctl = new AbortController();
    const tmr = setTimeout(async () => {
      try {
        const [text, heightCm, lightMode, lightingId, constructionId, fontId, montageId, trafo, logo, logoPrint, uvBaski, logoUv, cubukUv, unbelMaterial, chromColor, depth, bohrschablone, cubukLed] = JSON.parse(priceKey);
        const res = await fetch('/api/price', {
          method: 'POST', headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ text, heightCm, lightMode, lightingId, constructionId, fontId, montageId, trafo, logo, logoPrint, uvBaski, logoUv, cubukUv, unbelMaterial, chromColor, depth, bohrschablone, cubukLed }),
          signal: ctl.signal,
        });
        if (res.ok) {
          const data = await res.json();
          if (data?.price) setServerPrice(data.price);
        }
      } catch { /* lokale Formel bleibt */ }
    }, 350);
    return () => { clearTimeout(tmr); ctl.abort(); };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [priceKey]);
  const price = serverPrice || localPrice;
  const size = estimateSize({ text: sel.text, heightCm: sel.heightCm, fontId: sel.fontId });
  const assess = sizeAssessment({ text: sel.text, heightCm: sel.heightCm, fontId: sel.fontId, availWidth: sel.availWidth, availHeight: sel.availHeight });
  const depthRec = recommendDepth(sel.heightCm);
  // Max. Buchstabenhöhe aus verfügbarer Fläche (Breite &/oder Höhe)
  const maxHeight = maxLetterHeight({ text: sel.text, widthCm: sel.availWidth, heightCm: sel.availHeight, fontId: sel.fontId });
  const hasArea = sel.availWidth !== '' || sel.availHeight !== '';
  const areaTooSmall = hasArea && maxHeight !== null && maxHeight < KONFIG_LIMITS.minHeight;
  // Slider-Obergrenze: nie mehr, als in die eingegebene Fläche passt (Breite UND Höhe).
  const sliderMax = maxHeight !== null ? Math.max(KONFIG_LIMITS.minHeight, Math.min(maxHeight, KONFIG_LIMITS.maxHeight)) : KONFIG_LIMITS.maxHeight;
  // Logo-Maße: gültig → fließt in den Preis; teilweise/ungültig → Hinweis.
  // Rund: Durchmesser zählt als Breite = Höhe (Preis & maßstäbliche Vorschau).
  const logoCircle = sel.logoShape === 'circle';
  const logoDims = normalizeLogo(logoCircle
    ? { widthCm: sel.logoDiameterCm, heightCm: sel.logoDiameterCm }
    : { widthCm: sel.logoWidthCm, heightCm: sel.logoHeightCm });
  const logoBothEntered = logoCircle ? sel.logoDiameterCm !== '' : (sel.logoWidthCm !== '' && sel.logoHeightCm !== '');
  const logoInvalid = logoBothEntered && !logoDims;
  const logoNeedSize = !logoDims && !logoInvalid && (!!logoFile || sel.logoWidthCm !== '' || sel.logoHeightCm !== '' || sel.logoDiameterCm !== '');
  // Çubuk LED: bir parça en fazla 150 cm — toplam ölçü otomatik parçalara bölünür,
  // adet + parça ölçüleri girişin yanında gösterilir (son parça kalan ölçüde).
  // Fiyat: uzunluk × yükseklik geçerliyse harfler/logo gibi eşdeğer-harf hesabıyla toplama girer.
  const LED_MAX = CUBUK_LED_LIMITS.pieceMax;
  const ledTotal = Math.max(0, Math.round(Number(sel.cubukLedCm) || 0));
  const ledPieces = cubukLedPieces(ledTotal);
  const ledCount = ledPieces.length;
  const cubukDims = normalizeCubukLed({ lengthCm: sel.cubukLedCm, heightCm: sel.cubukLedHeightCm });
  const cubukEntered = sel.cubukLedCm !== '' || sel.cubukLedHeightCm !== '';
  const cubukInvalid = sel.cubukLedCm !== '' && sel.cubukLedHeightCm !== '' && !cubukDims;
  const cubukNeedSize = cubukEntered && !cubukDims && !cubukInvalid;
  // Kayıtlı/girili veri varsa ilgili bölümü otomatik aç (gizli kalıp veri kaybolmasın).
  useEffect(() => { if (logoFile || sel.logoWidthCm !== '' || sel.logoHeightCm !== '' || sel.logoDiameterCm !== '') setLogoOpen(true); }, [logoFile, sel.logoWidthCm, sel.logoHeightCm, sel.logoDiameterCm]);
  useEffect(() => { if (cubukEntered) setCubukOpen(true); }, [cubukEntered]);
  // Über quoteHeight (50 cm): Preis & Warenkorb bleiben, Online-Zahlung gesperrt — nur Angebot/PDF.
  // Pro Komponente getrennt, damit ein großes Logo/Çubuk nicht fälschlich die BUCHSTABEN-
  // Höhe rot färbt (Bug: früher machte oversize einer Komponente das Buchstabenfeld rot).
  const letterOversize = sel.heightCm > KONFIG_LIMITS.quoteHeight;
  const logoOversize = logoDims !== null && logoDims.heightCm > KONFIG_LIMITS.quoteHeight;
  const cubukOversize = cubukDims !== null && cubukDims.heightCm > KONFIG_LIMITS.quoteHeight;
  const oversize = letterOversize || logoOversize || cubukOversize;
  // Buchstabenhöhe füllt die eingegebene Flächenhöhe komplett aus (bündig, kein
  // Spielraum) → Montage-Hinweis mit Pflicht-Bestätigung vor dem Warenkorb.
  const availHNum = Number(sel.availHeight) || 0;
  const heightFillsArea = availHNum > 0 && !areaTooSmall && sel.heightCm >= Math.min(Math.floor(availHNum), KONFIG_LIMITS.maxHeight);
  const needFlushConfirm = heightFillsArea && !flushOk;
  // Teklif gerektiren seçenekler: Grundplatte/Tragprofil (montaj zemini) veya Yerinde
  // Profi-Montage. Seçenekler normal görünür ve seçilebilir, ürün SEPETE eklenebilir;
  // ödeme yerine sistem OTOMATİK teklif akışına geçer (Warenkorb/Kasse online ödemeyi
  // kilitler, /api/order sunucuda reddeder).
  const needsProjekt = sel.traeger === 'grundplatte' || sel.traeger === 'profil';
  const quoteOnly = needsProjekt || sel.montageId === 'profi';

  // Fläche eingegeben → Buchstabenhöhe automatisch auf das Maximum setzen.
  // Reagiert nur auf Änderungen von Fläche/Text/Font (nicht auf den Höhen-Slider),
  // damit eine manuelle Slider-Änderung erhalten bleibt.
  useEffect(() => {
    if (maxHeight === null) return;
    // Auf das Flächen-Maximum setzen; ist die Fläche zu klein, hart auf minHeight klemmen —
    // die Buchstabenhöhe darf die eingegebenen Maße nie überschreiten.
    const target = Math.max(KONFIG_LIMITS.minHeight, Math.min(maxHeight, KONFIG_LIMITS.maxHeight));
    setSel((s) => (s.heightCm !== target ? { ...s, heightCm: target } : s));
  }, [maxHeight]);

  // Sepet pozisyonu nesnesini kurar (add + addAndContinue ortak kullanır).
  const buildCartItem = () => {
    // Hochgeladene Kundenschrift als Positions-Datei anhängen (falls Storage-Upload gelang)
    const fontFile = sel.fontId === 'custom' && customFont?.url ? { fileUrl: customFont.url, fileName: customFont.name } : {};
    // Projektzeichnung nur bei angebotspflichtiger Auswahl (Teklif İste). Sie hat Vorrang
    // vor der Kundenschrift für den Datei-Slot; ist beides vorhanden, wird die Schrift
    // in der Bemerkung bewahrt, damit nichts verloren geht.
    const zeichnung = quoteOnly && projektFile?.url ? { fileUrl: projektFile.url, fileName: projektFile.name } : {};
    const attach = zeichnung.fileUrl ? zeichnung : fontFile;
    const noteExtra = zeichnung.fileUrl && fontFile.fileUrl ? { note: `Kundenschrift: ${fontFile.fileName} — ${fontFile.fileUrl}` } : {};
    // Anzeigedaten für die Ergebnis-Box je Produkt mitspeichern (Detailzeilen +
    // Buchstaben-Preistabelle), damit im Ergebnisbereich pro hinzugefügtem Produkt
    // eine eigene Box mit „tek tek harf fiyatları" erscheint.
    const viewRows = summaryRows(sel, price, size, t);
    const priceView = {
      letterRows: price.letterRows || [], logo: price.logo || null, cubukLed: price.cubukLed || null,
      netzteil: price.netzteil || 0, ambalaj: price.ambalaj || 0, montage: price.montage || 0,
      bohrschablone: price.bohrschablone || 0, total: price.total,
    };
    return { categorySlug: 'werbetechnik', productSlug: 'konfigurator-3d-buchstaben', name: sel.text.trim() ? t('konfig3.itemName') : konfLabel(cfg), detail: detail3(sel), unitPrice: price.total, konfig: cfg, oversize, quoteOnly, viewRows, priceView, ...attach, ...noteExtra };
  };
  const canAdd = () => price && !needFlushConfirm && !areaTooSmall && !configIncomplete;

  // ── Bölüm bazlı bağımsız kalemler (Harf / Logo / Çubuk ayrı sepet ürünü olur) ──
  // Fiyatlar paket price nesnesinden TÜRETİLİR → sunucu addon yeniden-hesabıyla birebir:
  //   Harf = total − logo − çubuk · Logo = price.logo.total · Çubuk = price.cubukLed.total
  // Proje-seviyesi ücretler (trafo/ambalaj/min/montaj) yalnız Harf kaleminde; logo/çubuk
  // addon (ek ürün) olarak yalnız kendi üretim maliyetini taşır.
  const r2 = (n) => Math.round(n * 100) / 100;
  const logoPart = price?.logo?.total || 0;
  const cubukPart = price?.cubukLed?.total || 0;
  const harfPart = price ? r2(price.total - logoPart - cubukPart) : 0;
  const hasHarfPart = !!sel.text.trim() && !!price;
  const hasLogoPart = !!(price?.logo);
  const hasCubukPart = !!(price?.cubukLed);

  const buildHarfItem = () => {
    const s2 = { ...sel, logoWidthCm: '', logoHeightCm: '', logoDiameterCm: '', logoUv: false, cubukLedCm: '', cubukLedHeightCm: '', cubukUv: false };
    return { categorySlug: 'werbetechnik', productSlug: 'konfigurator-3d-buchstaben', name: t('konfig3.itemName'), detail: detail3(s2), unitPrice: harfPart, konfig: buildCfg(s2) };
  };
  const buildLogoItem = () => {
    const s2 = { ...sel, text: '', cubukLedCm: '', cubukLedHeightCm: '', cubukUv: false, bohrschablone: false };
    const c = buildCfg(s2);
    return { categorySlug: 'werbetechnik', productSlug: 'konfigurator-3d-buchstaben', name: konfLabel(c) || t('konfig3.rLogo'), detail: detail3(s2), unitPrice: logoPart, konfig: c, addon: true };
  };
  const buildCubukItem = () => {
    const s2 = { ...sel, text: '', logoWidthCm: '', logoHeightCm: '', logoDiameterCm: '', logoUv: false, bohrschablone: false };
    const c = buildCfg(s2);
    return { categorySlug: 'werbetechnik', productSlug: 'konfigurator-3d-buchstaben', name: konfLabel(c) || t('konfig3.cubukLedRow'), detail: detail3(s2), unitPrice: cubukPart, konfig: c, addon: true };
  };
  const addHarf = () => { if (hasHarfPart && canAdd()) { addItem(buildHarfItem()); setPartAdded(true); } };
  const addLogoPart = () => { if (hasLogoPart) { addItem(buildLogoItem()); setPartAdded(true); } };
  const addCubukPart = () => { if (hasCubukPart) { addItem(buildCubukItem()); setPartAdded(true); } };
  const addAll = () => {
    if (!canAdd()) return;
    if (hasHarfPart) addItem(buildHarfItem());
    if (hasLogoPart) addItem(buildLogoItem());
    if (hasCubukPart) addItem(buildCubukItem());
    setPartAdded(true);
  };
  // Özet panelindeki CTA: tüm parçaları ekle + sepet sayfasına git ("Sepete git").
  const addAllAndGo = () => { if (!canAdd()) return; addAll(); router.push('/warenkorb'); };

  // Eski tekli (paket) ekleme — geri uyum; artık UI addAll/bölüm butonlarını kullanır.
  const add = () => {
    if (!canAdd()) return;
    addItem(buildCartItem());
    setPartAdded(true);
  };
  const reset = () => {
    setSel({ ...DEFAULTS, text: t('konfig3.defaultText') }); setLogoFile(null); setLogoErr(false); setFlushOk(false); setProjektFile(null); setProjektErr(false);
    try { localStorage.removeItem('kh-konfig'); } catch { /* egal — wird beim nächsten sel-Save überschrieben */ }
    if (typeof window !== 'undefined') window.scrollTo({ top: 0, behavior: 'smooth' });
  };
  const inquiryHref = `/kontakt?kategorie=werbetechnik&produkt=${encodeURIComponent('3D-Buchstaben: ' + detail3(sel).slice(0, 150))}`
    + (quoteOnly && projektFile?.url ? `&zeichnung=${encodeURIComponent(projektFile.url)}` : '');

  // Özet paneli mini-sepet: sepetteki kalemler (konfigüratör yazıları) + net toplam.
  // Etiket: konfig yazısı varsa onu, yoksa ürün adı.
  const cartCount = cartItems.length;
  const cartNetSum = cartItems.reduce((s, i) => s + i.unitPrice * i.qty, 0);

  // Sonuç bölümünde her ÜRÜN için kutu — ama şu an aktif kutuda görünen (forma birebir
  // eşleşen) ürünü tekrar gösterme (tek üründe kalabalık olmasın). Aktif config = cart key.
  const currentKey = price ? `werbetechnik|konfigurator-3d-buchstaben|${detail3(sel)}` : null;
  const completedItems = cartItems.filter((i) => i.productSlug === 'konfigurator-3d-buchstaben' && i.key !== currentKey);

  const openPdf = () => {
    const rows = summaryRows(sel, price, size, t);
    const esc = (s) => String(s || '').replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');

    // Empfängerblock + Datum + Angebotsnummer — wie auf einer Rechnung
    const buyerLines = [
      buyer.firma && `<strong>${esc(buyer.firma)}</strong>`,
      esc(buyer.name), esc(buyer.strasse), esc(buyer.plzOrt), esc(buyer.email), esc(buyer.telefon),
    ].filter(Boolean).join('<br>');
    const dateStr = new Date().toLocaleDateString(locale === 'tr' ? 'tr-TR' : locale === 'en' ? 'en-GB' : 'de-DE');
    const angNo = 'ANG-' + Date.now().toString(36).toUpperCase();
    const buyerHtml = `<div style="display:flex;justify-content:space-between;gap:24px;margin:20px 0 6px">
      <div style="font-size:14px;line-height:1.55"><div style="font-size:11px;color:#888;text-transform:uppercase;letter-spacing:.04em;margin-bottom:4px">${t('konfig3.pdfFor')}</div>${buyerLines}</div>
      <div style="font-size:13px;text-align:right;color:#444;flex-shrink:0"><div>${t('konfig3.pdfDate')}: ${dateStr}</div><div>${t('konfig3.pdfNo')}: ${angNo}</div></div>
    </div>`;

    // Gerenderte Vektor-Maßzeichnung (Schritt 3) fürs Angebot übernehmen; die
    // next/font-Klasse gilt im Popup nicht → Schriftfamilie inline setzen und
    // dieselbe Google-Font im Popup laden. Kundenschrift wird als Daten-URL eingebettet.
    const isCustom = sel.fontId === 'custom' && customFont?.dataUrl;
    const [famName, famWeight] = isCustom ? [CUSTOM_FONT_FAMILY, 400] : (FONT_PDF[sel.fontId] || FONT_PDF.modern);
    let vectorHtml = '';
    const svgEl = document.querySelector('svg[data-vektormass]');
    if (price && svgEl) {
      const clone = svgEl.cloneNode(true);
      clone.querySelectorAll('text').forEach((n) => {
        if (n.getAttribute('class')) { n.removeAttribute('class'); n.style.fontFamily = `'${famName}', sans-serif`; n.style.fontWeight = famWeight; }
      });
      clone.setAttribute('style', 'max-width:100%;height:auto;display:block;margin:0 auto');
      vectorHtml = `<h2 style="margin-top:26px">${t('konfig3.secVector')}</h2><div style="border:1px solid #eee;padding:14px 10px">${clone.outerHTML}</div>`;
    }
    // Kundenlogo (falls Bildvorschau vorhanden) mit Wunschmaß ins Angebot
    const logoHtml = price && logoFile?.dataUrl && logoDims
      ? `<h2 style="margin-top:26px">${t('konfig3.rLogo')}</h2><div style="border:1px solid #eee;padding:14px 10px;text-align:center"><img src="${logoFile.dataUrl}" alt="Logo" style="max-width:60%;max-height:140px${logoCircle ? ';border-radius:50%' : ''}"><p class="mut" style="margin:6px 0 0">${logoCircle ? `Ø ${logoDims.heightCm}` : `${logoDims.widthCm} × ${logoDims.heightCm}`} cm</p></div>`
      : '';
    const fontHeadHtml = isCustom
      ? `<style>@font-face{font-family:'${CUSTOM_FONT_FAMILY}';src:url(${customFont.dataUrl})}</style>`
      : `<link rel="stylesheet" href="https://fonts.googleapis.com/css2?family=${famName.replace(/ /g, '+')}:wght@${famWeight}&display=swap">`;

    // Foto des gewählten Produkts unter der Angebots-Überschrift
    const prodPick = (() => {
      if (sel.lit === 'unbeleuchtet') { const m = UNBEL_MAT.find((x) => x.id === sel.unbelMaterial); return m && { src: `/configurator/material/${m.img}.jpg`, label: oL('unbelMat', m) }; }
      if (sel.lightDir === 'rueck') { const m = BODY_MAT_RUECK.find((x) => x.id === sel.bodyMaterial); return m && { src: `/configurator/material/${m.img}.jpg`, label: oLabel('bodyMat', m) }; }
      if (sel.lightDir === 'front') { const m = SIDE_MAT_FRONT.find((x) => x.id === sel.sideMaterial); return m && { src: `/configurator/material/${m.img}.jpg`, label: oLabel('sideMat', m) }; }
      const d = LIGHT_DIRS.find((x) => x.id === sel.lightDir);
      return d && { src: `/configurator/light/${d.img}.jpg`, label: oL('lightDir', d) };
    })();
    const productHtml = price && prodPick
      ? `<h2 style="margin-top:28px">${t('konfig3.pdfProductPhoto')}</h2>
         <div><img src="${window.location.origin}${prodPick.src}" alt="${prodPick.label}" style="width:60%;max-width:380px;display:block;border:1px solid #eee"><p class="mut" style="margin:6px 0 0">${prodPick.label}</p></div>`
      : '';

    // ── Çok ürünlü teklif: sepetteki her konfigüratör ürünü + (geçerliyse) şu an
    // yapılandırılan ürün ayrı blok olarak. Her blok: detay tablosu + harf-fiyat
    // tablosu + ara toplam. En sonda proje toplamı.
    // Tamamlanan ürünler (aktif configle eşleşen hariç) + geçerliyse mevcut config — tekrarsız.
    const products = completedItems.map((it, idx) => ({
      label: `${t('konfig3.productBoxLabel')} ${idx + 1}: „${konfLabel(it.konfig) || it.name || ''}"`, rows: it.viewRows || [], price: it.priceView, qty: it.qty || 1,
    }));
    if (price) products.push({ label: `${t('konfig3.productBoxLabel')} ${products.length + 1}: „${sel.text}"`, rows, price, qty: 1 });
    const letterTableHtml = (pr) => (pr?.letterRows?.length ? `<table>
      <tr><td style="width:42%"><strong>${t('konfig3.phLetter')}</strong></td><td><strong>${t('konfig3.phHeight')}</strong></td><td style="text-align:right"><strong>${t('konfig3.phPrice')}</strong></td></tr>
      ${pr.letterRows.map((r) => `<tr><td><strong>${esc(r.ch)}</strong></td><td>${r.heightCm} cm</td><td style="text-align:right">${fmtEur(r.price)}</td></tr>`).join('')}
      ${pr.logo ? `<tr><td>${t('konfig3.rLogo')}</td><td>${pr.logo.widthCm}×${pr.logo.heightCm} cm</td><td style="text-align:right">${fmtEur(pr.logo.total)}</td></tr>` : ''}
      ${pr.cubukLed ? `<tr><td>${t('konfig3.cubukLedRow')}</td><td>${pr.cubukLed.lengthCm}×${pr.cubukLed.heightCm} cm</td><td style="text-align:right">${fmtEur(pr.cubukLed.total)}</td></tr>` : ''}
      ${pr.netzteil > 0 ? `<tr><td colspan="2">${t('konfig3.rowTrafo')}</td><td style="text-align:right">${fmtEur(pr.netzteil)}</td></tr>` : ''}
      ${pr.ambalaj > 0 ? `<tr><td colspan="2">${t('konfig3.rowVerpackung')}</td><td style="text-align:right">${fmtEur(pr.ambalaj)}</td></tr>` : ''}
      ${pr.montage > 0 ? `<tr><td colspan="2">${t('konfig3.rMontage')}</td><td style="text-align:right">${fmtEur(pr.montage)}</td></tr>` : ''}
      ${pr.bohrschablone > 0 ? `<tr><td colspan="2">${t('konfig3.bohrschablone')}</td><td style="text-align:right">${fmtEur(pr.bohrschablone)}</td></tr>` : ''}
      </table>` : '');
    const productsHtml = products.map((p) => `<h2 style="margin-top:24px">${esc(p.label)}${p.qty > 1 ? ` ×${p.qty}` : ''}</h2>
      <table>${(p.rows || []).map(([k, v]) => `<tr><td>${esc(k)}</td><td>${esc(v || '—')}</td></tr>`).join('')}</table>
      ${letterTableHtml(p.price)}
      <table><tr><td style="font-weight:700">${t('konfig3.totalNet')}</td><td style="text-align:right;font-weight:700">${fmtEur((p.price?.total || 0) * p.qty)}</td></tr></table>`).join('');
    const projectTotal = products.reduce((s, p) => s + (p.price?.total || 0) * p.qty, 0);

    const html = `<!doctype html><html><head><meta charset="utf-8"><title>${t('konfig3.pdfTitle')}</title>
      ${fontHeadHtml}
      <style>body{font-family:Arial,sans-serif;max-width:640px;margin:32px auto;color:#1c1e22;padding:0 24px}
      h1{font-size:22px}h2{font-size:14px;color:#c0392b;text-transform:uppercase;letter-spacing:.05em}
      table{width:100%;border-collapse:collapse;margin-top:12px}td{padding:7px 4px;border-bottom:1px solid #eee;font-size:14px}
      td:first-child{color:#666;width:42%}.total{font-size:20px;font-weight:800;border-top:2px solid #111}.mut{color:#888;font-size:12px}</style></head>
      <body><h2>${t('konfig3.pdfKicker')}</h2><h1>${t('konfig3.pdfHeading')}</h1>
      <p class="mut" style="margin:2px 0 0">KUTUHARF · Mil Werbung Marketing · info@kutuharf.eu · +49 174 962 33 44</p>
      ${buyerHtml}
      ${vectorHtml}
      ${logoHtml}
      ${productsHtml}
      <table><tr><td class="total">${products.length > 1 ? t('konfig3.projectTotal') : t('konfig3.totalNet')}</td><td class="total" style="text-align:right">${fmtEur(projectTotal)}</td></tr></table>
      ${productHtml}
      <p class="mut">${t('konfig3.pdfFootnote')}</p>
      <script>window.onload=()=>{(document.fonts&&document.fonts.ready?document.fonts.ready:Promise.resolve()).then(()=>setTimeout(()=>window.print(),150))}</script></body></html>`;
    const w = window.open('', '_blank');
    if (w) { w.document.write(html); w.document.close(); }
  };

  const rows = summaryRows(sel, price, size, t);

  return (
    <>
    <StepBar />
    <div className="grid grid-cols-1 min-[1000px]:grid-cols-[1.3fr_0.8fr] gap-8 items-start">
      {/* ── HAUPT-FLOW ── */}
      <div className="flex flex-col gap-9">

        {/* 1. Schriftzug & Font */}
        <section className="flex flex-col gap-4">
          <Head n={1} icon={Type}>{t('konfig3.secText')}</Head>
          <label className="flex flex-col gap-1.5 text-sm font-semibold">{t('konfig3.textLabel', { n: KONFIG_LIMITS.maxTextLen })}
            <input type="text" maxLength={KONFIG_LIMITS.maxTextLen} value={sel.text} onChange={(e) => set({ text: e.target.value })} placeholder={t('konfig3.textPlaceholder')} className={inputCls + ' text-lg font-bold'} />
          </label>
          {/* Çok parçalı proje ipucu (farklı font/yükseklik → her parça ayrı, tek proje) */}
          <div className="text-[13px] px-3 py-2.5 flex items-start gap-2 bg-accent/5 text-charcoal border border-accent/30">
            <Info size={15} className="flex-shrink-0 mt-0.5 text-accent" />
            <span>{t('konfig3.multiPartHint')}</span>
          </div>
          <Field label={t('konfig3.fontLabel')}>
            {/* Kategorie-Chips */}
            <div className="flex flex-wrap gap-1.5">
              {KONFIG_FONT_CATS.map((c) => (
                <button key={c.id} onClick={() => setFontCat(c.id)}
                  className={`px-3 py-1.5 text-[12px] font-bold border-2 cursor-pointer ${fontCat === c.id ? 'border-accent bg-accent text-white' : 'border-inputline bg-white text-charcoal hover:border-accent'}`}>
                  {t(`konfig3.fontCat.${c.id}`)}
                </button>
              ))}
            </div>
            <div className="grid grid-cols-3 sm:grid-cols-5 gap-2 max-h-[340px] overflow-y-auto pr-1">
              {KONFIG_FONTS.filter((f) => !f.custom && (fontCat === 'alle' || f.cat === fontCat)).map((f) => (
                <button key={f.id} onClick={() => set({ fontId: f.id })}
                  className={`px-2 py-2.5 border-2 cursor-pointer bg-white flex flex-col items-center gap-1 ${sel.fontId === f.id ? 'border-accent' : 'border-inputline hover:border-accent'}`}>
                  <span className={`text-xl leading-none text-charcoal ${FONT_CLASS[f.id]}`}>Ag</span>
                  <span className="text-[10px] text-textmut text-center leading-tight">{oLabel('font', f)}</span>
                </button>
              ))}
            </div>
            {/* Eigene Schrift hochladen — sofort in Vorschau & Vektorzeichnung aktiv */}
            <div className="flex flex-col gap-1.5">
              <label className={`flex items-center justify-center gap-2 px-3 py-3 text-[13px] font-bold border-2 border-dashed cursor-pointer ${sel.fontId === 'custom' ? 'border-accent bg-accent/5 text-charcoal' : 'border-inputline bg-white text-charcoal hover:border-accent'}`}>
                <Upload size={15} className="text-accent flex-shrink-0" />
                {fontBusy ? t('konfig3.customFontBusy') : customFont ? `✓ ${customFont.name}` : t('konfig3.customFontBtn')}
                <input type="file" accept=".ttf,.otf,.woff,.woff2" className="hidden"
                  onChange={(e) => { onFontFile(e.target.files && e.target.files[0]); e.target.value = ''; }} />
              </label>
              {customFont && sel.fontId !== 'custom' && (
                <button onClick={() => set({ fontId: 'custom', customFontName: customFont.name })} className="text-[12px] font-semibold text-accent underline cursor-pointer bg-transparent border-0 self-start">
                  {t('konfig3.customFontUse', { name: customFont.name })}
                </button>
              )}
              {fontErr && <span className="text-[12px] text-accent font-semibold">{t('konfig3.customFontErr')}</span>}
              {customFont && !customFont.url && sel.fontId === 'custom' && (
                <span className="text-[12px] text-textmut">{t('konfig3.customFontMailHint')}</span>
              )}
            </div>
          </Field>
          {/* Live-Vorschau — Studio-Wand im Mockup-Look: 3D-Extrusion (Text-Shadow-Stapel),
              leichte Perspektive, Wand-Vignette und Halo-Lichtfleck in der gewählten
              LED-Lichtfarbe. Nur Darstellung; State/Preislogik unverändert. */}
          <div className="relative overflow-hidden flex items-center justify-center min-h-[260px] px-6 py-14 border border-linegray">
            {/* Wand: oben-mittig angestrahlt, Ränder vignettiert */}
            <div className="absolute inset-0" style={{ background: 'linear-gradient(165deg,#1c2036 0%,#0e101f 55%,#141733 100%)' }} />
            <div className="absolute inset-0" style={{ background: 'radial-gradient(70% 85% at 55% 28%, rgba(120,128,205,.22), transparent 68%)' }} />
            <div className="absolute inset-0" style={{ background: 'radial-gradient(130% 130% at 50% 45%, transparent 52%, rgba(0,0,0,.55) 100%)' }} />
            {(() => {
              const lit3 = sel.lit === 'beleuchtet';
              const glow = lit3 ? (LIGHT_COLORS.find((c) => c.id === sel.lightColor)?.glow || '#ffe6b0') : null;
              const halo = glow && sel.lightDir === 'rueck';
              // 3D-Extrusion: gestapelte Text-Shadows nach rechts-unten (Mockup-Blickwinkel)
              const edge = halo ? '#04050a' : '#0a0c14';
              const depth = Array.from({ length: 7 }, (_, i) => `${(i + 1) * 1}px ${(i + 1) * 0.8}px 0 ${edge}`).join(',');
              const light = glow
                ? (halo
                  ? `${depth}, 0 0 26px ${glow}, 0 0 70px ${glow}, 0 0 130px ${glow}`
                  : `${depth}, 0 0 16px ${glow}, 0 0 50px ${glow}`)
                : `${depth}, 0 10px 24px rgba(0,0,0,.65)`;
              return (
                <>
                  {/* Halo-Lichtfleck an der Wand hinter den Buchstaben */}
                  {glow && (
                    <div className="absolute" style={{
                      inset: '12% 6%',
                      background: `radial-gradient(60% 55% at 50% 50%, ${glow}${halo ? '55' : '2e'}, transparent 72%)`,
                      filter: 'blur(6px)',
                    }} />
                  )}
                  <span className={`relative text-center break-words max-w-full font-extrabold uppercase ${FONT_CLASS[sel.fontId] || ''}`}
                    style={{
                      fontSize: `clamp(30px, ${Math.max(30, Math.min(84, sel.heightCm * 1.7))}px, 84px)`,
                      letterSpacing: '0.04em',
                      lineHeight: 1.05,
                      color: halo ? '#252833' : (letterColor || '#e8eaef'),
                      textShadow: light,
                      transform: 'perspective(1100px) rotateY(-7deg)',
                      ...(sel.fontId === 'custom' ? { fontFamily: `'${CUSTOM_FONT_FAMILY}', sans-serif` } : {}),
                    }}>
                    {sel.text.trim() || t('konfig3.defaultText')}
                  </span>
                </>
              );
            })()}
            <span className="absolute bottom-2.5 right-4 text-[11px] text-white/40">{t('konfig3.previewBadge')}</span>
          </div>
        </section>

        {/* 2. Fläche & Buchstabenhöhe */}
        <section className="flex flex-col gap-4">
          <Head n={2} icon={Ruler}>{t('konfig3.secArea')}</Head>
          <div className="flex flex-col gap-3 bg-white border border-linegray px-4 py-4">
            <span className="flex items-center gap-2.5 text-sm font-bold text-charcoal">
              <Ruler size={16} className="text-accent flex-shrink-0" />
              {t('konfig.areaQ')}
            </span>
            <div className="flex flex-wrap items-end gap-3">
              <label className="flex flex-col gap-1.5 text-[13px] font-semibold text-textsec">{t('konfig.areaWidth')}
                <input type="number" min={1} inputMode="numeric" placeholder={t('konfig3.widthPh')} value={sel.availWidth} onChange={(e) => set({ availWidth: e.target.value === '' ? '' : Math.max(0, Number(e.target.value)) })} className={inputCls + ' w-[150px]'} /></label>
              <label className="flex flex-col gap-1.5 text-[13px] font-semibold text-textsec">{t('konfig.areaHeight')}
                <input type="number" min={1} inputMode="numeric" placeholder={t('konfig3.heightPh')} value={sel.availHeight} onChange={(e) => set({ availHeight: e.target.value === '' ? '' : Math.max(0, Number(e.target.value)) })} className={inputCls + ' w-[150px]'} /></label>
              {maxHeight !== null && maxHeight >= KONFIG_LIMITS.minHeight && (
                <div className="flex items-center gap-3">
                  <span className="text-[15px]">{t('konfig.areaMax')} <strong className="text-accent">{maxHeight} cm</strong></span>
                  <button onClick={() => set({ heightCm: maxHeight })} className="px-4 py-2.5 text-[14px] font-semibold bg-accent text-white border-none cursor-pointer hover:brightness-90">{t('konfig.areaApply')}</button>
                </div>
              )}
            </div>
            {areaTooSmall && (
              <span className="text-[13px] text-warnred">{t('konfig.areaTooSmall', { text: sel.text.trim(), min: KONFIG_LIMITS.minHeight })}</span>
            )}
            {/* Buchstaben schließen bündig mit der Flächenhöhe ab → Hinweis + Pflicht-Checkbox */}
            {heightFillsArea && (
              <div className="flex flex-col gap-2.5 px-3.5 py-3 bg-[#fdf3e6] border border-[#d9a441]/50">
                <span className="text-[13px] leading-relaxed text-[#9a6414] flex items-start gap-2">
                  <Info size={15} className="flex-shrink-0 mt-0.5" />
                  <span>{t('konfig3.flushWarn')}</span>
                </span>
                <label className="flex items-start gap-2.5 cursor-pointer text-[13px] font-semibold text-charcoal">
                  <input type="checkbox" checked={flushOk} onChange={(e) => setFlushOk(e.target.checked)} className="w-4 h-4 accent-accent mt-0.5 flex-shrink-0" />
                  <span>{t('konfig3.flushCheck')} *</span>
                </label>
              </div>
            )}
            <span className="text-[12px] text-textmut">{t('konfig.areaNote', { font: t(`konfig.font_${sel.fontId}`, {}, sel.fontId), max: KONFIG_LIMITS.maxHeight })}</span>
          </div>
          <Field label={<>{t('konfig3.letterHeight')}: <strong className={letterOversize || areaTooSmall ? 'text-warnred' : 'text-accent'}>{sel.heightCm} cm</strong></>}>
            {/* Harte Obergrenze: bei eingegebener Fläche kann der Regler das Flächen-Maximum
                (Breite UND Höhe) nie überschreiten — nicht nur warnen. */}
            <input type="range" min={KONFIG_LIMITS.minHeight} max={sliderMax} step={5} value={sel.heightCm} onChange={(e) => set({ heightCm: Math.min(Number(e.target.value), sliderMax) })} className={`w-full ${letterOversize || areaTooSmall ? 'accent-warnred' : 'accent-accent'}`} />
            <span className="flex justify-between text-[11px] text-textmut"><span>{KONFIG_LIMITS.minHeight} cm</span><span>{sliderMax} cm</span></span>
            {/* Direkteingabe (cm): freie Zwischenwerte (der Regler springt in 5er-Schritten).
                Beim Tippen nur nach oben klemmen, Untergrenze erst beim Verlassen des Felds. */}
            <div className="flex items-center gap-2 mt-1">
              <input type="number" min={KONFIG_LIMITS.minHeight} max={sliderMax} inputMode="numeric" value={sel.heightCm}
                onChange={(e) => { const v = e.target.value; if (v === '') return; set({ heightCm: Math.min(Math.round(Number(v)) || 0, sliderMax) }); }}
                onBlur={() => set({ heightCm: Math.max(KONFIG_LIMITS.minHeight, Math.min(Number(sel.heightCm) || KONFIG_LIMITS.minHeight, sliderMax)) })}
                className={inputCls + ' w-[110px] text-[15px] font-bold'} />
              <span className="text-[13px] text-textsec">cm</span>
            </div>
          </Field>
          {letterOversize && (
            <div className="text-[13px] px-3 py-2.5 flex items-start gap-2 bg-[#fdeceb] text-warnred border border-warnred/40">
              <Info size={15} className="flex-shrink-0 mt-0.5" />
              <span>{t('konfig3.oversizeWarn', { max: KONFIG_LIMITS.quoteHeight })}</span>
            </div>
          )}
          {/* Untergrenze: Fläche erzwingt Buchstaben < 10 cm → produktionsunmöglich, Warnbox + Warenkorb gesperrt */}
          {areaTooSmall && (
            <div className="text-[13px] px-3 py-2.5 flex items-start gap-2 bg-[#fdeceb] text-warnred border border-warnred/40">
              <Info size={15} className="flex-shrink-0 mt-0.5" />
              <span>{t('konfig3.undersizeWarn', { min: KONFIG_LIMITS.minHeight })}</span>
            </div>
          )}
          <div className={`${box} px-4 py-3 flex flex-wrap items-center gap-x-5 gap-y-1 text-[13px]`}>
            <span className="inline-flex items-center gap-2"><Ruler size={15} className="text-accent" /> {t('konfig3.estWidth')}: <strong>{size ? `${size.widthCm} cm` : '—'}</strong></span>
            {depthRec && <span className="text-textsec">{t('konfig3.recDepth')} <strong className="text-charcoal">{depthRec}</strong></span>}
          </div>
          {assess && (
            <div className={`text-[13px] px-3 py-2.5 flex items-start gap-2 ${assess.status === 'good' ? 'bg-[#eaf6ee] text-[#1c7a45]' : assess.status === 'veryBig' ? 'bg-[#fdf3e6] text-[#9a6414]' : 'bg-[#fdeceb] text-warnred'}`}>
              <Info size={15} className="flex-shrink-0 mt-0.5" />
              <span>
                {assess.status === 'good' && t('konfig3.assessGood')}
                {assess.status === 'tooBig' && <>{t('konfig3.assessTooBigA')}<strong>{assess.recommendHeight} cm</strong>{t('konfig3.assessTooBigB')}</>}
                {assess.status === 'areaTooSmall' && t('konfig3.assessAreaTooSmall')}
                {assess.status === 'veryBig' && t('konfig3.assessVeryBig')}
                {assess.status === 'tinyLetters' && t('konfig3.assessTiny')}
              </span>
            </div>
          )}
        </section>

        {/* 3. Vektormaß */}
        <section className="flex flex-col gap-3">
          <Head n={3} icon={Ruler}>{t('konfig3.secVector')}</Head>
          <div className={`${box} px-4 py-5`}>
            {size ? <VectorMass text={sel.text.trim()} fontClass={FONT_CLASS[sel.fontId] || ''} fontFamily={sel.fontId === 'custom' ? `'${CUSTOM_FONT_FAMILY}', sans-serif` : undefined} widthCm={size.widthCm} heightCm={sel.heightCm} availWidth={sel.availWidth} availHeight={sel.availHeight} frameLabel={t('konfig3.availFrame')} color={letterColor}
              logo={logoDims ? { ...logoDims, shape: sel.logoShape, href: logoFile?.dataUrl || null, label: t('konfig3.rLogo') } : null}
              wallColor={sel.wallColor}
              lightDir={sel.lit === 'beleuchtet' ? sel.lightDir : null}
              glowColor={sel.lit === 'beleuchtet' && sel.lightDir ? (LIGHT_COLORS.find((c) => c.id === sel.lightColor)?.glow || '#ffe6b0') : null} />
              : <p className="m-0 text-[13px] text-textmut">{t('konfig3.vectorEmpty')}</p>}
            {/* Wandfarbe: Kunde kombiniert die Buchstaben mit seiner Fassaden-/Untergrundfarbe */}
            <div className="flex flex-wrap items-center gap-2 mt-3">
              <span className="text-[12px] font-bold text-textsec mr-1">{t('konfig3.wallColorLabel')}</span>
              {WALL_COLORS.map((c) => (
                <button key={c} onClick={() => set({ wallColor: c })} aria-label={c}
                  className={`w-8 h-8 border-2 cursor-pointer ${sel.wallColor === c ? 'border-accent' : 'border-inputline hover:border-accent'}`}
                  style={{ background: c }} />
              ))}
              <label className={`relative w-8 h-8 border-2 cursor-pointer overflow-hidden ${!WALL_COLORS.includes(sel.wallColor) ? 'border-accent' : 'border-inputline hover:border-accent'}`}
                title={t('konfig3.wallCustom')}
                style={{ background: 'conic-gradient(#f66 0 25%, #fd4 0 50%, #4d9 0 75%, #49f 0 100%)' }}>
                <input type="color" value={sel.wallColor} onChange={(e) => set({ wallColor: e.target.value })}
                  className="absolute inset-0 opacity-0 cursor-pointer w-full h-full" />
              </label>
            </div>
            <p className="m-0 text-[11px] text-textmut text-center mt-2">{t('konfig3.vectorNote')}</p>
          </div>
        </section>

        {/* 4. Tabellentyp */}
        <section className="flex flex-col gap-3">
          <Head n={4} icon={Lightbulb}>{t('konfig3.secType')}</Head>
          <div className="grid grid-cols-2 gap-3">
            {TABELLE_TYPES.map((ty) => (
              <ImgChoice key={ty.id} folder="light" img={ty.img} title={oL('type', ty)} sub={oS('type', ty)} alt={ty.alt} active={sel.lit === ty.id} onClick={() => set({ lit: ty.id })} />
            ))}
          </div>
        </section>

        {/* 5A. Beleuchtet → Lichtrichtung + Optionen */}
        {lit && (
          <section className="flex flex-col gap-5">
            <Head n="4A" icon={Sun}>{t('konfig3.secLightDir')}</Head>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              {LIGHT_DIRS.filter((d) => !uvActive || d.id === 'front' || d.id === 'front_seite').map((d) => (
                <ImgChoice key={d.id} folder="light" img={d.img} title={oL('lightDir', d)} sub={oS('lightDir', d)} alt={d.alt} active={sel.lightDir === d.id} onClick={() => set({ lightDir: d.id })} />
              ))}
            </div>

            {/* 4A1 Rückleuchtend */}
            {sel.lightDir === 'rueck' && (
              <div className="flex flex-col gap-4 border-l-2 border-accent/40 pl-4">
                <Field label={t('konfig3.fCorpus')}>
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                    {BODY_MAT_RUECK.map((m) => <ImgChoice key={m.id} folder="material" img={m.img} title={oLabel('bodyMat', m)} alt={m.alt} active={sel.bodyMaterial === m.id} onClick={() => set({ bodyMaterial: m.id })} />)}
                  </div>
                </Field>
                {RUECK_CHROM_IDS.includes(sel.bodyMaterial) && <ChromPicker sel={sel} set={set} />}
                {RUECK_LACK_IDS.includes(sel.bodyMaterial) && (
                  <Field label={t('konfig3.fRal')}>
                    <RalSelect value={sel.ralCode} onChange={(v) => set({ ralCode: v })} />
                  </Field>
                )}
                {RUECK_WAND_AKRYL_IDS.includes(sel.bodyMaterial) && (
                  <Field label={t('konfig3.fBackPanel')}>
                    <div className="grid grid-cols-2 gap-2 max-w-[360px]">
                      {BACK_PANELS.map((b) => <ChoiceBtn key={b.id} active={sel.backPanelSize === b.id} onClick={() => set({ backPanelSize: b.id })} title={b.label} />)}
                    </div>
                  </Field>
                )}
                <LightColor sel={sel} set={set} />
                <Field label={t('konfig3.fWandabstand')}>
                  <div className="grid grid-cols-3 gap-2">{WANDABSTAND.map((w) => <ChoiceBtn key={w.id} active={sel.wandabstand === w.id} onClick={() => set({ wandabstand: w.id })} title={w.label} sub={t(`konfig3.wandabstand.${w.id}`, null, w.desc)} />)}</div>
                </Field>
              </div>
            )}

            {/* 4A2 Frontleuchtend */}
            {sel.lightDir === 'front' && (
              <div className="flex flex-col gap-4 border-l-2 border-accent/40 pl-4">
                <AcrylPicker label={t('konfig3.fFaceAcryl')} value={sel.acrylFront} kontakt={sel.acrylFrontKontakt} onPick={(id) => set({ acrylFront: id })} onKontakt={(v) => set({ acrylFrontKontakt: v })} />
                <Field label={t('konfig3.fSideMaterial')}>
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">{SIDE_MAT_FRONT.map((m) => <ImgChoice key={m.id} folder="material" img={m.img} title={oLabel('sideMat', m)} alt={m.alt} active={sel.sideMaterial === m.id} onClick={() => set({ sideMaterial: m.id })} />)}</div>
                </Field>
                {CHROM_SIDE_IDS.includes(sel.sideMaterial) ? (
                  <ChromPicker sel={sel} set={set} />
                ) : (
                  <Field label={t('konfig3.fRal')}>
                    <RalSelect value={sel.ralCode} onChange={(v) => set({ ralCode: v })} />
                  </Field>
                )}
                <LightColor sel={sel} set={set} />
              </div>
            )}

            {/* 4A3 Front- und seitenleuchtend */}
            {sel.lightDir === 'front_seite' && (
              <div className="flex flex-col gap-4 border-l-2 border-accent/40 pl-4">
                <p className="m-0 text-[15px] font-extrabold text-charcoal">{t('konfig3.titleFrontSeite')}</p>
                <AcrylPicker label={t('konfig3.fFrontAcrylColor')} value={sel.acrylFront} kontakt={sel.acrylFrontKontakt} onPick={(id) => set({ acrylFront: id })} onKontakt={(v) => set({ acrylFrontKontakt: v })} />
                <AcrylPicker label={t('konfig3.fSideAcrylColor')} value={sel.acrylSide} kontakt={sel.acrylSideKontakt} onPick={(id) => set({ acrylSide: id })} onKontakt={(v) => set({ acrylSideKontakt: v })} />
                <LightColor sel={sel} set={set} />
                <p className="m-0 text-[12px] text-textsec flex items-center gap-1.5"><Info size={13} className="text-accent" /> {t('konfig3.infoFrontSeite')}</p>
              </div>
            )}

            {/* 4A4 Seitenleuchtend — Korpus immer Chrom, keine Front-Farbwahl */}
            {sel.lightDir === 'seite' && (
              <div className="flex flex-col gap-4 border-l-2 border-accent/40 pl-4">
                <p className="m-0 text-[15px] font-extrabold text-charcoal">{t('konfig3.titleSeite')}</p>
                <ChromPicker sel={sel} set={set} />
                <AcrylPicker label={t('konfig3.fSideAcrylLight')} value={sel.acrylSide} kontakt={sel.acrylSideKontakt} onPick={(id) => set({ acrylSide: id })} onKontakt={(v) => set({ acrylSideKontakt: v })} />
                <LightColor sel={sel} set={set} />
                <p className="m-0 text-[12px] text-textsec flex items-center gap-1.5"><Info size={13} className="text-accent" /> {t('konfig3.infoSeite')}</p>
              </div>
            )}
          </section>
        )}

        {/* 5B. Unbeleuchtet → Material */}
        {sel.lit === 'unbeleuchtet' && (
          <section className="flex flex-col gap-5">
            <Head n="4B" icon={Square}>{t('konfig3.secMaterial')}</Head>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              {UNBEL_MAT.filter((m) => !uvActive || m.id === 'plexi').map((m) => <ImgChoice key={m.id} folder="material" img={m.img} title={oL('unbelMat', m)} sub={oD('unbelMat', m)} alt={m.alt} active={sel.unbelMaterial === m.id} onClick={() => set({ unbelMaterial: m.id })} />)}
            </div>
            {sel.unbelMaterial === 'alu_lackiert' && (
              <div className="flex flex-col gap-4 border-l-2 border-accent/40 pl-4">
                <Field label={t('konfig3.fRal')}><RalSelect value={sel.unbelRal} onChange={(v) => set({ unbelRal: v })} /></Field>
                <Field label={t('konfig3.fSurface')}><div className="grid grid-cols-2 gap-2 max-w-[360px]">{SURFACES.map((s) => <ChoiceBtn key={s.id} active={sel.surface === s.id} onClick={() => set({ surface: s.id })} title={oL('surface', s)} sub={oD('surface', s)} />)}</div></Field>
                <Field label={t('konfig3.fDepth')}><div className="grid grid-cols-4 gap-2 max-w-[360px]">{DEPTHS.map((d) => <ChoiceBtn key={d.id} active={sel.depth === d.id} onClick={() => set({ depth: d.id })} title={d.label} />)}</div></Field>
              </div>
            )}
            {sel.unbelMaterial === 'strafor' && (
              <div className="flex flex-col gap-4 border-l-2 border-accent/40 pl-4">
                <Field label={t('konfig3.fRal')}><RalSelect value={sel.unbelRal} onChange={(v) => set({ unbelRal: v })} /></Field>
              </div>
            )}
            {sel.unbelMaterial === 'edelstahl_chrom' && (
              <div className="flex flex-col gap-4 border-l-2 border-accent/40 pl-4">
                {/* Unbeleuchteter Edelstahl/Chrom: keine RAL-Lackierung (noRal) */}
                <ChromPicker sel={sel} set={set} noRal />
              </div>
            )}
            {sel.unbelMaterial === 'plexi' && (
              <div className="flex flex-col gap-4 border-l-2 border-accent/40 pl-4">
                <AcrylPicker label={t('konfig3.fAcrylColor')} value={sel.unbelAcryl} kontakt={sel.unbelAcrylKontakt} onPick={(id) => set({ unbelAcryl: id })} onKontakt={(v) => set({ unbelAcrylKontakt: v })} />
              </div>
            )}
          </section>
        )}

        {/* 5C. UV Baskı (HARF) — ışık/malzeme seçiminden SONRA: frontAcrylic burada kesinleşir,
            yalnız harfin ön yüzü akrilikse gösterilir. Logo/çubuk UV'si kendi kutularında
            (harf malzemesinden bağımsız). */}
        {frontAcrylic && sel.text.trim() && (
          <section className="flex flex-col gap-3">
            <Head n="4C" icon={Sparkles}>{t('konfig3.uvBaskiLabel')}</Head>
            <p className="m-0 text-[13px] text-textmut">{t('konfig3.uvBaskiHint')}</p>
            <div className="flex flex-col gap-2">
              <label className={`flex items-center gap-3 px-4 py-3 bg-white border-2 cursor-pointer text-[15px] ${sel.uvBaski ? 'border-accent bg-accent/5' : 'border-linegray'}`}>
                <input type="checkbox" checked={sel.uvBaski === true} onChange={(e) => set({ uvBaski: e.target.checked })} className="w-4 h-4 accent-accent" />
                <span className="font-semibold text-charcoal">{t('konfig3.uvHarf')}</span>
              </label>
            </div>
          </section>
        )}

        {/* 5. Logo (optional) — Datei + Wunschmaß, fließt in den Preis ein */}
        <section className="flex flex-col gap-4">
          <Head n={5} icon={ImageIcon}>{t('konfig3.secLogo')}</Head>
          {/* Logo türü seçici (3D/UV) KALDIRILDI (Murat) — logo hep 3D kutu. UV Baskı,
              harf gibi ayrı bir kutucuk olarak logo detaylarının İÇİNDE (kutuda gizli). */}
          {!logoOpen && (
            <button onClick={() => setLogoOpen(true)} className="flex items-center justify-center gap-2 px-4 py-3.5 text-[15px] font-semibold border-2 border-dashed border-inputline text-charcoal hover:border-accent cursor-pointer bg-white">
              <ImageIcon size={16} className="text-accent" /> {t('konfig3.logoAdd')}
            </button>
          )}
          {logoOpen && (
          <div className={`${box} px-4 py-4 flex flex-col gap-3`}>
            <p className="m-0 text-[13px] text-textsec">{t('konfig3.logoIntro')}</p>
            <label className={`flex items-center justify-center gap-2 px-3 py-3 text-[13px] font-bold border-2 border-dashed cursor-pointer ${logoFile ? 'border-accent bg-accent/5 text-charcoal' : 'border-inputline bg-white text-charcoal hover:border-accent'}`}>
              <Upload size={15} className="text-accent flex-shrink-0" />
              {logoBusy ? t('konfig3.logoBusy') : logoFile ? `✓ ${logoFile.name}` : t('konfig3.logoBtn')}
              <input type="file" accept=".svg,.pdf,.ai,.eps,.png,.jpg,.jpeg" className="hidden"
                onChange={(e) => { onLogoFile(e.target.files && e.target.files[0]); e.target.value = ''; }} />
            </label>
            {logoErr && <span className="text-[12px] text-warnred font-semibold">{t('konfig3.logoErr')}</span>}
            {logoFile && (
              <div className="flex items-center gap-3">
                {logoFile.dataUrl && <img src={logoFile.dataUrl} alt={logoFile.name} className="w-20 h-20 object-contain border border-linegray bg-sectionlight p-1 flex-shrink-0" />}
                <button onClick={removeLogo} className="text-[12px] font-semibold text-warnred underline cursor-pointer bg-transparent border-0">{t('konfig3.logoRemove')}</button>
              </div>
            )}
            {logoFile && !logoFile.url && <span className="text-[12px] text-textmut">{t('konfig3.logoMailHint')}</span>}
            {/* Maß-Art: Rechteck (B × H) oder Rund (Ø) — Preis & Vorschau folgen dem gewählten Maß */}
            <div className="flex flex-wrap gap-2">
              {[['rect', 'logoShapeRect'], ['circle', 'logoShapeCircle']].map(([id, key]) => (
                <button key={id} onClick={() => set({ logoShape: id })}
                  className={`px-3 py-2 text-[13px] font-bold border-2 cursor-pointer ${sel.logoShape === id ? 'border-accent bg-accent/5 text-charcoal' : 'border-inputline bg-white text-textsec hover:border-accent'}`}>
                  {t(`konfig3.${key}`)}
                </button>
              ))}
            </div>
            <div className="flex flex-wrap items-end gap-3">
              {logoCircle ? (
                <label className="flex flex-col gap-1.5 text-[13px] font-semibold text-textsec">{t('konfig3.logoDia')}
                  <input type="number" min={LOGO_LIMITS.minCm} max={LOGO_LIMITS.maxHeight} inputMode="numeric" placeholder={t('konfig3.logoDiaPh')} value={sel.logoDiameterCm} onChange={(e) => set({ logoDiameterCm: e.target.value === '' ? '' : Math.max(0, Number(e.target.value)) })} className={inputCls + ' w-[150px]'} /></label>
              ) : (
                <>
                  <label className="flex flex-col gap-1.5 text-[13px] font-semibold text-textsec">{t('konfig3.logoW')}
                    <input type="number" min={LOGO_LIMITS.minCm} max={LOGO_LIMITS.maxWidth} inputMode="numeric" placeholder={t('konfig3.logoWPh')} value={sel.logoWidthCm} onChange={(e) => set({ logoWidthCm: e.target.value === '' ? '' : Math.max(0, Number(e.target.value)) })} className={inputCls + ' w-[150px]'} /></label>
                  <label className="flex flex-col gap-1.5 text-[13px] font-semibold text-textsec">{t('konfig3.logoH')}
                    <input type="number" min={LOGO_LIMITS.minCm} max={LOGO_LIMITS.maxHeight} inputMode="numeric" placeholder={t('konfig3.logoHPh')} value={sel.logoHeightCm} onChange={(e) => set({ logoHeightCm: e.target.value === '' ? '' : Math.max(0, Number(e.target.value)) })} className={inputCls + ' w-[150px]'} /></label>
                </>
              )}
            </div>
            {logoInvalid && (
              <span className="text-[13px] text-warnred">{logoCircle
                ? t('konfig3.logoInvalidDia', { min: LOGO_LIMITS.minCm, maxH: LOGO_LIMITS.maxHeight })
                : t('konfig3.logoInvalid', { min: LOGO_LIMITS.minCm, maxW: LOGO_LIMITS.maxWidth, maxH: LOGO_LIMITS.maxHeight })}</span>
            )}
            {logoNeedSize && (
              <span className="text-[13px] text-textsec flex items-center gap-1.5"><Info size={14} className="text-accent flex-shrink-0" /> {t('konfig3.logoNeedSize')}</span>
            )}
            {logoDims && price?.logo && (
              <span className="text-[13px] font-semibold text-charcoal">{t('konfig3.logoPriceNote', { price: fmtEur(price.logo.total), h: logoDims.heightCm })}</span>
            )}
            {logoDims && !price && (
              <span className="text-[13px] text-textsec">{t('konfig3.logoEqNote')}</span>
            )}
            {/* Logo UV baskı — harf malzemesinden BAĞIMSIZ (logo kendi akrilik ön yüzüne baskı);
                logo bölümü açıksa her zaman görünür. */}
            <label className={`flex items-center gap-3 px-4 py-3 bg-white border-2 cursor-pointer text-[15px] ${sel.logoUv ? 'border-accent bg-accent/5' : 'border-linegray'}`}>
              <input type="checkbox" checked={sel.logoUv === true} onChange={(e) => set({ logoUv: e.target.checked })} className="w-4 h-4 accent-accent" />
              <span className="font-semibold text-charcoal">{t('konfig3.uvLogo')}</span>
            </label>
            {/* Logoyu ayrı ürün olarak sepete ekle — bölümün kendi butonu (Murat). */}
            {hasLogoPart && (
              <button onClick={addLogoPart} className="flex items-center justify-center gap-2 text-[15px] font-semibold px-5 py-3 border-2 border-accent text-accent hover:bg-accent hover:text-white cursor-pointer">
                <ShoppingBag size={16} /> {t('konfig3.addLogoBtn')}
              </button>
            )}
            <button onClick={() => { setLogoOpen(false); removeLogo(); set({ logoWidthCm: '', logoHeightCm: '', logoDiameterCm: '', logoUv: false }); }} className="self-start text-[12px] font-semibold text-textmut hover:text-warnred underline cursor-pointer bg-transparent border-0">{t('konfig3.logoClose')}</button>
          </div>
          )}
          {/* Çubuk LED — logonun altında, ayrı açılır bölüm (madde 2): toplam ölçü → 150 cm parçalar */}
          {!cubukOpen && (
            <button onClick={() => setCubukOpen(true)} className="flex items-center justify-center gap-2 px-4 py-3.5 text-[15px] font-semibold border-2 border-dashed border-inputline text-charcoal hover:border-accent cursor-pointer bg-white">
              <Lightbulb size={16} className="text-accent" /> {t('konfig3.cubukAdd')}
            </button>
          )}
          {cubukOpen && (
          <div className={`${box} px-4 py-4 flex flex-col gap-3`}>
            <span className="text-[14px] font-extrabold text-charcoal">{t('konfig3.cubukLedTitle')}</span>
            <div className="flex flex-wrap items-end gap-4">
              <label className="flex flex-col gap-1.5 text-[13px] font-semibold text-textsec">{t('konfig3.cubukLedLen')}
                <input type="number" min={1} inputMode="numeric" placeholder={t('konfig3.cubukLedLenPh')} value={sel.cubukLedCm}
                  onChange={(e) => set({ cubukLedCm: e.target.value === '' ? '' : Math.max(0, Number(e.target.value)) })} className={inputCls + ' w-[150px]'} /></label>
              <label className="flex flex-col gap-1.5 text-[13px] font-semibold text-textsec">{t('konfig3.cubukLedH')}
                <input type="number" min={CUBUK_LED_LIMITS.minHeight} inputMode="numeric" placeholder={t('konfig3.cubukLedHPh')} value={sel.cubukLedHeightCm}
                  onChange={(e) => set({ cubukLedHeightCm: e.target.value === '' ? '' : Math.max(0, Number(e.target.value)) })} className={inputCls + ' w-[150px]'} /></label>
              {ledCount > 0 && (
                <div className="flex flex-col gap-0.5 text-[13px] text-charcoal">
                  <span>{t('konfig3.cubukLedTotal')}: <strong>{ledTotal} cm</strong></span>
                  <span>{t('konfig3.cubukLedCount')}: <strong>{ledCount}</strong></span>
                  <span>{t('konfig3.cubukLedPieces')}: <strong>{ledPieces.map((p) => `${p} cm`).join(' + ')}</strong></span>
                  {cubukDims && price?.cubukLed && (
                    <span>{t('konfig3.phPrice')}: <strong className="text-accent">+{fmtEur(price.cubukLed.total)}</strong></span>
                  )}
                </div>
              )}
            </div>
            <span className="text-[12px] text-textsec flex items-start gap-1.5"><Info size={14} className="text-accent flex-shrink-0 mt-0.5" /> {t('konfig3.cubukLedMaxNote')}</span>
            {ledCount > 0 && ledTotal % LED_MAX !== 0 && (
              <span className="text-[12px] text-textmut">{t('konfig3.cubukLedRemainNote')}</span>
            )}
            {cubukInvalid && (
              <span className="text-[13px] text-warnred">{t('konfig3.cubukLedInvalid', { min: CUBUK_LED_LIMITS.minCm, maxLen: CUBUK_LED_LIMITS.maxLen, maxH: CUBUK_LED_LIMITS.maxHeight })}</span>
            )}
            {cubukNeedSize && (
              <span className="text-[13px] text-textsec flex items-center gap-1.5"><Info size={14} className="text-accent flex-shrink-0" /> {t('konfig3.cubukLedNeedSize')}</span>
            )}
            {/* Çubuk UV baskı — harf malzemesinden BAĞIMSIZ (çubuk kendi akrilik ön yüzüne baskı);
                çubuk bölümü açıksa her zaman görünür. */}
            <label className={`flex items-center gap-3 px-4 py-3 bg-white border-2 cursor-pointer text-[15px] ${sel.cubukUv ? 'border-accent bg-accent/5' : 'border-linegray'}`}>
              <input type="checkbox" checked={sel.cubukUv === true} onChange={(e) => set({ cubukUv: e.target.checked })} className="w-4 h-4 accent-accent" />
              <span className="font-semibold text-charcoal">{t('konfig3.uvCubuk')}</span>
            </label>
            {/* Çubuk LED'i ayrı ürün olarak sepete ekle — bölümün kendi butonu (Murat). */}
            {hasCubukPart && (
              <button onClick={addCubukPart} className="flex items-center justify-center gap-2 text-[15px] font-semibold px-5 py-3 border-2 border-accent text-accent hover:bg-accent hover:text-white cursor-pointer">
                <ShoppingBag size={16} /> {t('konfig3.addCubukBtn')}
              </button>
            )}
            <button onClick={() => { setCubukOpen(false); set({ cubukLedCm: '', cubukLedHeightCm: '', cubukUv: false }); }} className="self-start text-[12px] font-semibold text-textmut hover:text-warnred underline cursor-pointer bg-transparent border-0">{t('konfig3.cubukClose')}</button>
          </div>
          )}
        </section>

        {/* Montage */}
        {sel.lit && (
          <section className="flex flex-col gap-3">
            <Head n={6} icon={Ruler}>{t('konfig3.secMontage')}</Head>
            {KONFIG_MONTAGE.map((m) => (
              <label key={m.id} className="flex items-center gap-3 px-4 py-3 bg-white border border-linegray cursor-pointer text-[15px]">
                <input type="radio" name="montage3" checked={sel.montageId === m.id} onChange={() => set({ montageId: m.id })} className="w-4 h-4 accent-accent" />
                {oLabel('montage', m)} <span className={`ml-auto text-[12px] ${m.quote ? 'text-accent font-bold' : 'text-textmut'}`}>{m.quote ? t('konfig3.montageQuote') : m.price === 0 ? t('konfig3.inclusive') : '+' + fmtEur(m.price)}</span>
              </label>
            ))}
            {/* Montaj Delme Şablonu — bağımsız, admin-fiyatlı ek ürün (kutucuk) */}
            <label className={`flex items-center gap-3 px-4 py-3 bg-white border-2 cursor-pointer text-[15px] ${sel.bohrschablone ? 'border-accent bg-accent/5' : 'border-linegray'}`}>
              <input type="checkbox" checked={sel.bohrschablone === true} onChange={(e) => set({ bohrschablone: e.target.checked })} className="w-4 h-4 accent-accent" />
              <span className="flex flex-col">
                <span className="font-semibold text-charcoal">{t('konfig3.bohrschablone')}</span>
                <span className="text-[12px] text-textmut">{t('konfig3.bohrschabloneHint')}</span>
              </span>
              <span className="ml-auto text-[13px] font-bold text-charcoal whitespace-nowrap">{price?.bohrschablonePrice ? '+' + fmtEur(price.bohrschablonePrice) : '—'}</span>
            </label>
            {/* Montageuntergrund — belirgin başlık. Grundplatte/Profil = "Teklif İste"
                (Profi-Montage ile aynı renk/etiket); seçilebilir kalır, sepete eklenir,
                ödeme yerine otomatik teklif akışı devreye girer. */}
            <div className="flex flex-col gap-2 mt-2">
              <span className="text-[16px] font-extrabold text-charcoal">{t('konfig3.traegerQ')}</span>
              {TRAEGER_OPTIONS.map((id) => (
                <label key={id} className="flex items-center gap-3 px-4 py-3 bg-white border border-linegray cursor-pointer text-[15px]">
                  <input type="radio" name="traeger3" checked={(sel.traeger || 'wand') === id} onChange={() => set({ traeger: id })} className="w-4 h-4 accent-accent" />
                  {t(`konfig3.traeger.${id}`)}
                  {id !== 'wand' && <span className="ml-auto text-[12px] text-accent font-bold">{t('konfig3.montageQuote')}</span>}
                </label>
              ))}
            </div>
            {needsProjekt && (
              <div className="text-[13px] px-3 py-2.5 flex items-start gap-2 bg-[#fdf3e6] text-[#9a6414] border border-[#d9a441]/50">
                <Info size={15} className="flex-shrink-0 mt-0.5" />
                <span>{t('konfig3.traegerNote')}</span>
              </div>
            )}
            {/* Detaillierte Projektzeichnung — nur bei angebotspflichtiger Auswahl (Teklif İste),
                ganz unten in der Montage-Sektion. Datei wird an die Anfrage/Bestellung gehängt. */}
            {quoteOnly && (
              <div className={`${box} px-4 py-4 flex flex-col gap-3 mt-1`}>
                <span className="text-[14px] font-extrabold text-charcoal">{t('konfig3.zeichnungTitle')}</span>
                <p className="m-0 text-[13px] text-textsec">{t('konfig3.zeichnungHint')}</p>
                <label className={`flex items-center justify-center gap-2 px-3 py-3 text-[13px] font-bold border-2 border-dashed cursor-pointer ${projektFile ? 'border-accent bg-accent/5 text-charcoal' : 'border-inputline bg-white text-charcoal hover:border-accent'}`}>
                  <Upload size={15} className="text-accent flex-shrink-0" />
                  {projektBusy ? t('konfig3.zeichnungBusy') : projektFile ? `✓ ${projektFile.name}` : t('konfig3.zeichnungBtn')}
                  <input type="file" accept=".pdf,.png,.jpg,.jpeg,.svg,.ai,.eps,.dwg,.dxf,.zip" className="hidden"
                    onChange={(e) => { onProjektFile(e.target.files && e.target.files[0]); e.target.value = ''; }} />
                </label>
                {projektErr && <span className="text-[12px] text-warnred font-semibold">{t('konfig3.zeichnungErr')}</span>}
                {projektFile && (
                  <button onClick={removeProjekt} className="self-start text-[12px] font-semibold text-warnred underline cursor-pointer bg-transparent border-0">{t('konfig3.zeichnungRemove')}</button>
                )}
              </div>
            )}
          </section>
        )}

        {/* 7. Ergebnis */}
        <section className="flex flex-col gap-3">
          <Head n={7} icon={Check}>{t('konfig3.secResult')}</Head>

          {/* Je hinzugefügtem Produkt eine eigene Box: Detailzeilen + Buchstaben-Preistabelle
              + Summe. Nur BEREITS abgeschlossene Produkte (nicht das aktive) — siehe completedItems. */}
          {hydrated && completedItems.map((it, idx) => (
            <div key={it.key} className={`${box} p-5 flex flex-col gap-2`}>
              <div className="flex items-center justify-between gap-3">
                <span className="text-[15px] font-extrabold text-charcoal">{t('konfig3.productBoxLabel')} {idx + 1}: „{konfLabel(it.konfig) || it.name}"{it.qty > 1 ? ` ×${it.qty}` : ''}</span>
                <button onClick={() => removeItem(it.key)} className="text-[12px] font-semibold text-warnred underline cursor-pointer bg-transparent border-0 flex-shrink-0">{t('konfig3.removeProduct')}</button>
              </div>
              {it.viewRows?.length > 0 && (
                <dl className="flex flex-col gap-1.5 text-[13px] m-0">
                  {it.viewRows.map(([k, v]) => (
                    <div key={k} className="flex justify-between gap-3"><dt className="text-textmut flex-shrink-0">{k}</dt><dd className="m-0 font-semibold text-right text-charcoal">{v || '—'}</dd></div>
                  ))}
                </dl>
              )}
              {it.priceView?.letterRows?.length > 0 && <LetterPriceTable price={it.priceView} t={t} />}
              <div className="flex justify-between items-baseline font-extrabold text-lg pt-2 mt-1 border-t border-charcoal"><span>{t('konfig3.totalNet')}</span><span>{fmtEur((it.priceView?.total ?? it.unitPrice) * (it.qty || 1))}</span></div>
            </div>
          ))}

          <div className={`${box} p-5 flex flex-col gap-2`}>
            <dl className="flex flex-col gap-1.5 text-[13px] m-0">
              {rows.map(([k, v]) => (
                <div key={k} className="flex justify-between gap-3"><dt className="text-textmut flex-shrink-0">{k}</dt><dd className="m-0 font-semibold text-right text-charcoal">{v || '—'}</dd></div>
              ))}
            </dl>
            {/* Harf bazlı fiyat dökümü: Harf · Yükseklik · Fiyat + Logo/Trafo/Verpackung/Montage,
                Summe = Gesamtpreis (Server liefert die Zeilen; lokale Schätzung hat keine) */}
            {price?.letterRows?.length > 0 && <LetterPriceTable price={price} t={t} />}
            {price ? (
              <div className="flex justify-between items-baseline font-extrabold text-2xl pt-3 mt-1 border-t-2 border-charcoal"><span>{t('konfig3.totalNet')}</span><span>{fmtEur(price.total)}</span></div>
            ) : (
              <p className="m-0 text-[13px] text-warnred pt-2">{lit ? t('konfig3.choosePromptLit') : t('konfig3.choosePrompt')}</p>
            )}
            <span className="text-[12px] text-textmut">{t('konfig3.netNote')}</span>
            {needFlushConfirm && <p className="m-0 text-[13px] text-warnred font-semibold">{t('konfig3.flushRequired')}</p>}
            {configIncomplete && (
              <p className="m-0 text-[13px] text-warnred font-semibold">{needRalMissing ? t('konfig3.needRal') : t('konfig3.configIncomplete')}</p>
            )}
            {needsProjekt && (
              <p className="m-0 text-[13px] font-semibold text-[#9a6414]">{t('konfig3.traegerPriceNote')}</p>
            )}
            {partAdded && (
              <p className="m-0 text-[13px] font-semibold text-charcoal bg-accent/10 border border-accent/40 px-4 py-2.5">{t('konfig3.partAdded')}</p>
            )}
            {/* Aksiyon butonları — sabit 2×2 ızgara:
                [Harfleri sepete ekle | Teklif gönder] / [Yeniden yapılandır | PDF teklif oluştur].
                Logo/Çubuk kendi bölümlerinde "sepete ekle" butonuna sahip; "Hepsini" = Özet'teki "Sepete git". */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 mt-2">
              {hasHarfPart && (
                <button onClick={addHarf} disabled={!price || needFlushConfirm || areaTooSmall || configIncomplete} className="flex items-center justify-center gap-2 text-[15px] font-semibold px-5 py-3.5 border-2 border-accent text-accent hover:bg-accent hover:text-white cursor-pointer disabled:opacity-40">
                  <ShoppingBag size={16} /> {t('konfig3.addHarf')}
                </button>
              )}
              <Link href={inquiryHref} className="flex items-center justify-center gap-2 text-[15px] font-semibold px-5 py-3.5 border-2 border-accent text-accent hover:bg-accent hover:text-white"><MessageSquare size={16} /> {t('konfig3.inquiry')}</Link>
              <button onClick={reset} className="flex items-center justify-center gap-2 text-[15px] font-semibold px-5 py-3.5 border-2 border-inputline text-textsec hover:border-accent hover:text-accent cursor-pointer"><RotateCcw size={16} /> {t('konfig3.resetBtn')}</button>
              <button onClick={() => setBuyerOpen(true)} disabled={!price && cartCount === 0} className="flex items-center justify-center gap-2 text-[15px] font-semibold px-5 py-3.5 border-2 border-charcoal text-charcoal hover:bg-charcoal hover:text-white cursor-pointer disabled:opacity-40"><FileText size={16} /> {t('konfig3.pdf')}</button>
            </div>
          </div>
        </section>
      </div>

      {/* ── STICKY ZUSAMMENFASSUNG ── */}
      <aside className={`${box} p-5 flex flex-col gap-2.5 min-[1000px]:sticky min-[1000px]:top-5`}>
        <h2 className="m-0 text-[18px] font-extrabold">{t('konfig3.summary')}</h2>

        {/* Sepette ürün varken üstteki mevcut-yapılandırma özeti GİZLİ — panel yalnız
            sepet listesini gösterir (Murat kararı, seçenek B). Sepet boşken normal özet. */}
        {!(hydrated && cartCount > 0) && (
          <>
            {price ? (
              <>
                {/* Ürün | Fiyat dökümü (eski konfig-özellik listesi yerine — Murat) */}
                <div className="flex justify-between text-[11px] font-bold text-textmut uppercase tracking-wide pb-1.5 border-b border-linegray">
                  <span>{t('konfig3.colProduct')}</span><span>{t('konfig3.colPrice')}</span>
                </div>
                <dl className="flex flex-col gap-1.5 text-[13px] m-0">
                  {hasHarfPart && (
                    <div className="flex justify-between gap-3"><dt className="text-textsec">{t('konfig3.prodHarf')}</dt><dd className="m-0 font-semibold text-right text-charcoal tabular-nums">{fmtEur(harfPart)}</dd></div>
                  )}
                  {hasLogoPart && (
                    <div className="flex justify-between gap-3"><dt className="text-textsec">{t('konfig3.rLogo')}</dt><dd className="m-0 font-semibold text-right text-charcoal tabular-nums">{fmtEur(logoPart)}</dd></div>
                  )}
                  {hasCubukPart && (
                    <div className="flex justify-between gap-3"><dt className="text-textsec">{t('konfig3.cubukLedRow')}</dt><dd className="m-0 font-semibold text-right text-charcoal tabular-nums">{fmtEur(cubukPart)}</dd></div>
                  )}
                </dl>
                <div className="flex justify-between items-baseline font-extrabold text-xl pt-2.5 mt-1 border-t-2 border-charcoal"><span>{t('konfig3.netto')}</span><span>{fmtEur(price.total)}</span></div>
                <span className="text-[11px] text-textmut">{t('konfig3.plusVat')}</span>
                {needFlushConfirm && <span className="text-[11px] text-warnred font-semibold">{t('konfig3.flushRequired')}</span>}
                {configIncomplete && <span className="text-[11px] text-warnred font-semibold">{needRalMissing ? t('konfig3.needRal') : t('konfig3.configIncomplete')}</span>}
                <button onClick={addAllAndGo} disabled={!price || needFlushConfirm || areaTooSmall || configIncomplete} className="kh-glow-btn mt-1 flex items-center justify-center gap-2 text-[15px] font-semibold px-5 py-3.5 bg-accent text-white hover:brightness-90 cursor-pointer disabled:opacity-40 disabled:shadow-none"><ShoppingBag size={16} /> {t('konfig3.goToCart')}</button>
              </>
            ) : <p className="m-0 text-[12px] text-textmut">{t('konfig3.chooseForPrice')}</p>}
          </>
        )}

        {/* Mini-Warenkorb: bereits hinzugefügte Positionen (Yazı 1 · Preis …) + Summe +
            „Zum Warenkorb". Kunde bleibt auf der Seite und konfiguriert weitere Teile. */}
        {hydrated && cartCount > 0 && (
          <div className="flex flex-col gap-2">
            <span className="text-[13px] font-extrabold text-charcoal">{t('konfig3.inCartTitle')} ({cartCount})</span>
            <div className="flex flex-col gap-1 max-h-[260px] overflow-y-auto pr-1">
              {cartItems.map((it, idx) => (
                <div key={it.key} className="flex justify-between gap-3 text-[12px]">
                  <span className="text-textsec truncate">{idx + 1}. {konfLabel(it.konfig) || it.name}{it.qty > 1 ? ` ×${it.qty}` : ''}</span>
                  <span className="font-semibold text-charcoal whitespace-nowrap">{fmtEur(it.unitPrice * it.qty)}</span>
                </div>
              ))}
            </div>
            <div className="flex justify-between font-extrabold text-[15px] pt-2 border-t border-linegray">
              <span>{t('konfig3.cartSum')}</span><span>{fmtEur(cartNetSum)}</span>
            </div>
            <Link href="/warenkorb" className="mt-1 flex items-center justify-center gap-2 text-[15px] font-semibold px-5 py-3.5 border-2 border-accent text-accent hover:bg-accent hover:text-charcoal">
              <ShoppingBag size={16} /> {t('konfig3.goToCart')}
            </Link>
          </div>
        )}
      </aside>

      {/* ── EMPFÄNGERDATEN-MODAL (vor Angebotserstellung) ── */}
      {buyerOpen && (
        <div className="fixed inset-0 z-[100] bg-black/60 flex items-center justify-center p-4" onClick={() => setBuyerOpen(false)}>
          <div className={`${box} w-full max-w-[460px] p-6 flex flex-col gap-2.5 max-h-[90vh] overflow-y-auto`} onClick={(e) => e.stopPropagation()}>
            <h3 className="m-0 text-[17px] font-extrabold text-charcoal">{t('konfig3.buyerTitle')}</h3>
            <p className="m-0 text-[12px] text-textmut">{t('konfig3.buyerNote')}</p>
            <input type="text" value={buyer.firma} onChange={(e) => setB({ firma: e.target.value })} maxLength={120} placeholder={t('konfig3.buyerFirma')} className={inputCls + ' text-[14px]'} />
            <input type="text" value={buyer.name} onChange={(e) => setB({ name: e.target.value })} maxLength={120} placeholder={t('konfig3.buyerName') + ' *'} className={inputCls + ' text-[14px]'} />
            <input type="text" value={buyer.strasse} onChange={(e) => setB({ strasse: e.target.value })} maxLength={160} placeholder={t('konfig3.buyerStrasse')} className={inputCls + ' text-[14px]'} />
            <input type="text" value={buyer.plzOrt} onChange={(e) => setB({ plzOrt: e.target.value })} maxLength={120} placeholder={t('konfig3.buyerPlzOrt')} className={inputCls + ' text-[14px]'} />
            <input type="email" value={buyer.email} onChange={(e) => setB({ email: e.target.value })} maxLength={160} placeholder={t('konfig3.buyerEmail')} className={inputCls + ' text-[14px]'} />
            <input type="tel" value={buyer.telefon} onChange={(e) => setB({ telefon: e.target.value })} maxLength={40} placeholder={t('konfig3.buyerTelefon')} className={inputCls + ' text-[14px]'} />
            <div className="grid grid-cols-2 gap-2 mt-2">
              <button onClick={() => setBuyerOpen(false)} className="px-4 py-3 text-[14px] font-semibold border-2 border-inputline text-textsec hover:border-accent hover:text-accent cursor-pointer">{t('konfig3.buyerCancel')}</button>
              <button
                onClick={() => { try { localStorage.setItem('rs-angebot-buyer', JSON.stringify(buyer)); } catch {} setBuyerOpen(false); openPdf(); }}
                disabled={!buyer.name.trim()}
                className="flex items-center justify-center gap-2 px-4 py-3 text-[14px] font-semibold bg-accent text-white hover:brightness-90 cursor-pointer disabled:opacity-40">
                <FileText size={15} /> {t('konfig3.buyerCreate')}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
    </>
  );
}

function ChoiceBtn({ active, onClick, title, sub }) {
  return (
    <button onClick={onClick} className={`px-3 py-2.5 border-2 text-left cursor-pointer ${active ? 'border-accent bg-accent/5' : 'border-inputline hover:border-accent'}`}>
      <span className="block font-bold text-[13px]">{title}</span>
      {sub && <span className="block text-[10px] text-textmut">{sub}</span>}
    </button>
  );
}

function LightColor({ sel, set }) {
  const t = useT();
  return (
    <Field label={t('konfig3.fLedColor')}>
      <div className="flex flex-wrap gap-2">
        {LIGHT_COLORS.map((c) => (
          <button key={c.id} onClick={() => set({ lightColor: c.id })}
            className={`flex flex-col items-start gap-0.5 px-3.5 py-2 border-2 cursor-pointer ${sel.lightColor === c.id ? 'border-accent bg-accent/5' : 'border-inputline hover:border-accent'}`}>
            <span className="flex items-center gap-2 font-bold text-[14px]"><span className="w-3.5 h-3.5 rounded-full border border-black/15" style={{ background: c.glow }} />{t(`konfig3.lightColor.${c.id}.l`, null, c.label)} · {t(`konfig3.lightColor.${c.id}.k`, null, c.kelvin)}</span>
            <span className="text-[10px] text-textmut">{t(`konfig3.lightColor.${c.id}.tag`, null, c.tag)}</span>
          </button>
        ))}
      </div>
    </Field>
  );
}

// Acryl: Hauptfarben nebeneinander + unabhängige „Farbtöne — Kontakt"-Checkbox
function AcrylPicker({ label, value, kontakt, onPick, onKontakt }) {
  const t = useT();
  return (
    <Field label={label}>
      <div className="flex flex-wrap items-center gap-2">
        {ACRYL_COLORS.map((c) => (
          <Swatch key={c.id} c={c} label={t(`konfig3.acryl.${c.id}`, null, c.label)} active={value === c.id} onClick={() => onPick(c.id)} />
        ))}
      </div>
      <button onClick={() => onKontakt(!kontakt)}
        className={`self-start flex items-center gap-2 px-3 py-2 text-[13px] font-semibold border-2 cursor-pointer ${kontakt ? 'border-accent bg-accent/5' : 'border-inputline hover:border-accent'}`}>
        <span className={`w-4 h-4 border-2 flex items-center justify-center flex-shrink-0 ${kontakt ? 'border-accent bg-accent text-white' : 'border-inputline bg-white'}`}>{kontakt && <Check size={12} />}</span>
        {t('konfig3.acrylKontakt')}
      </button>
    </Field>
  );
}

// RAL-Auswahl: kuratierte Liste (gängigste Acrylfarben, KONFIG_RAL) statt Freitext.
// Eigenes Dropdown (kein natives <select>): jede Zeile trägt ihr Farbquadrat.
// Wert bleibt der RAL-Code-String (Preis/Order unverändert).
function RalSelect({ value, onChange }) {
  const t = useT();
  const [open, setOpen] = useState(false);
  const ref = useRef(null);
  useEffect(() => {
    if (!open) return;
    const close = (e) => { if (ref.current && !ref.current.contains(e.target)) setOpen(false); };
    const esc = (e) => { if (e.key === 'Escape') setOpen(false); };
    document.addEventListener('mousedown', close);
    document.addEventListener('keydown', esc);
    return () => { document.removeEventListener('mousedown', close); document.removeEventListener('keydown', esc); };
  }, [open]);
  const found = KONFIG_RAL.find((r) => r.code === value);
  return (
    <div ref={ref} className="relative w-full max-w-[320px]">
      <button type="button" onClick={() => setOpen((o) => !o)} aria-haspopup="listbox" aria-expanded={open}
        className={inputCls + ' flex items-center gap-2.5 cursor-pointer text-[14px] text-left'}>
        <span className="w-5 h-5 border border-black/25 flex-shrink-0" style={{ background: found ? found.hex : 'transparent' }} />
        <span className="flex-1 truncate">{found ? `${found.code} — ${found.label}` : t('konfig3.ralChoose')}</span>
        <ChevronDown size={15} className={`text-textmut flex-shrink-0 transition-transform ${open ? 'rotate-180' : ''}`} />
      </button>
      {open && (
        <div role="listbox" className="absolute z-30 left-0 right-0 top-full mt-1 max-h-[280px] overflow-y-auto bg-white border border-inputline shadow-dropdown">
          {KONFIG_RAL.map((r) => (
            <button key={r.code} type="button" role="option" aria-selected={value === r.code}
              onClick={() => { onChange(r.code); setOpen(false); }}
              className={`w-full flex items-center gap-2.5 px-3 py-2 text-[13px] text-left cursor-pointer border-0 text-charcoal ${value === r.code ? 'bg-accent/15 font-bold' : 'bg-transparent hover:bg-accent/5'}`}>
              <span className="w-5 h-5 border border-black/25 flex-shrink-0" style={{ background: r.hex }} />
              <span className="font-semibold">{r.code}</span>
              <span className="text-textsec truncate">{r.label}</span>
              {value === r.code && <Check size={14} className="ml-auto text-accent flex-shrink-0" />}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}

// Edelstahl/Chrom: Farbton (Gold/Silber/Kupfer/RAL) + Oberfläche (Glänzend/Gebürstet).
// noRal: unbeleuchteter Edelstahl/Chrom bietet KEINE RAL-Lackierung (17 Tem 2026).
function ChromPicker({ sel, set, noRal }) {
  const t = useT();
  return (
    <>
      <Field label={t('konfig3.fChromColor')}>
        <div className="flex flex-wrap items-center gap-2">
          {CHROM_COLORS.filter((c) => !(noRal && c.id === 'ral')).map((c) => (
            <Swatch key={c.id} c={c} label={t(`konfig3.chromColor.${c.id}`, null, c.label)} active={sel.chromColor === c.id} onClick={() => set({ chromColor: c.id })} />
          ))}
          {!noRal && sel.chromColor === 'ral' && (
            <RalSelect value={sel.ralCode} onChange={(v) => set({ ralCode: v })} />
          )}
        </div>
      </Field>
      <Field label={t('konfig3.fSurface')}>
        <div className="grid grid-cols-2 gap-2 max-w-[360px]">
          {CHROM_SURFACES.map((s) => (
            <ChoiceBtn key={s.id} active={sel.chromSurface === s.id} onClick={() => set({ chromSurface: s.id })} title={t(`konfig3.chromSurface.${s.id}`, null, s.label)} />
          ))}
        </div>
      </Field>
    </>
  );
}

// Zusammenfassungs-Zeilen als [Label, Wert] — via useT übersetzt
function summaryRows(sel, price, size, t) {
  const opt = (map, id) => (id ? t(`konfig3.${map}.${id}`, null, id) : undefined);       // flache Maps
  const optL = (map, id) => (id ? t(`konfig3.${map}.${id}.l`, null, id) : undefined);     // { l } verschachtelt
  // Fontname: i18n-Label, sonst Datenlisten-Label (neue Fonts sind Eigennamen); Kundenschrift mit Dateiname
  const fontDef = KONFIG_FONTS.find((f) => f.id === sel.fontId);
  const fontBase = sel.fontId ? t(`konfig3.font.${sel.fontId}`, null, fontDef?.label || sel.fontId) : undefined;
  const font = sel.fontId === 'custom' && sel.customFontName ? `${fontBase} (${sel.customFontName})` : fontBase;
  // Logo / Çubuk LED önce hesaplanır — harfsiz üründe (metin boş) başlık bunlardan gelir.
  const lgCircle = sel.logoShape === 'circle';
  const lg = normalizeLogo(lgCircle
    ? { widthCm: sel.logoDiameterCm, heightCm: sel.logoDiameterCm }
    : { widthCm: sel.logoWidthCm, heightCm: sel.logoHeightCm });
  const cl = normalizeCubukLed({ lengthCm: sel.cubukLedCm, heightCm: sel.cubukLedHeightCm });
  const hasText = !!sel.text?.trim();
  const titleVal = hasText ? sel.text.trim()
    : (lg && cl ? `${t('konfig3.rLogo')} + ${t('konfig3.cubukLedRow')}` : lg ? t('konfig3.rLogo') : cl ? t('konfig3.cubukLedRow') : '—');
  // Harfsiz üründe Font/Buchstabenmaß satırları atlanır (harf yok, alakasız).
  const rows = [[t('konfig3.rSchriftzug'), titleVal]];
  if (hasText) {
    rows.push([t('konfig3.rFont'), font]);
    rows.push([t('konfig3.rMasse'), size ? t('konfig3.sizeSummary', { w: size.widthCm, h: size.heightCm, n: sel.heightCm }) : t('konfig3.sizeHeightOnly', { n: sel.heightCm })]);
  }
  if (lg) rows.push([t('konfig3.rLogo'), `${sel.logoMode === 'uv' ? `${t('konfig3.logoModeUv')} · ` : ''}${lgCircle ? `Ø ${lg.heightCm}` : `${lg.widthCm} × ${lg.heightCm}`} cm${sel.logoName ? ` · ${sel.logoName}` : ''}`]);
  if (cl) rows.push([t('konfig3.cubukLedRow'), `${cl.lengthCm} × ${cl.heightCm} cm (${cubukLedPieces(cl.lengthCm).join(' + ')} cm)`]);
  rows.push([t('konfig3.rType'), sel.lit === 'beleuchtet' ? t('konfig3.typeBeleuchtet') : sel.lit === 'unbeleuchtet' ? t('konfig3.typeUnbeleuchtet') : '—']);
  // Gesamtfläche (falls eingegeben) und Schriftzug-Fläche getrennt ausweisen (fürs Angebot).
  const sqm = (w, h) => (Math.round((w * h) / 100) / 100).toFixed(2).replace('.', ',');
  const aw = Number(sel.availWidth) || 0;
  const ah = Number(sel.availHeight) || 0;
  if (aw > 0 && ah > 0) rows.push([t('konfig3.rAreaTotal'), `${aw} × ${ah} cm (${sqm(aw, ah)} m²)`]);
  if (size) rows.push([t('konfig3.rTextArea'), `${size.widthCm} × ${size.heightCm} cm (${sqm(size.widthCm, size.heightCm)} m²)`]);
  const ralOr = (v) => v || t('konfig3.ralByChoice');
  const acrylVal = (id, kontakt) => `${opt('acryl', id)}${kontakt ? ` · ${t('konfig3.acrylKontaktShort')}` : ''}`;
  const chromVal = () => `${sel.chromColor === 'ral' ? ralOr(sel.ralCode) : opt('chromColor', sel.chromColor)} · ${opt('chromSurface', sel.chromSurface)}`;
  if (sel.lit === 'beleuchtet') {
    rows.push([t('konfig3.rLightDir'), optL('lightDir', sel.lightDir)]);
    if (sel.lightDir === 'rueck') {
      rows.push([t('konfig3.rCorpus'), opt('bodyMat', sel.bodyMaterial)]);
      if (RUECK_CHROM_IDS.includes(sel.bodyMaterial)) rows.push([t('konfig3.rChromColor'), chromVal()]);
      if (RUECK_LACK_IDS.includes(sel.bodyMaterial)) rows.push([t('konfig3.rRal'), ralOr(sel.ralCode)]);
      rows.push([t('konfig3.rWandabstand'), `${sel.wandabstand} mm`]);
      if (RUECK_WAND_AKRYL_IDS.includes(sel.bodyMaterial)) rows.push([t('konfig3.rBackPanel'), `${sel.backPanelSize} mm`]);
    } else if (sel.lightDir === 'front') {
      rows.push([t('konfig3.rFrontAcryl'), acrylVal(sel.acrylFront, sel.acrylFrontKontakt)]);
      rows.push([t('konfig3.rSides'), `${opt('sideMat', sel.sideMaterial)} · ${CHROM_SIDE_IDS.includes(sel.sideMaterial) ? chromVal() : ralOr(sel.ralCode)}`]);
    } else if (sel.lightDir === 'front_seite') {
      rows.push([t('konfig3.rFrontAcryl'), acrylVal(sel.acrylFront, sel.acrylFrontKontakt)]);
      rows.push([t('konfig3.rSideAcryl'), acrylVal(sel.acrylSide, sel.acrylSideKontakt)]);
    } else if (sel.lightDir === 'seite') {
      rows.push([t('konfig3.rFront'), `${t('konfig3.chromFixed')} · ${chromVal()}`]);
      rows.push([t('konfig3.rSideAcryl'), acrylVal(sel.acrylSide, sel.acrylSideKontakt)]);
    }
    rows.push([t('konfig3.rLedColor'), optL('lightColor', sel.lightColor)]);
  } else if (sel.lit === 'unbeleuchtet') {
    rows.push([t('konfig3.rMaterial'), optL('unbelMat', sel.unbelMaterial)]);
    if (sel.unbelMaterial === 'alu_lackiert') {
      rows.push([t('konfig3.rRal'), ralOr(sel.unbelRal)]);
      rows.push([t('konfig3.rSurface'), optL('surface', sel.surface)]);
      rows.push([t('konfig3.rDepth'), `${sel.depth} mm`]);
    } else if (sel.unbelMaterial === 'strafor') {
      rows.push([t('konfig3.rRal'), ralOr(sel.unbelRal)]);
    } else if (sel.unbelMaterial === 'edelstahl_chrom') {
      rows.push([t('konfig3.rChromColor'), chromVal()]);
    } else if (sel.unbelMaterial === 'plexi') {
      rows.push([t('konfig3.rAcrylColor'), acrylVal(sel.unbelAcryl, sel.unbelAcrylKontakt)]);
    }
  }
  const moSel = KONFIG_MONTAGE.find((m) => m.id === (sel.montageId || 'selbst'));
  rows.push([t('konfig3.rMontage'), opt('montage', sel.montageId || 'selbst') + (moSel?.quote ? ` · ${t('konfig3.montageQuote')}` : '')]);
  if (sel.bohrschablone === true) {
    rows.push([t('konfig3.bohrschablone'), price?.bohrschablonePrice ? '+' + fmtEur(price.bohrschablonePrice) : '✓']);
  }
  // UV Baskı (yalnız önden akrilikte checkbox görünür → seçiliyse satır). Fiyat harflere gömülü.
  if (sel.uvBaski === true) rows.push([t('konfig3.rUvHarf'), '✓']);
  if (sel.logoUv === true) rows.push([t('konfig3.rUvLogo'), '✓']);
  if (sel.cubukUv === true) rows.push([t('konfig3.rUvCubuk'), '✓']);
  return rows;
}

// Harf bazlı fiyat dökümü — Server-Preiszeilen (Harf · Yükseklik · Fiyat) + Auftragspositionen.
// Zeilensumme + Positionen = Gesamtpreis (Mindestbestell-Aufschlag als eigene Zeile).
function LetterPriceTable({ price, t }) {
  const th = 'text-left text-[11px] uppercase tracking-wide text-textmut font-extrabold pb-1 border-b border-linegray';
  const td = 'py-1 border-b border-linegray/60 text-[13px]';
  const rowsSum = price.letterRows.reduce((a, r) => a + r.price, 0)
    + (price.logo ? price.logo.total : 0) + (price.cubukLed ? price.cubukLed.total : 0) + (price.netzteil || 0) + (price.ambalaj || 0) + (price.montage || 0) + (price.bohrschablone || 0);
  const minDiff = Math.round((price.total - rowsSum) * 100) / 100;
  return (
    <div className="border-t border-linegray pt-2">
      <table className="w-full border-collapse">
        <thead>
          <tr>
            <th className={th}>{t('konfig3.phLetter')}</th>
            <th className={th + ' text-right'}>{t('konfig3.phHeight')}</th>
            <th className={th + ' text-right'}>{t('konfig3.phPrice')}</th>
          </tr>
        </thead>
        <tbody>
          {price.letterRows.map((r, i) => (
            <tr key={i}>
              <td className={td + ' font-bold'}>{r.ch}</td>
              <td className={td + ' text-right text-textsec'}>{r.heightCm} cm</td>
              <td className={td + ' text-right font-semibold tabular-nums'}>{fmtEur(r.price)}</td>
            </tr>
          ))}
          {price.logo && (
            <tr><td className={td}>{t('konfig3.rLogo')}{price.logo.print === 'uv' ? ` · ${t('konfig3.logoModeUv')}` : ''}</td><td className={td + ' text-right text-textsec'}>{price.logo.widthCm}×{price.logo.heightCm} cm</td><td className={td + ' text-right font-semibold tabular-nums'}>{fmtEur(price.logo.total)}</td></tr>
          )}
          {price.cubukLed && (
            <tr><td className={td}>{t('konfig3.cubukLedRow')}</td><td className={td + ' text-right text-textsec'}>{price.cubukLed.lengthCm}×{price.cubukLed.heightCm} cm</td><td className={td + ' text-right font-semibold tabular-nums'}>{fmtEur(price.cubukLed.total)}</td></tr>
          )}
          {price.netzteil > 0 && (
            <tr><td className={td} colSpan={2}>{t('konfig3.rowTrafo')}</td><td className={td + ' text-right font-semibold tabular-nums'}>{fmtEur(price.netzteil)}</td></tr>
          )}
          {price.ambalaj > 0 && (
            <tr><td className={td} colSpan={2}>{t('konfig3.rowVerpackung')}</td><td className={td + ' text-right font-semibold tabular-nums'}>{fmtEur(price.ambalaj)}</td></tr>
          )}
          {price.montage > 0 && (
            <tr><td className={td} colSpan={2}>{t('konfig3.rMontage')}</td><td className={td + ' text-right font-semibold tabular-nums'}>{fmtEur(price.montage)}</td></tr>
          )}
          {price.bohrschablone > 0 && (
            <tr><td className={td} colSpan={2}>{t('konfig3.bohrschablone')}</td><td className={td + ' text-right font-semibold tabular-nums'}>{fmtEur(price.bohrschablone)}</td></tr>
          )}
          {minDiff > 0.009 && (
            <tr><td className={td} colSpan={2}>{t('konfig3.rowMin')}</td><td className={td + ' text-right font-semibold tabular-nums'}>{fmtEur(minDiff)}</td></tr>
          )}
        </tbody>
      </table>
    </div>
  );
}
