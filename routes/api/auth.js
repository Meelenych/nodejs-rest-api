const express = require("express");
const router = express.Router();
const { User, schemas } = require("../../models/user");
const createError = require("http-errors");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");

const { SECRET_KEY } = process.env;
console.log(SECRET_KEY);
console.log(process.env.SECRET_KEY);

// SIGNUP
router.post("/signup", async (req, res, next) => {
	try {
		const { error } = schemas.register.validate(req.body);
		if (error) {
			throw createError(400, error.message);
		}
		const { email, password } = req.body;
		const user = await User.findOne({ email });

		if (user) {
			throw createError(409, "Email in use");
		}
		const salt = await bcrypt.genSalt(10);
		const hashPassword = await bcrypt.hash(password, salt);
		await User.create({ email, password: hashPassword });
		res.status(201).json({
			user: {
				email,
				// subscription,
			},
		});
	} catch (error) {
		next(error);
	}
});

// SIGNIN
router.post("/login", async (req, res, next) => {
	try {
		const { error } = schemas.register.validate(req.body);
		if (error) {
			throw createError(400, error.message);
		}
		const { email, password } = req.body;
		const user = await User.findOne({ email });
		if (!user) {
			throw createError(401, "Email or password is wrong");
		}
		const compareResult = await bcrypt.compare(password, user.password);
		if (!compareResult) {
			throw createError(401, "Email or password is wrong");
		}

		const payload = {
			id: user._id,
		};

		const token = jwt.sign(payload, SECRET_KEY, { expiresIn: "1h" });

		res.json({
			token,
			user: {
				email,
				// subscription,
			},
		});
	} catch (error) {
		next(error);
	}
});

module.exports = router;