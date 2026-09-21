var countries = ee.FeatureCollection("FAO/GAUL_SIMPLIFIED_500m/2015/level0");
// var geometry = WindMap.geometry()

// Map.addLayer(geometry)

var WindMap = ee.Image("projects/ee-guido/assets/MASKGEE2025Fires");


var GAUL1US = ee.FeatureCollection("FAO/GAUL/2015/level1");


var CURTIS = ee.Image('projects/tmf-monitoring/assets/CurtisDrivers2018/FilledMap');




Map.addLayer(CURTIS,{min:0, max:3}, 'CURTIS')

var fire_loss = ee.ImageCollection('users/sashatyu/2001-2025_fire_forest_loss').mosaic();
fire_loss = (fire_loss.gte(3)).and(fire_loss.lte(5)); 
var Tyukaivina = ee.ImageCollection('users/sashatyu/2001-2025_fire_forest_loss_annual').mosaic().unmask();

Map.addLayer(Tyukaivina,{min:0, max:24},'Tyukaivina year')

// //var loss_Year =  loss_annual.add(ee.Image.constant(2000))
// var Tyukaivina= (Tyukaivina.updateMask(fire_loss).updateMask(Tyukaivina.gte(11)))//.unmask();
// Tyukaivina = Tyukaivina.where(Tyukaivina.gte(11),1).unmask()
// Tyukaivina = Tyukaivina.rename('Fires')
// Map.addLayer(Tyukaivina,{min:0, max:1},'Tyukaivina')
print('WindMap',WindMap)




//WindMap -> assign zero to NA values
WindMap = WindMap.unmask()
Map.addLayer(WindMap)

var WIND_TOT = ee.Image(0)
WIND_TOT = WIND_TOT.where(WindMap.select('b8').eq(1),11) 
WIND_TOT = WIND_TOT.where(WindMap.select('b9').eq(1),12) 
WIND_TOT = WIND_TOT.where(WindMap.select('b10').eq(1),13) 
WIND_TOT = WIND_TOT.where(WindMap.select('b11').eq(1),14) 
WIND_TOT = WIND_TOT.where(WindMap.select('b12').eq(1),15) 
WIND_TOT = WIND_TOT.where(WindMap.select('b13').eq(1),16) 
WIND_TOT = WIND_TOT.where(WindMap.select('b14').eq(1),17) 
WIND_TOT = WIND_TOT.where(WindMap.select('b15').eq(1),18) 
WIND_TOT = WIND_TOT.where(WindMap.select('b16').eq(1),19) 
WIND_TOT = WIND_TOT.where(WindMap.select('b17').eq(1),20) 
WIND_TOT = WIND_TOT.where(WindMap.select('b18').eq(1),21) 
WIND_TOT = WIND_TOT.where(WindMap.select('b19').eq(1),22) 
WIND_TOT = WIND_TOT.where(WindMap.select('b20').eq(1),23) 
WIND_TOT = WIND_TOT.where(WindMap.select('b21').eq(1),24) 
WIND_TOT = WIND_TOT.where(WindMap.select('b22').eq(1),25) 

WIND_TOT = WIND_TOT.rename('YEAR')
Map.addLayer(WIND_TOT,{min:11,max:24},'WIND_TOT Year')


var WIND_1621 =  WIND_TOT
WIND_1621 = WIND_1621.updateMask(WIND_1621.gte(11))//.unmask();
WIND_1621 = WIND_1621.where(WIND_1621.gte(11),1)
WIND_1621 = WIND_1621.unmask()
Map.addLayer(WIND_1621,{min:0, max:1},'WIND_1121')


var ProvaWind =  WIND_TOT.select('YEAR').eq(19)
Map.addLayer(ProvaWind,{min:0, max:1},'ProvaWind')




// var countries = ee.FeatureCollection("USDOS/LSIB_SIMPLE/2017")

Map.addLayer(countries)

//######################################################################
// load Tree cover, loss, and gain
var gfc = ee.Image('UMD/hansen/global_forest_change_2025_v1_13');
// .clipToCollection(aoi);
gfc = gfc.updateMask(CURTIS.eq(3))

var treecover = gfc.select(['treecover2000'])//.clip(geometry);
var gain = gfc.select(['gain'])//.clip(geometry);
var loss = gfc.select(['loss'])//.clip(geometry);
var lossyear = gfc.select(['lossyear'])//.clip(geometry);






// var Rectangle1 =   geometry;

// // filter to the rectangle that excludes boreal areas
// countries = countries
//             .filterBounds(Rectangle1);

  
// Map.addLayer(Rectangle1)

// print(aoi)
Map.addLayer(countries,{}, 'countries', false)

var list_cL = ["AC" ,"AE" ,"AF" ,"AG" ,"AJ" ,"AL" ,"AM" ,"AN" ,"AO" ,"AQ" ,"AR" ,"AS" ,"AU" ,"AV" ,"BA" ,"BB" ,"BC" ,"BD" ,"BE" ,"BF" ,"BG" ,"BH" ,"BK" ,"BL" ,"BM" ,"BN" ,"BO" ,"BP",
"BR" ,"BT" ,"BU" ,"BY" ,"CA" ,"CB" ,"CD" ,"CE" ,"CF" ,"CG" ,"CH" ,"CI" ,"CM" ,"CN" ,"CO" ,"CQ" ,"CS" ,"CT" ,"CU" ,"CW" ,"CY" ,"DA" ,"DJ" ,"DO" ,"DR" ,"EC" ,"EG" ,"EI",
"EK" ,"EN" ,"ER" ,"ES" ,"ET" ,"EZ" ,"FG" ,"FI" ,"FJ" ,"FO" ,"FP" ,"FR" ,"GA" ,"GB" ,"GG" ,"GH" ,"GI" ,"GJ" ,"GM" ,"GP" ,"GQ" ,"GR" ,"GT" ,"GV" ,"GY" ,"HA" ,"HO" ,"HR",
"HU" ,"IC" ,"ID" ,"IM" ,"IN" ,"IR" ,"IS" ,"IT" ,"IV" ,"IZ" ,"JA" ,"JO" ,"KE" ,"KG" ,"KN" ,"KR" ,"KS" ,"KU" ,"KZ" ,"LA" ,"LE" ,"LG" ,"LH" ,"LI" ,"LO" ,"LS" ,"LT" ,"LU",
"LY" ,"MA" ,"MB" ,"MD" ,"MF" ,"MG" ,"MH" ,"MI" ,"MJ" ,"MK" ,"ML" ,"MO" ,"MP" ,"MR" ,"MT" ,"MU" ,"MV" ,"MX" ,"MY" ,"MZ" ,"NC" ,"NE" ,"NF" ,"NG" ,"NH" ,"NI" ,"NL" ,
 "NO" ,"NP" ,"NS" ,"NU" ,"NZ" ,"PA" ,"PE" ,"PK" ,"PL" ,"PM" ,"PO" ,"PP" ,"PS" ,"PU" ,"RI" ,"RM" ,"RO" ,"RP" ,"RQ" ,"RS" ,"RW" ,"SA" ,"SB" ,"SC" ,"SE" ,"SF" ,"SG" ,"SI",
"SL" ,"SM" ,"SN" ,"SO" ,"SP" ,"ST" ,"SU" ,"SW" ,"SY" ,"SZ" ,"TD" ,"TH" ,"TI" ,"TK" ,"TN" ,"TO" ,"TP" ,"TS" ,"TT" ,"TU" ,"TV" ,"TX" ,"TZ" ,"UG" ,"UK" ,"UP" ,"US" ,"UV",
"UY" ,"UZ" ,"VC" ,"VE" ,"VM" ,"WA" ,"WI" ,"WS" ,"WZ" ,"YM" ,"ZA" ,"ZI"]
print('list_cL',list_cL)

var list_c =  [11,255,1,4,19,3,13,7,8,5,12,17,18,9,21,24,35,30,27,20,23,28,34,33,
171,29,26,225,37,31,41,43,46,44,50,231,59,68,53,51,45,58,57,185,61,49,63,60,
64,69,70,71,72,73,40765,119,76,78,77,75,79,65,86,84,83,82,87,85,90,89,92,94,   
95,99,93,100,101,97,103,106,107,108,111,62,113,114,116,120,115,117,121,122,66,118,126,130,
133,138,67,135,202,137,132,139,141,140,147,144,223,146,142,148,145,150,158,165,161,167,168,152,
2647,241,155,169,160,159,156,187,154,162,153,170,178,183,184,181,262,182,177,186,175,233,180,  
179,194,195,188,198,191,199,192,189,105, 2648 ,157,203,196,200,204,205,215,210,208,220,227,217,224,  
221,213,222,226,229,209,40764,236,238,237,246,240,239,251,245,243,214,248,242,249,252,250,257,253, 
256,254,259,42,260,261,211,263,264,172,268,212,235,269,270,271]

print('list_c',list_c)



var list_t = [50,10,10,10,45,15,35,50,25,10,45,10,50,10,10,10,10,10,50,10,50,50,50,
50,50,15,45,50,50,10,50,40,50,10,15,50,50,50,10,25,50,50,50,10,50,50,50,10,10,30,10,
50,50,50,40,40,50,50,10,50,30,50,10,10,50,10,10,20,10,50,50,20,10,50,50,50,10,20,50,35,50,50,50,50,
20,10,50,50,10,10,10,30,40,10,50,10,20,35,30,10,10,10,50,10,10,10,35,50,50,50,15,50,10,45,50,15,50,
10,50,20,10,10,15,10,50,10,10,10,10,10,50,25,50,10,10,10,50,40,50,10,50,10,50,50,45,50,15,50,50,10,50,
10,20,30,10,50,50,40,10,30,10,50,50,10,20,10,50,50,
10,45,10,10,50,10,10,10,50,50,50,10,10,10,45,10,10,35,15,10,10,20,50,40,45,10,10,30,10,25,50,35,10,10,10,25,10,15,10]

 
 print('list_t',list_t)
// var list_c = ['IT']
for (var y=150; y<207; y++) {  ///##207
  
var  code_country = list_c[y]

var code_countryLabel = list_cL[y]
var forest_threshold = list_t [y]//40 //tree cover in % as threshold for forest / non forest


var US = ee.FeatureCollection(countries.filterMetadata('ADM0_CODE', 'equals', code_country))//.geometry().simplify(1000)

// var US = ee.FeatureCollection(GAUL1US.filterMetadata('ADM0_CODE', 'equals', 259))
 print('US',US)

Map.addLayer(US)

// Create Mask of canopy coverage greater than the threshold%
var Mask = treecover.gte(forest_threshold);


Map.addLayer(Mask,{min:0, max:1},'highTreeCoverage')

///// export 1 ALL LOSS


var ExportUS = loss
.updateMask(Mask.eq(1)) //remove non forests
.multiply(ee.Image.pixelArea()) //.addBands(loss_filtered).addBands(forest)
  .addBands(lossyear)





var getC2 = function(feature) {
  var C = ExportUS
.reduceRegion({
  reducer: ee.Reducer.sum().group({ //.unweighted()
        groupField: 1,
        groupName: 'lossyear',
      }),
    geometry: feature.geometry().simplify(5000),
   scale: 30,
   maxPixels:1e13
  });
  return feature.set(C);
};
var data = US.map(getC2)//.filter(ee.Filter.gte('fhd_normal_count', 30));
print(data.first());
print(data.limit(12));

var data = data.select(['.*'], null, false);

// convert output column list to columns
var list_wide = data.map(function(feature) {
  var groups = ee.List(ee.Feature(feature).get('groups'))
  var values = groups.map(function(group) {
    group = ee.Dictionary(group)
    var groupNo = ee.Number(group.get('lossyear')).format('%d')
    var keys = group.keys().remove("lossyear")
    var renamed = keys.map(function(key) {
       return [ee.String(key).cat("_").cat(groupNo), group.get(key)]
    })
    return renamed
  })
  values = ee.Dictionary(values.flatten())
  return feature.set(values)
});
print('US tot',list_wide.toList(2))




Export.table.toDrive({collection: list_wide, 
      	 	  folder: 'EUForObs11_25',
                        description: 'Country_Forest_Change_EUOBS_'+code_countryLabel,
  fileFormat: 'CSV'
                      // fileNamePrefix: "prcpMonmet",
                        // selectors: ['FID', 'rh98']
                      });



///// export2 Fires only


var ExportUS = loss
.updateMask(Mask.eq(1))
.updateMask(WIND_1621.eq(0))
.multiply(ee.Image.pixelArea()) //.addBands(loss_filtered).addBands(forest)
  .addBands(Tyukaivina)





var getC2 = function(feature) {
  var C = ExportUS
.reduceRegion({
  reducer: ee.Reducer.sum().group({ //.unweighted()
        groupField: 1,
        groupName: 'b1',
      }),
    geometry: feature.geometry().simplify(5000),
   scale: 30,
   maxPixels:1e13
  });
  return feature.set(C);
};
var data = US.map(getC2)//.filter(ee.Filter.gte('fhd_normal_count', 30));
// print(data.first());
// print(data.limit(12));

var data = data.select(['.*'], null, false);

// convert output column list to columns
var list_wide = data.map(function(feature) {
  var groups = ee.List(ee.Feature(feature).get('groups'))
  var values = groups.map(function(group) {
    group = ee.Dictionary(group)
    var groupNo = ee.Number(group.get('b1')).format('%d')
    var keys = group.keys().remove("b1")
    var renamed = keys.map(function(key) {
       return [ee.String(key).cat("_").cat(groupNo), group.get(key)]
    })
    return renamed
  })
  values = ee.Dictionary(values.flatten())
  return feature.set(values)
});
print('US fires',list_wide.toList(2))


Export.table.toDrive({collection: list_wide, 
      	 	  folder: 'EUForObs11_25',
                        description: 'Country_Forest_Change_EUOBS_fires'+code_countryLabel,
  fileFormat: 'CSV'
                      // fileNamePrefix: "prcpMonmet",
                        // selectors: ['FID', 'rh98']
                      });


///// export 3 winds only
 

var ExportUS = loss
.updateMask(Mask.eq(1))
.updateMask(WIND_1621.eq(1))
.multiply(ee.Image.pixelArea()) //.addBands(loss_filtered).addBands(forest)
  .addBands(lossyear)





var getC2 = function(feature) {
  var C = ExportUS
.reduceRegion({
  reducer: ee.Reducer.sum().group({ //.unweighted()
        groupField: 1,
        groupName: 'b1',
      }),
    geometry: feature.geometry().simplify(5000),
   scale: 30,
   maxPixels:1e13
  });
  return feature.set(C);
};
var data = US.map(getC2)//.filter(ee.Filter.gte('fhd_normal_count', 30));
// print(data.first());
// print(data.limit(12));

var data = data.select(['.*'], null, false);

// convert output column list to columns
var list_wide = data.map(function(feature) {
  var groups = ee.List(ee.Feature(feature).get('groups'))
  var values = groups.map(function(group) {
    group = ee.Dictionary(group)
    var groupNo = ee.Number(group.get('b1')).format('%d')
    var keys = group.keys().remove("b1")
    var renamed = keys.map(function(key) {
       return [ee.String(key).cat("_").cat(groupNo), group.get(key)]
    })
    return renamed
  })
  values = ee.Dictionary(values.flatten())
  return feature.set(values)
});
print('US_Wind',list_wide.toList(2))


Export.table.toDrive({collection: list_wide, 
      	 	  folder: 'EUForObs11_25',
                        description: 'Country_Forest_Change_EUOBS_Wind'+code_countryLabel,
  fileFormat: 'CSV'
                      // fileNamePrefix: "prcpMonmet",
                        // selectors: ['FID', 'rh98']
                      });








}