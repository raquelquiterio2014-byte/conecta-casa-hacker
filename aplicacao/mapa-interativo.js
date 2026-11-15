'use strict';

const estacaoCultura = [-47.066752, -22.908246];
const corProjeto = '#8b43bd';
const colecao = features => ({type: 'FeatureCollection', features});
const feicao = (type, coordinates, properties = {}) =>
  ({type: 'Feature', geometry: {type, coordinates}, properties});
let mapaInterativo;
let areasProjeto = colecao([]);
let tentouMapa = false;

function coordenadaLocal(leste, norte) {
  const [lon, lat] = estacaoCultura;
  return [lon + leste / (111.195 * Math.cos(lat * Math.PI / 180)), lat + norte / 111.195];
}

function atualizarMapaInterativo(prefixos, grade, total) {
  areasProjeto = colecao(prefixos.flatMap(({rotulo, n}) => grade[rotulo].map(([x, y]) =>
    feicao('Polygon', [[[x, y], [x + 1, y], [x + 1, y + 1], [x, y + 1], [x, y]]
      .map(([leste, norte]) => coordenadaLocal(leste / 2, norte / 2))],
    {prefixo: rotulo, proporcao: proporcao(n, total)}))));
  if (tentouMapa) {
    mapaInterativo?.getSource('projeto')?.setData(areasProjeto);
    return;
  }
  tentouMapa = true;
  if (!window.maplibregl) return;

  const container = $('maplibre-projeto');
  container.hidden = false;
  try {
    const raios = [6, 8].map(km => feicao('LineString', Array.from({length: 121}, (_, i) => {
      const angulo = i * 2 * Math.PI / 120;
      return coordenadaLocal(km * Math.cos(angulo), km * Math.sin(angulo));
    }), {km}));
    mapaInterativo = new maplibregl.Map({
      container,
      bounds: [coordenadaLocal(-20, -18), coordenadaLocal(25, 22)],
      fitBoundsOptions: {padding: 22},
      attributionControl: false,
      style: {
        version: 8,
        sources: {
          projeto: {type: 'geojson', data: areasProjeto},
          raios: {type: 'geojson', data: colecao(raios)}
        },
        layers: [
          {id: 'fundo', type: 'background', paint: {'background-color': '#f2f8ff'}},
          {id: 'areas', type: 'fill', source: 'projeto',
            paint: {'fill-color': corProjeto, 'fill-opacity': 0.72}},
          {id: 'raios', type: 'line', source: 'raios',
            paint: {'line-color': ['match', ['get', 'km'], 6, '#245cb0', '#007189'], 'line-width': 2}}
        ]
      }
    });
    const mapa = mapaInterativo;
    mapa.addControl(new maplibregl.NavigationControl(), 'top-right');
    new maplibregl.Marker({color: '#13294b'}).setLngLat(estacaoCultura)
      .setPopup(new maplibregl.Popup().setText('Estação Cultura • centro de referência')).addTo(mapa);
    const popup = new maplibregl.Popup();
    mapa.once('load', () => {
      mapa.getSource('projeto').setData(areasProjeto);
      $('mapa-projeto').hidden = true;
    });
    mapa.on('sourcedata', evento => {
      if (evento.sourceId === 'projeto') popup.remove();
    });
    mapa.on('click', 'areas', evento => {
      const linhas = [...new Map(evento.features.map(f => [f.properties.prefixo, f.properties])).values()];
      popup.setLngLat(evento.lngLat).setText(linhas.map(r =>
        'CEP ' + r.prefixo + ' • ' + r.proporcao).join('\n')).addTo(mapa);
    });
    mapa.on('mouseenter', 'areas', () => { mapa.getCanvas().style.cursor = 'pointer'; });
    mapa.on('mouseleave', 'areas', () => { mapa.getCanvas().style.cursor = ''; });
  } catch (erro) {
    mapaInterativo?.remove();
    mapaInterativo = undefined;
    container.hidden = true;
    console.warn('Mapa simplificado ativado.', erro);
  }
}
