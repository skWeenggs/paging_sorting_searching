const { response } = require("express");
const express = require("express");
const { MongoTopologyClosedError } = require("mongodb");

const mongoose = require("mongoose");
const User = require("./model/Post");
// const userRouter= require("./Routes/Routes")
const cors=require('cors');
require("dotenv").config();

const app = express();

app.use(express.json());





app.use(cors());


const PORT = 3800;

const uri = process.env.MONGO_DB;

// app.get("/", (req, res) => {
//   res.send("have connected!");
// });

mongoose.connect(uri, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
});
const connection = mongoose.connection;
connection.once("open", () => {
  console.log("connection has established with mongoDB");
});

mongoose.connection.on("disconnected",()=>{
  console.log("Mogoodb connection disconnected");
})

//INSERT


app.post("/add", async (req, res) => {

  try {
    console.log("req.body", req.body);

    const { name, email, contact_no, message, status, gender, city } = req.body;

    const newUser = new User({
      name,
      email,
      contact_no,
      message,
      status,
      gender,
      city,
    });

    await User.create(newUser);

    res.send(newUser);
  } catch (err) {
    console.log("error", err);
    res.status(500).json({error:true,massage:"Internal Server Error"});
  }
});


// app.delete('users/:id',async(req,res)=>{
//   try{
//     await User.findByIdAndDelete(req.params.id);
//     res.status(200).json({
//       status:'success',
//       data:null
//     });
//   }catch(err){
//     res.status(404).json({
//       status:'fail',
//       massage: err
//     })
//   }
// })

//PAGING GET USERS

// app.use('/',userRouter)



app.get("/posts", async (req, res) => {
  const PAGE_SIZE = 10;
  const page = parseInt(req.query.page || "0");
  const total = await User.countDocuments({});
  const posts = await User.find({})
    .limit(PAGE_SIZE)
    .skip(PAGE_SIZE * page);
  res.json({
    totalPages: Math.ceil(total / PAGE_SIZE),
    posts,
  });
});


// app.get("/users", paginatedresult(User), async(req, res) => {
app.get("/users", async(req, res,next) => {
  const page = parseInt(req.query.page || 0 ); //    .../page=2
  const limit = parseInt(req.query.limit||10); // .../limit=10
  const sort= req.query.sort ;
  console.log("sort type",sort);
  var userCount ,totalPages,currentpage;
  var sortData;
  const startIndex = (page + 1) * limit;
  const endIndex = page * limit;

  const q = req.query.q; // .../name=ashmita
  // const city_ = req.query.params; // .../city=rajkot
  console.log("data",q);
  // const filter =
  // name_ && city_
  //   ? { name: { $regex: name_ }, city: { $regex: city_ } }
  //   : name_
  //   ? { name: { $regex: name_ } }
  //   : city_
  //   ? { city: { $regex: city_ } }
  //   : {};

// const results = {};

  
  try {

    // results.results = await model
    const userData = await User
      // .find({})
      .find(q ? {
        "$or":[
          {name:{$regex:`${q}`}},
          {city:{$regex:`${q}`}},
          {email:{$regex:`${q}`}},
          {message:{$regex:`${q}`}},
          {contact_no:{$regex:`${q}`}},
        ]
      }:{}
      )
      .sort(sort)
      .limit(limit)
      .skip(page*limit)
      .exec();
      if(q == undefined){
        userCount=await User.count()
        totalPages=Math.ceil(userCount/limit)
        currentpage= Math.ceil(userCount%page)
      }else{
         userCount=await User.find(q ? {
          "$or":[
            {name:{$regex:`${q}`}},
            {city:{$regex:`${q}`}},
            {email:{$regex:`${q}`}},
            {message:{$regex:`${q}`}},
            {contact_no:{$regex:`${q}`}},
          ]
        }:{}
        )
        console.log("querydata----",userCount);
        totalPages=Math.ceil(userCount.length / limit)
        currentpage= Math.ceil(userCount.length % page)
      }

      if(sort == 'asc'){
        console.log("call")
          sortData = await User.find().sort({
          name: 1,
        })
        .limit(limit)
        .skip(limit * page);
        console.log("asc",sortData);
        // res.send(sortData);
      }else if(sort=='desc'){
          sortData = await User.find().sort({
          name: -1,
        })
        .limit(limit)
        .skip(limit * page);
        console.log("desc",sortData);
        // res.send(sortData)
      }


      if(q && sort=='asc'){
        userCount=await User.find(q ? {
          "$or":[
            {name:{$regex:`${q}`}},
            {city:{$regex:`${q}`}},
            {email:{$regex:`${q}`}},
            {message:{$regex:`${q}`}},
            {contact_no:{$regex:`${q}`}},
          ]
        }:{}
        )
        .sort({
          name: 1,
        })
        .limit(limit)
        .skip(limit * page);
        console.log("querydata----",userCount);
        totalPages=Math.ceil(userCount.length / limit)
        currentpage= Math.ceil(userCount.length % page)
      }else if(q && sort=='desc'){
        userCount=await User.find(q ? {
          "$or":[
            {name:{$regex:`${q}`}},
            {city:{$regex:`${q}`}},
            {email:{$regex:`${q}`}},
            {message:{$regex:`${q}`}},
            {contact_no:{$regex:`${q}`}},
          ]
        }:{}
        )
        .sort({
          name: -1,
        })
        .limit(limit)
        .skip(limit * page);
        console.log("querydata----",userCount);
        totalPages=Math.ceil(userCount.length / limit)
        currentpage= Math.ceil(userCount.length % page)
      }

    // res.paginatedResults = results;
      res.status(200).send({
        data:userData,
        sort:sortData,
        q_sort:userCount,
        pagging:{
          total:userCount,
          page:currentpage,
          pages:totalPages
        }

      })
    next();

  } catch (e) {
    res.status(500).json({ 
      data:null,
      message: e.message });
  }
  // const total =await User.countDocuments({});
  // console.log("toa",total);
  // res.json(
  //   res.paginatedResults,
  // );
});

function paginatedresult(model) {
  return async (req, res, next) => {
  //   const page = parseInt(req.query.page ); //    .../page=2
  //   const limit = parseInt(req.query.limit||10); // .../limit=10

  //   const startIndex = (page - 1) * limit;
  //   const endIndex = page * limit;

  //   const q = req.query.q; // .../name=ashmita
  //   // const city_ = req.query.params; // .../city=rajkot
  //   console.log("data",q);
  //   // const filter =
  //   // name_ && city_
  //   //   ? { name: { $regex: name_ }, city: { $regex: city_ } }
  //   //   : name_
  //   //   ? { name: { $regex: name_ } }
  //   //   : city_
  //   //   ? { city: { $regex: city_ } }
  //   //   : {};

  // const results = {};

  //   if (endIndex < (await model.countDocuments().exec())) {
  //     results.next = {
  //       page: page + 1,
  //       limit: limit,
  //     };
  //   }

  //   if (startIndex > 0) {
  //     results.previous = {
  //       page: page - 1,
  //       limit: limit,
  //     };
  //   }
  //   try {

  //     results.results = await model
  //       // .find({})
  //       .find(q ? {
  //         "$or":[
  //           {name:{$regex:`${q}`}},
  //           {city:{$regex:`${q}`}},
  //           {email:{$regex:`${q}`}},
  //           {message:{$regex:`${q}`}},
  //           {contact_no:{$regex:`${q}`}},
  //         ]
  //       }:{}
  //       )
  //       .limit(limit)
  //       .skip(startIndex)
  //       .sort({
  //         name: 1,
  //       })
  //       .exec();

  //     res.status(200).paginatedResults = results;
  //     next();
  //   } catch (e) {
  //     res.status(500).json({ message: e.message });
  //   }
  };
}

app.get("/users/:key",async(req,res)=>{
  const PAGE_SIZE=10;
  const page = parseInt(req.query.page || "0");
  const total = await User.countDocuments({});
  let data=await User.find(
    {
      "$or":[
     
        {name:{$regex:req.params.key}},
        {city:{$regex:req.params.key}},
        {email:{$regex:req.params.key}},
        // {gender:{$regex:req.params.key}},
        {message:{$regex:req.params.key}}
      ]
    }
  )
  .limit(PAGE_SIZE)
  // .skip(PAGE_SIZE * page);
  res.json({
    totalPages: Math.ceil(data.length/PAGE_SIZE),
    data
  })
  // res.send(data);
  // console.log("fdfd",data);
});




//SORTING

app.get("/users/sort/name/:key", async (req, res) => {
  const PAGE_SIZE=10;
  const page = parseInt(req.query.page || "0");
  console.log(page);
  if(req.params.key=== "asc"){

    let sortData = await User.find().sort({
      name: 1,
    })
    .limit(PAGE_SIZE)
    .skip(PAGE_SIZE * page);
    
    console.log(sortData);
    res.send(sortData);
  }
  else{

    let sortData = await User.find().sort({
      name: -1,
    })
    .limit(PAGE_SIZE)
    .skip(PAGE_SIZE * page);

    console.log(sortData);
    res.send(sortData);
    
  }

});

// app.get("/users/sort/email/:key", async (req, res) => {
//   const PAGE_SIZE=10;
//   const page = parseInt(req.query.page || "0");
//   console.log(page);
//   if(req.params.key=== "asc"){

//     let sortData = await User.find().sort({
//       email: 1,
//     })
//     .limit(PAGE_SIZE)
//     .skip(PAGE_SIZE * page);

//     console.log(sortData);
//     res.send(sortData);
//   }
//   else{

//     let sortData = await User.find().sort({
//       email: -1,
//     })
//     .limit(PAGE_SIZE)
//     .skip(PAGE_SIZE * page);

//     console.log(sortData);
//     res.send(sortData);
//   }

// });

app.post("/users/:id",async(req,res)=>{
  try{
    const _id=req.params.id;
    const updateUser=await User.findByIdAndUpdate(_id,req.body,{new:true});
    res.send(updateUser);
  }
  catch(err){
    res.status(404).send(updateUser);
  }
})  

app.delete("/users/:id",async(req,res)=>{
  try{
    const _id=req.params.id;
    const deleteUser=await User.findByIdAndDelete(_id);
    res.send(deleteUser);
  }
  catch(err){
    res.status(404).send(deleteUser);
  }
})  


app.listen(PORT, () => {
  console.log("server is running on:", PORT);
  //* connecting database
});
