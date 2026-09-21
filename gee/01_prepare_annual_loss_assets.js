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
          [178.52489799316342, 73.70493587034896]]], null, false);


// Load Dataset Hansen and Fires

var gfc = ee.Image("UMD/hansen/global_forest_change_2025_v1_13"),
    Countries = ee.FeatureCollection("USDOS/LSIB_SIMPLE/2017")

 
var EFFIS_TOT = ee.ImageCollection('users/sashatyu/2001-2025_fire_forest_loss_annual').mosaic().unmask()
Map.addLayer(EFFIS_TOT,{min:0, max:22},'Tyukaivina')

// Set tree cover threshold to define forest
var forest_threshold = 10 //tree cover in % as threshold for forest / non forest



 


 
// color palette
var palette = [ 'FFFFFF', 'CE7E45', 'DF923D', 'F1B555', 'FCD163', '99B718',
               '74A901', '66A000', '529400', '3E8601', '207401', '056201',
               '004C00', '023B01', '012E01', '011D01', '011301'];

      

// set EU boundaries
// var EU = ee.FeatureCollection(Countries.filterMetadata('wld_rgn','contains','Europe'));
// EU = EU.filterMetadata('country_na',"not_contains",'Russia')
// EU = EU.filterMetadata('country_na',"not_contains",'Portugal (Azores)')
// EU = EU.filterMetadata('country_na',"not_contains",'Belarus')
// EU = EU.filterMetadata('country_na',"not_contains",'Ukraine')
// EU = EU.filterMetadata('country_na',"not_contains",'Moldova')
// EU = EU.filterMetadata('country_na',"not_contains",'Svalbard')


// Load Hansen dataset
// Tree cover  and gain
//gfc = gfc.filterBounds(EU_b)
gfc = gfc//.clip(EU_b)
print(gfc)
// Tree cover  and gain
var treecover = gfc.select(['treecover2000'])//.clip(geometry);
var gain = gfc.select(['gain'])//.clip(geometry);

// Create Mask of canopy coverage greater than the threshold%
var Mask = treecover.gte(forest_threshold);
// Mask gain to avoid confusion
var MaskGain = gain.lt(1);
// Mask global dataset to create file with high tree coverage
var gfc_masked= gfc.mask(Mask)
gfc_masked = gfc_masked.updateMask(gfc_masked)

gfc_masked = gfc_masked.mask(MaskGain)
gfc_masked = gfc_masked.updateMask(gfc_masked)


// Mask EFFIS to exclude fires
// var MaskEFFIS = FIRES.lt(1);
// gfc_masked = gfc_masked.mask(MaskEFFIS)
// gfc_masked = gfc_masked.updateMask(gfc_masked)
Map.addLayer(gfc_masked.select('treecover2000'),{min:0, max:100})
gfc_masked = gfc_masked.updateMask(EFFIS_TOT.select('b1').eq(0))
Map.addLayer(gfc_masked.select('treecover2000'),{min:0, max:100})


print(gfc_masked)
var treecoverM = gfc_masked.select(['treecover2000'])

var lossyear = gfc_masked.select(['lossyear'])//.clip(geometry);
// var loss = gfc_masked.select(['loss'])//.clip(geometry);
lossyear = lossyear.mask(Mask)
lossyear = lossyear.updateMask(lossyear)

// Forest LOSS in 2001 -2017
var loss_2001 = lossyear.eq(1);
var loss_2002 = lossyear.eq(2);
var loss_2003 = lossyear.eq(3);
var loss_2004 = lossyear.eq(4);
var loss_2005 = lossyear.eq(5);
var loss_2006 = lossyear.eq(6);
var loss_2007 = lossyear.eq(7);
var loss_2008 = lossyear.eq(8);
var loss_2009 = lossyear.eq(9);
var loss_2010 = lossyear.eq(10);
var loss_2011 = lossyear.eq(11);
var loss_2012 = lossyear.eq(12);
var loss_2013 = lossyear.eq(13);
var loss_2014 = lossyear.eq(14);
var loss_2015 = lossyear.eq(15);
var loss_2016 = lossyear.eq(16);
var loss_2017 = lossyear.eq(17);
var loss_2018 = lossyear.eq(18);
var loss_2019 = lossyear.eq(19);
var loss_2020 = lossyear.eq(20);
var loss_2021 = lossyear.eq(21);
var loss_2022 = lossyear.eq(22);
var loss_2023 = lossyear.eq(23);
var loss_2024 = lossyear.eq(24);
var loss_2025 = lossyear.eq(25);





// Forest update
var forest2000 = treecoverM.gte(forest_threshold);
var forest2001 = forest2000.where(loss_2001.eq(1),0);
var forest2002 = forest2001.where(loss_2002.eq(1),0);
var forest2003 = forest2002.where(loss_2003.eq(1),0);
var forest2004 = forest2003.where(loss_2004.eq(1),0);
var forest2005 = forest2004.where(loss_2005.eq(1),0);
var forest2006 = forest2005.where(loss_2006.eq(1),0);
var forest2007 = forest2006.where(loss_2007.eq(1),0);
var forest2008 = forest2007.where(loss_2008.eq(1),0);
var forest2009 = forest2008.where(loss_2009.eq(1),0);
var forest2010 = forest2009.where(loss_2010.eq(1),0);
var forest2011 = forest2010.where(loss_2011.eq(1),0);
var forest2012 = forest2011.where(loss_2012.eq(1),0);
var forest2013 = forest2012.where(loss_2013.eq(1),0);
var forest2014 = forest2013.where(loss_2014.eq(1),0);
var forest2015 = forest2014.where(loss_2015.eq(1),0);
var forest2016 = forest2015.where(loss_2016.eq(1),0);
var forest2017 = forest2016.where(loss_2017.eq(1),0);
var forest2018 = forest2017.where(loss_2018.eq(1),0);
var forest2019 = forest2018.where(loss_2019.eq(1),0);
var forest2020 = forest2019.where(loss_2020.eq(1),0);
var forest2021 = forest2020.where(loss_2021.eq(1),0);
var forest2022 = forest2021.where(loss_2022.eq(1),0);
var forest2023 = forest2022.where(loss_2023.eq(1),0);
var forest2024 = forest2023.where(loss_2024.eq(1),0);
var forest2025 = forest2024.where(loss_2025.eq(1),0);

var treecover2000_0 =gfc.select(['treecover2000'])
treecover2000_0 = treecover2000_0.where(treecover2000_0.gte(0),1)
Map.addLayer(treecover2000_0,{min: 0, max: 1,  palette:[ 'red', 'green']},'treecover2000_0', false)


var Pixel_per_cell = treecover2000_0///.unmask()
  .reduceResolution(ee.Reducer.sum().unweighted(), false, 65536) 
  .reproject(ee.Projection('EPSG:4326').scale(0.02, 0.02)).updateMask(1) 
 Map.addLayer(Pixel_per_cell,{min: 0, max: 800,  palette:[ 'red', 'green']},'Pixel_per_cell')


var loss_2001_at_15km = loss_2001//.unmask()
  .reduceResolution(ee.Reducer.sum().unweighted(), false, 65536) 
  .reproject(ee.Projection('EPSG:4326').scale(0.02, 0.02)).updateMask(1) 
  var loss_2002_at_15km = loss_2002//.unmask()
  .reduceResolution(ee.Reducer.sum().unweighted(), false, 65536) 
  .reproject(ee.Projection('EPSG:4326').scale(0.02, 0.02)).updateMask(1) 
  
  var loss_2003_at_15km = loss_2003//.unmask()
  .reduceResolution(ee.Reducer.sum().unweighted(), false, 65536) 
  .reproject(ee.Projection('EPSG:4326').scale(0.02, 0.02)).updateMask(1) 


  var loss_2004_at_15km = loss_2004//.unmask()
  .reduceResolution(ee.Reducer.sum().unweighted(), false, 65536) 
  .reproject(ee.Projection('EPSG:4326').scale(0.02, 0.02)).updateMask(1) 
var loss_2005_at_15km = loss_2005//.unmask()
  .reduceResolution(ee.Reducer.sum().unweighted(), false, 65536) 
  .reproject(ee.Projection('EPSG:4326').scale(0.02, 0.02)).updateMask(1) 
var loss_2006_at_15km = loss_2006//.unmask()
  .reduceResolution(ee.Reducer.sum().unweighted(), false, 65536) 
  .reproject(ee.Projection('EPSG:4326').scale(0.02, 0.02)).updateMask(1) 
var loss_2007_at_15km = loss_2007//.unmask()
  .reduceResolution(ee.Reducer.sum().unweighted(), false, 65536) 
  .reproject(ee.Projection('EPSG:4326').scale(0.02, 0.02)).updateMask(1) 
var loss_2008_at_15km = loss_2008//.unmask()
  .reduceResolution(ee.Reducer.sum().unweighted(), false, 65536) 
  .reproject(ee.Projection('EPSG:4326').scale(0.02, 0.02)).updateMask(1) 
var loss_2009_at_15km = loss_2009//.unmask()
  .reduceResolution(ee.Reducer.sum().unweighted(), false, 65536) 
  .reproject(ee.Projection('EPSG:4326').scale(0.02, 0.02)).updateMask(1) 
var loss_2010_at_15km = loss_2010//.unmask()
  .reduceResolution(ee.Reducer.sum().unweighted(), false, 65536) 
  .reproject(ee.Projection('EPSG:4326').scale(0.02, 0.02)).updateMask(1) 
var loss_2011_at_15km = loss_2011//.unmask()
  .reduceResolution(ee.Reducer.sum().unweighted(), false, 65536) 
  .reproject(ee.Projection('EPSG:4326').scale(0.02, 0.02)).updateMask(1) 
var loss_2012_at_15km = loss_2012//.unmask()
  .reduceResolution(ee.Reducer.sum().unweighted(), false, 65536) 
  .reproject(ee.Projection('EPSG:4326').scale(0.02, 0.02)).updateMask(1) 
var loss_2013_at_15km = loss_2013//.unmask()
  .reduceResolution(ee.Reducer.sum().unweighted(), false, 65536) 
  .reproject(ee.Projection('EPSG:4326').scale(0.02, 0.02)).updateMask(1) 
var loss_2014_at_15km = loss_2014//.unmask()
  .reduceResolution(ee.Reducer.sum().unweighted(), false, 65536) 
  .reproject(ee.Projection('EPSG:4326').scale(0.02, 0.02)).updateMask(1) 
var loss_2015_at_15km = loss_2015//.unmask()
  .reduceResolution(ee.Reducer.sum().unweighted(), false, 65536) 
  .reproject(ee.Projection('EPSG:4326').scale(0.02, 0.02)).updateMask(1) 
var loss_2016_at_15km = loss_2016//.unmask()
  .reduceResolution(ee.Reducer.sum().unweighted(), false, 65536) 
  .reproject(ee.Projection('EPSG:4326').scale(0.02, 0.02)).updateMask(1) 
var loss_2017_at_15km = loss_2017//.unmask()
  .reduceResolution(ee.Reducer.sum().unweighted(), false, 65536) 
  .reproject(ee.Projection('EPSG:4326').scale(0.02, 0.02)).updateMask(1) 
var loss_2018_at_15km = loss_2018//.unmask()
  .reduceResolution(ee.Reducer.sum().unweighted(), false, 65536) 
  .reproject(ee.Projection('EPSG:4326').scale(0.02, 0.02)).updateMask(1) 
var loss_2019_at_15km = loss_2019//.unmask()
  .reduceResolution(ee.Reducer.sum().unweighted(), false, 65536) 
  .reproject(ee.Projection('EPSG:4326').scale(0.02, 0.02)).updateMask(1) 
  var loss_2020_at_15km = loss_2020//.unmask()
  .reduceResolution(ee.Reducer.sum().unweighted(), false, 65536) 
  .reproject(ee.Projection('EPSG:4326').scale(0.02, 0.02)).updateMask(1) 
    var loss_2021_at_15km = loss_2021//.unmask()
  .reduceResolution(ee.Reducer.sum().unweighted(), false, 65536) 
  .reproject(ee.Projection('EPSG:4326').scale(0.02, 0.02)).updateMask(1) 
      var loss_2022_at_15km = loss_2022//.unmask()
  .reduceResolution(ee.Reducer.sum().unweighted(), false, 65536) 
  .reproject(ee.Projection('EPSG:4326').scale(0.02, 0.02)).updateMask(1) 
        var loss_2023_at_15km = loss_2023//.unmask()
  .reduceResolution(ee.Reducer.sum().unweighted(), false, 65536) 
  .reproject(ee.Projection('EPSG:4326').scale(0.02, 0.02)).updateMask(1) 
   var loss_2024_at_15km = loss_2024//.unmask()
  .reduceResolution(ee.Reducer.sum().unweighted(), false, 65536) 
  .reproject(ee.Projection('EPSG:4326').scale(0.02, 0.02)).updateMask(1) 
     var loss_2025_at_15km = loss_2025//.unmask()
  .reduceResolution(ee.Reducer.sum().unweighted(), false, 65536) 
  .reproject(ee.Projection('EPSG:4326').scale(0.02, 0.02)).updateMask(1) 
//////////////////////////////// FOREST


  var forest2000_at_15km = forest2000//.unmask()
  .reduceResolution(ee.Reducer.sum().unweighted(), false, 65536) 
  .reproject(ee.Projection('EPSG:4326').scale(0.02, 0.02)).updateMask(1) 





//export

// var Final_loss_at_15km = loss_2001_at_15km
// .addBands(loss_2002_at_15km).addBands(loss_2003_at_15km)
// .addBands(loss_2004_at_15km).addBands(loss_2005_at_15km)
// .addBands(loss_2006_at_15km).addBands(loss_2007_at_15km)
// .addBands(loss_2008_at_15km).addBands(loss_2009_at_15km).addBands(loss_2010_at_15km)
// .addBands(loss_2011_at_15km).addBands(loss_2012_at_15km)
// .addBands(loss_2013_at_15km).addBands(loss_2014_at_15km)
// .addBands(loss_2015_at_15km).addBands(loss_2016_at_15km)
// .addBands(loss_2017_at_15km).addBands(loss_2018_at_15km)
// .addBands(loss_2019_at_15km).addBands(loss_2020_at_15km)
// .addBands(loss_2021_at_15km)






// print(Final_loss_at_15km)


Map.addLayer(AOItot)


// Export.image.toAsset({
//   image: Final_loss_at_15km.toUint16(),
// description: 'Final_loss_at_2km_2021Global', 
// // folder: 'EE_Images',
//   crs: 'EPSG:4326',
//   // crsTransform: '[0.25,0,-180,0,-0.25,90]',
//   region: EU_b,
//   // region: ee.Geometry.Polygon([-180, 90, 0, 90, 180, 90, 180, -90, 0, -90, -180, -90], null, false),
  
//   maxPixels: 1e13,
//   scale:'2226.3898158654715' 
//   }); 
  
  
Export.image.toAsset({
   image: forest2000_at_15km.toDouble(),
description: 'Forest2000_at_2km_2025GlobalFires_10', 
// folder: 'EE_Images',
  crs: 'EPSG:4326',
  // crsTransform: '[0.25,0,-180,0,-0.25,90]',
  region: AOItot,
  // region: ee.Geometry.Polygon([-180, 90, 0, 90, 180, 90, 180, -90, 0, -90, -180, -90], null, false),
  
  maxPixels: 1e13,
  scale:'2226.3898158654715' 
  }); 



Export.image.toAsset({
   image: loss_2025_at_15km.toUint16(),
description: 'loss_2025_at_2km_2025GlobalFires_10', 
// folder: 'EE_Images',
  crs: 'EPSG:4326',
  // crsTransform: '[0.25,0,-180,0,-0.25,90]',
  region: AOItot,
  // region: ee.Geometry.Polygon([-180, 90, 0, 90, 180, 90, 180, -90, 0, -90, -180, -90], null, false),
  
  maxPixels: 1e13,
  scale:'2226.3898158654715' 
  }); 


Export.image.toAsset({
   image: loss_2024_at_15km.toUint16(),
description: 'loss_2024_at_2km_2025GlobalFires_10', 
// folder: 'EE_Images',
  crs: 'EPSG:4326',
  // crsTransform: '[0.25,0,-180,0,-0.25,90]',
  region: AOItot,
  // region: ee.Geometry.Polygon([-180, 90, 0, 90, 180, 90, 180, -90, 0, -90, -180, -90], null, false),
  
  maxPixels: 1e13,
  scale:'2226.3898158654715' 
  }); 

Export.image.toAsset({
   image: loss_2023_at_15km.toUint16(),
description: 'loss_2023_at_2km_2025GlobalFires_10', 
// folder: 'EE_Images',
  crs: 'EPSG:4326',
  // crsTransform: '[0.25,0,-180,0,-0.25,90]',
  region: AOItot,
  // region: ee.Geometry.Polygon([-180, 90, 0, 90, 180, 90, 180, -90, 0, -90, -180, -90], null, false),
  
  maxPixels: 1e13,
  scale:'2226.3898158654715' 
  }); 


Export.image.toAsset({
   image: loss_2022_at_15km.toUint16(),
description: 'loss_2022_at_2km_2025GlobalFires_10', 
// folder: 'EE_Images',
  crs: 'EPSG:4326',
  // crsTransform: '[0.25,0,-180,0,-0.25,90]',
  region: AOItot,
  // region: ee.Geometry.Polygon([-180, 90, 0, 90, 180, 90, 180, -90, 0, -90, -180, -90], null, false),
  
  maxPixels: 1e13,
  scale:'2226.3898158654715' 
  }); 

Export.image.toAsset({
   image: loss_2021_at_15km.toUint16(),
description: 'loss_2021_at_2km_2025GlobalFires_10', 
// folder: 'EE_Images',
  crs: 'EPSG:4326',
  // crsTransform: '[0.25,0,-180,0,-0.25,90]',
  region: AOItot,
  // region: ee.Geometry.Polygon([-180, 90, 0, 90, 180, 90, 180, -90, 0, -90, -180, -90], null, false),
  
  maxPixels: 1e13,
  scale:'2226.3898158654715' 
  }); 
  

Export.image.toAsset({
   image: loss_2020_at_15km.toUint16(),
description: 'loss_2020_at_2km_2025GlobalFires_10', 
// folder: 'EE_Images',
  crs: 'EPSG:4326',
  // crsTransform: '[0.25,0,-180,0,-0.25,90]',
  region: AOItot,
  // region: ee.Geometry.Polygon([-180, 90, 0, 90, 180, 90, 180, -90, 0, -90, -180, -90], null, false),
  
  maxPixels: 1e13,
  scale:'2226.3898158654715' 
  }); 
  
Export.image.toAsset({
   image: loss_2019_at_15km.toUint16(),
description: 'loss_2019_at_2km_2025GlobalFires_10', 
// folder: 'EE_Images',
  crs: 'EPSG:4326',
  // crsTransform: '[0.25,0,-180,0,-0.25,90]',
  region: AOItot,
  // region: ee.Geometry.Polygon([-180, 90, 0, 90, 180, 90, 180, -90, 0, -90, -180, -90], null, false),
  
  maxPixels: 1e13,
  scale:'2226.3898158654715' 
  }); 
  
Export.image.toAsset({
   image: loss_2018_at_15km.toUint16(),
description: 'loss_2018_at_2km_2025GlobalFires_10', 
// folder: 'EE_Images',
  crs: 'EPSG:4326',
  // crsTransform: '[0.25,0,-180,0,-0.25,90]',
  region: AOItot,
  // region: ee.Geometry.Polygon([-180, 90, 0, 90, 180, 90, 180, -90, 0, -90, -180, -90], null, false),
  
  maxPixels: 1e13,
  scale:'2226.3898158654715' 
  }); 
  
Export.image.toAsset({
   image: loss_2017_at_15km.toUint16(),
description: 'loss_2017_at_2km_2025GlobalFires_10', 
// folder: 'EE_Images',
  crs: 'EPSG:4326',
  // crsTransform: '[0.25,0,-180,0,-0.25,90]',
  region: AOItot,
  // region: ee.Geometry.Polygon([-180, 90, 0, 90, 180, 90, 180, -90, 0, -90, -180, -90], null, false),
  
  maxPixels: 1e13,
  scale:'2226.3898158654715' 
  }); 
  
Export.image.toAsset({
   image: loss_2016_at_15km.toUint16(),
description: 'loss_2016_at_2km_2025GlobalFires_10', 
// folder: 'EE_Images',
  crs: 'EPSG:4326',
  // crsTransform: '[0.25,0,-180,0,-0.25,90]',
  region: AOItot,
  // region: ee.Geometry.Polygon([-180, 90, 0, 90, 180, 90, 180, -90, 0, -90, -180, -90], null, false),
  
  maxPixels: 1e13,
  scale:'2226.3898158654715' 
  }); 
  
  
Export.image.toAsset({
   image: loss_2015_at_15km.toUint16(),
description: 'loss_2015_at_2km_2025GlobalFires_10', 
// folder: 'EE_Images',
  crs: 'EPSG:4326',
  // crsTransform: '[0.25,0,-180,0,-0.25,90]',
  region: AOItot,
  // region: ee.Geometry.Polygon([-180, 90, 0, 90, 180, 90, 180, -90, 0, -90, -180, -90], null, false),
  
  maxPixels: 1e13,
  scale:'2226.3898158654715' 
  }); 
  
  
Export.image.toAsset({
   image: loss_2014_at_15km.toUint16(),
description: 'loss_2014_at_2km_2025GlobalFires_10', 
// folder: 'EE_Images',
  crs: 'EPSG:4326',
  // crsTransform: '[0.25,0,-180,0,-0.25,90]',
  region: AOItot,
  // region: ee.Geometry.Polygon([-180, 90, 0, 90, 180, 90, 180, -90, 0, -90, -180, -90], null, false),
  
  maxPixels: 1e13,
  scale:'2226.3898158654715' 
  }); 
  
  
Export.image.toAsset({
   image: loss_2013_at_15km.toUint16(),
description: 'loss_2013_at_2km_2025GlobalFires_10', 
// folder: 'EE_Images',
  crs: 'EPSG:4326',
  // crsTransform: '[0.25,0,-180,0,-0.25,90]',
  region: AOItot,
  // region: ee.Geometry.Polygon([-180, 90, 0, 90, 180, 90, 180, -90, 0, -90, -180, -90], null, false),
  
  maxPixels: 1e13,
  scale:'2226.3898158654715' 
  }); 
  
  
Export.image.toAsset({
   image: loss_2012_at_15km.toUint16(),
description: 'loss_2012_at_2km_2025GlobalFires_10', 
// folder: 'EE_Images',
  crs: 'EPSG:4326',
  // crsTransform: '[0.25,0,-180,0,-0.25,90]',
  region: AOItot,
  // region: ee.Geometry.Polygon([-180, 90, 0, 90, 180, 90, 180, -90, 0, -90, -180, -90], null, false),
  
  maxPixels: 1e13,
  scale:'2226.3898158654715' 
  }); 
  
  
Export.image.toAsset({
   image: loss_2011_at_15km.toUint16(),
description: 'loss_2011_at_2km_2025GlobalFires_10', 
// folder: 'EE_Images',
  crs: 'EPSG:4326',
  // crsTransform: '[0.25,0,-180,0,-0.25,90]',
  region: AOItot,
  // region: ee.Geometry.Polygon([-180, 90, 0, 90, 180, 90, 180, -90, 0, -90, -180, -90], null, false),
  
  maxPixels: 1e13,
  scale:'2226.3898158654715' 
  }); 
  
  
Export.image.toAsset({
   image: loss_2010_at_15km.toUint16(),
description: 'loss_2010_at_2km_2025GlobalFires_10', 
// folder: 'EE_Images',
  crs: 'EPSG:4326',
  // crsTransform: '[0.25,0,-180,0,-0.25,90]',
  region: AOItot,
  // region: ee.Geometry.Polygon([-180, 90, 0, 90, 180, 90, 180, -90, 0, -90, -180, -90], null, false),
  
  maxPixels: 1e13,
  scale:'2226.3898158654715' 
  }); 
  
  
Export.image.toAsset({
   image: loss_2009_at_15km.toUint16(),
description: 'loss_2009_at_2km_2025GlobalFires_10', 
// folder: 'EE_Images',
  crs: 'EPSG:4326',
  // crsTransform: '[0.25,0,-180,0,-0.25,90]',
  region: AOItot,
  // region: ee.Geometry.Polygon([-180, 90, 0, 90, 180, 90, 180, -90, 0, -90, -180, -90], null, false),
  
  maxPixels: 1e13,
  scale:'2226.3898158654715' 
  }); 
  
  
Export.image.toAsset({
   image: loss_2008_at_15km.toUint16(),
description: 'loss_2008_at_2km_2025GlobalFires_10', 
// folder: 'EE_Images',
  crs: 'EPSG:4326',
  // crsTransform: '[0.25,0,-180,0,-0.25,90]',
  region: AOItot,
  // region: ee.Geometry.Polygon([-180, 90, 0, 90, 180, 90, 180, -90, 0, -90, -180, -90], null, false),
  
  maxPixels: 1e13,
  scale:'2226.3898158654715' 
  }); 
  
  
Export.image.toAsset({
   image: loss_2007_at_15km.toUint16(),
description: 'loss_2007_at_2km_2025GlobalFires_10', 
// folder: 'EE_Images',
  crs: 'EPSG:4326',
  // crsTransform: '[0.25,0,-180,0,-0.25,90]',
  region: AOItot,
  // region: ee.Geometry.Polygon([-180, 90, 0, 90, 180, 90, 180, -90, 0, -90, -180, -90], null, false),
  
  maxPixels: 1e13,
  scale:'2226.3898158654715' 
  }); 
  
  
Export.image.toAsset({
   image: loss_2006_at_15km.toUint16(),
description: 'loss_2006_at_2km_2025GlobalFires_10', 
// folder: 'EE_Images',
  crs: 'EPSG:4326',
  // crsTransform: '[0.25,0,-180,0,-0.25,90]',
  region: AOItot,
  // region: ee.Geometry.Polygon([-180, 90, 0, 90, 180, 90, 180, -90, 0, -90, -180, -90], null, false),
  
  maxPixels: 1e13,
  scale:'2226.3898158654715' 
  }); 
  
  
Export.image.toAsset({
   image: loss_2005_at_15km.toUint16(),
description: 'loss_2005_at_2km_2025GlobalFires_10', 
// folder: 'EE_Images',
  crs: 'EPSG:4326',
  // crsTransform: '[0.25,0,-180,0,-0.25,90]',
  region: AOItot,
  // region: ee.Geometry.Polygon([-180, 90, 0, 90, 180, 90, 180, -90, 0, -90, -180, -90], null, false),
  
  maxPixels: 1e13,
  scale:'2226.3898158654715' 
  }); 
  
  
Export.image.toAsset({
   image: loss_2004_at_15km.toUint16(),
description: 'loss_2004_at_2km_2025GlobalFires_10', 
// folder: 'EE_Images',
  crs: 'EPSG:4326',
  // crsTransform: '[0.25,0,-180,0,-0.25,90]',
  region: AOItot,
  // region: ee.Geometry.Polygon([-180, 90, 0, 90, 180, 90, 180, -90, 0, -90, -180, -90], null, false),
  
  maxPixels: 1e13,
  scale:'2226.3898158654715' 
  }); 
  
  
  
  
Export.image.toAsset({
   image: loss_2003_at_15km.toUint16(),
description: 'loss_2003_at_2km_2025GlobalFires_10', 
// folder: 'EE_Images',
  crs: 'EPSG:4326',
  // crsTransform: '[0.25,0,-180,0,-0.25,90]',
  region: AOItot,
  // region: ee.Geometry.Polygon([-180, 90, 0, 90, 180, 90, 180, -90, 0, -90, -180, -90], null, false),
  
  maxPixels: 1e13,
  scale:'2226.3898158654715' 
  }); 
  
  
  
Export.image.toAsset({
   image: loss_2002_at_15km.toUint16(),
description: 'loss_2002_at_2km_2025GlobalFires_10', 
// folder: 'EE_Images',
  crs: 'EPSG:4326',
  // crsTransform: '[0.25,0,-180,0,-0.25,90]',
  region: AOItot,
  // region: ee.Geometry.Polygon([-180, 90, 0, 90, 180, 90, 180, -90, 0, -90, -180, -90], null, false),
  
  maxPixels: 1e13,
  scale:'2226.3898158654715' 
  }); 
  
  
Export.image.toAsset({
   image: loss_2001_at_15km.toUint16(),
description: 'loss_2001_at_2km_2025GlobalFires_10', 
// folder: 'EE_Images',
  crs: 'EPSG:4326',
  // crsTransform: '[0.25,0,-180,0,-0.25,90]',
  region: AOItot,
  // region: ee.Geometry.Polygon([-180, 90, 0, 90, 180, 90, 180, -90, 0, -90, -180, -90], null, false),
  
  maxPixels: 1e13,
  scale:'2226.3898158654715' 
  }); 