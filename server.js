const express = require("express");
const https = require("https");
require("dotenv").config();

const app = express();

app.use(express.json());
app.use(
  express.urlencoded({
    extended: true,
  })
);

function httpRequest(method, url, body = null) {
  if (!["get", "post", "head"].includes(method)) {
    throw new Error(`Invalid method: ${method}`);
  }

  let urlObject;

  try {
    urlObject = new URL(url);
  } catch (error) {
    throw new Error(`Invalid url ${url}`);
  }

  if (body && method !== "post") {
    throw new Error(
      `Invalid use of the body parameter while using the ${method.toUpperCase()} method.`
    );
  }

  let options = {
    method: method.toUpperCase(),
    hostname: urlObject.hostname,
    port: urlObject.port,
    path: urlObject.pathname,
    headers: {
      Authorization: process.env.AUTH_KEY,
      "accept-version": "1.0.0",
    },
  };

  if (body) {
    options.headers = { "Content-Length": Buffer.byteLength(body) };
  }

  return new Promise((resolve, reject) => {
    const clientRequest = https.request(options, (incomingMessage) => {
      // Response object.
      let response = {
        statusCode: incomingMessage.statusCode,
        headers: incomingMessage.headers,
        body: [],
      };

      // Collect response body data.
      incomingMessage.on("data", (chunk) => {
        response.body.push(chunk);
      });

      // Resolve on end.
      incomingMessage.on("end", () => {
        if (response.body.length) {
          response.body = response.body.join();

          try {
            response.body = JSON.parse(response.body);
          } catch (error) {
            // Silently fail if response is not JSON.
          }
        }

        resolve(response);
      });
    });

    // Reject on request error.
    clientRequest.on("error", (error) => {
      reject(error);
    });

    // Write request body if present.
    if (body) {
      clientRequest.write(body);
    }

    // Close HTTP connection.
    clientRequest.end();
  });
}

app.listen(process.env.PORT || 3000, () => console.log("Webhook is listening"));

app.get("/", (req, res) => {
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader(
    "Access-Control-Allow-Methods",
    "GET, POST, OPTIONS, PUT, PATCH, DELETE"
  ); // If needed
  res.setHeader(
    "Access-Control-Allow-Headers",
    "X-Requested-With,content-type"
  ); // If needed
  res.setHeader("Access-Control-Allow-Credentials", true); // If needed

  httpRequest(
    "get",
    "https://api.webflow.com/collections/6051cb041c2ff4cd91f14729/items"
  ).then(function (result) {
    console.log(result);
    res.status(200).json(result);
  });
});
