const mongoose = require('mongoose')
const Schema = mongoose.Schema

const articleSchema = new Schema({
	title: {
		type: String,
		default: "no title"
	},
	content: {
		type: String,
		default: "no content"
	},
	status: {
		type: String,
		default: "draft"
	},
	created_at: {
		type: Date,
		default: new Date()
	},
	owner: { 
		type: Schema.Types.ObjectId, 
		ref: 'User' 
	},
	featured_image:{
		type: String,
		default: ""
	},
	tags:[{type: String}]
});

const Article = mongoose.model('Article',articleSchema)

module.exports = Article