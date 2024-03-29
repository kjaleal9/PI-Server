const express = require("express");
const cors = require("cors");
const morgan = require("morgan");
const path = require("path");

const sampleCIPReportRouter = require("./routes/sampleCIPReport/sampleCIPReport");
const reportCIPRouter = require("./routes/reportCIP/reportCIP");
const recipesRouter = require("./routes/recipes/recipes");
const materialsRouter = require("./routes/materials/materials");
const processClassesRouter = require("./routes/process-classes/processClasses");
const phasesRouter = require("./routes/phases/phases");
const equipmentRouter = require("./routes/equipment/equipment");
const parametersRouter = require("./routes/parameters/parameters");
const errorLogRouter = require("./routes/errorLog/errorlog");
const performanceRouter = require("./routes/performanceTest/performance");
const batchTimesRouter = require("./routes/batchTime/batchTime");

const { databaseMiddleware } = require("./sql");

const app = express();

app.use(express.json());
app.use(
  cors({
    origin: ["http://localhost:3000", "http://localhost:3001"],
  })
);
app.use(morgan("combined"));
app.use(databaseMiddleware);
app.use(express.static(path.join(__dirname, "..", "public")));
app.get("/", (req, res) => {
  res.sendFile(path.join(__dirname, "..", "public", "index.html"));
});

app.use("/api/sampleCIPReport", sampleCIPReportRouter);
app.use("/api/reportCIP", reportCIPRouter);
app.use("/api/recipes", recipesRouter);
app.use("/api/materials", materialsRouter);
app.use("/api/process-classes", processClassesRouter);
app.use("/api/phases", phasesRouter);
app.use("/api/equipment", equipmentRouter);
app.use("/api/parameters", parametersRouter);
app.use("/api/errors", errorLogRouter);
app.use("/api/performance", performanceRouter);
app.use("/api/batch-times", batchTimesRouter);

module.exports = app;
