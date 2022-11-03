const connectDB = require("./Database/connection");
const createModels = require("./Database/model");
const mongoose = require("mongoose");
const express = require("express");
const csv = require("csvtojson");
const Graph = require("graph-data-structure");

const app = express();

async function index() {
  function getUniqueListBy(arr, key) {
    return [...new Map(arr.map((item) => [item[key], item])).values()];
  }

  var BOM_graph = Graph();

  var BOM;
  var Forecast;
  var Inventory;

  const readCSVBOM = async () => {
    const csvFilePath = "./CTB1/BOM_Table.csv";
    BOM = await csv().fromFile(csvFilePath);
  };

  const readCSVForecast = async () => {
    const csvFilePath = "./CTB1/Forecast.csv";
    Forecast = await csv().fromFile(csvFilePath);
  };

  const readCSVInventory = async () => {
    const csvFilePath = "./CTB1/Inventory.csv";
    Inventory = await csv().fromFile(csvFilePath);
  };
  await readCSVBOM();
  await readCSVForecast();
  await readCSVInventory();

  console.log(BOM);

  const UniqueBOM = getUniqueListBy(BOM, "PN");
  // console.log(UniqueBOM);

  const array = await createModels();
  const Parts = array[0];
  const Forecasts = array[1];
  console.log(array);
  //creating documents in MongoDb
  for (var i = 0; i < UniqueBOM.length; i++) {
    // var Part = new Parts({
    //   partNumber: UniqueBOM[i].PN,
    //   parents: [],
    //   children: [],
    //   availableStock: 0,
    // });
    // await Part.save();
  }

  // Updating parents and childrens in MongoDb
  // for (var i = 0; i < BOM.length; i++) {
  //   var root = BOM[0];
  //   var check = true;
  //   if (BOM[i].Level == "0") {
  //     var children = [];
  //     for (var j = 0; j < BOM.length; j++) {
  //       if (BOM[j].Level == "1") {
  //         children.push(BOM[j]);
  //       }
  //     }
  //     const part = await Parts.find({ partNumber: BOM[i].PN });
  //     part[0].children = children;
  //     // console.log(part[0].children);

  //     await part[0].save();
  //   } else if (BOM[i].Level == "1") {
  //     var parents = [root];
  //     var children = [];
  //     var j = i + 1;
  //     while (BOM[j]?.Level == "2") {
  //       children.push(BOM[j]);
  //       j++;
  //     }

  //     const part = await Parts.find({ partNumber: BOM[i].PN });
  //     if (part[0].parents.length == 0) {
  //       part[0].parents = parents;
  //     } else {
  //       part[0].parents.concat(parents);
  //     }
  //     part[0].children = children;
  //     // console.log(part[0].children)

  //     await part[0].save();
  //     // console.log(part);
  //     // const part = await Parts.find({ PN: BOM[i].PN });
  //     // console.log(part);
  //     // var Part = new Parts({
  //     //   partNumber: BOM[i].PN,
  //     //   parents: parents,
  //     //   children: children,
  //     //   availableStock: 0,
  //     // });

  //     // Part.save();
  //   } else {
  //     var children = [];
  //     var parents = [];
  //     if (i != BOM.length - 1) {
  //       if (BOM[i].Level >= BOM[i + 1].Level) {
  //         var k = i;
  //         while (BOM[k].Level == BOM[i].Level) {
  //           k--;
  //           if (parseInt(BOM[k].Level) < parseInt(BOM[i].Level)) {
  //             parents.push(BOM[k]);

  //             break;
  //           }
  //         }

  //         const part = await Parts.find({ partNumber: BOM[i].PN });
  //         if (part[0].parents.length == 0) {
  //           part[0].parents = parents;
  //         } else {
  //           const array = part[0].parents.concat(parents);
  //           part[0].parents = array;
  //           console.log(BOM[i].PN);
  //           // console.log(parents);
  //         }

  //         part[0].children = children;
  //         // console.log(part[0].children)

  //         await part[0].save();
  //       } else {
  //         if (check) {
  //           var Level = parseInt(BOM[i].Level);
  //           check = false;
  //         }
  //         var k = i;
  //         while (BOM[k].Level == BOM[i].Level) {
  //           k--;
  //           if (parseInt(BOM[k].Level) < parseInt(BOM[i].Level)) {
  //             parents.push(BOM[k]);

  //             break;
  //           }
  //         }
  //         // console.log(95);
  //         // console.log(Level + 1== BOM[i + 1].Level );
  //         var j = i + 1;
  //         while (Level + 1 == BOM[j].Level) {
  //           children.push(BOM[j]);
  //           j++;
  //         }
  //         if (BOM[i + 1].Level <= Level) {
  //           check = true;
  //         }
  //         const part = await Parts.find({ partNumber: BOM[i].PN });
  //         if (part[0].parents.length == 0) {
  //           part[0].parents = parents;
  //         } else {
  //           part[0].parents.concat(parents);

  //           // console.log(part[0].parents);
  //         }

  //         part[0].children = children;
  //         // console.log(part[0].children)

  //         await part[0].save();
  //       }
  //     }
  //     // console.log(i);
  //   }
  // }

  //availableQuantity updated
  const allParts = await Parts.find();
  for (var i = 0; i < Inventory.length; i++) {
    const PN = Inventory[i].PN;
    for (var j = 0; j < allParts.length; j++) {
      if (allParts[j].partNumber == PN) {
        allParts[j].availableStock = parseInt(Inventory[i].Inventory_Qty);
      }
    }
    await allParts[i].save();
  }


  //Adding documents to Forecast
  // for (var i=0;i<Forecast.length; i++){
  //   var forecast = new Forecasts({
  //     quantity: parseInt(Forecast[i].Forecast_qty),
  //     partNumber: Forecast[i].PN,
  //     workWeek: parseInt(Forecast[i].Work_Week),
  //   });
  //   await forecast.save();
  // }

  //Adding nodes to graph
  for (var i = 0; i < BOM.length; i++) {
    BOM_graph.addNode(i);
  }
  function checkrepet(srce, desti) {
    for (var i = 0; i < BOM_graph.serialize().links.length; i++) {
      if (
        BOM_graph.serialize().links[i].source == srce &&
        BOM_graph.serialize().links[i].target == desti
      ) {
        return true;
      }
    }
    return false;
  }

  await addingedge(0);
  //Adding edges to graph
  async function addingedge(ind) {
    // console.log("in function") //input 0 for index
    if (i == BOM.length - 1) return;
    var i;
    // console.log(ind+1);
    // console.log(BOM.length)
    // console.log(i<BOM.length)
    for (i = ind + 1; i < BOM.length; i++) {
      // console.log("here");
      if (BOM[i].Level == BOM[ind].Level) {
        addingedge(i);
        break;
      }
      if (BOM[i].Level - BOM[ind].Level == 1) {
        if (!checkrepet(ind, i)) BOM_graph.addEdge(ind, i);
      }
      if (BOM[i].Level - BOM[ind].Level > 1) {
        addingedge(i - 1);
        // break;
      }
    }
  }

  function getPartFromIndex(ind) {
    return BOM[ind];
  }

  // console.log(getPartFromIndex(BOM_graph.nodes()[2]));

  // setTimeout(() => {
  //   console.log(BOM_graph.serialize());
  // }, 1500);

  // setTimeout(()=>{console.log(result);}, 2000)
}
index();
connectDB();
