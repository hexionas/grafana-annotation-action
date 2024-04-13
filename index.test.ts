import { run } from './index';
import axios from "axios";

// Mock axios and reset after each test
jest.mock("axios");
const mockedAxiosPost = axios.post as jest.MockedFunction<typeof axios.post>;
const mockedAxiosPatch = axios.patch as jest.MockedFunction<typeof axios.patch>;

afterEach(() => {
    jest.clearAllMocks();
});

describe('Grafana Annotation Action Tests', () => {

    // ************************ Input Validation Tests ****************************************
    // ****************************************************************************************
    test('Input Validation: missing all required params', () => {
        run();
        expect(axios.post).not.toHaveBeenCalled();
        expect(axios.patch).not.toHaveBeenCalled();
    });

    test('Input Validation: supplied grafanaHost', () => {
        process.env.INPUT_GRAFANAHOST = 'something';
        run();
        expect(axios.post).not.toHaveBeenCalled();
        expect(axios.patch).not.toHaveBeenCalled();
    });

    test('Input Validation: supplied grafanaToken', () => {
        process.env.INPUT_GRAFANAHOST = 'something';
        process.env.INPUT_GRAFANATOKEN = 'something';
        run();
        expect(axios.post).not.toHaveBeenCalled();
        expect(axios.patch).not.toHaveBeenCalled();
    });

    test('Input Validation: supplied grafanaText, satisfied minimum required', () => {
        process.env.INPUT_GRAFANAHOST = 'something';
        process.env.INPUT_GRAFANATOKEN = 'something';
        process.env.INPUT_GRAFANATEXT = 'something';

        mockedAxiosPost.mockImplementationOnce(() => Promise.resolve({ status: 200, data: { id: 1} }));
        run();
        expect(axios.post).toHaveBeenCalledTimes(1);
        expect(axios.post).toHaveBeenCalledWith(expect.anything(), {
            tags: [],
            text: 'something',
        }, expect.anything());
        expect(axios.patch).not.toHaveBeenCalled();
    });


    // ************************ Create Annotation Tests ***************************************
    // ****************************************************************************************
    test('Create Annotation: global annotation with tags', () => {
        process.env.INPUT_GRAFANATAGS = 'tag:something\ntag2:something'
        mockedAxiosPost.mockImplementation(() => Promise.resolve({ status: 200, data: { id: 1} }));
        run();
        expect(axios.post).toHaveBeenCalledTimes(1);
        expect(axios.post).toHaveBeenCalledWith(expect.anything(), {
            tags: [
                'tag:something',
                'tag2:something',
            ],
            text: 'something',
        }, expect.anything());
        expect(axios.patch).not.toHaveBeenCalled();
    });

    test('Create Annotation: new annotation for dashboard but no panel specified', () => {
        process.env.INPUT_GRAFANADASHBOARDID = '12345';
        mockedAxiosPost.mockImplementation(() => Promise.resolve({ status: 200, data: { id: 1} }));
        run();
        expect(axios.post).not.toHaveBeenCalled();
        expect(axios.patch).not.toHaveBeenCalled();
    });

    test('Create Annotation: new annotation for panel but no dashboard specified', () => {
        process.env.INPUT_GRAFANAPANELID = '12345';
        process.env.INPUT_GRAFANADASHBOARDID = undefined;
        mockedAxiosPost.mockImplementation(() => Promise.resolve({ status: 200, data: { id: 1} }));
        run();
        expect(axios.post).not.toHaveBeenCalled();
        expect(axios.patch).not.toHaveBeenCalled();
    });

    test('Create Annotation: new annotation for panel and dashboard', () => {
        process.env.INPUT_GRAFANAPANELID = '12345';
        process.env.INPUT_GRAFANADASHBOARDID = '12345';
        mockedAxiosPost.mockImplementation(() => Promise.resolve({ status: 200, data: { id: 1} }));
        run();
        expect(axios.post).toHaveBeenCalledTimes(1);
        expect(axios.post).toHaveBeenCalledWith(expect.anything(), {
            tags: [
                'tag:something',
                'tag2:something',
            ],
            dashboardId: 12345,
            panelId: 12345,
            text: 'something',
        }, expect.anything());
        expect(axios.patch).not.toHaveBeenCalled();
    });


    // ************************ Annotation Update Tests ***************************************
    // ****************************************************************************************
    test('Update Annotation: update', () => {
        process.env.INPUT_GRAFANAANNOTATIONID = "12345";
        delete process.env.INPUT_GRAFANATEXT; // Make sure text is not present
        mockedAxiosPatch.mockImplementation(() => Promise.resolve({ status: 200}));
        run();
        expect(axios.post).not.toHaveBeenCalled();
        expect(axios.patch).toHaveBeenCalledTimes(1);
        expect(axios.patch).toHaveBeenCalledWith(expect.anything(), { timeEnd: expect.any(Number) }, expect.anything());
    });
});