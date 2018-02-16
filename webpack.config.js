var path = require("path");
var HtmlWebpackPlugin = require('html-webpack-plugin');
var webpack = require("webpack");
const CleanWebpackPlugin = require('clean-webpack-plugin')
const ExtractTextPlugin = require('extract-text-webpack-plugin');
var DIST_DIR   = path.join(__dirname, "dist");
var CLIENT_DIR = path.join(__dirname, "src");

module.exports = {
	context: CLIENT_DIR,

	entry: [
		'./js/main.js',
		'./styles/app.scss'
	],

	output: {
		path: DIST_DIR,
		publicPath: "/",
		filename: "bundle.js"
	},
	devtool: 'source-map',
	module: {
		rules:[
			{
				test: /\.scss$/,
				use: ExtractTextPlugin.extract({
					use: [
						'css-loader',
						'sass-loader'
					]
				})
			},
			{
				test: /\.js$/,
				exclude: /node_modules/,
				use: {
					loader: 'babel-loader'
				}
			}
		]
	},
	resolve: {
		extensions: ['.js']
	},
	plugins:[
		// new CleanWebpackPlugin(['dist']),
		new webpack.HotModuleReplacementPlugin(),
		new ExtractTextPlugin('style.bundle.css'),
		new HtmlWebpackPlugin({
			title: 'Setup...',
			template: './index.html',
			minify: {
				collapseWhitespace: true,
			}
		})
	]
};
