const connectDB = require("./Database/connection");
const createModels = require("./Database/model");
const mongoose = require("mongoose");
const express = require("express");
const csv = require("csvtojson");
const Graph = require("graph-data-structure");
const cors = require("cors");

const app = express();
var corsOptions = {
  origin: 'http://localhost:3000/',
  optionsSuccessStatus: 200 // some legacy browsers (IE11, various SmartTVs) choke on 204
}
app.use(cors());

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
  // console.log(array);
  //creating documents in MongoDb
  for (var i = 0; i < UniqueBOM.length; i++) {
    var Part = new Parts({
      partNumber: UniqueBOM[i].PN,
      parents: [],
      children: [],
      availableStock: 0,
    });
    await Part.save();
  }

  // Updating parents and childrens in MongoDb
  for (var i = 0; i < BOM.length; i++) {
    var root = BOM[0];
    var check = true;
    if (BOM[i].Level == "0") {
      var children = [];
      for (var j = 0; j < BOM.length; j++) {
        if (BOM[j].Level == "1") {
          children.push(BOM[j]);
        }
      }
      const part = await Parts.find({ partNumber: BOM[i].PN });
      part[0].children = children;
      // console.log(part[0].children);

      await part[0].save();
    } else if (BOM[i].Level == "1") {
      var parents = [root];
      var children = [];
      var j = i + 1;
      while (BOM[j]?.Level == "2") {
        children.push(BOM[j]);
        j++;
      }

      const part = await Parts.find({ partNumber: BOM[i].PN });
      if (part[0].parents.length == 0) {
        part[0].parents = parents;
      } else {
        part[0].parents.concat(parents);
      }
      part[0].children = children;
      // console.log(part[0].children)

      await part[0].save();
      // console.log(part);
      // const part = await Parts.find({ PN: BOM[i].PN });
      // console.log(part);
      // var Part = new Parts({
      //   partNumber: BOM[i].PN,
      //   parents: parents,
      //   children: children,
      //   availableStock: 0,
      // });

      // Part.save();
    } else {
      var children = [];
      var parents = [];
      if (i != BOM.length - 1) {
        if (BOM[i].Level >= BOM[i + 1].Level) {
          var k = i;
          while (BOM[k].Level == BOM[i].Level) {
            k--;
            if (parseInt(BOM[k].Level) < parseInt(BOM[i].Level)) {
              parents.push(BOM[k]);

              break;
            }
          }

          const part = await Parts.find({ partNumber: BOM[i].PN });
          if (part[0].parents.length == 0) {
            part[0].parents = parents;
          } else {
            const array = part[0].parents.concat(parents);
            part[0].parents = array;
            console.log(BOM[i].PN);
            // console.log(parents);
          }

          part[0].children = children;
          // console.log(part[0].children)

          await part[0].save();
        } else {
          if (check) {
            var Level = parseInt(BOM[i].Level);
            check = false;
          }
          var k = i;
          while (BOM[k].Level == BOM[i].Level) {
            k--;
            if (parseInt(BOM[k].Level) < parseInt(BOM[i].Level)) {
              parents.push(BOM[k]);

              break;
            }
          }
          // console.log(95);
          // console.log(Level + 1== BOM[i + 1].Level );
          var j = i + 1;
          while (Level + 1 == BOM[j].Level) {
            children.push(BOM[j]);
            j++;
          }
          if (BOM[i + 1].Level <= Level) {
            check = true;
          }
          const part = await Parts.find({ partNumber: BOM[i].PN });
          if (part[0].parents.length == 0) {
            part[0].parents = parents;
          } else {
            part[0].parents.concat(parents);

            // console.log(part[0].parents);
          }

          part[0].children = children;
          // console.log(part[0].children)

          await part[0].save();
        }
      }
      // console.log(i);
    }
  }

  //availableQuantity updated
  const allParts = await Parts.find();
  console.log(allParts);
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
  for (var i = 0; i < Forecast.length; i++) {
    var forecast = new Forecasts({
      quantity: parseInt(Forecast[i].Forecast_qty),
      partNumber: Forecast[i].PN,
      workWeek: parseInt(Forecast[i].Work_Week),
    });
    await forecast.save();
  }


  //calculating BOM required quantity
  for (var i = 0; i < BOM.length; i++) {
    BOM[i] = { ...BOM[i], req_qty: parseInt(BOM[i].BOM_Qty) };
    // console.log(BOM[i]);
  }
  console.log("lol");
  // console.log(BOM)

  var mult = BOM[0].req_qty;
  // var Dp = 1;
  for (var i = 0; i < BOM.length; i++) {
    var j = i;
    mult = 1;
    var currlvl = parseInt(BOM[i].Level);
    while (j > 0) {
      j--;
      if (currlvl - parseInt(BOM[j].Level) == 1) {
        currlvl = parseInt(BOM[j].Level);
        mult = mult * BOM[j].req_qty;
        break;
      }
    }

    BOM[i].req_qty = parseInt(BOM[i].req_qty) * mult;
  }

  console.log(BOM);
  var childNodes = await Parts.find({ children: [] });
  var childBOM = [];
  var newobj = {};
  for (var i = 0; i < childNodes.length; i++) {
    var sum = 0;
    for (var j = 0; j < BOM.length; j++) {
      if (childNodes[i].partNumber == BOM[j].PN) {
        sum = sum + BOM[j].req_qty;
        newobj = {
          PartNumber: BOM[j].PN,
          BOM_REQ_RTY: sum,
          Work_Week1: 0,
          Work_Week2: 0,
          Work_Week3: 0,
          Work_Week4: 0,
        };
      }
    }
    childBOM.push(newobj);
  }

  // workWeek calculations
  for (var i = 0; i < 4; i++) {
    if (i == 0) {
      for (var j = 0; j < childBOM.length; j++) {
        childBOM[j].Work_Week1 =
          parseInt(Forecast[i].Forecast_qty) * childBOM[j].BOM_REQ_RTY;
      }
    } else if (i == 1) {
      for (var j = 0; j < childBOM.length; j++) {
        childBOM[j].Work_Week2 =
          parseInt(Forecast[i].Forecast_qty) * childBOM[j].BOM_REQ_RTY +
          childBOM[j].Work_Week1;
      }
    } else if (i == 2) {
      for (var j = 0; j < childBOM.length; j++) {
        childBOM[j].Work_Week3 =
          parseInt(Forecast[i].Forecast_qty) * childBOM[j].BOM_REQ_RTY +
          childBOM[j].Work_Week2;
      }
    } else if (i == 3) {
      for (var j = 0; j < childBOM.length; j++) {
        childBOM[j].Work_Week4 =
          parseInt(Forecast[i].Forecast_qty) * childBOM[j].BOM_REQ_RTY +
          childBOM[j].Work_Week3;
      }
    }
  }
  console.log("Unique child: ");
  console.log(childBOM);
  // console.log(BOMRequiredQuantity);

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

  //adding values for Inventory (including parents)
  for (var i = 0; i < Inventory.length; i++) {
    Inventory[i] = { ...Inventory[i], inc_prnts: parseInt(Inventory[i].Inventory_Qty) };
  }
  

  for (var i =0 ; i <BOM.length; i++) {
    var name = BOM[i].PN;
  
  
    var z = i;
    while(z>0 && BOM[z].Level>=BOM[i].Level) {
      z--;
    }
    var Pname = BOM[z].PN;
    var j = 0;
    for(j = 0; j<Inventory.length ; j++){
      if(Inventory[j].PN==name){break;}
    }
    for (var f =0 ; f <Inventory.length; f++) {
      if(Inventory[f].PN==Pname){
        Inventory[j].inc_prnts += Inventory[f].inc_prnts*parseInt(BOM[i].BOM_Qty);
        break;
      }
    }
  }
  console.log(Inventory);
  
   //Adding edges to graph
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
  for (var i = 0; i< childBOM.length; i++){
    for (var j = 0; j< Inventory.length; j++ ){
      if (childBOM[i].PartNumber == Inventory[j].PN){
        childBOM[i] = {...childBOM[i], Inventory: Inventory[j].inc_prnts}
      }
    }
  }

  return childBOM;
}

connectDB();

var answer = null;
async function getBOMchild() {
  if (answer == null) {
    answer = await index();
  }
  return answer;
}

app.get("/", async (req, res) => {
  const result = await getBOMchild();
  res.send(result);
});

app.listen(6000, () => {
  console.log("Server running on port 6000");
});
