# R/05_plot_country_forest_loss.R
#
# This version does not use table.csv.
#
# Country names are read directly from the ADM0_NAME field in each total-loss
# CSV exported by gee/04_country_statistics.js. The suffix in the filename is
# used only as an internal GEE code and is not used to identify the country.
#
# Expected files in data/intermediate:
#   Country_Forest_Change_EUOBS_<CODE>.csv
#   Country_Forest_Change_EUOBS_fires<CODE>.csv
#   Country_Forest_Change_EUOBS_Wind<CODE>.csv
#
# For every total-loss file, the script extracts ADM0_NAME and then searches
# for the corresponding fires and Wind files using the same filename code.
# This avoids all ambiguity between ISO3166, ISO3, FIPS, and project-specific
# GEE country codes.

suppressPackageStartupMessages({
  library(dplyr)
  library(tidyr)
  library(readr)
  library(stringr)
  library(ggplot2)
  library(scales)
})

# -------------------------------------------------------------------------
# Paths
# -------------------------------------------------------------------------

gee_dir <- "data/intermediate"
output_dir <- "data/processed/country_forest_loss"
figure_dir <- file.path(output_dir, "figures")

dir.create(output_dir, recursive = TRUE, showWarnings = FALSE)
dir.create(figure_dir, recursive = TRUE, showWarnings = FALSE)

# -------------------------------------------------------------------------
# Identify total-loss files only
# -------------------------------------------------------------------------

all_csv <- list.files(
  gee_dir,
  pattern = "\\.csv$",
  full.names = FALSE
)

total_files <- all_csv[
  str_detect(
    all_csv,
    "^Country_Forest_Change_EUOBS_[A-Za-z0-9]+\\.csv$"
  ) &
    !str_detect(
      all_csv,
      "^Country_Forest_Change_EUOBS_(fires|Wind)"
    )
]

if (length(total_files) == 0) {
  stop("No total-loss country CSV files found in: ", gee_dir)
}

# -------------------------------------------------------------------------
# Helpers
# -------------------------------------------------------------------------

# Extract the GEE filename code from a total-loss filename.
get_gee_code <- function(filename) {
  str_match(
    filename,
    "^Country_Forest_Change_EUOBS_([A-Za-z0-9]+)\\.csv$"
  )[, 2]
}

# Read one exported CSV and return annual values by Hansen year code.
read_gee_series <- function(path) {
  
  if (!file.exists(path)) {
    return(NULL)
  }
  
  dat <- read_csv(
    path,
    show_col_types = FALSE,
    name_repair = "unique"
  )
  
  year_columns <- names(dat)[
    str_detect(names(dat), "^sum_[0-9]+$")
  ]
  
  if (length(year_columns) == 0 || nrow(dat) == 0) {
    return(NULL)
  }
  
  dat %>%
    select(all_of(year_columns)) %>%
    pivot_longer(
      cols = everything(),
      names_to = "YearCode",
      values_to = "Area_m2"
    ) %>%
    mutate(
      YearCode = suppressWarnings(
        as.integer(str_remove(YearCode, "^sum_"))
      ),
      Area_m2 = suppressWarnings(as.numeric(Area_m2))
    ) %>%
    filter(
      !is.na(YearCode),
      YearCode >= 1,
      YearCode <= 25
    ) %>%
    group_by(YearCode) %>%
    summarise(
      Area_m2 = sum(Area_m2, na.rm = TRUE),
      .groups = "drop"
    )
}

# Extract ADM0_NAME from a total-loss file.
get_country_name <- function(path) {
  
  dat <- read_csv(
    path,
    show_col_types = FALSE,
    name_repair = "unique",
    n_max = 1
  )
  
  if (!"ADM0_NAME" %in% names(dat)) {
    stop("ADM0_NAME is missing from: ", basename(path))
  }
  
  country <- unique(str_squish(as.character(dat$ADM0_NAME)))
  country <- country[!is.na(country) & country != ""]
  
  if (length(country) == 0) {
    return(NA_character_)
  }
  
  country[[1]]
}

# -------------------------------------------------------------------------
# Process one country from its three files
# -------------------------------------------------------------------------

process_country <- function(gee_code, country_name) {
  
  total_file <- file.path(
    gee_dir,
    paste0("Country_Forest_Change_EUOBS_", gee_code, ".csv")
  )
  
  fires_file <- file.path(
    gee_dir,
    paste0("Country_Forest_Change_EUOBS_fires", gee_code, ".csv")
  )
  
  wind_file <- file.path(
    gee_dir,
    paste0("Country_Forest_Change_EUOBS_Wind", gee_code, ".csv")
  )
  
  input_files <- c(
    Total = total_file,
    Fires = fires_file,
    Wind = wind_file
  )
  
  if (!all(file.exists(input_files))) {
    message(
      "Skipping ", country_name,
      " [GEE code ", gee_code, "]: missing ",
      paste(
        names(input_files)[!file.exists(input_files)],
        collapse = ", "
      ),
      " file(s)."
    )
    return(NULL)
  }
  
  total <- read_gee_series(total_file)
  fires <- read_gee_series(fires_file)
  wind <- read_gee_series(wind_file)
  
  # A file with no readable annual columns is treated as a zero series.
  # A file containing annual columns whose values are all zero is retained.
  zero_series <- tibble(
    YearCode = 1:25,
    Area_m2 = 0
  )
  
  if (is.null(total)) {
    total <- zero_series %>% rename(Total_m2 = Area_m2)
  } else {
    total <- total %>% rename(Total_m2 = Area_m2)
  }
  
  if (is.null(fires)) {
    fires <- zero_series %>% rename(Fires_m2 = Area_m2)
  } else {
    fires <- fires %>% rename(Fires_m2 = Area_m2)
  }
  
  if (is.null(wind)) {
    wind <- zero_series %>% rename(ExtremeEvents_m2 = Area_m2)
  } else {
    wind <- wind %>% rename(ExtremeEvents_m2 = Area_m2)
  }
  
  combined <- total %>%
    full_join(fires, by = "YearCode") %>%
    full_join(wind, by = "YearCode") %>%
    mutate(
      Total_m2 = replace_na(Total_m2, 0),
      Fires_m2 = replace_na(Fires_m2, 0),
      ExtremeEvents_m2 = replace_na(ExtremeEvents_m2, 0),
      Year = YearCode + 2000L
    ) %>%
    filter(YearCode >= 11) %>%
    mutate(
      Harvest_m2 = pmax(
        Total_m2 - Fires_m2 - ExtremeEvents_m2,
        0
      )
    ) %>%
    select(
      Year,
      YearCode,
      Total_m2,
      Harvest_m2,
      Fires_m2,
      ExtremeEvents_m2
    )
  
  if (nrow(combined) == 0) {
    message(
      "Skipping ", country_name,
      " [GEE code ", gee_code,
      "]: no observations after filtering."
    )
    return(NULL)
  }
  
  tidy_data <- combined %>%
    pivot_longer(
      cols = c(
        Harvest_m2,
        Fires_m2,
        ExtremeEvents_m2
      ),
      names_to = "name",
      values_to = "Area_m2"
    ) %>%
    mutate(
      name = recode(
        name,
        Harvest_m2 = "Harvest",
        Fires_m2 = "Fires",
        ExtremeEvents_m2 = "ExtremeEvents"
      ),
      value = Area_m2 / 10000000,
      Country = country_name,
      GEECode = gee_code
    ) %>%
    select(
      Year,
      YearCode,
      Country,
      GEECode,
      name,
      Area_m2,
      value
    )
  
  # Use the GEE code in the output filename because no table is used.
  write_csv(
    tidy_data,
    file.path(output_dir, paste0(gee_code, ".csv"))
  )
  
  plot_data <- tidy_data %>%
    mutate(
      name = factor(
        name,
        levels = c(
          "ExtremeEvents",
          "Fires",
          "Harvest"
        )
      )
    )
  
  plot <- ggplot(
    plot_data,
    aes(
      x = Year,
      y = value,
      fill = name
    )
  ) +
    geom_col(width = 0.8) +
    theme_bw() +
    scale_fill_manual(
      values = c(
        ExtremeEvents = "#4DBBD5FF",
        Fires = "#E64B35FF",
        Harvest = "#00A087FF"
      ),
      drop = FALSE
    ) +
    scale_x_continuous(
      breaks = seq(
        min(plot_data$Year, na.rm = TRUE),
        max(plot_data$Year, na.rm = TRUE),
        by = 1
      )
    ) +
    scale_y_continuous(
      labels = label_comma()
    ) +
    labs(
      title = country_name,
      x = "Year",
      y = "Forest loss area [1,000 ha]",
      fill = "Forest loss driver"
    ) +
    theme(
      panel.grid.minor = element_blank(),
      axis.line = element_line(),
      axis.text.x = element_text(angle = 45, hjust = 1),
      legend.position = "bottom",
      legend.direction = "horizontal"
    )
  
  ggsave(
    filename = file.path(
      figure_dir,
      paste0("Plot_", gee_code, ".png")
    ),
    plot = plot,
    width = 23,
    height = 23,
    units = "cm",
    dpi = 300
  )
  
  tidy_data
}

# -------------------------------------------------------------------------
# Process all total-loss files
# -------------------------------------------------------------------------

all_results <- list()
skipped <- character()

for (total_filename in total_files) {
  
  total_path <- file.path(gee_dir, total_filename)
  gee_code <- toupper(get_gee_code(total_filename))
  
  country_name <- tryCatch(
    get_country_name(total_path),
    error = function(e) {
      message(
        "Skipping ", total_filename, ": ",
        conditionMessage(e)
      )
      NA_character_
    }
  )
  
  if (is.na(country_name) || country_name == "") {
    skipped <- c(skipped, total_filename)
    next
  }
  
  result <- tryCatch(
    process_country(
      gee_code = gee_code,
      country_name = country_name
    ),
    error = function(e) {
      message(
        "Error for ", country_name,
        " [GEE code ", gee_code, "]: ",
        conditionMessage(e)
      )
      NULL
    }
  )
  
  if (is.null(result)) {
    skipped <- c(skipped, country_name)
  } else {
    all_results[[gee_code]] <- result
  }
}

# -------------------------------------------------------------------------
# Combined output and summary
# -------------------------------------------------------------------------

all_results <- bind_rows(all_results)

write_csv(
  all_results,
  file.path(output_dir, "AllCountries_ForestLoss.csv")
)

message("Processed countries: ", n_distinct(all_results$Country))
message("Skipped countries: ", length(skipped))

if (length(skipped) > 0) {
  message("Skipped: ", paste(skipped, collapse = ", "))
}