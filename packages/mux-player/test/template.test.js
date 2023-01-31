import { assert } from '@open-wc/testing';
import { content } from '../src/template.ts';
import { render } from '../src/html.ts';

const minify = (html) => html.trim().replace(/>\s+</g, '><');

describe('<mux-player> template render', () => {
  const div = document.createElement('div');

  const exportParts = `top, center, bottom, layer, media-layer, poster-layer, vertical-layer, centered-layer, gesture-layer, poster, seek-live, play, button, seek-backward, seek-forward, mute, captions, airplay, pip, fullscreen, cast, playback-rate, volume, range, time, display`;

  it('default template without props', function () {
    render(content({}), div);
    assert.equal(
      normalizeAttributes(minify(div.innerHTML)),
      normalizeAttributes(
        `<media-theme default-showing-captions="" disabled="" nohotkeys="" stream-type="on-demand" exportparts="${exportParts}"><mux-video slot="media" crossorigin="" playsinline="" exportparts="video"></mux-video><mxp-dialog no-auto-hide=""><p></p></mxp-dialog></media-theme>`
      )
    );
  });

  it('template live extra-small w/o src, not in live window', function () {
    render(
      content({
        inLiveWindow: false,
        streamType: 'live',
        isDialogOpen: true,
        dialog: {
          title: 'Errr',
        },
      }),
      div
    );
    div.querySelectorAll('svg').forEach((svg) => svg.remove());
    assert.equal(
      normalizeAttributes(minify(div.innerHTML)),
      normalizeAttributes(
        `<media-theme hotkeys=" noarrowleft noarrowright" stream-type="live" default-showing-captions="" disabled="" nohotkeys="" exportparts="${exportParts}"><mux-video slot="media" crossorigin="" playsinline="" stream-type="live" cast-stream-type="live" exportparts="video"></mux-video><mxp-dialog no-auto-hide="" open=""><h3>Errr</h3><p></p></mxp-dialog></media-theme>`
      )
    );
  });

  it('template VodChromeLarge with captions', function () {
    render(
      content({
        streamType: 'on-demand',
        hasCaptions: true,
      }),
      div
    );
    div.querySelectorAll('svg').forEach((svg) => svg.remove());
    assert.equal(
      normalizeAttributes(minify(div.innerHTML)),
      normalizeAttributes(
        `<media-theme default-showing-captions="" disabled="" nohotkeys="" stream-type="on-demand" exportparts="${exportParts}"><mux-video slot="media" crossorigin="" playsinline="" stream-type="on-demand" exportparts="video"></mux-video><mxp-dialog no-auto-hide=""><p></p></mxp-dialog></media-theme>`
      )
    );
  });

  it('template VodChromeLarge without captions', function () {
    render(
      content({
        streamType: 'on-demand',
        hasCaptions: false,
        isDialogOpen: true,
        dialog: {
          title: 'Errr',
        },
      }),
      div
    );
    div.querySelectorAll('svg').forEach((svg) => svg.remove());
    assert.equal(
      normalizeAttributes(minify(div.innerHTML)),
      normalizeAttributes(
        `<media-theme stream-type="on-demand" default-showing-captions="" disabled="" nohotkeys="" exportparts="${exportParts}"><mux-video slot="media" crossorigin="" playsinline="" stream-type="on-demand" exportparts="video"></mux-video><mxp-dialog no-auto-hide="" open=""><h3>Errr</h3><p></p></mxp-dialog></media-theme>`
      )
    );
  });
});

function normalizeAttributes(htmlStr) {
  return htmlStr.replace(/<([a-z0-9-]+)((?:\s[a-z0-9:_.-]+=".*?")+)((?:\s*\/)?>)/gi, (s, pre, attrs, after) => {
    let list = attrs.match(/\s[a-z0-9:_.-]+=".*?"/gi).sort((a, b) => (a > b ? 1 : -1));
    if (~after.indexOf('/')) after = '></' + pre + '>';
    return '<' + pre + list.join('') + after;
  });
}
