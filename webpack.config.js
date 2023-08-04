const path = require('path')
const { CleanWebpackPlugin } = require('clean-webpack-plugin') // чистит папку dist
const HTMLWebpackPlugin = require('html-webpack-plugin') // созд html и доб соответ файл bundla
const CopyPlugin = require('copy-webpack-plugin') // копирует файлы и перемещает в другое место
const MiniCssExtractPlugin = require('mini-css-extract-plugin'); // выносит весь css из js-файла в отдельный файл (оптимизация)

// cross-env NODE_ENV=development устанавливает текущей режим в котором мы собираем проект
const isProd = process.env.NODE_ENV === 'production'
const isDev = !isProd

const filename = ext => isDev ? `bundle.${ext}` : `bundle.[hash].${ext}`

const jsLoaders = () => {
	const loaders = [
		{
			loader: 'babel-loader',
			options: {
				presets: ['@babel/preset-env'],
			}
		}
	]

	if (isDev) {
		loaders.push('eslint-loader')
	}

	return loaders
}

module.exports = {
	context: path.resolve(__dirname, 'src'),
	mode: 'development',
	entry: [
		// '@babel/polyfill',
		'./index.js'
	],
	// target: 'web', // позволяет исправить ошибку с runtime при rerender (связана с async await в коде основном)
	output: {
		filename: filename('js'),
		path: path.resolve(__dirname, 'dist')
	},
	resolve: {
		extensions: ['.js'], // позволяют определить список расширений файлов, которые Webpack будет автоматически разрешать при импорте модулей
		// чтобы не писать import '../../../../core/Component'
		alias: {
			'@': path.resolve(__dirname, 'src'), // то есть если мы пишем @, то мы уже идем от src дальше
			'@core': path.resolve(__dirname, 'src/core')
		}
	},
	// devServer: { // из либы webpack-dev-server для запуска dev servera
	// 	port: 3000,
	// 	hot: isDev,
	// 	liveReload: true
	// },
	devtool: isDev ? 'source-map' : false,
	plugins: [
		new CleanWebpackPlugin(),
		new HTMLWebpackPlugin({
			template: 'index.html',
			minify: { // взаимодейтсвует с кодом внутри html
				removeComments: isProd,
				collapseWhitespace: isProd
			}
			// src не указываем тк context
		}),
		new CopyPlugin({
			patterns: [
				{ from: path.resolve(__dirname, 'src/favicon.ico'), to: '' }
			]
		}),
		new MiniCssExtractPlugin({
			filename: filename('css')
		})
	],
	module: {
		rules: [ // какие действия следует выполнять с определенными типами файлов при сборке проекта (состоит из двух частей: условия (test) и набора загрузчиков (loader))
			{
				test: /\.s[ac]ss$/i,
				use: [
					MiniCssExtractPlugin.loader,
					'css-loader',
					'sass-loader',
				],
			},
			{
				test: /\.m?js$/,
				exclude: /node_modules/,
				use: {
					loader: 'babel-loader',
					options: {
						presets: ['@babel/preset-env']
					}
				}
			},
		],
	},
}
