var express = require("express");
var expressSanitizer = require("express-sanitizer");
var app = express();
var mongoose = require("mongoose");
var parser = require("body-parser");
var methodOverride = require("method-override");

mongoose.connect("mongodb://localhost/blog");
app.use(parser.urlencoded({extended: true}));
app.use(expressSanitizer()); //Must be called after the body parser
app.use(express.static("public"));
app.use(methodOverride("_method"));
app.set("view engine", "ejs");

//---DATABASE CONFIG---//
var blogSchema = new mongoose.Schema({
	title: String,
	image: String,
	body: String,
	created: {type: Date, default: Date.now} //Works with every other var type. So I can use a default placeholder in case the user does not enter anything
});

var Blog = mongoose.model("Blog", blogSchema);

/*Blog.create({
	title: "First post",
	image: "https://sp.yimg.com/ib/th?id=OIP.gysQJsBEMi9eY8Bc6mJW6wHaFE&pid=15.1&rs=1&c=1&qlt=95&w=145&h=99",
	body: "Dino is amazing!"
});*/

//---END OF DATABASE CONFIG---//

app.get("/", function(req, res) {
	res.redirect("/blogs");
});

//INDEX ROUTE
app.get("/blogs", function(req, res) {
	Blog.find({}, function(err, blogs) {
		if(err) console.log(err);
		else res.render("index", {foundBlogs: blogs});
	});
});

//NEW ROUTE
app.get("/blogs/new", function(req, res) {
	res.render("new");
});

//CREATE ROUTE *THIS ROUTE IS NOT A PAGE - DB ONLY*
app.post("/blogs", function(req, res) {
	req.body.blog.body = req.sanitize(req.body.blog.body); //It will not allow script tags to be included in the HTML the user inputs
	var data = req.body.blog; //This will retrieve all the content inside of the obj 'blogs' from the NEW route
	Blog.create(data, function(err, createdBlog) { 
		if(err) res.render("new");
		else res.redirect("/blogs");
	});
});

//SHOW ROUTE
app.get("/blogs/:id", function(req, res) {
	var id = req.params.id;
	Blog.findById(id, function(err, clickedBlog) {
		if(err) console.log(err);
		else res.render("show", {blog: clickedBlog});
	});
});

//EDIT ROUTE
app.get("/blogs/:id/edit", function(req, res) {
	var id = req.params.id;
	Blog.findById(id, function(err, foundBlog) {
		if(err) console.log(err);
		else res.render("edit", {blog: foundBlog});
	});
});

//UPDATE ROUTE *THIS ROUTE IS NOT A PAGE - DB ONLY*
app.put("/blogs/:id", function(req, res) {
	req.body.blog.body = req.sanitize(req.body.blog.body); //It will not allow script tags to be included in the HTML the user inputs
	var id = req.params.id;
	var data = req.body.blog;
	Blog.findByIdAndUpdate(id, data, function(err, updatedblog) {
		if(err) console.log(err);
		else res.redirect("/blogs/" + id);
	});
});	

//DELETE ROUTE *THIS ROUTE IS NOT A PAGE - DB ONLY*
app.delete("/blogs/:id", function(req, res) {
	var id = req.params.id;
	Blog.findByIdAndRemove(id, function(err, removedBlog) {
		if(err) console.log(err);
		else res.redirect("/blogs");
	});
});

app.listen(3000, function() {
	console.log("Blog is online.");
});


// var myData = new Array([10, 2], [15, 0], [18, 3], [19, 6], [20, 8.5], [25, 10], [30, 9], [35, 8], [40, 5], [45, 6], [50, 2.5]);
// var myChart = new JSChart('chartid', 'line');
// myChart.setDataArray(myData);
// myChart.setLineColor('#8D9386');
// myChart.setLineWidth(4);
// myChart.setTitleColor('#7D7D7D');
// myChart.setAxisColor('#9F0505');
// myChart.setGridColor('#a4a4a4');
// myChart.setAxisValuesColor('#333639');
// myChart.setAxisNameColor('#333639');
// myChart.setTextPaddingLeft(0);
// myChart.draw();
