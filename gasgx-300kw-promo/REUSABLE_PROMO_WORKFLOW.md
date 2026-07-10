# Reusable HyperFrames Product Promo Workflow

Use this workflow to turn a product website into a 20-second promo with captions, English voiceover, and premium industrial background music.

## Copyable Agent Instruction

```text
Use HyperFrames to turn the supplied product website into a 20-second product promo.

Capture the site first and reuse its product images, diagrams, logos, fonts, colors, and verified specifications. Create DESIGN.md, SCRIPT.md, and narration.txt before authoring HTML. Structure the video into four beats: hook, proof points, engineering/use cases, and price/CTA.

Add English captions as one root-level overlay controlled by the root GSAP timeline. Generate a natural-sounding English technical voiceover that fits within 20 seconds. Prefer Kokoro TTS; if it fails, use macOS Daniel voice at a moderate speaking rate and shorten the script instead of speaking unnaturally fast.

Generate a premium industrial product bed with low-frequency pulse, drum groove, metallic impacts, synth arpeggio, chord movement, stereo width, and a controlled ending. Keep the music clearly audible but duck it under narration with FFmpeg sidechain compression.

Render the visual track without HTML audio elements if they cause HyperFrames capture frames to turn black. Mix voice and music into the rendered MP4 afterward. Validate with hyperframes lint, validate, snapshots, and ffprobe. Deliver the MP4 and the Studio preview URL. Do not deliver only index.html and do not render a silent final file.
```

## 1. Set Variables

```bash
SITE_URL="https://example.com/products/example/"
PROJECT="product-promo"
PORT="3017"
```

Run all commands from the project directory.

## 2. Capture the Website

```bash
npx hyperframes capture "$SITE_URL" -o "$PROJECT/capture"
```

Inspect the generated screenshots, assets, visible text, tokens, and design styles. Reuse captured product photography, diagrams, logos, fonts, and technical specifications.

Create these files before authoring compositions:

- `DESIGN.md`: palette, typography, layout, motion rules, and anti-patterns.
- `SCRIPT.md`: narration, spoken text, and on-screen proof points.
- `narration.txt`: the final spoken English script.

For a 20-second video, keep the narration around 40-50 words. Split the script into four beats that match the visual scenes.

## 3. Build and Validate the Visual Composition

Use four beats as a reliable product-promo structure:

1. Hook: product name, category, and main value proposition.
2. Proof: power, efficiency, engine, or other hard specifications.
3. Engineering: components, warranty, delivery scope, and use cases.
4. CTA: price, configuration options, and contact action.

Use root-level captions as one persistent overlay controlled by the root GSAP timeline. Avoid multiple root-level timed `.clip` caption elements if they cause sub-compositions to disappear during capture.

```bash
npx hyperframes lint
npx hyperframes validate
```

## 4. Generate English Voiceover

Try HyperFrames Kokoro first:

```bash
HYPERFRAMES_PYTHON=.venv/bin/python \
  npx hyperframes tts narration.txt \
  --voice am_adam --lang en-us \
  --output media/narration.wav
```

If Kokoro fails during voice-data download, use the reliable macOS fallback. Daniel at a moderate rate works well for technical product narration:

```bash
say -v Daniel -r 215 -f narration.txt -o media/narration.aiff
ffmpeg -y -i media/narration.aiff \
  -ar 48000 -ac 2 media/narration.wav
ffprobe -v error -show_entries format=duration \
  -of default=noprint_wrappers=1:nokey=1 media/narration.wav
```

Keep the voiceover at or below 20 seconds. If it runs long, shorten the copy before increasing speech rate.

## 5. Generate Premium Industrial Music

Use the reusable generator included in this project:

```bash
python3 media/generate_product_music.py
```

It creates:

```text
media/product-music-premium.wav
```

The generator uses a deterministic 120 BPM arrangement with low-frequency pulse, kick, snare, hi-hat, metal hits, synth arpeggio, chord beds, stereo panning, room reflections, and a controlled tail fade. Replace the script or its parameters when a different musical identity is needed.

## 6. Render the Captioned Visual Track

Keep audio out of the HyperFrames HTML when the capture engine shows black frames after adding `<audio>` elements. Render the visual track first:

```bash
npx hyperframes render \
  --output renders/${PROJECT}-captioned.mp4
```

Run visual QA at representative beat times:

```bash
rm -rf snapshots
npx hyperframes snapshot . --at 2,6.5,12.4,17.6
```

Review `snapshots/contact-sheet.jpg` and confirm every beat is nonblank, captions fit, and product assets load.

## 7. Mix Voiceover and Music into the Final MP4

Use sidechain compression so the music remains audible but yields to the voice. Pad the narration to the full video duration so the final audio stream lasts exactly 20 seconds.

```bash
ffmpeg -y \
  -i renders/${PROJECT}-captioned.mp4 \
  -i media/narration.wav \
  -i media/product-music-premium.wav \
  -filter_complex "\
[1:a]apad=pad_dur=20,atrim=duration=20,volume=1.0,asplit=2[narrMain][narrSide];\
[2:a]volume=0.78[music];\
[music][narrSide]sidechaincompress=threshold=0.025:ratio=2.8:attack=15:release=360:makeup=1[ducked];\
[narrMain][ducked]amix=inputs=2:duration=longest:normalize=0,alimiter=limit=0.95[outa]" \
  -map 0:v:0 \
  -map "[outa]" \
  -c:v copy \
  -c:a aac -b:a 192k -ar 48000 -ac 2 \
  -t 20 -movflags +faststart \
  renders/${PROJECT}-premium-industrial.mp4
```

Use `volume=0.78` as the starting music level. Raise it toward `1.0-1.3` when the bed is not audible enough; lower it toward `0.55-0.7` when the voice loses clarity.

## 8. Verify the Final File

```bash
ffprobe -v error \
  -show_entries format=duration,size:stream=index,codec_name,codec_type,duration \
  -of default=noprint_wrappers=1 \
  renders/${PROJECT}-premium-industrial.mp4
```

Expected result:

- H.264 video stream.
- AAC stereo audio stream.
- Both streams at 20.000 seconds.
- Captions visible in all four beats.
- Voiceover intelligible over the music.

## 9. Preview and Deliver

```bash
npx hyperframes preview --port "$PORT"
```

Studio preview URL:

```text
http://localhost:${PORT}/#project/${PROJECT}
```

Deliver the rendered MP4, not the raw `index.html`:

```text
renders/${PROJECT}-premium-industrial.mp4
```
