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
  console.log(UniqueBOM);

  const Parts = await createModels();
  // console.log( await getPartFromIndex(BOM_graph[2]));
  for (var i = 0; i < BOM.length; i++) {
    var root = BOM[0];
    
    if (BOM[i].Level == "0") {
      var children = [];
      for (var j = 0; j < BOM.length; j++) {
        if (BOM[j].Level == "1") {
          children.push(BOM[j]);
        }
      }
      // console.log(55);
      // console.log(children);
      // var Part = new Parts({
      //   partNumber: UniqueBOM[i].PN,
      //   parents: [],
      //   children: children,
      //   availableStock: 0,
      // });

      // Part.save();
    } else if (BOM[i].Level == "1") {
      var parents = [root];
      var children = [];
      var j = i + 1;
      while (BOM[j]?.Level == "2"){
        children.push(BOM[j]);
        j++
      }
      console.log(72);
      console.log(children);
    }
  }

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

  setTimeout(() => {
    console.log(BOM_graph.serialize());
  }, 1500);

  // setTimeout(()=>{console.log(result);}, 2000)
}
index();
connectDB();
