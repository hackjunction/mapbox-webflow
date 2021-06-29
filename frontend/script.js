// This is a public read-only token and can therefore be stored in the codebase. Do not add any secret keys here!
mapboxgl.accessToken =
  "pk.eyJ1IjoiaGFja2p1bmN0aW9uIiwiYSI6ImNqdnFqaGtsMjI1ZWM0Ym9mZGg1cTNrODgifQ.opDfJH_G3cznE63MLRQ9ww";
var map = new mapboxgl.Map({
  container: "map",
  style: "mapbox://styles/mapbox/dark-v9",
  center: ["24.9384", "20.1699"], // starting position [lng, lat]
  zoom: "1.5", // starting zoom
  transitionDuration: "300",
  dragPan: "false",
  dragRotate: "false",
  scrollZoom: "false",
  touchZoom: "false",
  doubleClickZoom: "false",
  touchAction: "pan-y",
  attributionControl: "false",
});

const setActiveLocation = (e) => {
  const origlocation = e.features[0].geometry.coordinates.slice();

  // Let's change the center of the map so that the description popup fits better :)
  const newlocation = [
    e.features[0].geometry.coordinates[0],
    e.features[0].geometry.coordinates[1] + 0.5,
  ];

  map.flyTo({
    center: newlocation,
    essential: true,
    zoom: 7,
  });
};

// Add the image to the map style.
map.on("load", function () {
  map.loadImage(
    "https://upload.wikimedia.org/wikipedia/commons/7/7c/201408_cat.png",
    function (error, image) {
      map.addImage("cat", image);
      if (error) throw error;
    }
  );

  // Get map data from custom server

  function getLocations(method, url) {
    return new Promise(function (resolve, reject) {
      var xhr = new XMLHttpRequest();
      xhr.open(method, url);
      xhr.onload = resolve;
      xhr.onerror = reject;
      xhr.send();
    });
  }

  map.addSource("places", {
    type: "geojson",
    data: {},
  });

  map.addLayer({
    id: "places",
    type: "symbol",
    source: "places",
    layout: {
      "icon-image": "cat", // reference the image
      "icon-size": 0.1,
      "icon-allow-overlap": true,
    },
  });

  getLocations("GET", "https://mapbox-webflow.herokuapp.com/").then(
    function (e) {
      let saved = [];
      let response = JSON.parse(e.target.response);
      items = response?.body?.items;
      console.log(items);
      saved = items.map((elem) => ({
        type: "Feature",
        properties: {
          description: elem.description,
          name: elem.name,
          eventTime: elem["start-date-time"],
          linkToTickets: elem["external-link"],
          shortDescription: elem["short-description"],
          locationDescription: elem.description,
          linkToEventSite: elem.slug,
          eventImage: elem.image.url,
        },
        geometry: {
          type: "Point",
          //coordinates: [24.933168, 60.174651],
          coordinates: [elem.longitude, elem.latitude], // there seems to be problem how these are handled
        },
      }));
      console.log("saved", saved);

      map.getSource("places").setData({
        type: "FeatureCollection",
        features: saved,
      });
    },
    function (e) {
      // handle errors
    }
  );

  // Disable scrolling of the map.  Helpful if we want users to be able to scroll over the map. Requires that the buttons start working tho.
  //map.scrollZoom.disable();

  map.on("click", "places", function (event) {
    var coordinates = event.features[0].geometry.coordinates.slice();

    const {
      name,
      eventImage,
      description,
      eventTime,
      linkToTickets,
      shortDescription,
      locationDescription,
      linkToEventSite,
    } = event.features[0].properties;

    var newdesc = `

<div class="EventsMap--PopupWrapper EventsMap--PopupWrapper-active">
  <div class="EventsMap--Popup">
    <img
      class="EventsMap--Popup__image"
      src="${eventImage}"
      width="100%"
      height="180px"
    />
    <div class="EventsMap--Popup__content">
      <h4 class="EventsMap--Popup__name">${name}</h4>
      <p class="EventsMap--Popup__dates">
        ${eventTime} | ${locationDescription}
      </p>
      <p class="EventsMap--Popup__desc">${shortDescription}</p>
      ${
        linkToTickets
          ? `<a
        class="EventsMap--Popup__link"
        href="${linkToTickets}"
      >
        Tickets </a
      >`
          : null
      } ${
      linkToEventSite
        ? `<a
        class="EventsMap--Popup__link"
        href="${linkToEventSite}"
      >
        Event website </a
      >`
        : null
    }
    </div>
  </div>
  <div class="EventsMap--Popup__prev">
  <i class="fas fa-angle-left" onClick=${console.log("right")}></i>
</div>
  <div class="EventsMap--Popup__next">
  <i class="fas fa-angle-right"onClick=${console.log("left")}></i>
</div>
</div>

                      `;

    // Ensure that if the map is zoomed out such that multiple
    // copies of the feature are visible, the popup appears
    // over the copy being pointed to.
    while (Math.abs(event.lngLat.lng - coordinates[0]) > 180) {
      coordinates[0] += event.lngLat.lng > coordinates[0] ? 360 : -360;
    }

    var popup = new mapboxgl.Popup({ class: "apple-popup" })
      .setLngLat(coordinates)
      .setHTML(newdesc)
      .addTo(map);

    popup.on("close", function () {
      map.flyTo({
        center: ["24.9384", "20.1699"], // starting position [lng, lat]
        essential: true,
        zoom: 1.5,
      });
    });
  });

  map.on("click", "places", function (e) {
    const origlocation = e.features[0].geometry.coordinates.slice();

    // Let's change the center of the map so that the description popup fits better :)
    const newlocation = [
      e.features[0].geometry.coordinates[0],
      e.features[0].geometry.coordinates[1] + 0.5,
    ];

    map.flyTo({
      center: newlocation,
      essential: true,
      zoom: 5,
    });
  });

  map.on("mouseenter", "places", function () {
    map.getCanvas().style.cursor = "pointer";
  });

  // Change it back to a pointer when it leaves.
  map.on("mouseleave", "places", function () {
    map.getCanvas().style.cursor = "";
  });
});
