# Armor Command Content Drop 2 Plan

## Implemented Runtime Slice

- Missile racks now use a sequence model: the starter rack always exists, each Missile Battery adds one independent rack, and racks cool down separately.
- Upgrade values are stronger than the original flat pool, generally about double the previous impact.
- Upgrade offers now carry tree tags and can surface capstones after three picks in a tree.
- Shotgun range is doubled on unlock and can gain its own range/pellet upgrades.
- New missile traits are additive: Radioactive Canisters, Piercer Warheads, and Splitter Payloads can all stack on the same missile.
- New additive drone branches: Radioactive Drone Conversion, Interceptor Drone Link, and Flamethrower Drone Branch.

## Current Trees

- Missile: burst radius, missile batteries, additive piercer warheads, additive splitter payloads, Salvo Doctrine capstone.
- Radioactive: additive radioactive canister clouds, radioactive saturation, Fallout Zone capstone.
- Drone: drone bay, radioactive drone conversion, interceptor drone link, flamethrower close-defense branch, Wing Commander capstone.
- Shotgun: scatter barrel, shotgun choke, Street Sweeper capstone.
- Cannon: pistol servo, heavy pistol link, Hammer Cycle capstone.
- Armor: bulwark plating, Overbuilt Line capstone.

## Art Prompt: Missile And Radioactive Sheet

Transparent-background 2D game sprite sheet for Armor Command, a side-view futuristic tank missile-command arcade game. Include separate readable projectiles: standard interceptor missile, green radioactive canister missile, gold piercing warhead, pink splitter missile, small smoke trails, muzzle flashes, animated radioactive cloud sprite puffs, expanding shock rings, tiny spark fragments. Clean high-contrast blue-white-gold military sci-fi palette with green radioactive and pink splitter accents. No text, no letters, no UI, no watermark.

## Art Prompt: Drone Variant Sheet

Transparent-background 2D game sprite sheet for Armor Command. Four small side-view hovering support drones designed to orbit a futuristic armor platform: gun drone, radioactive drone with canister launcher, interceptor defense drone with compact twin barrels, targeting radar drone with dish sensor. Include muzzle flashes and tiny status glows. Consistent scale, readable silhouettes, blue-white-gold military sci-fi style with distinct accent lights. No text, no UI, no watermark.

## Art Prompt: Upgrade Icon Sheet

Square transparent-background upgrade icon sheet for a mobile arcade missile defense game called Armor Command. Icons only, no text. Include missile battery, radioactive cloud, shotgun barrel, drone wing, interceptor drone, piercing missile, splitter missile, repair plating, capstone starburst, EMP pulse placeholder. Bold readable shapes at small mobile size, blue-white-gold with green radioactive and pink splitter accents. No letters, no watermark.

## Convoy Flamethrower Source

The flamethrower drone branch ports the Cornfire Convoy canvas flame cone behavior from `/storage/emulated/0/Documents/GodotProjects/cornfire-convoy/src/main.js` lines 454-464 and visual gradient cone from lines 1005-1021. Armor Command adapts it to side-view drone positions, all-hostile cone damage, and richer animated cone lobes. No external bitmap asset was copied; the effect remains procedural canvas art.

## Flame Visual Tuning

Armor Command improves the Convoy cone by drawing a curved flame ribbon in world space. The centerline bends with animated sway, then layered ember lobes follow that curve so rotation feels like a flexible flame stream rather than a rigid triangular wedge.

## Piercer And Scatter Tuning

Piercer Warheads now behave as pass-through payloads: each missile explodes at the tapped point, then continues along its launch trajectory for one pierce per upgrade, up to four. Splitter Payload child bursts now chain forward along that same trajectory after short staggered delays, so additive piercer + splitter + radioactive shots can create multiple staged explosion pockets instead of a single stacked blast.

## Runtime Art Tuning

The defended base is now a procedural fortified line with shield pylons, bunker mass, radar dome, integrity cells, and damage cracks. Explosions retain sprite-sheet frames when available and add procedural core flashes, shock rings, radial spokes, and team-colored glow. Radioactive clouds remain procedural animated sprites with pulsing lobes and radiation-symbol arcs.

## Generated Effect Sprite Sheet

Added `assets/effects/armor_command_effects_sheet_alpha_v1.png`, a real generated 6x2 bitmap effect sheet. The top row supplies explosion animation frames; the bottom row supplies radioactive cloud frames. The runtime now prefers this sheet for explosion and radioactive rendering, keeping the previous procedural versions only as load-failure fallbacks.

## Effect Sprite Slice Fix

A gameplay video from Android Downloads showed hard rectangular crop edges on explosion frames. The generated sheet was not truly aligned to equal grid cells, so the runtime now uses hand-measured source rectangles and aspect-preserving draws for explosion and radioactive frames.

## Radioactive Frame Leak Fix

Manual inspection of each radioactive frame showed neighboring-frame pixels leaking into frames 1-3 because the generated sheet is not grid-aligned. Runtime and atlas rectangles were tightened in v1.1.9 so each cloud frame crops only its own painted sprite.
