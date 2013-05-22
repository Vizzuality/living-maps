
window.AppData = window.AppData || {};

window.AppData.CITIES = {

  'london': {
    map: {
      center: [51.511, -0.100],
      zoom: 12,
      maxZoom: 13,
      minZoom: 11
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
      minZoom: 11
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
      minZoom: 12
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
      minZoom: 12
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
      center: [18.972, 72.822],
      zoom: 13,
      maxZoom: 14,
      minZoom: 12
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

