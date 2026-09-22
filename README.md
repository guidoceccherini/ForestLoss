# EU Forest Observatory: Forest Loss Monitoring

Google Earth Engine and R workflow for producing annual forest-loss layers, aggregating them to a 0.2-degree grid, detecting extreme loss events, and generating country-level statistics by disturbance type.

## Overview

This repository documents a processing chain developed for the EU Forest Observatory. The workflow combines:

1.  Hansen Global Forest Change data (Hansen et al. 2013) for tree cover and annual forest loss.
2.  The Curtis (Curtis et al. 2018) forest-loss-driver map to filter the analysis specifically for forestry-related drivers.
3.  An annual fire-related forest-loss product (Tyukavina et al. 2022) used to exclude fire-affected pixels from the harvest-oriented layers.
4.  A first Google Earth Engine aggregation from approximately 30 m to a nominal 0.02-degree grid (approximately 2 km).
5.  A second Earth Engine aggregation from the approximately 2 km layers to a 0.2-degree grid (approximately 20 km).
6.  An R-based robust outlier procedure, applied to the 0.2-degree forest and loss rasters produced in step 5, that uses the median and median absolute deviation (MAD) of each grid cell's relative loss time series to flag years of anomalously high forest loss as extreme-loss events.
7.  A final Earth Engine workflow producing country-level annual statistics and plots for total forest loss, fire-related loss, and extreme-loss events.

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
│   ├── 03_detect_extreme_loss.R
│   └── 05_plot_country_forest_loss.R
└── data/
    ├── raw/                 # Local GeoTIFFs downloaded from Earth Engine and table.csv
    ├── intermediate/        # R-derived rasters and intermediate products
    └── processed/           # R-derived rasters and intermediate products
        └── country_forest_loss/
            ├── <ISO3>.csv        # optional cached long-format table per country
            └── figures/
                └── Plot_<ISO3>.png



```

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

`R/03_detect_extreme_loss.R` reads the two 0.2-degree GeoTIFFs (i.e. the exports of the gee code 02_aggregate_to_20km) with the `raster` package:

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

native pixels, on every row of the grid, at every latitude. This is a property of the degree-based grid definition, not an empirical or approximate figure. The pixel count per 0.2-degree cell is exactly 640,000 everywhere on Earth by construction.

This shortcut is valid in this script because Forest/640000 is used only to compute a coverage fraction, not an absolute area.

The simplification would become a real limitation only if this denominator were repurposed to convert pixel counts into an absolute area estimate, for example hectares of forest loss, because then the shrinking pixel footprint at high latitude would require an explicit cosine-latitude area correction. That is not how it is used here, so no area bias is introduced into the extreme-loss classification.

### 4. Produce country-level statistics

`gee/04_country_statistics.js` combines:

-   the R-derived extreme-event mask;
-   the Curtis driver map;
-   the Hansen tree-cover and loss bands;
-   annual fire-loss layers;
-   country boundaries;
-   country-specific tree-cover thresholds.


The first step is to load the R-derived extreme-event mask as an asset to identify extreme events. The extreme-event mask is loaded as:

``` javascript
ee.Image("projects/ee-guido/assets/MASKGEE2025Fires")
```

Then the Curtis layer is loaded as:

``` javascript
ee.Image("projects/tmf-monitoring/assets/CurtisDrivers2018/FilledMap")
```

The code restricts the analysis to `CURTIS.eq(3)`, which refers to "forestry" forest loss driver. The script then builds a year-coded extreme-event image from the multiband R mask. Bands `b8` through `b22` are mapped to years 2011–2025 using the values 11–25.

It then calculates annual area statistics at 30 m using pixel area and grouped reducers.

Three CSV outputs are produced:

1.  `Country_Forest_Change_EUOBS_<country>.csv` — all forest loss by loss year.
2.  `Country_Forest_Change_EUOBS_fires<country>.csv` — fire-related loss, excluding cells classified as extreme events by the wind/extreme mask.
3.  `Country_Forest_Change_EUOBS_Wind<country>.csv` — loss in cells classified as extreme events (i.e. Wind and other extreme events).

The grouped reducer converts the `lossyear` or annual fire/extreme-event code into wide columns such as `sum_1`, `sum_2`, and so forth. The values are areas in square metres because loss pixels are multiplied by `ee.Image.pixelArea()`.

For each country, the script applies the corresponding country-specific threshold from `list_t`. Each country is assigned its own tree-cover percentage threshold in list_t, rather than the single global 10% threshold used in the first script. These per-country values are not arbitrary: they follow a calibration method (not shown here) introduced in Ceccherini et al. (2020) to reconcile the Hansen tree-cover product with official national forest statistics.

This calibration procedure (again, not shown here, see Ceccherini et al. 2020) works as follows:

-   For each country, the Hansen treecover2000 layer is thresholded at a series of candidate tree-cover percentages, stepped in increments of 5% (for example 10%, 15%, 20%, and so on).

-   At each candidate threshold, the total forest area implied by Hansen is computed for that country.

-   This Hansen-derived forest area is compared against the corresponding national forest area reported by FAO's Forest Resource Assessment (FRA), obtained through FAOSTAT, for the closest matching reference year.

-   The threshold that minimises the discrepancy between the Hansen-derived forest area and the FAO/FRA benchmark is selected as that country's calibrated tree-cover threshold.



### 5. Visualize country-level forest loss by disturbance type

`R/05_plot_country_forest_loss.R` uses the three per-country CSV outputs produced by `gee/04_country_statistics.js` (total loss, fire-related loss, and extreme-event loss) and produces one stacked bar chart per country, showing annual forest loss decomposed into harvest, fires, and extreme events. This script merges and simplifies the two separate legacy R scripts previously used for this step: one that built a per-country long-format CSV from the raw Earth Engine exports, and a second that read those per-country CSVs and rendered the plots. The two steps are now combined into a single pass over the country list, removing the intermediate `DataReport25/` CSV write as a required step and keeping it only as an optional cache.

#### Country lookup table (`table.csv`)

The country lookup table is a standard country-code reference table with one row per country and the following columns, based on its header row:

| Column | Header | Example value | Role in this workflow |
|------------------|------------------|------------------|------------------|
| A | Flag | (icon, not used) | Not used. |
| B | Member Countries | Afghanistan | Human-readable country name, used for plot titles. |
| C | ISO3166 | AF | ISO 3166-1 alpha-2 code. Not used directly here. |
| D | ISONumeric | 4 | ISO 3166-1 numeric code. Not used directly here. |
| E | ISO3 | AFG | ISO 3166-1 alpha-3 code, used to name output files and label countries in the merged dataset. |
| F | FIPS | AF | Two-letter FIPS 10-4 code. This matches the country-label suffix (`list_cL`) used when exporting the CSVs from `gee/04_country_statistics.js`, and is therefore the key used to find each country's three input CSV files. |
| G | ccTLD | af | Country-code top-level domain. Not used directly here. |

Only three columns are needed for this script: the country name (column B, for plot titles), the ISO3 code (column E, for output file names and the merged dataset's `Country` field), and the FIPS code (column F, for locating the Earth Engine export files). 

#### Processing logic

For each valid country in the lookup table:

1.  Build the expected file paths for the three Earth Engine exports using the country's FIPS code: the total-loss CSV, the fire-loss CSV, and the extreme-event ("Wind") CSV.
2.  Skip the country if any of the three files is missing.
3.  In each CSV, select only the annual loss-year columns (the `sum_<code>` columns) and pivot them to long format with `Year` and `Area`.
4.  Aggregate each of the three long tables by `Year` with `sum(Area, na.rm = TRUE)`, collapsing any sub-national rows into a single national total per year.
5.  Join the three yearly totals (all loss, fires, extreme events) by `Year`, replacing missing matches with zero.
6.  Derive the harvest component as the residual: `Harvest = TotalLoss - Fires - ExtremeEvents`, clipping any negative values to zero. This residual approach assumes the three categories are mutually exclusive and exhaustive, consistent with how the masks are applied upstream in the country-statistics script.
7.  Clean the `Year` field by stripping the `sum_` prefix, converting it to numeric, and adding 2000 to convert the Hansen year code to a calendar year.
8.  Filter to the years actually covered by the extreme-event mask (year code `>= 11`, i.e. 2011 onward) so that harvest, fire, and extreme-event totals are compared over the same period.
9.  Reshape the three components to long format (`Harvest`, `Fires`, `ExtremeEvents`) and tag each row with the country's ISO3 code and full name.
10. Convert area from square metres to thousands of hectares for plotting (divide by `10,000 * 1,000`).

#### Plotting logic

For each country, the script renders a single stacked bar chart with `ggplot2`:

-   x-axis: `Year`;
-   y-axis: area in thousands of hectares;
-   fill: disturbance category (`Harvest`, `Fires`, `ExtremeEvents`), stacked with `geom_bar(position = "stack", stat = "identity")`;
-   a fixed category order and a fixed three-colour palette so that the same disturbance type always has the same colour across all country plots;
-   the country's full name (from column B of the lookup table) as the plot title, and axis and legend styling consistent with the project's figure style.

Each country's chart is saved as a PNG named after its ISO3 code, into a dedicated output folder.





## Reproducible execution

1.  Open `gee/01_prepare_annual_loss_assets.js` in the Earth Engine Code Editor.
2.  Confirm the Hansen and fire asset versions (there are annual updates), and start the annual asset exports.
3.  Wait until the asset exports are complete.
4.  Update the asset IDs in `gee/02_aggregate_to_20km.js` and export the two GeoTIFFs to Google Drive.
5.  Download the GeoTIFFs into the local `data/raw/` directory.
6.  Run `R/03_detect_extreme_loss.R` in RStudio and inspect the denominator, relative-loss, MAD, and extreme-event maps.
7.  Upload `MASKGEE2025Fires.tif` to Earth Engine and update its project asset ID in `gee/04_country_statistics.js`.
8.  Run the country-statistics script `04_country_statistics` and retrieve the generated CSV files from Google Drive.
9.  Run the plot script `05_plot_country_forest_loss` and retrieve the generated png files.

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
