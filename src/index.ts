import express from "express";
import bodyParser from "body-parser";

const app = express();
const port = process.env.PORT;

// maps the shortened path to the original URL
// e.g. /foo -> https://google.com
const pathMap = new Map<string, string>();

app.use(bodyParser.json());

app.post("/shorten", (req, res) => {
  if (!("url" in req.body) || typeof req.body.url !== "string") {
    res.status(400).send("missing 'url' field in request body");
    return;
  }

  let url: URL | null = null;

  try {
    url = new URL(req.body.url);
  } catch (err) {
    console.error(err);
    res.status(400).send("invalid url value");
    return;
  }

  if (url.hostname === req.hostname) {
    res.status(400).send(`url must not contain the hostname '${req.hostname}'`);
    return;
  }

  pathMap.set("/foo", req.body.url);

  res.status(200).json({
    path: "/foo",
    redirectsTo: req.body.url,
  });
});

app.get("*", (req, res) => {
  if (!pathMap.has(req.path)) {
    res.status(404).send("Not Found");
    return;
  }

  res.redirect(pathMap.get(req.path)!);
});

app.listen(port, () => {
  console.log(`Listening on port ${port}`);
});
