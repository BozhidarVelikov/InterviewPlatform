const jwt = require("jsonwebtoken");

module.exports = function(req, res, next) {
	const token = req.header("auth-token");

	if(!token) {
		res.status(401).json({msg: "Authorisation required!"})
	}

	try{
		const decoded = jwt.verify(token, "bearer");
		req.body.user = decoded.user;
		next();
	} catch(err) {
		res.status(401).json({msg: "Invalid token!"})
	}	
}