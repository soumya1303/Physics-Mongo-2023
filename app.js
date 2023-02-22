const express = require("express");
const app = express();
const mongoose = require("mongoose");
const _ = require("lodash");

const PORT = process.env.PORT || 4000;

app.use(express.json());
app.use(express.urlencoded({extended:true}));
app.use(express.static("public"));
app.set("view engine", "ejs");

try {
    mongoose.set('strictQuery', true);
    mongoose.connect("mongodb://127.0.0.1:27017/blogDB", { useNewUrlParser: true });
} catch (error) {
    console.log(error);
    process.exit();
}

const epsumSchema = new mongoose.Schema({
    epsumCode:{
        type:String,
        required:true
    },
    epsumText:{
        type:String,
        required:true
    }
});

const Epsum = mongoose.model("Epsum", epsumSchema);

const postSchema = new mongoose.Schema({
    posttitle:{
        type:String,
        required:true
    },
    postbody:{
        type:String,
        required:true
    }
});

const Post = mongoose.model("Post", postSchema);


app.route("/")
.get((req, res)=>{
    const query={epsumCode:"Home"
    }
    let posts=[];
    Epsum.findOne(query, (e, intro)=>{
        if (!e) {
            Post.find({}, (e, resp)=>{
                posts=resp.map((element)=>{
                    element.postbody = element.postbody.slice(0,400);
                    return(element);
                });
                res.render("index", {intro:intro, posts:posts});
            });    
            
        }else{
            console.log("Error in accessing db");
        }
    });
})
.post((req, res)=>{

    const post = new Post({
        posttitle:_.toLower( req.body.posttitle),
        postbody:_.toLower( req.body.postbody)
    }); 

    post.save((e)=>{
        if (!e){
            console.log("Post saved successfully");
        }
        res.redirect("/");
    });

});

app.route("/about") 
.get((req, res)=>{
    const query = {
        epsumCode:"About"
    }
    Epsum.findOne(query, (e, resp)=>{
        if (!e){
            res.render("about", {resp:resp});
        }
    });
});

app.route("/contact")
.get((req, res)=>{
    
    const query = {
        epsumCode:"Contact"
    }
    Epsum.findOne(query, (e, resp)=>{
        if (!e){
            res.render("contact", {resp:resp});
        }
    });
});

app.route("/compose").get((req, res)=>{
    res.render("compose");
});

app.route("/posts/:post_id").get( (req, res)=>{

    const postId= req.params.post_id;
    const query={posttitle:_.toLower(postId)}
    
    const projection={_id:0}

    Post.findOne(query, projection, (e, resp)=>{
        if (!e){
            console.log(resp);
            res.render("post", {
                posttitle:resp.posttitle, postbody:resp.postbody
            });
        }
    });

});

app.listen(PORT, ()=>{
    console.log(`Server started at ${PORT}`);
});
