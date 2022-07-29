const router= require("express").Router();
const Users=require("../model/Post")
router.get("/user",async(req,res)=>{
    try{
        const page=parseInt(req.query.page) -1||0;
        const limit=parseInt(req.query.limit)||5;
        const search= req.query.search || "";
        let sort=req.query.sort|| "Rating";

        req.query.sort ?(sort= req.query.sort.split(",")):(sort=[sort]);
        let sortBy={};
        if(sort[1]){
            sortBy[sort[0]]=sort[1];
        }else{
            sortBy[sort[0]]="asc";
        }
        const res = await Users.find({ name: { $regex: search, $options: "i" } })
			// .where("genre")
			// .in([...genre])
			.sort(sortBy)
			.skip(page * limit)
			.limit(limit);
        const total = await Users.countDocuments({
            // genre: { $in: [...genre] },
            name: { $regex: search, $options: "i" },
        });
        const response = {
			error: false,
			total,
			page: page + 1,
			limit,
			// genres: genreOptions,
			res,
		};

		res.status(200).json(response);
    }catch(err){
        console.log(err);
		res.status(500).json({ error: true, message: "Internal Server Error" });
    }
})
module.exports = router;