var AOItot = 
    /* color: #d63000 */
    /* shown: false */
    /* displayProperties: [
      {
        "type": "rectangle"
      }
    ] */
    ee.Geometry.Polygon(
        [[[-167.76416450683655, 73.70493587034896],
          [-167.76416450683655, -54.769203390873436],
          [178.52489799316342, -54.769203390873436],
          [178.52489799316342, 73.70493587034896]]], null, false),
    forest2016_at_15km = ee.Image("projects/planet-guido/assets/Forest2016_at_2km_2021GlobalFiresT");




var image = ee.Image("projects/ee-guido/assets/Forest2000_at_2km_2025GlobalFires_10"),
    image2 = ee.Image("projects/ee-guido/assets/loss_2004_at_2km_2025GlobalFires_10"),
    image3 = ee.Image("projects/ee-guido/assets/loss_2005_at_2km_2025GlobalFires_10"),
    image4 = ee.Image("projects/ee-guido/assets/loss_2006_at_2km_2025GlobalFires_10"),
    image5 = ee.Image("projects/ee-guido/assets/loss_2007_at_2km_2025GlobalFires_10"),
    image6 = ee.Image("projects/ee-guido/assets/loss_2008_at_2km_2025GlobalFires_10"),
    image7 = ee.Image("projects/ee-guido/assets/loss_2009_at_2km_2025GlobalFires_10"),
    image8 = ee.Image("projects/ee-guido/assets/loss_2010_at_2km_2025GlobalFires_10"),
    image9 = ee.Image("projects/ee-guido/assets/loss_2011_at_2km_2025GlobalFires_10"),
    image10 = ee.Image("projects/ee-guido/assets/loss_2012_at_2km_2025GlobalFires_10"),
    image11 = ee.Image("projects/ee-guido/assets/loss_2013_at_2km_2025GlobalFires_10"),
    image12 = ee.Image("projects/ee-guido/assets/loss_2014_at_2km_2025GlobalFires_10"),
    image13 = ee.Image("projects/ee-guido/assets/loss_2015_at_2km_2025GlobalFires_10"),
    image14 = ee.Image("projects/ee-guido/assets/loss_2016_at_2km_2025GlobalFires_10"),
    image15 = ee.Image("projects/ee-guido/assets/loss_2017_at_2km_2025GlobalFires_10"),
    image16 = ee.Image("projects/ee-guido/assets/loss_2018_at_2km_2025GlobalFires_10"),
    image17 = ee.Image("projects/ee-guido/assets/loss_2019_at_2km_2025GlobalFires_10"),
    image18 = ee.Image("projects/ee-guido/assets/loss_2020_at_2km_2025GlobalFires_10"),
    image19 = ee.Image("projects/ee-guido/assets/loss_2021_at_2km_2025GlobalFires_10"),
    image20 = ee.Image("projects/ee-guido/assets/loss_2022_at_2km_2025GlobalFires_10"),
    image21 = ee.Image("projects/ee-guido/assets/loss_2023_at_2km_2025GlobalFires_10");

var image22 = ee.Image("projects/ee-guido/assets/loss_2024_at_2km_2025GlobalFires_10");

var image23 = ee.Image("projects/ee-guido/assets/loss_2025_at_2km_2025GlobalFires_10");


var Final_loss= ee.Image(image2)
.addBands(image3)
.addBands(image4)
.addBands(image5)
.addBands(image6)
.addBands(image7)
.addBands(image8)
.addBands(image9)
.addBands(image10)
.addBands(image11)
.addBands(image12)
.addBands(image13)
.addBands(image14)
.addBands(image15)
.addBands(image16)
.addBands(image17)
.addBands(image18)
.addBands(image19)
.addBands(image20)
.addBands(image21)
.addBands(image22)
.addBands(image23)


print(Final_loss)



// reduce resolution to 0.2 Final_loss
var Final_loss_at_20km = Final_loss
  .reduceResolution(ee.Reducer.sum().unweighted(), false, 65536) 
  .reproject(ee.Projection('EPSG:4326').scale(0.2, 0.2)).updateMask(1) 


// export
  
  
  
  
Export.image.toDrive({
   image: Final_loss_at_20km.toDouble(),
description: 'FinalLoss_at_20km_2025Fires', 
// folder: 'EE_Images',
  crs: 'EPSG:4326',
  region: AOItot,
  maxPixels: 1e13,
  scale:'22263.898158654716' 
  }); 

// reduce resolution to 0.2 degrees

var Forest2000_at_20km = image
  .reduceResolution(ee.Reducer.sum().unweighted(), false, 65536) 
  .reproject(ee.Projection('EPSG:4326').scale(0.2, 0.2)).updateMask(1) 



  // export
 
Export.image.toDrive({
   image: Forest2000_at_20km.toDouble(),
description: 'Forest2000_at_20km_2025Fires', 
// folder: 'EE_Images',
  crs: 'EPSG:4326',
  region: AOItot,
  maxPixels: 1e13,
  scale:'22263.898158654716' 
  }); 





// Export.image.toDrive({
//   image: forest2016_at_15km.toDouble(),
// description: 'Forest2016_at_2km_2023GlobalFires_10', 
// // folder: 'EE_Images',
//   crs: 'EPSG:4326',
//   // crsTransform: '[0.25,0,-180,0,-0.25,90]',
//   region: AOItot,
//   // region: ee.Geometry.Polygon([-180, 90, 0, 90, 180, 90, 180, -90, 0, -90, -180, -90], null, false),
  
//   maxPixels: 1e13,
//   scale:'2226.3898158654715' 
//   }); 
