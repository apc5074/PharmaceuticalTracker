const express = require("express");

const app = express();
const url = "https://clinicaltrials.gov/api/v2/studies?pageSize=100";

app.get("/", (req, res) => {
  res.send("Hello World!");
});

app.get("/api/get-studies", async (req, res) => {
  let statusesFinal = [];
  let nextPageToken = "";

  try {
    do {
      console.log(`Fetching URL: ${url}&pageToken=${nextPageToken}`);
      const data = await fetch(
        nextPageToken ? `${url}&pageToken=${nextPageToken}` : url
      );
      if (!data.ok) {
        throw new Error(`HTTP error! status: ${data.status}`);
      }

      const json = await data.json();
      console.log(`Fetched ${json.studies.length} studies`);
      const statuses = json.studies.map((study) => {
        return {
          id: study.protocolSection.identificationModule.nctId,
          status: study.protocolSection.statusModule.overallStatus,
          officialTitle:
            study.protocolSection.identificationModule.officialTitle,
          startDate: study.protocolSection.statusModule.startDateStruct
            ? study.protocolSection.statusModule.startDateStruct.date
            : "Start date not available",
          completionDate: study.protocolSection.statusModule
            .completionDateStruct
            ? study.protocolSection.statusModule.completionDateStruct.date
            : "Completion date not available",
          lastSubmitDate: study.protocolSection.statusModule
            .lastUpdateSubmitDate
            ? study.protocolSection.statusModule.lastUpdateSubmitDate
            : "Last submit date not available",
          description: study.protocolSection.descriptionModule
            ? study.protocolSection.descriptionModule.briefSummary
            : "Description not available",
        };
      });

      statusesFinal = statusesFinal.concat(statuses);
      console.log(`Total studies so far: ${statusesFinal.length}`);

      nextPageToken = json.nextPageToken || "";
    } while (nextPageToken);

    console.log(statusesFinal);
    res.send(statusesFinal);
  } catch (error) {
    console.error("Error fetching or processing data:", error);
    res.status(500).send("An error occurred while fetching the studies.");
  }
});
app.listen(3000, () => {
  try {
    console.log("Server is running on port 3000");
  } catch (error) {
    console.log("Error: ", error);
  }
});
