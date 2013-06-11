
window.AppData = window.AppData || {};

window.AppData.CITIES = {

  'london': {
    map: {
      center: [51.511, -0.100],
      zoom: 12,
      maxZoom: 13,
      minZoom: 11,
      maxBounds: [
        [51.6658689535146, 0.139838309451462],
        [51.3861403977661, -0.348236804682573]
      ],
      bubbleBounds: [
        [51.5501779951158, 0.05218505859375],
        [51.45400691005984, -0.2217864990234375]
      ]
    },
    time_scale: 15 * 60,
    scale: 2.0,
    city: "london",
    city_name: "London",
    city_title: "The great British capital",
    city_subtitle: "Largest and most populous city in the EU.",
    time: 0,
    // time_offset: -60, // minutes
    time_offset: 0, // minutes
    reductionSlowBrowser: 1
  },

  'chicago': {
    map: {
      center: [41.850, -87.650],
      zoom: 12,
      maxZoom: 13,
      minZoom: 11,
      maxBounds: [
        [42.0226052431361, -87.5245571136],
        [41.6445683186, -87.9193200670193]
      ],
      bubbleBounds: [
        [41.959999783467666, -87.62435210527343],
        [41.820198321274404, -87.77987731279296]
      ]
    },
    time_scale: 15 * 60,
    scale: 2.0,
    city: "chicago",
    city_name: "Chicago",
    city_title: "Capital of the Midwest",
    city_subtitle: "The third most populous city in the USA.",
    time: 0,
    time_offset: 5*60 // minutes
  },

  'rome': {
    map: {
      center: [41.900, 12.500],
      zoom: 13,
      maxZoom: 14,
      minZoom: 12,
      maxBounds: [
        [42.0904208095211, 12.8069148710051],
        [41.7543071894641, 12.2988076118757]
      ],
      bubbleBounds: [
        [41.951624734362795, 12.567583593359473],
        [41.852478785574405, 12.40484860800791]
      ]
    },
    time_scale: 15 * 60,
    scale: 2.0,
    city: "rome",
    city_name: "Rome",
    city_title: "Yesterday, today and forever",
    city_subtitle: "Birthplace of western civilisation.",
    time: 0,
    time_offset: -60 // minutes
  },

  'helsinki': {
    map: {
      center: [60.169738,24.937763],
      zoom: 13,
      maxZoom: 14,
      minZoom: 12,
      maxBounds: [
        [60.3252853491389, 25.1981615056761],
        [60.1398453840818, 24.5206260681]
      ],      
      bubbleBounds: [
        [60.21867286062495, 25.005912800488204],
        [60.14992180859246, 24.865837116894454]
      ]
    },
    time_scale: 15 * 60,
    scale: 2.0,
    city: "helsinki",
    city_name: "Helsinki",
    city_title: "The heart of Finland.",
    city_subtitle: "Europe's northernmost capital, population 1,361,506",
    time: 0,
    time_offset: -2*60 // minutes
  },

  'mumbai': {
    map: {
      center: [19.102, 72.852],
      zoom: 12,
      maxZoom: 13,
      minZoom: 12,
      maxBounds: [
        [19.2610380202874, 72.983583740247],
        [18.9058804949, 72.7925160539108]
      ],      
      bubbleBounds: [
        [19.124345369319737, 72.91643109843744],
        [18.89842685807366, 72.78047528789057]
      ]
    },
    time_scale: 15 * 60,
    scale: 2.0,
    city: "mumbai",
    city_name: "Mumbai",
    city_title: "The jewel in India’s crown",
    city_subtitle: "18M people, 1.8M vehicles, 1,900 km of road.",
    time: 0,
    time_offset: -5*60 // minutes
  }
};

window.AppData.init_time = 0;
window.AppData.last_time = 1419;
