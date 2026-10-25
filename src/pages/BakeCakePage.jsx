import React, { useEffect, useState } from 'react';
import { useLocation } from 'react-router-dom';
import { Sparkles, Cake, ShoppingBag, RefreshCw, Flame, Cherry, MapPin } from 'lucide-react';
import { useCart } from '../context/CartContext';
import Cake3D from '../components/3d/Cake3D';
import api from '../services/api';

// ─── Topper options ─────────────────────────────────────────────────────────────
const TOPPER_OPTIONS = [
  { id: 'none', label: 'No Topper' },
  { id: 'doll_figurine', label: 'Doll / Figurine' },
  { id: 'bat_emblem', label: 'Bat Emblem Silhouette' },
  { id: 'edible_image_plaque', label: 'Edible Image Plaque' },
  { id: 'crown', label: 'Crown' },
  { id: 'stars_burst', label: 'Stars Burst' },
];

const normalizeTopperStyle = (style) => {
  const value = String(style || '').toLowerCase();
  if (value === 'none') return 'none';
  if (value.includes('bat') || value.includes('emblem')) return 'bat_emblem';
  if (value.includes('doll') || value.includes('figurine')) return 'doll_figurine';
  if (value.includes('crown')) return 'crown';
  if (value.includes('ribbon') || value.includes('bow')) return 'ribbon_bow';
  if (value.includes('image') || value.includes('plaque')) return 'edible_image_plaque';
  return 'stars_burst';
};

// ─── Build local spatial annotations before AI responds ─────────────────────────
const buildClientAnnotations = (themeName, tiers, topperType) => {
  return [
    {
      id: 'top_topper',
      position: [0, 0, 0],
      label: topperType === 'doll_figurine' ? 'Top Figurine / Doll Zone' : 'Top Decoration Zone',
      detail: `Place the ${themeName} theme topper here on the top tier.`,
    },
    {
      id: 'front_plaque',
      position: [0, 0, 0],
      label: 'Edible Print Photo Marker',
      detail: `Apply high-res edible rice paper print of ${themeName} character image here.`,
    },
    {
      id: 'tier_accent',
      position: [0, 0, 0],
      label: 'Tier Joint Accent Zone',
      detail: `Place ${themeName} ribbon or accent sugar work along the upper edge of the lower tier.`,
    },
  ];
};

// ─── Inspiration Presets ─────────────────────────────────────────────────────────
const INSPIRATION_PRESETS = [
  {
    name: '🤖 Doraemon Sky Adventure',
    prompt: 'I want a Doraemon theme cake.',
    tiers: 2,
    palette: { baseColor: '#1E90FF', frostingColor: '#FFFFFF', dripColor: '#1E90FF', accentColor: '#FFD700', standColor: '#FFF8DC' },
    topperType: 'doll_figurine',
    customText: 'Doraemon',
    textColor: '#1E90FF',
    bakeryName: 'Sweet Treats Studio',
    flavorProfile: 'Sky-blue vanilla chiffon with white chantilly, yellow-bell accents, and a Doraemon figurine stand.',
  },
  {
    name: '🍪 Mickey & Cookies Cream',
    prompt: 'Cookies and cream cake with Mickey Mouse theme, Oreo crumb and white Mickey Mouse message',
    tiers: 2,
    palette: { baseColor: '#27272A', frostingColor: '#FAF5FF', dripColor: '#FAF5FF', accentColor: '#DC2626', standColor: '#FAFAFA' },
    topperType: 'doll_figurine',
    customText: 'Mickey Mouse',
    textColor: '#FFFFFF',
    bakeryName: 'Sweet Treats Studio',
    flavorProfile: 'Dark cocoa Oreo crunch sponge layered with sweet chantilly cream and character ear toppers.',
  },
  {
    name: '👑 Royal Gold & Caramel',
    prompt: 'Royal Golden Caramel Anniversary Cake with golden luster dust',
    tiers: 3,
    palette: { baseColor: '#D97706', frostingColor: '#FEF3C7', dripColor: '#78350F', accentColor: '#FFD700', standColor: '#FAFAFA' },
    topperType: 'crown',
    customText: 'Happy Anniversary',
    textColor: '#FFFFFF',
    bakeryName: 'Sweet Treats Studio',
    flavorProfile: 'Belgian salted caramel sponge with gold leaf chantilly and praline crunch.',
  },
  {
    name: '🌸 Lavender Twilight',
    prompt: 'Lavender Bergamot Cloud Cake with lilac petals and pearls',
    tiers: 2,
    palette: { baseColor: '#C084FC', frostingColor: '#FAF5FF', dripColor: '#F472B6', accentColor: '#FDE047', standColor: '#FAFAFA' },
    topperType: 'stars_burst',
    customText: 'Happy Birthday',
    textColor: '#FFFFFF',
    bakeryName: 'Pastry Palace',
    flavorProfile: 'French lavender blossom chiffon infused with organic Ceylon bergamot essence.',
  },
  {
    name: '🍵 Kyoto Matcha Garden',
    prompt: 'Kyoto Uji Matcha Celebration Cake with white chocolate drizzle',
    tiers: 2,
    palette: { baseColor: '#86EFAC', frostingColor: '#F0FDF4', dripColor: '#15803D', accentColor: '#FDE047', standColor: '#FAFAFA' },
    topperType: 'ribbon_bow',
    customText: 'Congratulations',
    textColor: '#FFFFFF',
    bakeryName: 'Artisan Crust',
    flavorProfile: 'First-harvest Uji ceremonial matcha sponge with silky white chocolate ganache.',
  },
  {
    name: '🍫 Valrhona Dark Truffle',
    prompt: 'Decadent Valrhona 72% Dark Chocolate Fudge Cake with cocoa nibs',
    tiers: 3,
    palette: { baseColor: '#451A03', frostingColor: '#78350F', dripColor: '#1C1917', accentColor: '#F59E0B', standColor: '#FAFAFA' },
    topperType: 'none',
    customText: 'Sweet Indulgence',
    textColor: '#F59E0B',
    bakeryName: 'Sweet Treats Studio',
    flavorProfile: 'Single-origin 72% Valrhona dark chocolate fudge with roasted hazelnuts.',
  },
  {
    name: '🍓 Strawberry Velvet',
    prompt: 'Sakura Alpine Strawberry Shortcake with whipped rose cream',
    tiers: 2,
    palette: { baseColor: '#F472B6', frostingColor: '#FFF1F2', dripColor: '#F43F5E', accentColor: '#F59E0B', standColor: '#FAFAFA' },
    topperType: 'edible_image_plaque',
    customText: 'With Love',
    textColor: '#FFFFFF',
    bakeryName: 'Pastry Palace',
    flavorProfile: 'Alpine strawberry compote folded into whipped rose water chantilly cream.',
  },
];

// ─── Main Component ──────────────────────────────────────────────────────────────
const BakeCakePage = () => {
  const { addToCart, removeFromCart } = useCart();
  const location = useLocation();

  // Single reactive source of truth for every manual and AI-driven 3D value.
  const [cakeParams, setCakeParams] = useState({
    tiers: 2,
    topperStyle: 'none',
    baseColor: '#C084FC',
    frostingColor: '#FAF5FF',
    dripColor: '#F472B6',
    accentColor: '#FFD700',
    standColor: '#FAFAFA',
    hasCandles: true,
    hasCherries: false,
    hasBlueberries: false,
    hasSprinkles: true,
    plaqueText: 'Happy Birthday',
    textColor: '#FFFFFF',
    spatialAnnotations: buildClientAnnotations('Lavender Cloud Cake', 2, 'none'),
  });
  const { tiers, topperStyle: topperType, baseColor, frostingColor, dripColor, accentColor, standColor, hasCandles, hasCherries, hasBlueberries, hasSprinkles, plaqueText: customText, textColor, spatialAnnotations } = cakeParams;
  const palette = { baseColor, frostingColor, dripColor, accentColor, standColor };
  const toppings = { candles: hasCandles, cherries: hasCherries, berries: hasBlueberries, sprinkles: hasSprinkles };
  const updateCakeParams = (changes) => setCakeParams((current) => ({ ...current, ...changes }));
  const applyChatbotDesign = (suggested) => {
    const nextTiers = suggested.tiers || tiers;
    const nextTopper = suggested.topperStyle || suggested.topperType || topperType;
    updateCakeParams({
      tiers: nextTiers,
      topperStyle: nextTopper,
      ...(suggested.baseColor ? { baseColor: suggested.baseColor } : {}),
      ...(suggested.frostingColor ? { frostingColor: suggested.frostingColor } : {}),
      ...(suggested.dripColor ? { dripColor: suggested.dripColor } : {}),
      ...(suggested.accentColor ? { accentColor: suggested.accentColor } : {}),
      ...(suggested.plaqueText ? { plaqueText: suggested.plaqueText } : {}),
      spatialAnnotations: buildClientAnnotations(suggested.themeName || 'Suggested Theme', nextTiers, nextTopper),
    });
    setShowTopper(nextTopper !== 'none');
    if (suggested.themeName) {
      setAiConceptDetails((current) => ({ ...current, cakeName: suggested.themeName, themeName: suggested.themeName }));
    }
  };
  const [selectedBakery, setSelectedBakery] = useState('');
  const [partnerBakeries, setPartnerBakeries] = useState([]);

  useEffect(() => {
    let active = true;
    const loadPartnerBakeries = async () => {
      try {
        const response = await api.get('/bakeries');
        const bakeries = Array.isArray(response.data?.bakeries) ? response.data.bakeries : [];
        if (!active) return;
        setPartnerBakeries(bakeries);
        setSelectedBakery((current) => (
          bakeries.some((bakery) => bakery.name === current)
            ? current
            : bakeries[0]?.name || ''
        ));
      } catch (error) {
        if (active) setPartnerBakeries([]);
        console.warn('Unable to load partner bakeries:', error.message);
      }
    };
    loadPartnerBakeries();
    return () => {
      active = false;
    };
  }, []);

  // AI State
  const [aiPrompt, setAiPrompt] = useState('I want a Doraemon theme cake.');
  const [occasion] = useState('Birthday');
  const [aiLoading, setAiLoading] = useState(false);
  const [aiConceptDetails, setAiConceptDetails] = useState({
    cakeName: 'Lavender Cloud Signature Celebration Cake',
    themeName: 'Lavender Cloud Signature Celebration Cake',
    flavorProfile: 'Triple-whipped Madagascar vanilla bean chiffon with Provencal lavender essence.',
  });
  const [addedCustom, setAddedCustom] = useState(false);
  const [aiGeneratedPrice, setAiGeneratedPrice] = useState(null);
  const [aiNotice, setAiNotice] = useState('');
  const [showTopper, setShowTopper] = useState(false);
  const [editingCartItemId, setEditingCartItemId] = useState(null);

  useEffect(() => {
    const saved = location.state?.editCake;
    const config = saved?.cakeConfig || saved?.customCake3DParams;
    if (!config) return;
    setEditingCartItemId(saved.productId || saved._id);
    const toppingsConfig = config.toppings || {};
    setCakeParams((current) => ({
      ...current,
      tiers: config.tiers || current.tiers,
      topperStyle: config.topperStyle || config.topperType || current.topperStyle,
      baseColor: config.baseColor || config.palette?.baseColor || current.baseColor,
      frostingColor: config.frostingColor || config.palette?.frostingColor || current.frostingColor,
      dripColor: config.dripColor || config.palette?.dripColor || current.dripColor,
      accentColor: config.accentColor || config.palette?.accentColor || current.accentColor,
      hasCandles: toppingsConfig.candles ?? current.hasCandles,
      hasCherries: toppingsConfig.cherries ?? current.hasCherries,
      hasBlueberries: toppingsConfig.blueberries ?? toppingsConfig.berries ?? current.hasBlueberries,
      hasSprinkles: toppingsConfig.sprinkles ?? current.hasSprinkles,
      plaqueText: config.inscription || config.plaqueText || config.customText || current.plaqueText,
      textColor: config.inscriptionColor || config.textColor || current.textColor,
      spatialAnnotations: config.blueprintNotes || config.spatialAnnotations || current.spatialAnnotations,
    }));
    if (saved.bakeryName || config.bakeryName) setSelectedBakery(saved.bakeryName || config.bakeryName);
    setAiConceptDetails((current) => ({
      ...current,
      cakeName: saved.name || config.themeName || current.cakeName,
      themeName: config.themeName || saved.name || current.themeName,
    }));
  }, [location.state]);

  const basePriceINR = aiGeneratedPrice || (tiers === 1 ? 899 : tiers === 2 ? 1499 : 2299);

  const tierColorSwatches = [
    { name: 'Sky Blue', hex: '#1E90FF' },
    { name: 'Oreo Dark Charcoal', hex: '#27272A' },
    { name: 'Valrhona Cocoa', hex: '#451A03' },
    { name: 'Lavender Mist', hex: '#C084FC' },
    { name: 'Sakura Petal', hex: '#F472B6' },
    { name: 'Kyoto Matcha', hex: '#86EFAC' },
    { name: 'Velvet Vanilla', hex: '#FED7AA' },
    { name: 'Royal Gold', hex: '#D97706' },
  ];

  const dripColorSwatches = [
    { name: 'Yellow Bell', hex: '#FFD700' },
    { name: 'Chantilly Cream', hex: '#FAF5FF' },
    { name: 'Dark Ganache', hex: '#18181B' },
    { name: 'Salted Caramel', hex: '#D97706' },
    { name: 'Ruby Berry', hex: '#F43F5E' },
    { name: 'Golden Drizzle', hex: '#F59E0B' },
  ];

  // Apply preset — reads palette object (not flat tierColor)
  const applyPreset = (preset) => {
    setAiPrompt(preset.prompt);
    updateCakeParams({
      tiers: preset.tiers,
      topperStyle: preset.topperType || 'none',
      baseColor: preset.palette.baseColor,
      frostingColor: preset.palette.frostingColor,
      dripColor: preset.palette.dripColor,
      accentColor: preset.palette.accentColor,
      standColor: preset.palette.standColor,
      hasCandles: true,
      hasCherries: false,
      hasBlueberries: false,
      hasSprinkles: true,
      ...(preset.customText ? { plaqueText: preset.customText } : {}),
      ...(preset.textColor ? { textColor: preset.textColor } : {}),
      spatialAnnotations: buildClientAnnotations(preset.name, preset.tiers, preset.topperType || 'none'),
    });
    setShowTopper((preset.topperType || 'none') !== 'none');
    if (preset.bakeryName && partnerBakeries.some((bakery) => bakery.name === preset.bakeryName)) {
      setSelectedBakery(preset.bakeryName);
    }
    setAiConceptDetails({
      cakeName: preset.name,
      themeName: preset.name,
      flavorProfile: preset.flavorProfile,
      flavorNotes: preset.flavorProfile,
    });
  };

  // Instant keyword preview + AI API call
  const handleGenerateFromAi = async (e) => {
    e?.preventDefault();
    const query = aiPrompt.trim();
    if (!query || aiLoading) return;

    try {
      setAiLoading(true);
      setAiNotice('');
      const res = await api.post('/ai/cake-preview', { description: aiPrompt, occasion, tiers }, { timeout: 15000 });

      const generatedData = res.data.data || res.data.concept;
      if (res.data.success && generatedData) {
        const c = generatedData;

        // Apply tiers
        const generatedTiers = c.tiers || tiers;

        // Accept the dedicated flat 3D payload, while retaining legacy palette support.
        const generatedPalette = c.palette || c;
        updateCakeParams({
          baseColor: generatedPalette.baseColor || generatedPalette.tierColor || baseColor,
          frostingColor: generatedPalette.frostingColor || frostingColor,
          dripColor: generatedPalette.dripColor || dripColor,
          accentColor: generatedPalette.accentColor || accentColor,
          standColor: generatedPalette.standColor || standColor,
        });

        // Apply topper and spatial pins
        const generatedTopper = normalizeTopperStyle(c.topperStyle || c.topperType || topperType);
        if (Array.isArray(c.spatialAnnotations) && c.spatialAnnotations.length > 0) {
          updateCakeParams({ spatialAnnotations: c.spatialAnnotations });
        } else {
          updateCakeParams({ spatialAnnotations: buildClientAnnotations(c.themeName || c.cakeName || query, generatedTiers, generatedTopper) });
        }

        if (c.toppings) {
          updateCakeParams({
            hasCandles: c.toppings.candles !== false,
            hasCherries: Boolean(c.toppings.cherries),
            hasBlueberries: Boolean(c.toppings.berries),
            hasSprinkles: c.toppings.sprinkles !== false,
          });
        }
        if (Number.isFinite(Number(c.price))) setAiGeneratedPrice(Number(c.price));
        if (c.formulationNotes) {
          setAiConceptDetails((current) => ({ ...current, flavorNotes: c.formulationNotes, flavorProfile: c.formulationNotes }));
        }

        updateCakeParams({
          tiers: generatedTiers,
          ...(generatedTopper ? { topperStyle: generatedTopper } : {}),
          plaqueText: c.title || c.plaqueText || c.customText || query,
          ...(c.textColor ? { textColor: c.textColor } : {}),
        });
        setShowTopper(Boolean(generatedTopper && generatedTopper.toLowerCase() !== 'none'));
        if (c.bakeryName && partnerBakeries.some((bakery) => bakery.name === c.bakeryName)) {
          setSelectedBakery(c.bakeryName);
        }

        setAiConceptDetails({
          cakeName: c.title || c.themeName || c.cakeName || `Custom ${tiers}-Tier Cake`,
          themeName: c.title || c.themeName || c.cakeName,
          flavorProfile: c.flavorNotes || c.flavorProfile || '',
          flavorNotes: c.flavorNotes || c.flavorProfile || '',
          spatialAnnotations: c.spatialAnnotations,
          palette: c.palette,
          topperType: c.topperType,
          estimatedPriceINR: c.estimatedPriceINR,
        });
      }
    } catch (err) {
      const lowerQuery = query.toLowerCase();
      const localDesign = lowerQuery.includes('iron') || lowerQuery.includes('hero')
        ? {
          title: 'Iron Hero Celebration Cake',
          baseColor: '#DC2626',
          frostingColor: '#FACC15',
          dripColor: '#2563EB',
          accentColor: '#F59E0B',
          topperStyle: 'doll_figurine',
          formulationNotes: 'Red, gold, and blue superhero styling with a character figurine topper.',
        }
        : lowerQuery.includes('doraemon')
          ? {
            title: 'Doraemon Sky Adventure Cake',
            baseColor: '#1E90FF',
            frostingColor: '#FFFFFF',
            dripColor: '#1E90FF',
            accentColor: '#FFD700',
            topperStyle: 'doll_figurine',
            formulationNotes: 'Sky-blue vanilla cake with white frosting and a character topper.',
          }
          : {
            title: `${query.slice(0, 32)} Cake`,
            baseColor: baseColor,
            frostingColor,
            dripColor,
            accentColor,
            topperStyle: topperType,
            formulationNotes: 'Custom celebration cake with coordinated colors and decorative accents.',
          };
      const localTopper = normalizeTopperStyle(localDesign.topperStyle);
      updateCakeParams({
        tiers,
        baseColor: localDesign.baseColor,
        frostingColor: localDesign.frostingColor,
        dripColor: localDesign.dripColor,
        accentColor: localDesign.accentColor,
        topperStyle: localTopper,
        plaqueText: localDesign.title,
        spatialAnnotations: buildClientAnnotations(localDesign.title, tiers, localTopper),
      });
      setShowTopper(localTopper !== 'none');
      setAiGeneratedPrice(tiers === 1 ? 899 : tiers === 2 ? 1499 : 2299);
      setAiConceptDetails({
        cakeName: localDesign.title,
        themeName: localDesign.title,
        flavorProfile: localDesign.formulationNotes,
        flavorNotes: localDesign.formulationNotes,
      });
      setAiNotice('AI service unavailable; applied a local 3D design so you can continue customizing.');
      console.warn('AI structure generation fallback:', err.message);
    } finally {
      setAiLoading(false);
    }
  };

  // Save full customCake3DParams including spatialAnnotations to cart
  const handleAddToCart = async () => {
    if (!selectedBakery) {
      setAddedCustom(false);
      return;
    }
    const cakeConfig = {
      tiers,
      topperStyle: topperType,
      baseColor,
      dripColor,
      frostingColor,
      accentColor,
      toppings,
      inscription: customText,
      inscriptionColor: textColor,
      blueprintNotes: (spatialAnnotations || []).map((annotation) => ({
        label: annotation.label,
        detail: annotation.detail,
      })),
    };
    try {
      await addToCart({
      _id: 'custom-' + Date.now(),
      name: aiConceptDetails?.cakeName || `Custom ${tiers}-Tier 3D Celebration Cake`,
      category: 'Cakes',
      bakeryName: selectedBakery,
      price: basePriceINR,
      image: 'https://images.unsplash.com/photo-1535141192574-5d4897c13136?auto=format&fit=crop&w=800&q=80',
      description: `Custom ${tiers}-tier 3D cake: "${customText}". Baked by ${selectedBakery}.`,
      isCustom: true,
      is3DCake: true,
      cakeConfig,
      customCake3DParams: {
        ...cakeConfig,
        themeName: aiConceptDetails?.themeName || aiConceptDetails?.cakeName || `Custom ${tiers}-Tier 3D Cake`,
        tiers,
        palette,
        topperType,
        spatialAnnotations,
        plaqueText: customText,
        customText,
        toppings,
        bakeryName: selectedBakery,
        estimatedPriceINR: basePriceINR,
        flavorNotes: aiConceptDetails?.flavorNotes || aiConceptDetails?.flavorProfile || 'Madagascar vanilla bean sponge with organic fruit chantilly',
        flavorProfile: aiConceptDetails?.flavorProfile || aiConceptDetails?.flavorNotes || 'Madagascar vanilla bean sponge with organic fruit chantilly',
        // Legacy aliases for backward compat
        tierColor: palette.baseColor,
        frostingColor: palette.frostingColor,
        dripColor: palette.dripColor,
        textColor,
      },
      isEggless: true,
      inStock: true,
      }, 1);
      if (editingCartItemId) {
        await removeFromCart(editingCartItemId);
        setEditingCartItemId(null);
      }
      setAddedCustom(true);
      setTimeout(() => setAddedCustom(false), 2200);
    } catch (error) {
      setAddedCustom(false);
      console.error('Failed to add custom cake to cart:', error);
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-10">
      {/* Header */}
      <div className="text-center max-w-2xl mx-auto space-y-2">
        <span className="text-xs font-bold uppercase tracking-widest text-lavender-600 dark:text-lavender-400 bg-lavender-100 dark:bg-mocha-800 py-1 px-3 rounded-full">
          3D Interactive Pâtisserie Engine
        </span>
        <h1 className="font-display font-bold text-3xl sm:text-5xl text-berry-950 dark:text-mocha-50">
          Design Your 3D Custom Cake
        </h1>
        <p className="text-xs sm:text-sm text-berry-900/75 dark:text-mocha-300">
          Rotate, tilt, and customize every layer in procedural 3D. Prompt our AI to generate architectural color
          palettes, or craft your own dream tiers and send the blueprint to our master bakers.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        {/* Left: 3D Canvas */}
        <div className="lg:col-span-7 glass-card rounded-4xl p-4 sm:p-6 shadow-soft border border-lavender-200 dark:border-mocha-800 dark:bg-mocha-900/60 flex flex-col items-center justify-between min-h-[560px] relative overflow-hidden">
          <div className="w-full flex items-center justify-between px-2 pt-1 pb-3 border-b border-lavender-100 dark:border-mocha-800 z-10">
            <div>
              <span className="text-xs font-bold uppercase tracking-wider text-lavender-700 dark:text-mocha-400 block">
                Live 3D Canvas
              </span>
              <h3 className="font-display font-bold text-lg text-berry-950 dark:text-mocha-50">
                {aiConceptDetails?.cakeName || `${tiers}-Tier Celebration Cake`}
              </h3>
            </div>
            <div className="text-right">
              <span className="text-xs uppercase font-bold text-lavender-600 dark:text-lavender-400 block">Price</span>
              <span className="font-display font-bold text-2xl text-berry-950 dark:text-mocha-50">
                ₹{basePriceINR.toLocaleString('en-IN')}
              </span>
            </div>
          </div>

          {/* 3D Canvas — wired with palette, topperType, spatialAnnotations */}
          <div className="w-full h-[400px] sm:h-[440px] flex items-center justify-center relative">
            <Cake3D
                key={aiConceptDetails?.themeName || aiConceptDetails?.cakeName || aiPrompt}
              tiers={tiers}
              palette={palette}
              toppings={toppings}
              hasCandles={hasCandles}
              hasCherries={hasCherries}
              hasBerries={hasBlueberries}
              hasSprinkles={hasSprinkles}
              themeName={`${aiConceptDetails?.themeName || aiConceptDetails?.cakeName || ''} ${aiPrompt}`.trim()}
              customText={customText}
              textColor={textColor}
              topperType={showTopper ? topperType : 'none'}
              spatialAnnotations={spatialAnnotations}
              showSpatialGuides={true}
              interactive={true}
              autoRotate={false}
              className="w-full h-full"
            />
          </div>

          {/* Baker Blueprint Annotation Summary */}
          {spatialAnnotations.length > 0 && (
            <div className="w-full mt-3 p-3.5 rounded-2xl bg-white/80 dark:bg-mocha-900/80 backdrop-blur-md border border-lavender-200/80 dark:border-mocha-700/80 shadow-xs">
              <div className="flex items-center justify-between gap-2 mb-2 pb-2 border-b border-lavender-100 dark:border-mocha-800">
                <div className="flex items-center gap-1.5">
                  <MapPin className="w-3.5 h-3.5 text-lavender-600 dark:text-lavender-400" />
                  <span className="text-xs font-bold uppercase tracking-wider text-berry-950 dark:text-purple-200">
                    Baker Blueprint & Placement Notes
                  </span>
                </div>
                <span className="text-[11px] font-semibold text-lavender-700 dark:text-purple-300 bg-lavender-100 dark:bg-mocha-800 px-2.5 py-0.5 rounded-full">
                  {spatialAnnotations.length} {spatialAnnotations.length === 1 ? 'Guide' : 'Guides'}
                </span>
              </div>
              <div className="space-y-1.5">
                {spatialAnnotations.map((pin) => (
                  <div key={pin.id} className="flex items-start gap-2 p-2 rounded-xl bg-lavender-50/70 dark:bg-mocha-800/60 border border-lavender-100/70 dark:border-mocha-700/40 text-xs">
                    <span className="w-1.5 h-1.5 rounded-full bg-lavender-600 dark:bg-lavender-400 mt-1.5 shrink-0"></span>
                    <div className="leading-snug">
                      <strong className="font-semibold text-berry-950 dark:text-purple-100">{pin.label}:</strong>{' '}
                      <span className="text-berry-900/80 dark:text-purple-200/80">{pin.detail}</span>
                    </div>
                  </div>
                ))}
              </div>
              <label className="mt-2 flex items-center gap-2 text-xs text-berry-900 dark:text-mocha-200">
                <input
                  type="checkbox"
                  checked={showTopper}
                  onChange={(event) => setShowTopper(event.target.checked)}
                  className="accent-lavender-600"
                />
                Show topper on canvas
              </label>
            </div>
          )}

          <div className="w-full pt-2 flex flex-wrap items-center justify-between text-xs text-berry-900/70 dark:text-mocha-300 border-t border-lavender-100 dark:border-mocha-800">
            <span>🖱️ Drag to rotate & tilt • Scroll to zoom</span>
            <span className="font-medium text-lavender-700 dark:text-lavender-400">
              Bakery: <strong className="text-berry-950 dark:text-mocha-100">{selectedBakery}</strong>
            </span>
          </div>
        </div>

        {/* Right: AI Controls + Studio */}
        <div className="lg:col-span-5 space-y-6">
          {/* AI Prompt Card */}
          <form
            onSubmit={(e) => e.preventDefault()}
            className="glass-card rounded-3xl p-5 shadow-soft border border-lavender-200 dark:border-mocha-800 dark:bg-mocha-900/60 space-y-3.5"
          >
            <div className="flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-lavender-600 dark:text-lavender-400" />
              <h3 className="font-display font-bold text-sm text-berry-950 dark:text-mocha-50">
                AI 3D Parameter Generator
              </h3>
            </div>

            <div className="space-y-1">
              <span className="text-xs font-bold uppercase tracking-wider text-lavender-700 dark:text-mocha-400 block">
                Quick Inspiration Presets:
              </span>
              <div className="flex flex-wrap gap-1.5">
                {INSPIRATION_PRESETS.map((p) => (
                  <button
                    key={p.name}
                    type="button"
                    onClick={() => applyPreset(p)}
                    className="text-xs px-2.5 py-1 rounded-full bg-lavender-50 dark:bg-mocha-800 hover:bg-lavender-100 dark:hover:bg-mocha-700 text-berry-950 dark:text-mocha-100 font-medium border border-lavender-200 dark:border-mocha-700 transition"
                  >
                    {p.name}
                  </button>
                ))}
              </div>
            </div>

            <div className="space-y-1">
              <label className="text-xs font-bold text-berry-900 dark:text-mocha-200 block">
                Describe Your Cake Concept
              </label>
              <textarea
                rows={2}
                value={aiPrompt}
                onChange={(e) => setAiPrompt(e.target.value)}
                placeholder="e.g. Doraemon theme cake, Superhero Cake, Red Velvet Doll Cake"
                className="w-full text-xs sm:text-sm p-3 rounded-2xl border border-lavender-200 dark:border-mocha-800 bg-white dark:bg-mocha-950 text-berry-950 dark:text-mocha-50 focus:outline-none focus:ring-2 focus:ring-lavender-400 font-medium resize-none shadow-xs"
              />
              <button
                type="button"
                onClick={handleGenerateFromAi}
                disabled={aiLoading}
                className="w-full py-2.5 px-4 rounded-xl bg-gradient-to-r from-lavender-600 to-purple-600 hover:from-lavender-700 hover:to-purple-700 text-white font-semibold text-xs tracking-wide transition flex items-center justify-center gap-2 shadow-soft disabled:opacity-50 cursor-pointer"
              >
                {aiLoading ? (
                  <>
                    <RefreshCw className="w-4 h-4 animate-spin" />
                    <span>Formulating 3D Cake Blueprint...</span>
                  </>
                ) : (
                  <>
                    <Sparkles className="w-4 h-4" />
                    <span>Generate 3D Architectural Cake</span>
                  </>
                )}
              </button>
              {aiNotice && (
                <p className="text-xs font-semibold text-amber-700 dark:text-amber-300">
                  {aiNotice}
                </p>
              )}
            </div>

            {aiConceptDetails?.flavorProfile && (
              <div className="p-2.5 rounded-xl bg-lavender-50 dark:bg-mocha-800/80 border border-lavender-100 dark:border-mocha-700 text-xs text-berry-900/80 dark:text-mocha-200 space-y-0.5 animate-pop-in">
                <span className="font-bold text-lavender-800 dark:text-lavender-300 block">Chef Baker's Formulation:</span>
                <p className="italic">{aiConceptDetails.flavorProfile}</p>
              </div>
            )}
          </form>

          {/* Studio Controls */}
          <div className="glass-card rounded-3xl p-5 shadow-soft border border-lavender-200 dark:border-mocha-800 dark:bg-mocha-900/60 space-y-5">
            <h3 className="font-display font-bold text-sm text-berry-950 dark:text-mocha-50 pb-2 border-b border-lavender-100 dark:border-mocha-800 flex items-center gap-2">
              <Cake className="w-4 h-4 text-lavender-600 dark:text-lavender-400" />
              <span>Studio Blueprint Controls</span>
            </h3>

            {/* Tiers */}
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-berry-900 dark:text-mocha-200 block">Number of Tiers</label>
              <div className="grid grid-cols-3 gap-2">
                {[1, 2, 3].map((t) => (
                  <button
                    key={t}
                    type="button"
                    onClick={() => {
                      updateCakeParams({
                        tiers: t,
                        spatialAnnotations: buildClientAnnotations(aiConceptDetails?.themeName || 'Theme', t, topperType),
                      });
                    }}
                    className={`py-2 px-3 rounded-xl font-display font-semibold text-xs transition ${tiers === t
                      ? 'bg-lavender-600 text-white shadow-soft scale-105'
                      : 'bg-white dark:bg-mocha-800 text-berry-900 dark:text-mocha-200 border border-lavender-200 dark:border-mocha-700 hover:bg-lavender-100 dark:hover:bg-mocha-700'
                      }`}
                  >
                    {t} {t === 1 ? 'Tier' : 'Tiers'}
                  </button>
                ))}
              </div>
            </div>

            {/* Topper Style */}
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-berry-900 dark:text-mocha-200 block">Cake Topper Style</label>
              <div className="grid grid-cols-2 gap-1.5">
                {TOPPER_OPTIONS.map((opt) => (
                  <button
                    key={opt.id}
                    type="button"
                    onClick={() => {
                      updateCakeParams({
                        topperStyle: opt.id,
                        spatialAnnotations: buildClientAnnotations(aiConceptDetails?.themeName || 'Theme', tiers, opt.id),
                      });
                      setShowTopper(opt.id !== 'none');
                    }}
                    className={`py-1.5 px-2.5 rounded-xl text-xs font-semibold transition border ${topperType === opt.id
                      ? 'bg-lavender-600 text-white border-lavender-600 shadow-xs'
                      : 'bg-white dark:bg-mocha-800 text-berry-900 dark:text-mocha-200 border-lavender-200 dark:border-mocha-700 hover:bg-lavender-50'
                      }`}
                  >
                    {opt.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Partner Bakery */}
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-berry-900 dark:text-mocha-200 block">Bake at Partner Bakery</label>
              <select
                value={selectedBakery}
                onChange={(e) => setSelectedBakery(e.target.value)}
                className="w-full text-xs py-2 px-3 rounded-xl border border-lavender-200 dark:border-mocha-800 bg-white dark:bg-mocha-950 text-berry-950 dark:text-mocha-50 focus:outline-none focus:ring-2 focus:ring-lavender-400 font-medium"
              >
                {partnerBakeries.map((bakery) => (
                  <option key={bakery._id || bakery.name} value={bakery.name}>
                    {bakery.name}
                  </option>
                ))}
              </select>
            </div>

            {/* Tier Color */}
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-berry-900 dark:text-mocha-200 block">Cake Tier Base Color</label>
              <div className="flex items-center gap-2 flex-wrap">
                <input
                  type="color"
                  value={palette.baseColor}
                  onChange={(e) => updateCakeParams({ baseColor: e.target.value })}
                  className="w-8 h-8 rounded-full cursor-pointer border-0 bg-transparent"
                  title="Choose base sponge color"
                />
                {tierColorSwatches.map((c) => (
                  <button
                    key={c.hex}
                    type="button"
                    onClick={() => updateCakeParams({ baseColor: c.hex })}
                    className={`w-7 h-7 rounded-full border-2 transition-transform ${palette.baseColor === c.hex ? 'border-berry-950 dark:border-white scale-110 shadow-md' : 'border-white dark:border-mocha-700'
                      }`}
                    style={{ backgroundColor: c.hex }}
                    title={c.name}
                  />
                ))}
              </div>
            </div>

            {/* Drip Color */}
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-berry-900 dark:text-mocha-200 block">Frosting Drip Ring Color</label>
              <div className="flex items-center gap-2 flex-wrap">
                <input
                  type="color"
                  value={palette.dripColor}
                  onChange={(e) => updateCakeParams({ dripColor: e.target.value })}
                  className="w-8 h-8 rounded-full cursor-pointer border-0 bg-transparent"
                  title="Choose frosting drip color"
                />
                {dripColorSwatches.map((c) => (
                  <button
                    key={c.hex}
                    type="button"
                    onClick={() => updateCakeParams({ dripColor: c.hex })}
                    className={`w-7 h-7 rounded-full border-2 transition-transform ${palette.dripColor === c.hex ? 'border-berry-950 dark:border-white scale-110 shadow-md' : 'border-white dark:border-mocha-700'
                      }`}
                    style={{ backgroundColor: c.hex }}
                    title={c.name}
                  />
                ))}
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              {[
                ['frostingColor', 'Frosting Color'],
                ['accentColor', 'Accent Color'],
              ].map(([key, label]) => (
                <label key={key} className="flex items-center justify-between gap-2 text-xs font-bold text-berry-900 dark:text-mocha-200">
                  <span>{label}</span>
                  <input
                    type="color"
                    value={palette[key]}
                    onChange={(e) => updateCakeParams({ [key]: e.target.value })}
                    className="w-8 h-8 rounded-full cursor-pointer border-0 bg-transparent"
                    title={`Choose ${label.toLowerCase()}`}
                  />
                </label>
              ))}
            </div>

            {/* Toppings */}
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-berry-900 dark:text-mocha-200 block">Toppings & Decorations</label>
              <div className="grid grid-cols-2 gap-2 text-xs">
                {[
                  { key: 'candles', icon: <Flame className="w-3.5 h-3.5 text-amber-500" />, label: '3D Candles' },
                  { key: 'cherries', icon: <Cherry className="w-3.5 h-3.5 text-rose-500" />, label: '3D Cherries' },
                  { key: 'berries', icon: <span>🫐</span>, label: 'Blueberries' },
                  { key: 'sprinkles', icon: <span>✨</span>, label: 'Sprinkles' },
                ].map(({ key, icon, label }) => (
                  <button
                    key={key}
                    type="button"
                    onClick={() => updateCakeParams({
                      [key === 'candles' ? 'hasCandles' : key === 'cherries' ? 'hasCherries' : key === 'berries' ? 'hasBlueberries' : 'hasSprinkles']: !toppings[key],
                    })}
                    className={`p-2 rounded-xl border flex items-center justify-between font-semibold transition ${toppings[key]
                      ? 'bg-amber-50 dark:bg-amber-950/40 border-amber-300 dark:border-amber-700 text-amber-900 dark:text-amber-300 shadow-xs'
                      : 'bg-white dark:bg-mocha-800 border-lavender-200 dark:border-mocha-700 text-berry-900/60 dark:text-mocha-400'
                      }`}
                  >
                    <span className="flex items-center gap-1.5">{icon}<span>{label}</span></span>
                    <span>{toppings[key] ? 'ON' : 'OFF'}</span>
                  </button>
                ))}
              </div>
            </div>

            {/* Plaque inscription */}
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <label className="text-xs font-bold text-berry-900 dark:text-mocha-200 block">
                  3D Cake Plaque Inscription
                </label>
                <div className="flex items-center gap-1.5">
                  <span className="text-xs text-berry-900/60 dark:text-mocha-400 font-semibold">Text Color:</span>
                  {[
                    { name: 'Pure White', hex: '#FFFFFF' },
                    { name: 'Royal Gold', hex: '#FDE047' },
                    { name: 'Dark Cocoa', hex: '#18181B' },
                    { name: 'Ruby Red', hex: '#DC2626' },
                  ].map((tc) => (
                    <button
                      key={tc.hex}
                      type="button"
                      onClick={() => updateCakeParams({ textColor: tc.hex })}
                      className={`w-4 h-4 rounded-full border transition-all ${textColor === tc.hex
                        ? 'border-berry-950 dark:border-white scale-125 shadow-xs'
                        : 'border-lavender-300 dark:border-mocha-700'
                        }`}
                      style={{ backgroundColor: tc.hex }}
                      title={tc.name}
                    />
                  ))}
                </div>
              </div>
              <input
                type="text"
                value={customText}
                onChange={(e) => updateCakeParams({ plaqueText: e.target.value })}
                placeholder="e.g. Happy Birthday Doraemon!"
                className="w-full text-xs px-3 py-2 rounded-xl border border-lavender-200 dark:border-mocha-800 bg-white dark:bg-mocha-950 text-berry-950 dark:text-mocha-50 focus:outline-none focus:ring-2 focus:ring-lavender-400 font-medium"
              />
            </div>

            {/* Add to Cart */}
            <button
              type="button"
              onClick={handleAddToCart}
              className={`w-full py-3.5 px-6 rounded-2xl font-semibold text-sm flex items-center justify-center gap-2 shadow-soft transition-all ${addedCustom
                ? 'bg-emerald-600 text-white'
                : 'bg-gradient-to-r from-lavender-600 to-purple-600 hover:from-lavender-700 hover:to-purple-700 text-white shadow-md hover:shadow-lg'
                }`}
            >
              <ShoppingBag className="w-4 h-4" />
              <span>
                {addedCustom
                  ? 'Custom 3D Cake Added to Bag! 🧁'
                  : `Add Custom Cake to Cart (₹${basePriceINR.toLocaleString('en-IN')})`}
              </span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default BakeCakePage;
