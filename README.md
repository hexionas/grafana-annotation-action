# grafana-annotation-action
GitHub Action for Grafana annotations.

![Example Image](images/example.png)

## Creating an annotation and updating the end time after some actions

```yaml
jobs:
  example:
    name: example job
    runs-on: ubuntu-latest
    steps:
      - name: Add Grafana annotation
        id: grafana
        uses: actions/grafana-annotation-action@v0
        with:
          grafanaHost: "https://grafana.example.com"
          grafanaToken: ${{ secrets.GRAFANA_TOKEN }}
          grafanaText: "Performance Test"
          grafanaTags: '["performance-test"]'
      - name: Action that takes some time
        run: sleep 30
      - name: Update Grafana annotation
        uses: actions/grafana-annotation-action@v0
        with:
          grafanaHost: "https://grafana.example.com"
          grafanaToken: ${{ secrets.GRAFANA_TOKEN }}
          grafanaAnnotationID: ${{ steps.grafana.outputs.annotation-id }} # Output from previous usage of action
```
