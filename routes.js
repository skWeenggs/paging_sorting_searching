const express = require("express");
const router = express.Router();

const Post = require("./model/Post");

router.get("/posts", async (req, res) => {
  const posts = await Post.find();
  res.send(posts);
});

router.post("/posts", async (req, res) => {
  const post = new Post({
    name: req.body.name,
    email: req.body.email,
    contact_no: req.body.contact_no,
    message: req.body.message,
    status: req.body.status,
    gender: req.body.gender,
    city: req.body.city,
  });

  console.log(post);
  await post.save();

  res.send(post);
});

module.exports = router;