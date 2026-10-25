"""Copy the episodes into the site, without ever touching the working files.

    python site/scripts/sync-shorts.py

- copies ../engine2.js and ../sfx.js into site/shorts/ (engine2 gets one small,
  site-only patch: stories may override the camera scale and ground height, which
  the hero and the walking band need)
- extracts each Season 2-5 episode's inline story script into
  site/shorts/stories/<id>.js, wrapped so many episodes can live on one page
- copies the Season 1 pages and engine.js into site/shorts/s1/
"""
import pathlib, re, shutil, sys

ROOT = pathlib.Path(__file__).resolve().parents[2]          # .../Animation
SITE = ROOT / 'site'
OUT = SITE / 'shorts'
ENGINE2 = ['one-more', 'the-hill', 'bloom', 'hurry', 'what-if',
           'last-minute', 'yes', 'perfect', 'battery', 'seen',
           'tomorrow', 'highlight-reel', 'small-steps', 'snooze', 'reset',
           'monday-mountain', 'imposter', 'decision', 'busy', 'rain-check']
SEASON1 = ['the-cloud', 'the-seed', 'the-gap']

VIEW_OLD = """      const unit = Math.min(cw / (portrait ? 640 : 1200), ch / 600) * this.cam.z.x;
      const gy = ch * (portrait ? .64 : .7);"""
VIEW_NEW = """      const unit = (this.story.unit ? this.story.unit(cw, ch) : Math.min(cw / (portrait ? 640 : 1200), ch / 600)) * this.cam.z.x;
      const gy = ch * (this.story.groundFrac ?? (portrait ? .64 : .7));"""

# the band's Wobbin is asked to walk fast, so the site may cap how far a foot reaches ahead
LEAD_OLD = "const lead = clamp(this.vx * .22, -60, 60), thresh = Math.max(16, Math.abs(lead));"
LEAD_NEW = "const ml = this.S.story.maxLead ?? 60, lead = clamp(this.vx * .22, -ml, ml), thresh = Math.max(16, Math.abs(lead));"

CLEAR_OLD = "      ctx.fillStyle = st.paperAt ? st.paperAt(t, this) : st.paper || PAPER; ctx.fillRect(0, 0, cw, ch);"
CLEAR_NEW = "      if (st.clear) ctx.clearRect(0, 0, cw, ch); else { ctx.fillStyle = st.paperAt ? st.paperAt(t, this) : st.paper || PAPER; ctx.fillRect(0, 0, cw, ch); }"

WRAP = """/* {id}: extracted from ../{id}.html by scripts/sync-shorts.py. Do not edit here. */
(function () {{
  const Shorts = Object.assign(Object.create(window.Shorts), {{ play: story => {{ (window.WL_STORIES ||= {{}})['{id}'] = story; }} }});
{body}
}})();
"""


def main():
    (OUT / 'stories').mkdir(parents=True, exist_ok=True)
    (OUT / 's1').mkdir(parents=True, exist_ok=True)

    engine = (ROOT / 'engine2.js').read_text(encoding='utf-8')
    for old in (VIEW_OLD, CLEAR_OLD, LEAD_OLD):
        if old not in engine:
            sys.exit('engine2.js changed where the site patches it; update sync-shorts.py')
    # site-only patches: stories may override camera scale/ground height and stride, and draw on a transparent canvas
    (OUT / 'engine2.js').write_text(engine.replace(VIEW_OLD, VIEW_NEW).replace(CLEAR_OLD, CLEAR_NEW).replace(LEAD_OLD, LEAD_NEW), encoding='utf-8')
    shutil.copy(ROOT / 'sfx.js', OUT / 'sfx.js')

    for ep in ENGINE2:
        html = (ROOT / f'{ep}.html').read_text(encoding='utf-8')
        scripts = re.findall(r'<script>\n(.*?)</script>', html, re.S)
        if len(scripts) != 1 or 'Shorts.play(' not in scripts[0]:
            sys.exit(f'{ep}: expected exactly one inline story script')
        body = '\n'.join('  ' + line if line else line for line in scripts[0].rstrip().split('\n'))
        (OUT / 'stories' / f'{ep}.js').write_text(WRAP.format(id=ep, body=body), encoding='utf-8')

    shutil.copy(ROOT / 'engine.js', OUT / 's1' / 'engine.js')
    for ep in SEASON1:
        shutil.copy(ROOT / f'{ep}.html', OUT / 's1' / f'{ep}.html')

    print(f'synced {len(ENGINE2)} stories + {len(SEASON1)} season-1 pages into {OUT}')


if __name__ == '__main__':
    main()
