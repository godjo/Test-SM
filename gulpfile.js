'use strict'

var gulp = require('gulp');							//	Подключаем Gulp
var sass = require('gulp-sass');					//	Подключаем Sass
var plumber = require('gulp-plumber');				//	Подключаем Plumber(показывыет ошибки в стилях, если есть)
var postcss = require('gulp-postcss');				// Подключаем Postcss для работы плагина autoprefixer
var autoprefixer = require('autoprefixer');			//	Подключаем Autoprefixer(Ставит префиксы для старых браузеров)
var server = require('browser-sync').create();		//	Подключаем Browser-Sync(Для запуска локального сервера)
var minify = require('gulp-csso');					//	Подключаем Csso(Для минификации стилей)
var rename = require('gulp-rename');				//	Подключаем rename(Меняет имя файла)
var imagemin = require('gulp-imagemin');			//	Подключаем imagemin(Минифицирует изображения)
var webp = require('gulp-webp');					//	Подключаем webp
var sprite = require('gulp-svgstore');				//	Подключаем svgstore(Делает спрайты из иконок svg)
var posthtml = require('gulp-posthtml');			//	Подключаем posthtml
var	include = require('posthtml-include');			//	Подключаем плагин posthtml-include(Заменяет один тег на контент, который задать)
var del = require('del');							//	Подключаем библиотеку del для удаления папок
var gcmq = require('gulp-group-css-media-queries');	// Подключаем библиотеку для медия-запросов
var concat = require('gulp-concat'); 				// Подключаем gulp-concat (для конкатенации файлов)
var uglify = require('gulp-uglifyjs'); 				// Подключаем gulp-uglifyjs (для сжатия JS)
var gulpif = require('gulp-if');

gulp.task('style', async function () {				//	Создаем таск style
	gulp.src('app/sass/*.scss')						//	Берем источник
	.pipe(plumber())								//	Проверяем на ошибки в стилях
	.pipe(sass({
		includePaths: [								//	Указываем пути к исходникам в модулях для стилей подключенных фреймворков
			'node_modules/bootstrap/scss',
			'node_modules/slick-carousel/slick',
			'node_modules/magnific-popup/src/css'
		]
	}))												// Преобразуем Sass в CSS посредством gulp-sass
	.pipe(postcss([
		autoprefixer(["> 1%", "last 2 versions", "Firefox ESR", "ie >= 10"],
		 { cascade: true })							// Создаем префиксы
	]))
	.pipe(gulp.dest('dist/css'))					// Выгружаем результата в папку app/css
	.pipe(gcmq())									// Объединение медиа-запросов
	.pipe(minify())									//	Минифицируем стили
	.pipe(rename('style.min.css'))					// Переименовываем минифицированный файл
	.pipe(gulp.dest('dist/css'))					// Выгружаем результата в папку app/css
	.pipe(server.stream())							// Обновляем CSS на странице при изменении
});

gulp.task('serve', function () {					//	Создаем таск serve
	server.init({
		server: 'dist/'								//	Директория для сервера - app
	});
	gulp.watch('app/sass/**/*.{scss,sass}',
	gulp.parallel('style'));						//	Следим за стилями
	gulp.watch('app/*.html',
	gulp.parallel('html'))							//	Следим за html файлами
		.on('change', server.reload),
	gulp.watch('app/js/*.js',						//	Следим за js файлами
	gulp.parallel('scripts'));
});

gulp.task('scripts', function () {
	return gulp.src('app/js/*.js')
	.pipe(gulp.dest('dist/js'))
	// .pipe(uglify())
	.pipe(rename('script.min.js'))
	.pipe(gulp.dest('dist/js'))
	.pipe(server.stream());
});

gulp.task('images', function () {					//	Создаем таск images
	return gulp.src('app/img/**/*.{png,jpg,svg}')	//	Директория изображений
		.pipe(imagemin([
			imagemin.optipng({
				optimizationLevel: 3				//	Сжимаем изображения (Безопасное сжатие = 3, максимальное = 1, без сжатия = 10)
			}),
			imagemin.jpegtran({
				progressive: true					//	Делаем прогрессивные jpeg-и
			}),
			imagemin.svgo()							//	Минифицируем svg
		]))
	.pipe(gulp.dest('dist/img'));					//	Выгружаем результат
});

gulp.task('webp', function () {						//	Создаем таск webp
	return gulp.src('app/img/**/*.{png,jpg}')		//	Директория изображений
	.pipe(webp({
		quality: 90									//	Назначаем степень сжатия
	}))
	.pipe(gulp.dest('dist/img'));					//	Выгружаем результат
});

gulp.task('sprite', function () {					//	Создает таск sprite
	return gulp.src('app/img/icon-*.svg')			//	Директория изображений
	.pipe(svgstore({
		inlineSvg: true								//	Инлайнит svg
	}))
	.pipe(rename('sprite.svg'))						//	Переименовываем в sprite.svg
	.pipe(gulp.dest('dist/img'));					//	Выгружаем результат
});

gulp.task('html', function () {						//	Создает таск html
	return gulp.src('app/*.html')					//	Директория html файла
	.pipe(posthtml([
		include()									//	Заменяет тег
	]))
	.pipe(gulp.dest('dist'));							//	Выгружаем результат
});

gulp.task('copy', function () {						//	Создает таск copy
	return gulp.src([
		'app/fonts/**/*.{woff,woff2}',				//	Директория шрифтов
		'app/img/**'									//	Директория скриптов
	],	{
		base: 'app'									//	Базовая папка, нужна, чтобы не потерять папки fonts, img и js
		})
	.pipe(gulp.dest('dist'));						//	Выгружаем результат
});

gulp.task('clean', function () {					//	Создает таск clean
	return del('dist');								//	Удаляет папку build
})

gulp.task('dev', gulp.series('clean', 'copy', 'images', 'style','scripts',/* 'sprite',*/ 'html'));
gulp.task('default', gulp.series('dev', 'serve'));
gulp.task('build', gulp.series('clean', 'copy', 'images', 'style', 'scripts', /* 'sprite',*/ 'html'));


