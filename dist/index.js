/******/ // The require scope
/******/ var __nccwpck_require__ = {};
/******/ 
/************************************************************************/
/******/ /* webpack/runtime/define property getters */
/******/ (() => {
/******/ 	// define getter functions for harmony exports
/******/ 	__nccwpck_require__.d = (exports, definition) => {
/******/ 		for(var key in definition) {
/******/ 			if(__nccwpck_require__.o(definition, key) && !__nccwpck_require__.o(exports, key)) {
/******/ 				Object.defineProperty(exports, key, { enumerable: true, get: definition[key] });
/******/ 			}
/******/ 		}
/******/ 	};
/******/ })();
/******/ 
/******/ /* webpack/runtime/hasOwnProperty shorthand */
/******/ (() => {
/******/ 	__nccwpck_require__.o = (obj, prop) => (Object.prototype.hasOwnProperty.call(obj, prop))
/******/ })();
/******/ 
/******/ /* webpack/runtime/compat */
/******/ 
/******/ if (typeof __nccwpck_require__ !== 'undefined') __nccwpck_require__.ab = new URL('.', import.meta.url).pathname.slice(import.meta.url.match(/^file:\/\/\/\w:/) ? 1 : 0, -1) + "/";
/******/ 
/************************************************************************/
var __webpack_exports__ = {};
/* harmony export */ __nccwpck_require__.d(__webpack_exports__, {
/* harmony export */   "K": () => (/* binding */ run)
/* harmony export */ });
const core = require('@actions/core');
const axios = require('axios');
const moment = require('moment');

const run = () => {
    try {
        let globalAnnotation = true;
        const grafanaHost = core.getInput("grafanaHost", {required: true});
        const grafanaToken = core.getInput("grafanaToken", {required: true});
        const grafanaTags = core.getInput("grafanaTags").split("\n").filter(x => x !== "");
        const grafanaDashboardID = Number.parseInt(core.getInput("grafanaDashboardID"), 10) || undefined;
        const grafanaPanelID = Number.parseInt(core.getInput("grafanaPanelID"),10) || undefined;
        const grafanaText = core.getInput("grafanaText", {required: true});
        const grafanaAnnotationID = Number.parseInt(core.getInput("grafanaAnnotationID"), 10) || undefined;

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

            console.log("payload: " + JSON.stringify(payload));

            axios.post(
                `${grafanaHost}/api/annotations`,
                payload,
                {
                    headers: headers
                }
            ).then((response) => {
                if (response.status !== 200) {
                    console.warn("non 200 status code from post /api/annotations: " + response.status)
                    core.setFailed("post request had failed");
                }

                const annotationId = response.data.id;
                console.log(`successfully created an annotation with the following id [${annotationId}]`)
                core.setOutput("annotation-id", annotationId);
            }).catch((err) => {
                console.error(err);
                core.setFailed(err.message);
            });

        } else {
            console.log("preparing to update an existing annotation")
            let payload = {
                timeEnd: moment.now().valueOf()
            };

            console.log(`updating the 'time-end' of annotation [${grafanaAnnotationID}]`);
            axios.patch(
                `${grafanaHost}/api/annotations/${grafanaAnnotationID}`,
                payload,
                {
                    headers: headers
                }
            ).then((response) => {
                if (response.status !== 200) {
                    console.warn("non 200 status code from patch /api/annotations: " + response.status)
                    core.setFailed("patch request had failed");
                }
                console.log("successfully updated the annotation with time-end");
            }).catch((err) => {
                console.error(err);
                core.setFailed(err.message);
            });
        }
    } catch (error) {
        core.setFailed(error.message);
    }
};

run();
var __webpack_exports__run = __webpack_exports__.K;
export { __webpack_exports__run as run };
