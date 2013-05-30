
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
      ]
    },
    time_scale: 15 * 60,
    scale: 2.0,
    city: "london",
    city_name: "London",
    city_title: "The Great British capital.",
    city_subtitle: "The largest city in the European Union.",
    time: 0,
    time_offset: -60 // minutes
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
      ]
    },
    time_scale: 15 * 60,
    scale: 2.0,
    city: "chicago",
    city_name: "Chicago",
    city_title: "The Windy City.",
    city_subtitle: "The third most populous city in the United States.",
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
      ]
    },
    time_scale: 15 * 60,
    scale: 2.0,
    city: "rome",
    city_name: "Rome",
    city_title: "Legendary founded in 753 BC.",
    city_subtitle: "More than two and a half thousand years of history.",
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
      ]
    },
    time_scale: 15 * 60,
    scale: 2.0,
    city: "helsinki",
    city_name: "Helsinki",
    city_title: "The largest city of Finland.",
    city_subtitle: "1,361,506 People in an arm of the Baltic Sea",
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
      ]
    },
    time_scale: 15 * 60,
    scale: 2.0,
    city: "mumbai",
    city_name: "Mumbai",
    city_title: "The city that never sleeps.",
    city_subtitle: "More than 3M points mapped over time.",
    time: 0,
    time_offset: -5*60 // minutes
  }
};

window.AppData.init_time = 0;
window.AppData.last_time = 1419;

