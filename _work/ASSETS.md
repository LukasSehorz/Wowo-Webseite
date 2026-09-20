# Assets

Everything below exists in `public/` unless marked *pending*. Use only these files. Videos come as `.webm`, `.mp4` and a poster `.jpg` with the same base name (1920×1080 unless noted, muted, 5 to 10 s, loopable).

## Brand (`public/brand/`)

| File | Use |
| --- | --- |
| `mark.png` / `mark-white.png` / `mark-duo.png` | Runner mark alone, 709×710, transparent. Color for light surfaces, white for footage, duo (pale steel plus light olive) for dark surfaces |
| `logo-full.png` / `logo-full-white.png` / `logo-full-duo.png` | Full lockup with wordmark, transparent |

App icons: `src/app/icon.png`, `src/app/apple-icon.png`.

## Videos (`public/media/videos/`)

| Base name | Content | Suggested use |
| --- | --- | --- |
| `hero-walk-crosswalk` | Low angle, boots and jeans walking towards the camera over a crosswalk, strong shadows, calm grading | **Home hero** (first choice). Focal point lower center, the headline sits over the legs and road |
| `hero-walk-crosswalk-portrait` | 864×1080 (4:5) cut of the same clip, 9 s, loops | **Home hero below 768 px** (video sources and poster) |
| `hero-run-cobblestone` | Side view, runner's legs in light sneakers on cobblestone, slow motion, soft grey tones | Home hero alternative, or Über uns closing band |
| `walk-bridge-teal` | Low angle, a person walking away over a bridge, teal grading that matches navy | **Über uns closing band** (text bottom left is calm) |
| `run-road-side` | 1600×900, side view of a runner's feet on asphalt, dark trousers | Spare |
| `work-clinic-corridor` | Clinic corridor at floor level, staff with shoe covers pushing a trolley | Spare for work context |
| `work-workshop-walk` | Workshop hall, a worker walking through seen from behind | Spare for work context |
| `physio-foot-palpation` | Close-up, therapist's hands examining a foot | Spare for Über uns |
| `physio-treadmill-gait` | Feet on a treadmill, gait analysis feel, dark | Spare |
| `physio-knee-taping` | Hands applying tape to a knee in a gym | Spare |
| `detail-lacing-shoe` | Hands lacing a dark trail shoe outdoors | Spare |
| `sport-football-footwork` | Football boots and white socks on turf seen through a goal net, evening | Spare |
| `sport-football-penalty` | Night pitch, ball in the foreground, player approaching (face small, distant) | Spare |

## Generated photographs (`public/media/images/`)

Documentary style, consistent wardrobe (navy polo, olive trousers), no faces, no logos.

| File | Size | Content | Use |
| --- | --- | --- | --- |
| `fitting-hands.jpg` | 2048×1536 (4:3) | Therapist's hands sliding a light blue insole into a grey sneaker on a wooden bench, olive wall behind | **Home 1.2 intro card**. Caption bottom left sits on the wooden bench area |
| `step-1-untersuchen.jpg` | 2048×1152 | Therapist kneeling, hands on a standing patient's heel, dark calm left third | **Home 1.7 step 1** |
| `step-2-erwaermen.jpg` | 2048×1152 | Sneakers upside down on a white warm-air device, finger on the button, calm left half | **Home 1.7 step 2** |
| `step-3-anformen.jpg` | 2048×1152 | Person standing in sneakers, knees slightly bent, therapist guiding the knee, calm left third | **Home 1.7 step 3** |
| `step-4-kontrollieren.jpg` | 2048×1152 | Person walking away down the practice corridor, therapist's shoulder blurred in the foreground right | **Home 1.7 step 4** |
| `feature-thermoformbar.jpg` | 2048² | Hands flexing a warm light blue insole, pale steel studio backdrop | Home 1.6 column 1 |
| `feature-gefraest.jpg` | 2048² | Macro of the milled contour next to a raw foam block | Home 1.6 column 2 |
| `feature-fersenschale.jpg` | 2048² | Rear three-quarter view into the deep heel cup | Home 1.6 column 3 |
| `feature-justierbar.jpg` | 2048² | Flat-lay of insole underside with wedges, pad and heel raiser | Home 1.6 column 4 |
| `about-hero.jpg` | 2400×1029 (21:9) | Practice interior, insoles, sneakers and device on a bench, therapist at work in the blurred background seen from behind | **Über uns 2.2 hero image** |
| `about-detail.jpg` | 1536×2048 (3:4) | Therapist's hands examining the sole of a foot on a treatment table | **Über uns 2.4 story image** (crop to 4:5) |
| `insole-in-hands.jpg` | 1536×1024 | Hands holding a dark blue insole, grey sneaker in the background | Spare (Gutscheine, leistungsumfang) |
| `product-side.png` | 1859×784, transparent | Side view of one light blue insole, heel right | **Home 1.2 cut-out**, Gutscheine 3.4 |
| `product-pair.png` | 1254×1207, transparent | Top view of a pair of light blue insoles | Spare (Gutscheine hero or 3.4) |

The feature images share a pale steel-blue studio background (about `#DDE6EE`). Show them in their rounded 1:1 frames without an extra tint.

## Stock photographs (`public/media/images/`) – delivered

Real stock photos (Unsplash and Pexels licenses, sources in `_work/media/CREDITS.md`). The four audience tiles for Home 1.4 are pre-cropped to 4:5 (1600×2000):

| File | Content | Notes for the overlay |
| --- | --- | --- |
| `tile-handel.jpg` | Supermarket employee in a dark apron at a bakery shelf, teal and wood tones | Dark apron in the lower third carries a white title without help |
| `tile-pflege.jpg` | Nurse in blue scrubs from behind, pushing an incubator down a bright corridor | Lower third is bright: needs the bottom gradient (`navy-900` 0 → 70 %) under the white title |
| `tile-logistik.jpg` | Delivery man from behind pulling a parcel cart down a cobbled street | Dark cobblestone lower left, fine for white text |
| `tile-sport.jpg` | Runner's legs mid-stride on asphalt with an orange road line | Lowest 30 % is clean asphalt, add the same light gradient for consistency |

Use one shared bottom gradient on all four tiles so they read as a set (the reference relies on calm image zones, our photos are brighter).

Further stock photos, free to use where they help (do not force them in):

| File | Size | Content | Suggested use |
| --- | --- | --- | --- |
| `work-production-line.jpg` | 2400×1599 | Workers from behind at sorting lines | Gutscheine 3.5 (for employers), as a wide rounded image above or beside the three arguments |
| `team-conversation.jpg` | 1600×2400 | Two colleagues talking, woman in an olive shirt from behind | Gutscheine, optional. Crop 4:5 with `object-position: 35% 50%` |
| `gait-runners-road.jpg` | 2400×1599 | Many runners' feet on a road, empty asphalt below | Spare background |
| `physio-foot-treatment.jpg` | 2400×1929 | Gloved therapist's hands on a foot and ankle | Spare (Über uns) |
| `physio-feet-exam.jpg` | 2400×1150 | Carer's hands on a patient's feet, wide banner | Spare (Über uns) |
| `work-warehouse-walk.jpg` | 2400×1599 | Warehouse staff walking, motion blur, orange and blue | Spare |
| `work-boots-lacing.jpg` | 2400×1599 | Hands lacing brown work boots | Do not use (suggests safety footwear, see FAQ 5) |
| `texture-track-blue.jpg` | 1600×2133 | Deep blue running track with white lanes | Spare texture under a navy overlay |

## Open Graph

Create `src/app/opengraph-image.jpg` (1200×630) from `fitting-hands.jpg` with the white logo bottom left, or generate it with `next/og` using the display voice on the brand gradient.
