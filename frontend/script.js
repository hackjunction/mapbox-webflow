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

  // Get map data from Integromat

  function getLocations(url, done) {
    var xhr = new XMLHttpRequest();
    xhr.open("GET", url, true);
    xhr.onload = function () {
      done(null, xhr.response);
    };
    xhr.onerror = function () {
      done(xhr.response);
    };
    xhr.send();
  }

  // And we'd call it as such:

  getLocations(
    "https://hook.integromat.com/5a4mp73aie8ixdgfdzt4erxdy9uuh42m",
    function (err, datums) {
      if (err) {
        throw err;
      }
      console.log("integromat", datums);
    }
  );

  function getWebflowdata(url, done) {
    var xhr = new XMLHttpRequest();

    xhr.open("GET", url, true);
    xhr.setRequestHeader(
      "Authorization",
      "Bearer dca0b2f807ab19c0af7b5503d786e9874337dd6901485ff90d7e4a2ffd972ac8"
    );
    xhr.setRequestHeader("accepted-version", "1.0.0");
    xhr.onload = function () {
      done(null, xhr.response);
    };
    xhr.onerror = function () {
      done(xhr.response);
    };
    xhr.send();
  }

  // And we'd call it as such:

  getWebflowdata(
    "https://api.webflow.com/collections/6051cb041c2ff4cd91f14729/items",
    function (err, datums) {
      if (err) {
        throw err;
      }
      console.log("webflow", datums);
    }
  );

  map.addSource("places", {
    // This GeoJSON contains features that include an "icon"
    // property. The value of the "icon" property corresponds
    // to an image in the Mapbox Streets style's sprite.
    type: "geojson",
    data: {
      type: "FeatureCollection",
      features: [
        {
          type: "Feature",
          properties: {
            description:
              '<strong>Make it Mount Pleasant</strong><p><a href="http://www.mtpleasantdc.com/makeitmtpleasant" target="_blank" title="Opens in a new window">Make it Mount Pleasant</a> is a handmade and vintage market and afternoon of live entertainment and kids activities. 12:00-6:00 p.m.</p>',
            name: "Upea tapahtuma",
            description: "https://hackjunction.com",
            eventTime: "25/12/2021",
            linkToTickets: "https://hackjunction.com",
            shortDescription: "Noniin elikkäs",
            locationDescription: "Kunnon mesta",
            linkToEventSite: "https://hackjunction.com",
            eventImage:
              "https://edit.co.uk/uploads/2016/12/Image-1-Alternatives-to-stock-photography-Thinkstock.jpg",
          },
          geometry: {
            type: "Point",
            coordinates: [24.933168, 60.174651],
          },
        },
        {
          type: "Feature",
          properties: {
            description:
              '<strong>Mad Men Season Five Finale Watch Party</strong><p>Head to Lounge 201 (201 Massachusetts Avenue NE) Sunday for a <a href="http://madmens5finale.eventbrite.com/" target="_blank" title="Opens in a new window">Mad Men Season Five Finale Watch Party</a>, complete with 60s costume contest, Mad Men trivia, and retro food and drink. 8:00-11:00 p.m. $10 general admission, $20 admission and two hour open bar.</p>',
          },
          geometry: {
            type: "Point",
            coordinates: [24.038659, 38.931567],
          },
        },
      ],
    },
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