const express = require("express");
const router = express.Router();

function delay(duration) {
  const startTime = Date.now();
  while (Date.now() - startTime < duration) {}
}

router.get("/", (req, res) => {
  res.send(`Performance Example ${process.pid}`);
});

router.get("/timer", (req, res) => {
  delay(9000);
  res.send(`Ding ding ding ${process.pid}`);
});

module.exports = router;
