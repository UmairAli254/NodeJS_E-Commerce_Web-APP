"use strict";
const mongoose = require("mongoose");
const validator = require("validator");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
require("dotenv").config();

const Sr = new mongoose.Schema({
	name: {
		type: String,
		// required: true
	},
	email: {
		type: String,
		validate(val) {
			if (!validator.isEmail(val))
				throw new Error("Invalid Email");
		},
		// required: true,
		index: {
			unique: true
		}
	},
	address: {
		type: String,
		default: ""
	},
	profile_img: {
		type: String,
		default: ""
	},
	pass: {
		type: String,
		required: true
	},
	tokens: [{
		token: {
			type: String,
			required: true
		}
	}],
	date: {
		type: Date,
		default: Date.now()
	}

});

// Hash Password
Sr.pre("save", async function () {
	this.pass = await bcrypt.hash(this.pass, 10);
});

// Genarate / Store a unique jwt token upon signup
Sr.methods.singnUpToken = async function () {
	const payload = this._id.toString();

	const token = jwt.sign(payload, process.env.SECRET_KEY);
	this.tokens = this.tokens.concat({ token: token });
	// console.log(token);
};

Sr.methods.genLoginToken = async function () {
	const payload = this.email;

	const loginToken = jwt.sign(payload, process.env.SECRET_KEY);
	return loginToken;
}

const Mr = new mongoose.model("user_account", Sr);

module.exports = Mr;



