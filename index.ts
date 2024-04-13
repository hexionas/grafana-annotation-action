import * as core from '@actions/core';
import axios from 'axios';
import moment from 'moment';

type Headers = {
    'Content-Type': string;
    Authorization: string;
}

interface AnnotationPayload {
    tags: string[];
    text: string;
    dashboardId?: number;
    panelId?: number;
    timeEnd?: number;
}

export const run = async (): Promise<void> => {
    try {
        let globalAnnotation = true;
        const grafanaHost: string = core.getInput('grafanaHost', { required: true });
        const grafanaToken: string = core.getInput('grafanaToken', { required: true });
        const grafanaTags: string[] = core.getInput('grafanaTags').split('\n').filter(x => x !== '');
        const grafanaDashboardID: number | undefined = Number.parseInt(core.getInput('grafanaDashboardID'), 10) || undefined;
        const grafanaPanelID: number | undefined = Number.parseInt(core.getInput('grafanaPanelID'), 10) || undefined;
        const grafanaAnnotationID: number | undefined = Number.parseInt(core.getInput('grafanaAnnotationID'), 10) || undefined;
        const grafanaText: string = core.getInput('grafanaText', { required: grafanaAnnotationID === undefined });

        const headers: Headers = {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${grafanaToken}`,
        };

        if (grafanaAnnotationID === undefined) {
            console.log('Creating a new annotation');

            if ((grafanaDashboardID === undefined && grafanaPanelID !== undefined) ||
                (grafanaDashboardID !== undefined && grafanaPanelID === undefined)) {
                return core.error('Must supply both grafanaDashboardID, grafanaPanelID or none.');
            }

            if (grafanaDashboardID !== undefined && grafanaPanelID !== undefined) {
                console.log('Dashboard and panel specified, non-global annotation will be created.');
                globalAnnotation = false;
            }

            const payload: AnnotationPayload = {
                tags: grafanaTags,
                text: grafanaText,
            };

            if (!globalAnnotation) {
                payload.dashboardId = grafanaDashboardID;
                payload.panelId = grafanaPanelID;
            }

            console.log('Payload: ' + JSON.stringify(payload));

            // Using async/await for axios POST request
            try {
                const response = await axios.post(`${grafanaHost}/api/annotations`, payload, { headers });
                const annotationId = response.data.id;
                console.log(`Successfully created an annotation with the following id [${annotationId}]`);
                core.setOutput('annotation-id', annotationId);
            } catch (err) {
                console.error('Error in POST /api/annotations:', err);
                core.setFailed(`Error in POST /api/annotations: ${err}`);
            }

        } else {
            console.log('Updating the end time of existing annotation');
            const payload: Partial<AnnotationPayload> = {
                timeEnd: moment().valueOf(),
            };

            console.log(`Updating the 'time-end' of annotation [${grafanaAnnotationID}]`);

            try {
                await axios.patch(`${grafanaHost}/api/annotations/${grafanaAnnotationID}`, payload, { headers });
                console.log('Successfully updated the annotation with time-end');
            } catch (err) {
                console.error('Error in PATCH /api/annotations:', err);
                core.setFailed(`Error in PATCH /api/annotations: ${err}`);
            }
        }
    } catch (err) {
        if (err instanceof Error) {
            core.setFailed(err.message);
        } else {
            console.error('An unexpected error occurred');
        }
    }
};

run();
