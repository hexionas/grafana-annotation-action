const { run } = require('./index');
import axios from "axios";

jest.mock("axios")

describe('required inputs validation', () => {
    test('missing all required params', () => {
        run();
        expect(axios.post).toBeCalledTimes(0);
        expect(axios.put).toBeCalledTimes(0);
    });

    test('supplied grafanaHost', () => {
        process.env.INPUT_GRAFANAHOST = 'something';
        run();
        expect(axios.post).toBeCalledTimes(0);
        expect(axios.put).toBeCalledTimes(0);
    });

    test('supplied grafanaToken', () => {
        process.env.INPUT_GRAFANAHOST = 'something';
        process.env.INPUT_GRAFANATOKEN = 'something';
        run();
        expect(axios.post).toBeCalledTimes(0);
        expect(axios.put).toBeCalledTimes(0);
    });

    test('supplied grafanaText', () => {
        process.env.INPUT_GRAFANAHOST = 'something';
        process.env.INPUT_GRAFANATOKEN = 'something';
        process.env.INPUT_GRAFANATEXT = 'something';
        run();
        expect(axios.post).toBeCalledTimes(1);
        expect(axios.put).toBeCalledTimes(0);
    });
});


describe('create new annotation', () => {
    test('new global annotation with tags', () => {
        run();
        expect(axios.post).toBeCalledTimes(0);
        expect(axios.put).toBeCalledTimes(0);
    });

    test('new annotation for dashboard but no panel specified', () => {
        run();
        expect(axios.post).toBeCalledTimes(0);
        expect(axios.put).toBeCalledTimes(0);
    });

    test('new annotation for panel but no dashboard specified', () => {
        run();
        expect(axios.post).toBeCalledTimes(0);
        expect(axios.put).toBeCalledTimes(0);
    });

    test('new annotation for panel and dashboard', () => {
        run();
        expect(axios.post).toBeCalledTimes(0);
        expect(axios.put).toBeCalledTimes(0);
    });
});

describe('update existing annotation', () => {
    test('annotation update', () => {
        run();
        expect(axios.post).toBeCalledTimes(0);
        expect(axios.put).toBeCalledTimes(0);
    });
})
