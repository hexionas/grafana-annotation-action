const core = require('@actions/core');
const axios = require('axios');
const moment = require('moment');

try {
    let globalAnnotation = true;
    const grafanaHost = core.getInput("grafanaHost", {required: true});
    const grafanaToken = core.getInput("grafanaToken", {required: true});
    const grafanaTags = core.getInput("grafanaTags").split("\n").filter(x => x !== "");
    const grafanaDashboardID = Number.parseInt(core.getInput("grafanaDashboardID"), 10) || undefined;
    const grafanaPanelID = Number.parseInt(core.getInput("grafanaPanelID"),10) || undefined;
    const grafanaText = core.getInput("grafanaText");
    const grafanaAnnotationID = Number.parseInt(core.getInput("grafanaDashboardID"), 10) || undefined;

    let headers = {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${grafanaToken}`
    };

    if (grafanaAnnotationID === undefined) {
        console.log("preparing to create a new annotation")

        if (grafanaDashboardID !== undefined && grafanaPanelID !== undefined) {
            console.log("Dashboard and panel specified, non global annotation will be created.")
            globalAnnotation = false
        }

        let payload = {
            tags: grafanaTags,
            text: grafanaText
        };

        if (!globalAnnotation) {
            payload.dashboardId = grafanaDashboardID;
            payload.panelId = grafanaPanelID;
        }

        const response = await axios.post(
            `${grafanaHost}/api/annotations`,
            payload,
            {
                headers: headers
            }
        );

        if (response.status !== 200) {
            console.warn("non 200 status code from post /api/annotations: " + response.status)
            core.setFailed("post request had failed");
        }

        const annotationId = response.data.id;
        console.log(`successfully created an annotation with the following id [${annotationId}]`)
        core.setOutput("annotation-id", annotationId);

    } else {
        console.log("preparing to update an existing annotation")
        let payload = {
            timeEnd: moment.now().valueOf()
        };

        console.log(`updating the 'time-end' of annotation [${grafanaAnnotationID}]`);
        const response = await axios.patch(
            `${grafanaHost}/api/annotations/${grafanaAnnotationID}`,
            payload,
            {
                headers: headers
            }
        );

        if (response.status !== 200) {
            console.warn("non 200 status code from patch /api/annotations: " + response.status)
            core.setFailed("patch request had failed");
        }
        console.log("successfully updated the annotation with time-end");
    }
} catch (error) {
    core.setFailed(error.message);
}