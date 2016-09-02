var webpack = require('webpack');
var path = require('path');

var BUILD_DIR = path.resolve(__dirname, 'dist');
var APP_DIR = path.resolve(__dirname, 'src/client/app');

var config = {
	entry: APP_DIR+'/index.jsx',
	output: {
		path: BUILD_DIR,
		filename: 'bundle.js'
	},
	plugins: process.env.NODE_ENV === 'production' ? [
		new webpack.ExtendedAPIPlugin(),
		new webpack.DefinePlugin({
				'process.env': { 'NODE_ENV': JSON.stringify('production') }
		}),
		new webpack.optimize.DedupePlugin(),
		new webpack.optimize.OccurenceOrderPlugin(),
		new webpack.optimize.UglifyJsPlugin()
	] : [
		new webpack.ExtendedAPIPlugin()
	],
	module: {
		loaders: [
			{
				test: /\.jsx?/,
				include: APP_DIR,
				loader: 'babel'
			}
		]
	}
};

module.exports = config;
