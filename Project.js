const express = require("express");
const users = require("./MOCK_DATA.json");
const fs = require("fs");
const path = require('path');

const app = express();  //Creating instance
const port = 3000;

//MiddleWare-plugin

app.use(express.urlencoded({extended:false}));

//Custom creation of middleware
app.use((req,res,next) => {
    console.log("Hello from middleware 1");
    next();
});

app.use((req,res,next) => {
    fs.appendFile("logs.txt",`\n${Date.now()}: ${req.ip}: ${req.method}: ${req.path}\n`,
    (err,data) => {
        next();
    });
});

app
.route("/api/users/:id")
.get((req,res) => {
    const id = Number(req.params.id);
    const user = users.find((user) => user.id === id);
    if(!user)
        return res.status(404).json({error: "user not found"});
    return res.json(user);
})
.patch((req,res) => {
           //Edit user with id
               const id = parseInt(req.params.id); // Get the user ID from the URL
               const updatedData = req.body; // Get the updated field(s) from the request body
           
               // Read the JSON file
               const filePath = path.join(__dirname, 'MOCK_DATA.json'); // Adjust the path as needed
               fs.readFile(filePath, 'utf8', (err, data) => {
                   if (err) {
                       return res.status(500).json({ status: "Error", message: "Unable to read file" });
                   }
           
                   let users = JSON.parse(data); // Parse the JSON data
                   const user = users.find((user) => user.id === id);
           
                   if (user) {
                       // Merge only the provided fields into the existing user object
                       Object.keys(updatedData).forEach(key => {
                           user[key] = updatedData[key];
                       });
           
                       // Write the updated users array back to the JSON file
                       fs.writeFile(filePath, JSON.stringify(users, null, 2), (err) => {
                           if (err) {
                               return res.status(500).json({ status: "Error", message: "Unable to update file" });
                           }
                           return res.status(200).json({ status: "Success", message: "User updated", user });
                       });
                   } else {
                       return res.status(404).json({ status: "Error", message: "User not found" });
                   }
               });
           })
.delete((req,res) => { 
    //Delete user with id
    const id = parseInt(req.params.id); // Get the user ID from the URL
    const filePath = path.join(__dirname, 'MOCK_DATA.json'); // Adjust the path to your JSON file

    // Read the JSON file
    fs.readFile(filePath, 'utf8', (err, data) => {
        if (err) {
            console.error("Error reading the file:", err);  // Log the error for debugging
            return res.status(500).json({ status: "Error", message: "Unable to read file" });
        }
        let users;
        try {
            users = JSON.parse(data); // Parse the JSON data
        } catch (parseErr) {
            console.error("Error parsing the JSON file:", parseErr);  // Log the error for debugging
            return res.status(500).json({ status: "Error", message: "Error parsing JSON data" });
        }

        const userIndex = users.findIndex((user) => user.id === id); // Find the index of the user

        if (userIndex !== -1) {
            users.splice(userIndex, 1); // Remove the user from the list

            // Write the updated users array back to the JSON file
            fs.writeFile(filePath, JSON.stringify(users, null, 2), (err) => {
                if (err) {
                    console.error("Error writing to the file:", err);  // Log the error for debugging
                    return res.status(500).json({ status: "Error", message: "Unable to update file" });
                }
                return res.json({ status: "Success", message: "User deleted" });
            });
        } else {
            return res.status(404).json({ status: "Error", message: "User not found" });
        }
    });
});

app.post("/api/users",(req,res) => {
    const body = req.body;
    //console.log("Body",body);
    if(!body || !body.first_name || !body.last_name || !body.email || !body.gender || !body.job_title){
        return res.status(400).json({message: "All fields are required..."});  //new user is created
    }
    users.push({...body,id: users.length + 1});
    fs.writeFile("./MOCK_DATA.json",JSON.stringify(users),(err,data) => {
        return res.status(201).json({status : "success",id:users.length});
    });
});
app.get("/api/users",(req,res) => {
    res.setHeader("X-myName","Dimpi Gupta");   //console.log(req.headers);  Always add X to custom headers
    return res.json(users);
});

app.get("/users",(req,res) => {
    const html = `<ul>
    ${users.map((user) => `<li> ${user.first_name} </li>`).join("")}
    </ul>
    `;
    res.send(html);
});

app.listen(port,() => console.log(`Server Started at Port: ${port}`));