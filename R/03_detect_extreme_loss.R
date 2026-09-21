library(raster)
library(tidyverse)

# setwd("~/EuForObs2021/DataGEE/Files@20Km/")

# Load GEE derived data

Final_loss <- stack('Data2025//FinalLoss_at_20km_2025Fires.tif') ##~/Documents/Forest_management_EU/Data/
Forest <- stack('Data2025/Forest2000_at_20km_2025Fires.tif') ##~/Documents/Forest_management_EU/Data/


#### there are 640000 landsta pixels in a 0.2 cell

plot((Forest/640000)<0.05)


######################### Percentage of pixels
Rho <- (Final_loss/Forest[[1]])*100

Rho[Rho==0] <- NA


#####median and MAD
RhoM <- raster::calc(Rho, median, na.rm=T)
RhoMean <-  raster::calc(Rho, mean, na.rm=T)

Rhomad <-  raster::calc(Rho, mad, na.rm=T)
Rhosd <-  raster::calc(Rho, sd, na.rm=T)


Rho2 <- Rho
Rho2[Rho2> (RhoM + (3*Rhomad)) & Rho2 > 3 & (Forest/640000)> 0.05] <- 100  ##//& (Forest/640000)> 0.05
Rho2[Rho2 != 100] <- NA
Rho2[Rho2>0] <- 1
Rho2 <- max(Rho2, na.rm=T)
plot(Rho2)


###new Rho

# Rho[Rho> (RhoM + (3*Rhomad)) & Rho > 3 & (Forest/640000)> 0.05 ] <- NA
Rho2 <- Rho
Rho2[Rho2> (RhoM + (3*Rhomad)) & Rho2 > 3 & (Forest/640000)> 0.05] <- 100  ##//& (Forest/640000)> 0.05
Rho2[Rho2 != 100] <- NA
Rho2[Rho2>0] <- 1

#########SAVE FOR GEE
# RhoG <- Rho
# RhoG[RhoG>0] <- 1
writeRaster(Rho2,filename="Data2025/MASKGEE2025Fires.tif", format="GTiff", overwrite=TRUE)
writeRaster(Rho,filename="Data2025/ForestHarvest_04_25Fires.tif", format="GTiff", overwrite=TRUE)

#########SAVE FOR GEE