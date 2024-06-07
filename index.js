const express = require("express");
const users = require("./MOCK_DATA.json");
const fs = require("fs");
const app = express(); // created instance of exp
const PORT = 8000;
const mongoose = require("mongoose");
// moongoose Connection
mongoose
  .connect(
    "mongodb+srv://amitsinghs2798:yMctjNKE7g9uS6us@cluster0.prowhhd.mongodb.net/firstExpProject"
  )
  .then(() => {
    console.log("connected db");
  })
  .catch((error) => {
    console.log(error);
  });

// schema
const userSchema = new mongoose.Schema({
  firstName: {
    type: String,
    required: true, // if we dont give the first name value then entry wont be placed
  },
  lastName: {
    type: String,
    required: false, // it will work even if we dont write last name
  },
  email: {
    type: String,
    required: true,
  },
  jobTitle: {
    type: String,
  },
  gender: {
    type: String,
  },
}); // here schema defined

const User = mongoose.model("user", userSchema); // created our model
//middleware plugin
app.use(express.json());
app.use(express.urlencoded({ extended: false }));

app.use((req, res, next) => {
  // we will create a llog file when any req will arrive at server
  fs.appendFile(
    "log.txt",
    `${Date.now()}: ${req.method} :${req.ip} :${req.path}\n`,
    (err, data) => {
      next();
    }
  );
  // return res.end("terminated in mw1");
});
app.use((req, res, next) => {
  // return res.end("terminated in mw2");
  // return res.end("ill hold here");
  req.userName1 = "amit";
  next();
});
//Routes - by default browsers do GET request
app.get("/api/users", (req, res) => {
  res.setHeader("x-myName", "amit singh"); // setting header in the response
  console.log(req.headers);
  return res.json(users);
});

// We can combine the routes or group routes with same url, in future we need to change only at one place instead of multiple
// here patch, delete and get have same url with is /api/users/:id
app
  .route("/api/users/:id") //:id dynamic parameter passed
  .get((req, res) => {
    // when particular id requested
    const id = Number(req.params.id); // we get string so converted here
    const user = users.find((useri) => useri.id === id);
    console.log(
      "I am passed in the middleware: when you GET users with id ill console and hunt",
      req.userName1
    );
    if (!user) {
      return res.status(404).json({ error: "User not found" }); // if no user found then error
    }
    return res.json(user);
  })
  .patch((req, res) => {
    // TODO: Edit the user with id
    const id = Number(req.params.id); // storing id
    const userToUpdate = users.find((userpatch) => {
      userpatch.id === id;
    });
    const indexNo = users.indexOf(userToUpdate);
    // let index = users.indexOf(userToUpdate)
    const body = req.body;
    // Object.assign(userToUpdate, req.body);
    users.push({ indexNo, ...body });
    users[indexNo] = userToUpdate;
    // if (!user) {
    //   return res.status(404).json({ error: "User not found" }); // if no user found then error
    // }
    fs.writeFile("./MOCK_DATA.json", JSON.stringify(users), (err, data) => {
      //c
      //write in async beacuse in call back fn, writing in mock file
      return res.json({ status: "success", id: users.length });
    });
  })
  .delete((req, res) => {
    // TODO: to delete the user with id
    return res.json({ status: "pending" });
  });

// POST - can be problematic for browsers
app.post("/api/users", (req, res) => {
  // TODO: Creating new user
  const body = req.body; // it stores the data which is coming from frontend (body) like for url its req.params.url
  console.log("body", body);
  users.push({ ...body, id: users.length + 1 }); // pushing in user length +1  1000+1 =1001  // doing spread...
  fs.writeFile("./MOCK_DATA.json", JSON.stringify(users), (err, data) => {
    //write in async beacuse in call back fn, writing in mock file
    return res.json({ status: "success", id: users.length });
  });
});

// Starting-envoking server
app.listen(PORT, () => console.log(`Server started on running ${PORT}`));

/*
// We can create a hybrid API , if user access /users - html doc render with ssr and with /api/users - json
//server is a hybrid server which supports browser and mobile apps too

// /html/users shows -> it will throw html data to browser (render html page)
// api/users -> it will throw json data that is api above we can see
app.get("/html/users", (req, res) => {
  //   <ul>
  //       <li>Usernames</li>
  //   <.ul>

  // inside UL we started map => users.map we fetch the users from json and mapped in html element <li>
  // means inside UL the LI tags will map username
  const html = `<ul>${users
    .map((user) => `<li>${user.first_name}</li>`)
    .join("")}</ul>`;
  res.send(html);
});
*/
