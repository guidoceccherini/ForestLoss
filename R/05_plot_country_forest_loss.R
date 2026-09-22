library(dplyr)
library(tidyr)
library(readr)
library(stringr)
library(ggplot2)
library(scales)

# ---- paths -----------------------------------------------------------
country_table_path <- "data/raw/table.csv"
gee_extract_dir     <- "data/intermediate"
output_csv_dir       <- "data/processed/country_forest_loss"
output_fig_dir       <- file.path(output_csv_dir, "figures")

dir.create(output_csv_dir, recursive = TRUE, showWarnings = FALSE)
dir.create(output_fig_dir, recursive = TRUE, showWarnings = FALSE)

# ---- helper: read one country's three CSVs and build a tidy table ----
build_country_series <- function(fips_code, iso3_code, country_name, extract_dir) {
  
  f_total   <- file.path(extract_dir, paste0("Country_Forest_Change_EUOBS_", fips_code, ".csv"))
  f_fires   <- file.path(extract_dir, paste0("Country_Forest_Change_EUOBS_fires", fips_code, ".csv"))
  f_extreme <- file.path(extract_dir, paste0("Country_Forest_Change_EUOBS_Wind", fips_code, ".csv"))
  
  if (!all(file.exists(f_total, f_fires, f_extreme))) {
    return(NULL)
  }
  
  read_long <- function(path) {
    d <- read_csv(path, show_col_types = FALSE)
    d %>%
      dplyr::select(ADM0_NAME, starts_with("sum_")) %>%
      pivot_longer(-ADM0_NAME, names_to = "Year", values_to = "Area") %>%
      mutate(Year = str_remove(Year, "^sum_")) %>%
      group_by(Year) %>%
      summarise(Area = sum(Area, na.rm = TRUE), .groups = "drop")
  }
  
  total   <- read_long(f_total)   %>% rename(Total = Area)
  fires   <- read_long(f_fires)   %>% rename(Fires = Area)
  extreme <- read_long(f_extreme) %>% rename(ExtremeEvents = Area)
  
  combined <- total %>%
    left_join(fires,   by = "Year") %>%
    left_join(extreme, by = "Year") %>%
    replace(is.na(.), 0) %>%
    mutate(Year = as.numeric(Year)) %>%
    filter(Year >= 11) %>%              # keep years covered by the extreme-event mask (2011 onward)
    mutate(Year = Year + 2000L) %>%
    mutate(Harvest = pmax(Total - Fires - ExtremeEvents, 0)) %>%
    dplyr::select(Year, Harvest, Fires, ExtremeEvents)
  
  combined %>%
    pivot_longer(c(Harvest, Fires, ExtremeEvents), names_to = "name", values_to = "value") %>%
    mutate(
      ISO3    = iso3_code,
      Country = country_name,
      value_kha = value / (10000 * 1000)   # m2 -> thousands of hectares
    )
}

# ---- helper: plot one country's series --------------------------------
plot_country_series <- function(df, country_name, iso3_code, output_fig_dir) {
  
  df <- df %>%
    mutate(name = factor(name, levels = c("ExtremeEvents", "Fires", "Harvest")))
  
  p <- ggplot(df, aes(x = Year, y = value_kha, fill = name)) +
    geom_bar(position = "stack", stat = "identity") +
    theme_bw() +
    scale_fill_manual(values = c("#4DBBD5FF", "#E64B35FF", "#00A087FF")) +
    ggtitle(country_name) +
    xlab("Year") +
    ylab("Forest loss area [1,000 ha]") +
    labs(fill = "Forest loss driver") +
    scale_y_continuous(labels = function(x) format(x, big.mark = ",", scientific = FALSE)) +
    theme(
      panel.grid.minor = element_blank(),
      legend.position  = "bottom",
      legend.direction = "horizontal"
    )
  
  ggsave(
    filename = file.path(output_fig_dir, paste0("Plot_", iso3_code, ".png")),
    plot = p, width = 23, height = 23, units = "cm", dpi = 300
  )
}

# ---- main loop over countries -----------------------------------------
country_table <- read_csv(country_table_path, show_col_types = FALSE) %>%
  rename(
    Country = `Member Countries`,
    ISO3    = ISO3,
    FIPS    = FIPS
  ) %>%
  filter(!is.na(FIPS), FIPS != "")

all_country_data <- list()

for (i in seq_len(nrow(country_table))) {
  
  fips_code    <- toupper(country_table$FIPS[i])
  iso3_code    <- toupper(country_table$ISO3[i])
  country_name <- country_table$Country[i]
  
  country_series <- build_country_series(fips_code, iso3_code, country_name, gee_extract_dir)
  
  if (is.null(country_series)) next
  
  write_csv(country_series, file.path(output_csv_dir, paste0(iso3_code, ".csv")))
  plot_country_series(country_series, country_name, iso3_code, output_fig_dir)
  
  all_country_data[[iso3_code]] <- country_series
}

ExportForestLoss <- bind_rows(all_country_data)
write_csv(ExportForestLoss, file.path(output_csv_dir, "AllCountries_ForestLoss.csv"))
