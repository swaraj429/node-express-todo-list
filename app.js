const express = require("express");
//const https = require("https");
//const request = require("request");
const bodyParser = require("body-parser");
const date = require(__dirname + "/date.js");
const mongoose = require("mongoose");
const _ = require("lodash");

const app = express();
app.use(bodyParser.urlencoded({extended:true}));
app.use(express.static("public"));
app.set('view engine', 'ejs');
mongoose.set('useFindAndModify', false);

mongoose.connect("mongodb+srv://admin-swaraj:test1234@cluster0.aqgfy.mongodb.net/todolistDB", {useNewUrlParser: true, useUnifiedTopology: true});

const itemSchema = { name:String };
const Item = mongoose.model("Item", itemSchema);

const item1 = new Item({name: "Welcome To List"});
const item2 = new Item({name: "Welcome To List"});
const item3 = new Item({name: "Welcome To List"});
const defaultItems = [item1, item2, item3];

const listSchema = {name:String, items:[itemSchema]};
const List = mongoose.model("List",listSchema);


app.get("/", function(req, res){
  let listTitle = date.getDate();
  Item.find({},function(err, foundItems){
    if(foundItems.length === 0){
      Item.insertMany(defaultItems, function(err){
        if(err) {console.log(err);}
        else {console.log("Done");}
      });
      res.redirect("/");
    }
    else{
      res.render("list", {listTitle: listTitle, items: foundItems});
    }
  });
});

app.get("/:customListName",function(req, res){
  const customListName = _.capitalize(req.params.customListName);
  List.findOne({name:customListName},function(err, foundList){
    if(!err){
      if(!foundList){
        const list = new List({name:customListName, items:defaultItems});
        list.save();
        res.redirect("/" + customListName);
      }
      else{
        res.render("list",{listTitle:foundList.name, items:foundList.items});
      }
    }
  });
});


app.post("/",function(req, res){
  const itemName = req.body.newItem;
  const listName = req.body.list;
  const item = new Item({
    name: itemName
  });
  if(listName === date.getDate()){
    item.save();
    res.redirect("/");
  }
  else{
    List.findOne({name:listName}, function(err, foundList){
      foundList.items.push(item);
      foundList.save();
      res.redirect("/" + listName);
    })
  }
});

app.post("/delete", function(req, res){
  const checkedItemId = req.body.checkBox;
  const listName = req.body.listName;
  if(listName === date.getDate()){
    Item.findByIdAndRemove(checkedItemId, function(err){
      if(!err){
        console.log("Delete Done");
        res.redirect("/")
      }
      });
  }else{
    List.findOneAndUpdate({name:listName}, {$pull:{items:{_id:checkedItemId}}}, function(err, foundList){
      if(!err){
        res.redirect("/" + listName);
      }
    });
  }
});


let port = process.env.PORT;
if(port == null || port ==""){
  port = 3000;
}
app.listen(port, function(){
  console.log("Sever Strarted");
});
