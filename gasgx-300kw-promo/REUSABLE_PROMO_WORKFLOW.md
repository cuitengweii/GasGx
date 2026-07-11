# Reusable HyperFrames Product Promo Workflow

Use this workflow to turn a product website into an English-only promo with captions, natural English voiceover, content-based duration, and premium industrial/energy product-showcase music.

## Copyable Agent Instruction

```text
Use HyperFrames to turn the supplied product website into an English-only product promo. Do not force the video to 20 seconds: choose the duration from the verified page content, narration length, number of beats, and CTA. Every visible word in the video must be English; do not use Chinese UI text, screenshots, captions, metadata, or overlays.

Capture the site first in its English locale. If the page has a language switch, set its English localStorage/cookie state before taking screenshots and verify the visible DOM text contains no CJK characters. Reuse its product images, diagrams, logos, fonts, colors, and verified specifications. Create DESIGN.md, SCRIPT.md, and narration.txt before authoring HTML. Structure the video into as many beats as the page needs: hook, product proof, engineering/use cases, systems/operations, and CTA are typical beats.

Add English captions as one root-level overlay controlled by the root GSAP timeline. Generate a natural-sounding English technical voiceover that fits the selected duration. Prefer Kokoro TTS; if it fails, use macOS Daniel voice at a moderate speaking rate and shorten the script instead of speaking unnaturally fast.

Generate a premium industrial/energy product-showcase bed with low-frequency power pulse, drum groove, metallic impacts, restrained synth arpeggio, chord movement, stereo width, and a controlled ending. Keep the music clearly audible but duck it under narration with FFmpeg sidechain compression.

Render the visual track without HTML audio elements if they cause HyperFrames capture frames to turn black. Mix voice and music into the rendered MP4 afterward. Validate with hyperframes lint, validate, snapshots, and ffprobe. Deliver the MP4 and the Studio preview URL. Do not deliver only index.html and do not render a silent final file.
```

## 1. Set Variables

```bash
SITE_URL="https://example.com/products/example/"
PROJECT="product-promo"
PORT="3017"
DURATION_SECONDS="<set from content and narration, not a fixed default>"
```

Run all commands from the project directory.

## 2. Capture the Website

```bash
npx hyperframes capture "$SITE_URL" -o "$PROJECT/capture"
```

Inspect the generated screenshots, assets, visible text, tokens, and design styles. If the default capture is not English, recapture with the page's English locale state and store those screenshots separately, for example `capture-en/screenshots/`. Reject any screenshot or visible DOM state containing Chinese or other unintended language text. Reuse captured product photography, diagrams, logos, fonts, and technical specifications.

Create these files before authoring compositions:

- `DESIGN.md`: palette, typography, layout, motion rules, and anti-patterns.
- `SCRIPT.md`: narration, spoken text, and on-screen proof points.
- `narration.txt`: the final spoken English script.

Set the duration after the script is drafted. Use enough time for the page's actual proof points and CTA to be readable; a short product page may be 15-20 seconds, while a systems page may need 25-40 seconds. Split the script and root caption timeline into beats that match the visual scenes.

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

Keep the voiceover within the selected duration. If it runs long, shorten the copy before increasing speech rate. If the page needs more proof points, extend the visual timeline instead of compressing the narration unnaturally.

## 5. Generate Premium Industrial Music

Use the reusable generator included in this project:

```bash
python3 media/generate_product_music.py
```

It creates a full-duration music bed:

```text
media/product-music-energy-showcase.wav
```

The generator uses a deterministic industrial/energy arrangement with low-frequency pulse, kick, snare, hi-hat, metal hits, synth arpeggio, chord beds, stereo panning, room reflections, and a controlled tail fade. Match its duration to the visual timeline and replace the script or its parameters when a different musical identity is needed.

## 6. Render the Captioned Visual Track

Keep audio out of the HyperFrames HTML when the capture engine shows black frames after adding `<audio>` elements. Render the visual track first:

```bash
npx hyperframes render \
  --output renders/${PROJECT}-captioned.mp4
```

Run visual QA at representative beat times across the selected duration:

```bash
rm -rf snapshots
npx hyperframes snapshot . --at 2,6.5,12.4,17.6
```

Review `snapshots/contact-sheet.jpg` and confirm every beat is nonblank, captions fit, and product assets load.

## 7. Mix Voiceover and Music into the Final MP4

Use sidechain compression so the music remains audible but yields to the voice. Pad or trim the narration and music to the selected video duration so the final audio stream matches the visual track exactly.

```bash
ffmpeg -y \
  -i renders/${PROJECT}-captioned.mp4 \
  -i media/narration.wav \
  -i media/product-music-premium.wav \
  -filter_complex "\
[1:a]apad=pad_dur=${DURATION_SECONDS},atrim=duration=${DURATION_SECONDS},volume=1.0,asplit=2[narrMain][narrSide];\
[2:a]volume=0.78[music];\
[music][narrSide]sidechaincompress=threshold=0.025:ratio=2.8:attack=15:release=360:makeup=1[ducked];\
[narrMain][ducked]amix=inputs=2:duration=longest:normalize=0,alimiter=limit=0.95[outa]" \
  -map 0:v:0 \
  -map "[outa]" \
  -c:v copy \
  -c:a aac -b:a 192k -ar 48000 -ac 2 \
  -t ${DURATION_SECONDS} -movflags +faststart \
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
- Both streams at the selected duration.
- Captions visible in every beat.
- No visible Chinese or other unintended-language text.
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
