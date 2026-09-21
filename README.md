# EU Forest Observatory: Forest Loss Monitoring

Google Earth Engine and R workflow for producing annual forest-loss layers, aggregating them to a 0.2-degree grid, detecting extreme loss events, and generating country-level statistics by disturbance type.

## Overview

This repository documents a processing chain developed for the EU Forest Observatory. The workflow combines:

1.  Hansen Global Forest Change data (Hansen et al. 2013) for tree cover and annual forest loss.
2.  The Curtis (Curtis et al. 2018) forest-loss-driver map to filter the analysis specifically for forestry-related drivers.
3.  An annual fire-related forest-loss product (Tyukavina et al. 2022) used to exclude fire-affected pixels from the harvest-oriented layers.
4.  Google Earth Engine aggregation from approximately 30 m to a nominal 0.02-degree grid (approximately 2 km).
5.  A second Earth Engine aggregation from the approximately 2 km layers to a 0.2-degree grid (approximately 20 km).
6.  An R-based robust outlier procedure based on the median and median absolute deviation (MAD).
7.  A final Earth Engine workflow producing country-level annual statistics for total forest loss, fire-related loss, and extreme-loss events.

The analysis follows the conceptual approach described in Ceccherini et al. (2020), including spatial aggregation and the separation of abrupt or extreme disturbances from the normal loss signal. The original Nature study and its reproducibility materials are available through Zenodo: [code](https://doi.org/10.5281/zenodo.3687096) and [data](https://doi.org/10.5281/zenodo.3687090).

## Repository structure

``` text
.
├── README.md
├── gee/
│   ├── 01_prepare_annual_loss_assets.js
│   ├── 02_aggregate_to_20km.js
│   └── 04_country_statistics.js
├── R/
│   └── 03_detect_extreme_loss.R
├── data/
│   ├── raw/                 # Local GeoTIFFs downloaded from Earth Engine
│   └── intermediate/        # R-derived rasters and intermediate products
```

The code supplied for this documentation should be split into the files above. Asset IDs, Drive folders, regions, country lists, and local paths must be adapted to the execution account and project.

## Workflow

### 1. Prepare annual loss assets

`gee/01_prepare_annual_loss_assets.js` loads:

-   `UMD/hansen/global_forest_change_2025_v1_13`;
-   `users/sashatyu/2001-2025_fire_forest_loss_annual`;

AOItot (Total Area of Interest): This variable defines a massive, near-global bounding polygon using geographic WGS84 coordinates. It spans almost the entire globe excluding only the extreme polar caps.

The Hansen product is a 30 m Landsat-derived dataset covering 2000–2025. Its `treecover2000` band represents canopy cover in 2000, while `lossyear` encodes loss years as 1–25 for 2001–2025. The official Earth Engine catalogue documents the product and its bands at [Hansen Global Forest Change v1.13](https://developers.google.com/earth-engine/datasets/catalog/UMD_hansen_global_forest_change_2025_v1_13).

The script applies the following masks:

-   `treecover2000 >= forest_threshold`, with the default threshold set to 10%.
-   `gain < 1`, excluding pixels classified as forest gain.
-   Annual fire mask equal to zero, excluding pixels identified by the Tyukavina et al. (2022) fire product.

For each year, a binary loss layer is produced using `lossyear.eq(year_code)`. The script also constructs a cumulative forest-presence sequence beginning in 2000. These forest-presence layers are intended to represent the initial forest denominator for subsequent aggregation.

Each binary annual loss layer and the 2000 forest layer is aggregated with:

``` javascript
.reduceResolution(ee.Reducer.sum().unweighted(), false, 65536)
.reproject(ee.Projection('EPSG:4326').scale(0.02, 0.02))
```

The resulting values are sums of source pixels within the target grid cell. They should therefore be interpreted as counts of approximately 30 m pixels, not directly as hectares or percentages.

The script exports one Earth Engine asset per year and one 2000 forest-denominator asset. The export names follow this pattern:

``` text
Forest2000_at_2km_2025GlobalFires_10
loss_YYYY_at_2km_2025GlobalFires_10
```

Despite the variable names `at_2km`, the target projection uses 0.02 degrees. At the equator this is approximately 2.2 km, while the physical north–south and east–west dimensions vary with latitude.

### 2. Aggregate annual assets to approximately 20 km

`gee/02_aggregate_to_20km.js` loads the annual approximately 2 km loss assets, stacks them into `Final_loss`, and applies a second sum aggregation to a 0.2-degree grid:

``` javascript
Final_loss
  .reduceResolution(ee.Reducer.sum().unweighted(), false, 65536)
  .reproject(ee.Projection('EPSG:4326').scale(0.2, 0.2))
```

The script exports:

-   `FinalLoss_at_20km_2025Fires.tif`, containing one band per annual loss layer;
-   `Forest2000_at_20km_2025Fires.tif`, containing the aggregated 2000 forest denominator.

Note that this is a nominal scale corresponding to 0.2 degrees at the equator; it is not a constant metric 20 km grid globally.

The current supplied script loads loss assets from 2004 onward.

### 3. Detect extreme loss events in R

`R/03_detect_extreme_loss.R` reads the two 0.2-degree GeoTIFFs with the `raster` package:

``` r
Final_loss <- stack("Data2025/FinalLoss_at_20km_2025Fires.tif")
Forest <- stack("Data2025/Forest2000_at_20km_2025Fires.tif")
```

The script first calculates the annual loss percentage relative to the 2000 forest-pixel denominator:

``` r
Rho <- (Final_loss / Forest[[1]]) * 100
Rho[Rho == 0] <- NA
```

It then calculates cell-wise temporal summary statistics:

-   median;
-   mean;
-   MAD;
-   standard deviation.

The classification rule is:

``` r
Rho > RhoM + 3 * Rhomad &
Rho > 3 &
(Forest / 640000) > 0.05
```

A cell is classified as an extreme-loss event when its annual relative loss exceeds the temporal median by three MADs, exceeds 3%, and contains more than 5% forest cover according to the source-pixel denominator. The binary mask is written to:

``` text
Data2025/MASKGEE2025Fires.tif
```

The continuous relative-loss time series is written to:

``` text
Data2025/ForestHarvest_04_25Fires.tif
```

The R-derived mask is then uploaded to Earth Engine as the asset used by the country-statistics script. Please note that the time series starts in 2004.

Why the code divides by a fixed constant of 640,000? The Hansen GFC product is delivered on a fixed angular grid with a native pixel resolution of 0.00025 degree, approximately 30 m at the equator. A 0.2-degree aggregation cell therefore always contains exactly

``` text
(0.2 / 0.00025) x (0.2 / 0.00025) = 800 x 800 = 640,000
```

native pixels, on every row of the grid, at every latitude. This is a property of the degree-based grid definition, not an empirical or approximate figure. The pixel count per 0.2-degree cell is exactly 640,000 everywhere on Earth by construction. What genuinely changes with latitude is the physical ground area that each of those 640,000 pixels represents, because a 0.00025-degree pixel spans less east-west distance near the poles than near the equator, following the cosine of latitude, while its north-south extent stays roughly constant.

This shortcut is valid in this script because Forest/640000 is used only to compute a coverage fraction, not an absolute area. Forest is itself a sum of pixel counts produced by the earlier reduceResolution step on the same fixed angular grid, so the numerator and the 640,000 denominator are both counts on that identical grid. Their ratio is a dimensionless fraction that stays internally consistent at every latitude, even though the underlying pixel footprints shrink toward the poles, because the latitude-dependent physical area cancels out of the ratio rather than biasing it. The fraction is then used purely as a screening threshold, (Forest/640000) \> 0.05, to exclude cells with negligible forest presence before the outlier rule is applied, not to report an area in hectares or square kilometres.

The simplification would become a real limitation only if this denominator were repurposed to convert pixel counts into an absolute area estimate, for example hectares of forest loss, because then the shrinking pixel footprint at high latitude would require an explicit cosine-latitude area correction. That is not how it is used here, so no area bias is introduced into the extreme-loss classification.

### 4. Produce country-level statistics

`gee/04_country_statistics.js` combines:

-   the R-derived extreme-event mask;
-   the Curtis driver map;
-   the Hansen tree-cover and loss bands;
-   annual fire-loss layers;
-   country boundaries;
-   country-specific tree-cover thresholds.

The Curtis layer is loaded as:

``` javascript
ee.Image("projects/tmf-monitoring/assets/CurtisDrivers2018/FilledMap")
```

The code restricts the analysis to `CURTIS.eq(3)`, which refers to "forestry" forest loss driver. The script then builds a year-coded extreme-event image from the multiband R mask. Bands `b8` through `b22` are mapped to years 2011–2025 using the values 11–25.

Three CSV outputs are produced:

1.  `Country_Forest_Change_EUOBS_<country>.csv` — all forest loss by loss year.
2.  `Country_Forest_Change_EUOBS_fires<country>.csv` — fire-related loss, excluding cells classified as extreme events by the wind/extreme mask.
3.  `Country_Forest_Change_EUOBS_Wind<country>.csv` — loss in cells classified as extreme events (i.e. Wind and other extreme events).

The grouped reducer converts the `lossyear` or annual fire/extreme-event code into wide columns such as `sum_1`, `sum_2`, and so forth. The values are areas in square metres because loss pixels are multiplied by `ee.Image.pixelArea()`.

For each country, the script applies the corresponding country-specific threshold from `list_t`. Each country is assigned its own tree-cover percentage threshold in list_t, rather than the single global 10% threshold used in the first script. These per-country values are not arbitrary: they follow a calibration method (not shown here) introduced in Ceccherini et al. (2020) to reconcile the Hansen tree-cover product with official national forest statistics.

This calibration procedure (again, not shown here, see Ceccherini et al. 2020) works as follows:

- For each country, the Hansen treecover2000 layer is thresholded at a series of candidate tree-cover percentages, stepped in increments of 5% (for example 10%, 15%, 20%, and so on).

- At each candidate threshold, the total forest area implied by Hansen is computed for that country.

- This Hansen-derived forest area is compared against the corresponding national forest area reported by FAO's Forest Resource Assessment (FRA), obtained through FAOSTAT, for the closest matching reference year.

- The threshold that minimises the discrepancy between the Hansen-derived forest area and the FAO/FRA benchmark is selected as that country's calibrated tree-cover threshold.

It then calculates annual area statistics at 30 m using pixel area and grouped reducers.

### Fire and extreme-event terminology

The supplied variable names use `WIND`, but the R mask is generated from temporal outliers in the aggregated loss series. It should therefore be called an `extreme_loss` or `abrupt_loss` mask unless it has been independently validated as wind damage. If the mask is specifically intended to represent windstorms, document the external windstorm layer, temporal coverage, and exclusion rule.

## Reproducible execution

1.  Open `gee/01_prepare_annual_loss_assets.js` in the Earth Engine Code Editor.
2.  Confirm the Hansen and fire asset versions, and start the annual asset exports.
3.  Wait until the asset exports are complete and confirm their band names and footprints.
4.  Update the asset IDs in `gee/02_aggregate_to_20km.js` and export the two GeoTIFFs to Google Drive.
5.  Download the GeoTIFFs into the local `data/raw/` directory.
6.  Run `R/03_detect_extreme_loss.R` in RStudio and inspect the denominator, relative-loss, MAD, and extreme-event maps.
7.  Upload `MASKGEE2025Fires.tif` to Earth Engine and update its project asset ID in `gee/04_country_statistics.js`.
8.  Define the country boundary collection and verify the country-code vectors and threshold vector have identical lengths and ordering.
9.  Run the country-statistics script and retrieve the generated CSV files from Google Drive.
10. Archive the Earth Engine task configuration, asset IDs, input versions, thresholds, and output checksums.

## Data dictionary

| Object | Type | Meaning |
|------------------------|------------------------|------------------------|
| `treecover2000` | Hansen band | Tree canopy cover in 2000, percent. |
| `gain` | Hansen band | Forest gain flag for 2000–2012; not updated in later versions. |
| `lossyear` | Hansen band | Loss-year code 1–25 for 2001–2025. |
| `forest_threshold` | Parameter | Tree-cover threshold used to define forest. |
| `Final_loss` | Earth Engine image | Annual aggregated loss bands at the intermediate grid. |
| `Forest` | Earth Engine image | Aggregated 2000 forest-pixel denominator. |
| `Rho` | R raster stack | Annual loss as a percentage of the 2000 forest denominator. |
| `RhoM` | R raster | Temporal median of `Rho` per grid cell. |
| `Rhomad` | R raster | Temporal MAD of `Rho` per grid cell. |
| `Rho2` | R raster | Binary extreme-loss mask. |
| `WIND_TOT` | Earth Engine image | Year-coded extreme-event layer reconstructed from the uploaded mask. |
| `CURTIS` | Earth Engine image | Curtis forest-loss-driver map. |
| `pixelArea()` | Earth Engine image | Pixel area used for country-level area totals. |

## Scientific context

The Hansen GFC product is a Landsat-based global forest-change dataset with approximately 30 m pixels and annual loss-year coding through 2025 in the current v1.13 release. The product is documented in the Earth Engine Data Catalog and is distributed under CC BY 4.0. The original methodological basis is Hansen et al. (2013).

Curtis et al. (2018) classified dominant drivers of global forest loss, including commodity-driven deforestation, shifting agriculture, forestry, wildfire, and urbanisation.

The Nature study by Ceccherini et al. (2020) used aggregated satellite-derived forest-loss information to study harvested forest area in Europe, while excluding fire-affected areas and discussing the treatment of major windstorms. This repository extends that general structure with the 2025 Hansen release and a robust time-series procedure for identifying unusually large grid-cell losses.

## Citation

-   Ceccherini, G., Duveiller, G., Grassi, G., et al. (2020). Abrupt increase in harvested forest area over Europe after 2015. *Nature*, 583, 72–77. <https://doi.org/10.1038/s41586-020-2438-y>
-   Curtis, P. G., Slay, C. M., Harris, N. L., Tyukavina, A., and Hansen, M. C. (2018). Classifying drivers of global forest loss. *Science*, 361, 1108–1111. <https://doi.org/10.1126/science.aau3445>
-   Hansen, M. C., et al. (2013). High-resolution global maps of 21st-century forest cover change. *Science*, 342, 850–853. <https://doi.org/10.1126/science.1244693>
-   Tyukavina et al. (2022) Global trends of forest loss due to fire, 2001-2019. *Frontiers in Remote Sensing*, <https://doi.org/10.3389/frsen.2022.825190>
