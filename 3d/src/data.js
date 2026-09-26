// Game content tables — extracted verbatim from the classic build (../index.html).
// tools/check-data.mjs asserts these stay identical to the classic game's window.ALLIES/MONSTERS/ITEMS/RECIPES/LEVELS.
// Do not hand-edit gameplay numbers here without changing the classic build too.

export const ALLIES={
  floss_finch:{name:'Floss Finch',sprite:'floss_finch',role:'Healer',hp:48,atk:6,def:3,speed:1.15,range:150,kind:'heal'},
  geode_jay:{name:'Geode Jay',sprite:'geode_jay',role:'Ranged',hp:55,atk:11,def:5,speed:1.0,range:260,kind:'ranged'},
  chompgum:{name:'Chompgum',sprite:'chompgum',role:'Tank',hp:120,atk:14,def:12,speed:0.78,range:62,kind:'melee'},
  prickletreat:{name:'Prickletreat',sprite:'prickletreat',role:'Counter',hp:80,atk:9,def:9,speed:0.95,range:64,kind:'melee'},
  swirlbug:{name:'Swirlbug',sprite:'swirlbug',role:'Speed',hp:60,atk:7,def:6,speed:1.5,range:54,kind:'melee'},
  rock_turtle:{name:'Crystal Snapper',sprite:'rock_turtle',role:'Guardian',hp:130,atk:12,def:15,speed:0.7,range:60,kind:'melee'},
  corn_hog:{name:'Kernel Hog',sprite:'corn_hog',role:'Counter',hp:92,atk:11,def:11,speed:1.0,range:60,kind:'melee'},
  lico_snake:{name:'Twizzle Serpent',sprite:'lico_snake',role:'Striker',hp:78,atk:16,def:8,speed:1.25,range:64,kind:'melee'},
  choc_lizard:{name:'Choco Gecko',sprite:'choc_lizard',role:'Bruiser',hp:104,atk:17,def:12,speed:1.1,range:64,kind:'melee'},
  pepp_fish:{name:'Peppermint Fish',sprite:'pepp_fish',role:'Splasher',hp:96,atk:18,def:10,speed:1.3,range:210,kind:'ranged'},
  nerd_worm:{name:'Nerd Worm',sprite:'nerd_worm',role:'Wriggler',hp:104,atk:20,def:11,speed:1.3,range:64,kind:'melee'},
  cane_runner:{name:'Cane Roadrunner',sprite:'cane_runner',role:'Sprinter',hp:98,atk:22,def:10,speed:1.5,range:64,kind:'melee'},
};
export const MONSTERS={
  sour_gloop:{name:'Sour Gloop',sprite:'blob_sour',hp:34,atk:8,def:4,speed:0.62,range:46,kind:'melee',xp:14},
  licorice_lump:{name:'Licorice Lump',sprite:'blob_licorice',hp:60,atk:13,def:7,speed:0.56,range:48,kind:'melee',xp:24},
  taffy_swordsman:{name:'Taffy Swordsman',sprite:'sword',hp:70,atk:15,def:13,speed:0.8,range:60,kind:'melee',xp:30},
  gumguard_lancer:{name:'Gumguard Lancer',sprite:'spear',hp:62,atk:13,def:11,speed:0.74,range:96,kind:'melee',xp:28},
  sugar_archer:{name:'Sugar Archer',sprite:'bow',hp:46,atk:12,def:8,speed:0.78,range:300,kind:'ranged',xp:30},
  brittle_bolter:{name:'Brittle Bolter',sprite:'crossbow',hp:54,atk:16,def:9,speed:0.72,range:340,kind:'ranged',xp:34},
  hichew_captain:{name:'Hichew Captain',sprite:'boss',hp:340,atk:20,def:16,speed:0.62,range:78,kind:'melee',xp:200,boss:true},
  spike_gloop:{name:'Spike Gloop',sprite:'spike_blob',hp:52,atk:12,def:9,speed:0.6,range:48,kind:'melee',xp:24},
  rock_swordsman:{name:'Rock Candy Knight',sprite:'rock_sword',hp:82,atk:17,def:15,speed:0.8,range:62,kind:'melee',xp:34},
  crystal_widow:{name:'Crystal Widow',sprite:'rock_spider',hp:460,atk:23,def:18,speed:0.74,range:84,kind:'melee',xp:280,boss:true},
  corn_box:{name:'Kernel Cube',sprite:'corn_box',hp:64,atk:14,def:12,speed:0.5,range:300,kind:'ranged',xp:30,spike:true},
  corn_lizard:{name:'Corn Lasher',sprite:'corn_lizard',hp:96,atk:19,def:14,speed:0.82,range:104,kind:'melee',xp:40,spike:true},
  corn_king:{name:'Cornmaw the Colossal',sprite:'corn_boss',hp:560,atk:26,def:20,speed:0.72,range:120,kind:'melee',xp:360,boss:true,spike:true},
  evil_gumdrop:{name:'Evil Gumdrop',sprite:'evil_gum',hp:70,atk:15,def:11,speed:0.86,range:48,kind:'melee',xp:34},
  gumdrop_blob:{name:'Gumdrop Blob',sprite:'gum_blob',hp:120,atk:17,def:14,speed:0.5,range:50,kind:'melee',xp:44},
  gum_lord:{name:'Gumlord the Sticky',sprite:'gum_lord',hp:640,atk:29,def:22,speed:0.7,range:80,kind:'melee',xp:440,boss:true},
  vine_pillar:{name:'Vine Pillar',sprite:'pillar',hp:96,atk:18,def:16,speed:0.44,range:96,kind:'melee',xp:40},
  tail_smasher:{name:'Twizzle Basher',sprite:'tail_beast',hp:150,atk:21,def:15,speed:0.72,range:120,kind:'melee',xp:52},
  vine_king:{name:'Basher Rex',sprite:'tail_boss',hp:760,atk:33,def:24,speed:0.68,range:150,kind:'melee',xp:520,boss:true},
  choc_squirt:{name:'Cocoa Squirter',sprite:'choc_squirt',hp:130,atk:26,def:17,speed:0.56,range:330,kind:'ranged',xp:66,proj:'#6b4427'},
  choc_backblob:{name:'Fudgeback Blob',sprite:'choc_blob',hp:170,atk:28,def:20,speed:0.64,range:54,kind:'melee',xp:72},
  choc_boss:{name:'Fudge Colossus',sprite:'choc_boss',hp:1050,atk:40,def:27,speed:0.58,range:115,kind:'melee',xp:800,boss:true},
  pepp_lurker:{name:'Peppermint Lurker',sprite:'pepp_monster',hp:150,atk:30,def:19,speed:0.6,range:340,kind:'ranged',xp:78,proj:'#ff4d63'},
  pepp_swordsman:{name:'Peppermint Swordsman',sprite:'pepp_sword',hp:190,atk:33,def:22,speed:0.72,range:60,kind:'melee',xp:84},
  pepp_sea_boss:{name:'Peppermint Leviathan',sprite:'pepp_boss',hp:1250,atk:46,def:30,speed:0.6,range:130,kind:'melee',xp:950,boss:true},
  nerd_blob:{name:'Nerd Blob',sprite:'nerd_blob',hp:170,atk:33,def:21,speed:0.55,range:330,kind:'ranged',xp:86,proj:'#c77dff'},
  nerd_cluster:{name:'Nerds Gummy Cluster',sprite:'nerd_cluster',hp:220,atk:37,def:24,speed:0.95,range:62,kind:'melee',xp:94},
  nerd_king:{name:'Mega Nerds Cluster',sprite:'nerd_king',hp:1450,atk:52,def:33,speed:0.62,range:128,kind:'melee',xp:1150,boss:true},
  cane_brawler:{name:'Cane Brawler',sprite:'cane_brawler',hp:200,atk:38,def:24,speed:0.8,range:66,kind:'melee',xp:96},
  cane_strider:{name:'Cane Strider',sprite:'cane_strider',hp:235,atk:41,def:26,speed:0.92,range:70,kind:'melee',xp:104},
  cane_boss:{name:'Cane Colossus',sprite:'cane_boss',hp:1650,atk:56,def:36,speed:0.64,range:132,kind:'melee',xp:1350,boss:true},
  hichew_king:{name:'Hi-Chew King',sprite:'hichew_king',hp:2400,atk:62,def:40,speed:0.68,range:120,kind:'melee',xp:2500,boss:true},
};
export const ITEMS={
  cotton_candy:{name:'Cotton Candy',kind:'bait',rarity:'common',desc:'Sweet bait. Offer it to wild animals to win their trust and tame them.'},
  lollipop:{name:'Lollipop',kind:'bait',rarity:'common',desc:'Swirly forest lollipop. The favorite treat of Level 1 animals — offer it to tame them.'},
  rock_candy:{name:'Rock Candy',kind:'bait',rarity:'common',desc:'A stick of crystal sugar. Cave creatures can’t resist it — offer it to tame them.'},
  candy_corn:{name:'Candy Corn',kind:'bait',rarity:'common',desc:'Classic tri-color kernel. Mountain animals love it — offer it to tame them.'},
  gumdrop:{name:'Gumdrop',kind:'bait',rarity:'common',desc:'A glossy sugared gumdrop. Grove creatures adore it — offer it to tame them.'},
  licorice:{name:'Licorice Twist',kind:'bait',rarity:'common',desc:'A chewy licorice coil. Jungle creatures crave it — offer it to tame them.'},
  chocolate:{name:'Chocolate Bar',kind:'bait',rarity:'common',desc:'A rich square of chocolate. Forest lizards melt for it — offer it to tame them.'},
  peppermint:{name:'Peppermint Swirl',kind:'bait',rarity:'common',desc:'A cool red-and-white swirl. Ocean creatures surface for it — offer it to tame them.'},
  nerds:{name:'Nerds Box',kind:'bait',rarity:'common',desc:'A rattling box of tiny crunchy Nerds. Mine critters dig for it — offer it to tame them.'},
  cane_shard:{name:'Cane Shard',kind:'bait',rarity:'common',desc:'A sweet splinter of candy cane. Dune runners chase it — offer it to tame them.'},
  crystal:{name:'Sugar Crystal',kind:'currency',rarity:'rare',desc:'Glittering candy currency. Spend it… somewhere, eventually.'},
  mushroom:{name:'Mallow Shroom',kind:'ingredient',rarity:'common',desc:'A pillowy cooking ingredient.'},
  acorn:{name:'Choco Acorn',kind:'ingredient',rarity:'common',desc:'Crunchy chocolate seed. Cooking ingredient.'},
  glowberry:{name:'Glowberry',kind:'ingredient',rarity:'common',desc:'Faintly glowing berry. Cooking ingredient.'},
  alien_goo:{name:'Alien Goo',kind:'ingredient',rarity:'rare',desc:'Strange ooze from a gloop blob. Key crafting reagent.'},
  sugar_vest:{name:'Sugar Vest',kind:'armor',def:3,rarity:'common',desc:'Flimsy spun-sugar armor. +3 DEF.'},
  peppermint_plate:{name:'Peppermint Plate',kind:'armor',def:8,rarity:'rare',desc:'Hard candy breastplate. +8 DEF.'},
  cane_sword:{name:'Candy Cane Saber',kind:'weapon',atk:6,rarity:'common',desc:'A sharpened candy cane. +6 ATK.'},
  jawbreaker_mace:{name:'Jawbreaker Mace',kind:'weapon',atk:12,rarity:'epic',desc:'Absurdly heavy. +12 ATK.'},
  glow_gloop:{name:'Glowberry Gloop',kind:'food',effect:'atk',val:14,dur:30,rarity:'rare',desc:'Cooked alien food. +14 ATK for 30s.'},
  mallow_mend:{name:'Mallow Mend',kind:'food',effect:'heal',val:40,rarity:'common',desc:'Cooked alien food. Restores 40 HP.'},
  fizz_tonic:{name:'Fizz Tonic',kind:'food',effect:'speed',val:1,dur:20,rarity:'rare',desc:'Cooked alien food. +Speed for 20s.'},
  gummy_worm:{name:'Gummy Worm',kind:'ingredient',rarity:'common',desc:'Chewy multicolor worm. A stretchy crafting ingredient.'},
  honey:{name:'Nougat Honey',kind:'ingredient',rarity:'common',desc:'Golden sticky honey. Sweetens any recipe.'},
  sour_dust:{name:'Sour Dust',kind:'ingredient',rarity:'common',desc:'Tangy powder shaken off a gloop. Crafting reagent.'},
  star_sprinkle:{name:'Star Sprinkle',kind:'ingredient',rarity:'rare',desc:'A twinkling star-shaped sprinkle. Rare reagent.'},
  gummy_armor:{name:'Gummy Mail',kind:'armor',def:5,rarity:'rare',desc:'Bouncy gummy armor that absorbs blows. +5 DEF.'},
  licorice_whip:{name:'Licorice Whip',kind:'weapon',atk:9,rarity:'rare',desc:'A stinging coil of black licorice. +9 ATK.'},
  rainbow_brittle:{name:'Rainbow Brittle',kind:'food',effect:'atk',val:20,dur:35,rarity:'epic',desc:'Cooked alien food. +20 ATK for 35s.'},
  gummy_guard:{name:'Gummy Guard',kind:'food',effect:'def',val:10,dur:30,rarity:'rare',desc:'Cooked alien food. +10 DEF for 30s.'},
  star_pop:{name:'Star Pop',kind:'food',effect:'heal',val:65,rarity:'rare',desc:'Cooked alien food. Restores 65 HP.'},
};
export const RECIPES=[
  {out:'mallow_mend',in:{mushroom:2}},
  {out:'glow_gloop',in:{glowberry:1,alien_goo:1}},
  {out:'fizz_tonic',in:{glowberry:1,acorn:1}},
  {out:'star_pop',in:{star_sprinkle:1,honey:1}},
  {out:'gummy_guard',in:{gummy_worm:2,alien_goo:1}},
  {out:'rainbow_brittle',in:{star_sprinkle:1,crystal:2,sour_dust:1}},
  {out:'gummy_armor',in:{gummy_worm:3,honey:1}},
  {out:'licorice_whip',in:{alien_goo:2,sour_dust:2}},
];
export const LEVELS={
  1:{ id:1, name:'Lollipop & Cotton Candy Forest', scenery:'forest', bait:'lollipop',
      sky:'radial-gradient(circle at 22% 16%, #c4eeb0, transparent 42%), radial-gradient(circle at 82% 72%, #a4e092, transparent 46%), radial-gradient(circle at 58% 38%, #cdf2bb, transparent 38%), linear-gradient(165deg, #a8e398, #83cf75 55%, #72c266)',
      bossName:'Hichew Captain',
      enemyPool:['sour_gloop','sour_gloop','sour_gloop','licorice_lump','licorice_lump','taffy_swordsman','taffy_swordsman','gumguard_lancer','sugar_archer','sugar_archer','brittle_bolter'],
      boss:'hichew_captain', wild:['floss_finch','swirlbug'],
      forage:['lollipop','lollipop','lollipop','lollipop','mushroom','mushroom','acorn','acorn','glowberry','glowberry','gummy_worm','gummy_worm','honey','honey','sour_dust','star_sprinkle'] },
  2:{ id:2, name:'Rock Candy Caves', scenery:'cave', bait:'rock_candy',
      sky:'linear-gradient(#241830, #2e2142 46%, #1a1226)',
      bossName:'Crystal Widow',
      enemyPool:['spike_gloop','spike_gloop','spike_gloop','spike_gloop','rock_swordsman','rock_swordsman','rock_swordsman','spike_gloop','rock_swordsman','spike_gloop'],
      boss:'crystal_widow', wild:['geode_jay','rock_turtle'],
      forage:['rock_candy','rock_candy','rock_candy','rock_candy','crystal','crystal','sour_dust','sour_dust','alien_goo','star_sprinkle','star_sprinkle','glowberry','honey','gummy_worm'] },
  3:{ id:3, name:'Candy Corn Mountains', scenery:'snow', bait:'candy_corn',
      sky:'linear-gradient(#cdddf0, #e6eff9 46%, #f6fafe)',
      bossName:'Cornmaw the Colossal',
      enemyPool:['corn_box','corn_box','corn_box','corn_lizard','corn_lizard','corn_lizard','corn_box','corn_lizard','corn_box','corn_lizard'],
      boss:'corn_king', wild:['corn_hog'],
      forage:['candy_corn','candy_corn','candy_corn','candy_corn','crystal','crystal','star_sprinkle','star_sprinkle','honey','honey','glowberry','sour_dust','acorn','gummy_worm'] },
  4:{ id:4, name:'Gumdrop Grove', scenery:'gumdrop', bait:'gumdrop',
      sky:'linear-gradient(#f6d9ff, #efe0fb 46%, #e4f6ec)',
      bossName:'Gumlord the Sticky',
      enemyPool:['evil_gumdrop','evil_gumdrop','evil_gumdrop','evil_gumdrop','gumdrop_blob','gumdrop_blob','gumdrop_blob','evil_gumdrop','gumdrop_blob','evil_gumdrop'],
      boss:'gum_lord', wild:['chompgum'],
      forage:['gumdrop','gumdrop','gumdrop','gumdrop','gummy_worm','gummy_worm','honey','honey','glowberry','glowberry','alien_goo','sour_dust','crystal','star_sprinkle'] },
  5:{ id:5, name:'Licorice Jungle', scenery:'jungle', bait:'licorice',
      sky:'linear-gradient(#173a2a, #1f4a34 46%, #12281d)',
      bossName:'Basher Rex',
      enemyPool:['vine_pillar','vine_pillar','vine_pillar','tail_smasher','tail_smasher','tail_smasher','vine_pillar','tail_smasher','vine_pillar','tail_smasher'],
      boss:'vine_king', wild:['lico_snake'],
      forage:['licorice','licorice','licorice','licorice','gummy_worm','gummy_worm','sour_dust','sour_dust','alien_goo','alien_goo','glowberry','honey','crystal','star_sprinkle'] },
  6:{ id:6, name:'Chocolate Forest', scenery:'choco', bait:'chocolate',
      sky:'radial-gradient(circle at 24% 18%, #b98a5a, transparent 44%), radial-gradient(circle at 78% 70%, #8a5a32, transparent 48%), linear-gradient(165deg, #a8794a, #7a5230 55%, #5e3c20)',
      bossName:'Fudge Colossus',
      enemyPool:['choc_squirt','choc_squirt','choc_squirt','choc_backblob','choc_backblob','choc_backblob','choc_squirt','choc_backblob','choc_squirt','choc_backblob'],
      boss:'choc_boss', wild:['choc_lizard'],
      forage:['chocolate','chocolate','chocolate','chocolate','mushroom','mushroom','acorn','acorn','glowberry','honey','honey','alien_goo','crystal','star_sprinkle'] },
  7:{ id:7, name:'Peppermint Ocean', scenery:'ocean', bait:'peppermint',
      sky:'radial-gradient(circle at 24% 18%, #a8ecf2, transparent 44%), radial-gradient(circle at 78% 70%, #4fb3d9, transparent 48%), linear-gradient(165deg, #8fdbe8, #4a9fd0 55%, #2f6f9e)',
      bossName:'Peppermint Leviathan',
      enemyPool:['pepp_lurker','pepp_lurker','pepp_lurker','pepp_swordsman','pepp_swordsman','pepp_swordsman','pepp_lurker','pepp_swordsman','pepp_lurker','pepp_swordsman'],
      boss:'pepp_sea_boss', wild:['pepp_fish'],
      forage:['peppermint','peppermint','peppermint','peppermint','gummy_worm','gummy_worm','honey','glowberry','sour_dust','alien_goo','mushroom','acorn','crystal','star_sprinkle'] },
  8:{ id:8, name:'Nerd Mines', scenery:'mines', bait:'nerds',
      sky:'radial-gradient(circle at 30% 20%, rgba(199,125,255,.3), transparent 42%), radial-gradient(circle at 72% 74%, rgba(90,184,255,.2), transparent 46%), linear-gradient(170deg, #4a3554, #33243e 55%, #241830)',
      bossName:'Mega Nerds Cluster',
      enemyPool:['nerd_blob','nerd_blob','nerd_blob','nerd_cluster','nerd_cluster','nerd_cluster','nerd_blob','nerd_cluster','nerd_blob','nerd_cluster'],
      boss:'nerd_king', wild:['nerd_worm'],
      forage:['nerds','nerds','nerds','nerds','gummy_worm','sour_dust','sour_dust','glowberry','glowberry','honey','mushroom','acorn','crystal','star_sprinkle'] },
  9:{ id:9, name:'Candy Cane Dunes', scenery:'dunes', bait:'cane_shard',
      sky:'radial-gradient(circle at 26% 16%, #fff3e0, transparent 42%), radial-gradient(circle at 76% 72%, rgba(255,77,99,.14), transparent 46%), linear-gradient(168deg, #ffe1c4, #f5b98a 55%, #d98d5f)',
      bossName:'Cane Colossus',
      enemyPool:['cane_brawler','cane_brawler','cane_brawler','cane_strider','cane_strider','cane_strider','cane_brawler','cane_strider','cane_brawler','cane_strider'],
      boss:'cane_boss', wild:['cane_runner'],
      forage:['cane_shard','cane_shard','cane_shard','cane_shard','gummy_worm','honey','honey','sour_dust','glowberry','mushroom','acorn','alien_goo','crystal','star_sprinkle'] },
  10:{ id:10, name:'The Final Battle', scenery:'castle', bait:'lollipop', allPets:true,
      sky:'radial-gradient(circle at 26% 14%, rgba(255,120,160,.28), transparent 42%), radial-gradient(circle at 76% 76%, rgba(240,180,41,.16), transparent 46%), linear-gradient(168deg, #5c2440, #3a1430 55%, #230c1e)',
      bossName:'Hi-Chew King',
      enemyPool:[], boss:'hichew_king', wild:[],
      forage:['honey','honey','honey','glowberry','glowberry','mallow_mend','mallow_mend','gummy_worm','sour_dust','alien_goo','crystal','crystal','star_sprinkle','star_sprinkle'] },
};
LEVELS[10].enemyPool=[...new Set(Object.values(LEVELS).filter(l=>l.id<10).flatMap(l=>l.enemyPool))].flatMap(k=>[k,k,k,k,k]);

// Scenery placement per biome — ported from makeScenery() in the classic build (positions in world px).
export function makeScenery(kind){
  const s=[];
  const add=(t,x,y,o={})=>s.push({t,x,y,...o});
  if(kind==='cave'){
    // rock-candy crystal clusters
    [[300,360,'teal'],[700,300,'purple'],[1100,420,'teal'],[1500,340,'purple'],[1900,300,'teal'],[520,1180,'purple'],[980,1240,'teal'],[1600,1180,'purple'],[2000,1080,'teal']].forEach(([x,y,c],i)=>add('rcrystal',x,y,{c,s:0.9+(i%3)*0.16}));
    // stalagmites
    [[460,520],[860,1060],[1300,300],[1750,980],[200,900],[1420,1100]].forEach(([x,y])=>add('stala',x,y));
    // dark stone boulders + pebbles
    [[640,500],[1240,640],[1820,820],[420,1080],[1080,860]].forEach(([x,y],i)=>add('stone',x,y,{s:0.8+(i%2)*0.5}));
    [[520,600],[1180,720],[660,980],[1740,560],[1380,1080],[300,720],[900,1180]].forEach(([x,y])=>add('pebble',x,y));
    // glowing crystal pool + scattered shards
    add('cpool',560,900);
    [[1000,520,'var(--teal)'],[1560,900,'var(--purple)'],[760,1140,'var(--teal)'],[1640,640,'var(--purple)']].forEach(([x,y,c])=>add('shard',x,y,{c}));
    return s;
  }
  if(kind==='snow'){
    // candy-corn boulders
    [[320,380],[700,320],[1120,420],[1520,340],[1900,320],[520,1160],[980,1220],[1600,1160],[2000,1060]].forEach(([x,y],i)=>add('ccboulder',x,y,{s:0.85+(i%3)*0.3}));
    // snow drifts
    [[460,560],[1180,760],[1700,540],[900,1120],[1360,980],[240,860]].forEach(([x,y],i)=>add('drift',x,y,{s:0.8+(i%3)*0.3}));
    // little pines / icy shards
    [[360,640],[1080,880],[1620,600],[840,440],[1440,1100]].forEach(([x,y])=>add('pine',x,y));
    [[520,600],[1180,720],[660,980],[1740,560],[1380,1080],[300,720]].forEach(([x,y])=>add('snowlump',x,y));
    return s;
  }
  if(kind==='gumdrop'){
    // giant gumdrop mounds (trees)
    const gc=[['#ff9bd0','#c41f7a'],['#a8ffcf','#2f9c63'],['#ffd36e','#e0891e'],['#8fd4ff','#2f74c4'],['#c26bff','#7c2fd8']];
    [[320,380],[700,320],[1120,440],[1520,340],[1900,320],[520,1180],[980,1240],[1600,1160],[2000,1060]].forEach(([x,y],i)=>add('gmound',x,y,{c:gc[i%gc.length],s:0.9+(i%3)*0.28}));
    // gumdrop bushes (clusters)
    [[360,640],[1080,880],[1620,600],[840,440],[1440,1100]].forEach(([x,y],i)=>add('gcluster',x,y,{c:gc[(i+2)%gc.length]}));
    // sticky syrup pools
    [[540,900],[1500,760]].forEach(([x,y])=>add('gpool',x,y));
    // scattered small gumdrops
    [[640,540],[1240,660],[660,1040],[1740,560],[1360,1040],[280,760],[1820,900]].forEach(([x,y],i)=>add('gsmall',x,y,{c:gc[i%gc.length]}));
    return s;
  }
  if(kind==='jungle'){
    // towering licorice-vine trees
    const lc=['#d61f7a','#ff5d8f','#7c2fd8','#e0891e'];
    [[320,380],[700,320],[1120,440],[1520,340],[1900,320],[520,1180],[980,1240],[1600,1160],[2000,1060]].forEach(([x,y],i)=>add('vinetree',x,y,{c:lc[i%lc.length],s:0.9+(i%3)*0.24}));
    // fern clusters
    [[360,640],[1080,880],[1620,600],[840,440],[1440,1100],[1240,700]].forEach(([x,y])=>add('fern',x,y));
    // dark swamp pools
    [[540,900],[1560,860]].forEach(([x,y])=>add('swamp',x,y));
    // licorice logs / coils on ground
    [[640,560],[1240,660],[660,1040],[1740,560],[1360,1040],[300,760]].forEach(([x,y],i)=>add('coil',x,y,{c:lc[i%lc.length]}));
    return s;
  }
  if(kind==='choco'){
    // chocolate trees — cocoa trunk + fudge canopy
    [[320,380],[700,320],[1120,440],[1520,340],[1900,320],[520,1180],[980,1240],[1600,1160],[2000,1060]].forEach(([x,y],i)=>add('choctree',x,y,{s:0.9+(i%3)*0.22}));
    // fudge boulders
    [[640,520],[1240,660],[1820,840],[420,1060],[1440,1100]].forEach(([x,y],i)=>add('fudge',x,y,{s:0.8+(i%2)*0.45}));
    // chocolate pools
    [[540,900],[1560,860]].forEach(([x,y])=>add('chocpool',x,y));
    // cocoa mushrooms + wafer stumps
    [[360,640],[1080,880],[1620,600],[840,440],[1300,1020]].forEach(([x,y])=>add('cocoashroom',x,y));
    [[480,760],[1180,540],[1700,720],[900,1120]].forEach(([x,y])=>add('wafer',x,y));
    return s;
  }
  if(kind==='ocean'){
    // candy-cane coral clusters
    [[320,380],[700,320],[1120,440],[1520,340],[1900,320],[520,1180],[980,1240],[1600,1160],[2000,1060]].forEach(([x,y],i)=>add('canecoral',x,y,{s:0.9+(i%3)*0.24}));
    // half-buried peppermint boulders
    [[640,520],[1240,660],[1820,840],[420,1060],[1440,1100]].forEach(([x,y],i)=>add('mintrock',x,y,{s:0.8+(i%2)*0.45}));
    // tide pools
    [[540,900],[1560,860]].forEach(([x,y])=>add('tidepool',x,y));
    // mint shells + sea foam
    [[360,640],[1080,880],[1620,600],[840,440],[1300,1020]].forEach(([x,y])=>add('shellc',x,y));
    [[480,760],[1180,540],[1700,720],[900,1120],[1500,480],[260,980]].forEach(([x,y],i)=>add('foam',x,y,{s:0.8+(i%3)*0.3}));
    return s;
  }
  if(kind==='mines'){
    // timber support frames
    [[420,360],[980,300],[1560,380],[720,1180],[1400,1120],[1980,1040]].forEach(([x,y],i)=>add('beam',x,y,{s:0.9+(i%2)*0.25}));
    // nerd ore boulders
    [[640,520],[1240,660],[1820,840],[420,1060],[1520,480],[260,900]].forEach(([x,y],i)=>add('orerock',x,y,{s:0.8+(i%3)*0.3}));
    // rails + cart
    add('rail',900,880);add('rail',1120,880);add('cart',1010,872);
    // spilled nerd piles
    [[360,640],[1080,860],[1620,600],[840,440],[1300,1020],[1900,700]].forEach(([x,y],i)=>add('nerdpile',x,y,{s:0.8+(i%3)*0.28}));
    // glowing sugar crystals
    [[500,760],[1180,540],[1700,760],[300,1150]].forEach(([x,y],i)=>add('glowcrys',x,y,{c:['#c77dff','#5ab8ff','#ff5d8f','#7ce26a'][i]}));
    return s;
  }
  if(kind==='dunes'){
    // giant candy canes leaning out of the sand
    [[340,380],[760,320],[1180,440],[1580,340],[1960,320],[540,1180],[1020,1240],[1640,1160]].forEach(([x,y],i)=>add('bigcane',x,y,{s:0.9+(i%3)*0.25,f:i%2?1:-1}));
    // dune ridges
    [[600,560],[1300,700],[1860,900],[400,1000],[1100,1060]].forEach(([x,y],i)=>add('dune',x,y,{s:0.9+(i%3)*0.35}));
    // broken cane stumps
    [[460,700],[1240,560],[1720,740],[880,900]].forEach(([x,y],i)=>add('canestump',x,y,{s:0.85+(i%2)*0.3}));
    // shards + desert tufts
    [[380,640],[1080,880],[1620,620],[860,460],[1340,1020],[240,940]].forEach(([x,y])=>add('caneshards',x,y));
    [[520,800],[1160,620],[1760,820],[940,1140],[1480,500]].forEach(([x,y])=>add('deserttuft',x,y));
    add('oasis',560,940);
    return s;
  }
  if(kind==='castle'){
    // candy castle wall across the top + towers
    [[260,300],[760,260],[1360,300],[1960,260],[2560,300]].forEach(([x,y],i)=>add('tower',x,y,{s:0.9+(i%2)*0.3}));
    [[510,280],[1060,280],[1660,280],[2260,280]].forEach(([x,y])=>add('wall',x,y));
    // royal banners
    [[560,620],[1240,560],[1900,640],[900,1500],[2100,1420]].forEach(([x,y],i)=>add('banner',x,y,{c:['#e23d72','#f0b429','#a98cff','#e23d72','#f0b429'][i]}));
    // hi-chew block ramparts
    [[440,900],[1500,820],[2400,980],[700,1700],[1800,1760]].forEach(([x,y],i)=>add('chewblock',x,y,{s:0.85+(i%3)*0.3}));
    // torches + candy braziers
    [[360,1200],[1100,1080],[2000,1240],[2600,1500],[1400,1560]].forEach(([x,y])=>add('brazier',x,y));
    // scattered royal shards
    [[820,760],[1700,1000],[2300,760],[560,1560],[1250,1860]].forEach(([x,y])=>add('caneshards',x,y));
    return s;
  }
  // forest (default)
  [[300,360,'pink'],[700,300,'teal'],[1100,420,'orange'],[1500,340,'pink'],[1900,300,'teal'],[520,1180,'orange'],[980,1240,'pink'],[1600,1180,'teal'],[2000,1080,'pink']].forEach(([x,y,c],i)=>add('lolli',x,y,{c,s:1+(i%3)*0.12}));
  [[460,520],[860,1060],[1300,300],[1750,980],[200,900]].forEach(([x,y])=>add('cane',x,y));
  [[360,640],[1080,860],[1620,560],[840,420],[1420,1080]].forEach(([x,y],i)=>add('bush',x,y,{c:['var(--purple)','var(--teal)','var(--orange)','var(--pink)','var(--teal)'][i]}));
  [[640,500],[1240,640],[1820,820],[420,1080]].forEach(([x,y],i)=>add('rock',x,y,{s:0.8+(i%2)*0.5}));
  [[480,560],[1180,760],[1700,520],[900,1120]].forEach(([x,y],i)=>add('dirt',x,y,{s:0.8+(i%3)*0.25}));
  [[520,600],[1180,720],[660,980],[1740,560],[1380,1080],[300,720]].forEach(([x,y])=>add('pebble',x,y));
  [[400,700,'var(--pink)'],[1000,520,'var(--orange)'],[1500,900,'var(--purple)'],[760,1140,'#fff'],[1620,700,'var(--pink)']].forEach(([x,y,c])=>add('flower',x,y,{c}));
  [[560,760],[900,620],[1300,880],[1700,720],[420,900],[1140,1020],[820,880],[1560,480]].forEach(([x,y])=>add('tuft',x,y));
  add('pond',520,900);
  return s;
}
