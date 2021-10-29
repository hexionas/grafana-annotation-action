const core = require('@actions/core');
const axios = require('axios');
const moment = require('moment');

try {
    let globalAnnotation = true;
    const grafanaHost = core.getInput("grafanaHost", {required: true});
    const grafanaToken = core.getInput("grafanaToken", {required: true});
    const grafanaTags = core.getInput("grafanaTags");
    const grafanaDashboardID = core.getInput("grafanaDashboardID");
    const grafanaPanelID = core.getInput("grafanaPanelID");
    const grafanaText = core.getInput("grafanaText");
    const grafanaAnnotationID = core.getInput("grafanaDashboardID");

    let headers = {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${grafanaToken}`
    };

    if (grafanaAnnotationID === "") {
        console.log("preparing to create a new annotation")

        if (grafanaDashboardID !== "" && grafanaPanelID !== "") {
            console.log("Dashboard and panel specified, non global annotation will be created.")
            let globalAnnotation = false
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
            },
        )

        if (response.status !== 200) {
            console.warn("non 200 status code from post /api/annotations: " + response.status)
            throw new Error(response.statusText)
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
            },
        );

        console.log("successfully updated the annotation with time-end");
    }
} catch (error) {
    core.setFailed(error.message);
}