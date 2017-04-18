'use strict';

// инициализируем наши плагины
var gulp = require('gulp'),
    uglify = require('gulp-uglify'),
    rigger = require('gulp-rigger'),
    imagemin = require('gulp-imagemin'),
    pngquant = require('imagemin-pngquant'),
    rimraf = require('rimraf'),
    rename = require("gulp-rename"),
    sourcemaps = require('gulp-sourcemaps'),
    browserSync = require("browser-sync"),
    notify = require( 'gulp-notify' ),
    mqpacker = require("css-mqpacker"),
    csso = require('gulp-csso'),
    postcss = require("gulp-postcss"),
    cssnext = require('postcss-cssnext'),
    partial = require('postcss-partial-import'),
    nested = require('postcss-nested'),
    short = require('postcss-short'),
    reload = browserSync.reload;

// Указываем пути, для лучшей коммуникации
var path = {
    build: { //Тут мы укажем куда складывать готовые после сборки файлы
        html: 'build/',
        js: 'build/js/',
        css: 'build/css/',
        img: 'build/img/',
        fonts: 'build/fonts/',
        lib: 'build/lib/'
    },
    src: { //Пути откуда брать исходники
        html: 'src/*.html',
        mainJs: 'src/js/main.js',
        vendorJs: 'src/js/vendor.js',
        mainStyle: 'src/css/main.pcss',
        vendorStyle: 'src/css/vendor.pcss',
        img: 'src/img/**/*.*',
        fonts: 'src/fonts/**/*.*',
        lib: 'src/lib/**/*.{png,svg,jpg,gif,JPEG}'
    },
    watch: { //Тут мы укажем, за изменением каких файлов мы хотим наблюдать
        html: 'src/**/*.html',
        mainJs: 'src/js/main.js',
        vendorJs: 'src/js/vendor.js',
        mainStyle: 'src/css/main.pcss',
        vendorStyle: 'src/css/vendor.pcss',
        img: 'src/img/**/*.*',
        fonts: 'src/fonts/**/*.*'
    },
    clean: './build',
    html: './build/*.html'
};

// Конфигурация сервера
var config = {
    server: {
        baseDir: "./build"
    },
    tunnel: true,
    host: 'localhost',
    port: 9000,
    logPrefix: "Frontend"
};

// Task на сборку html
gulp.task('html:build', function () {
    gulp.src(path.src.html) // Выберем файлы по нужному пути
        .pipe(rigger()) // Прогоним через rigger
        .pipe(gulp.dest(path.build.html)) // Выплюнем их в папку build
        .pipe(reload({stream: true})); // И перезагрузим наш сервер для обновлений
});

// Task на сборку основного файла с нашими js скриптами
gulp.task('mainJs:build', function () {
    gulp.src(path.src.mainJs) // Найдем наш main файл
        .pipe(sourcemaps.init()) // Инициализируем sourcemap
        .pipe(rigger()) // Прогоним через rigger
        .pipe(sourcemaps.write()) // Пропишем карты
        .pipe(gulp.dest(path.build.js)) // Выплюнем готовый файл в build
        .pipe(reload({stream: true})) // Перезагрузим сервер
        .pipe(uglify()) // Сожмем наш js
        .pipe(rename({suffix: '.min'})) // Добавим в имя файла суффикс .min
        .pipe(sourcemaps.write()) // Ещё раз пропишем карты, для минифицированного файла
        .pipe(gulp.dest(path.build.js)) // Выплюнем готовый минифицированный файл в build
        .pipe(reload({stream: true})); // И перезагрузим сервер
});

// Task на сборку js файла с вендорными скриптами
gulp.task('vendorJs:build', function () {
    gulp.src(path.src.vendorJs) // Найдем наш вендорный файл
        .pipe(sourcemaps.init()) // Инициализируем sourcemap
        .pipe(rigger()) // Прогоним через rigger
        .pipe(rename({suffix: '.min'})) // Добавим в имя файла суффикс .min
        .pipe(uglify()) // Сожмем наш js
        .pipe(sourcemaps.write()) // Пропишем карты
        .pipe(gulp.dest(path.build.js)) // Выплюнем готовый файл в build
        .pipe(reload({stream: true})); // И перезагрузим сервер
});

// Task на сборку основного файла с нашими стилями
gulp.task('mainStyle:build', function () {
    var processors = [
        nested,
        short,
        mqpacker({
            sort: true
        }),
        cssnext({browsers: ['last 25 version']})
    ]; // Подготовим наши postcss плагины

    gulp.src(path.src.mainStyle) // Найдем наш main файл
        .pipe(sourcemaps.init()) // Инициализируем sourcemap
        .pipe(postcss(processors)
            .on( 'error', notify.onError({
                message: "<%= error.message %>",
                title  : "PostCSS Error!"
            }))
        ) // Переберём наш файл с помощью postcss
        .pipe(sourcemaps.write()) // Пропишем карты
        .pipe(rename({
            extname: '.css'
        })) // Изменим расширение
        .pipe(gulp.dest(path.build.css)) // Выплюнем готовый файл в build
        .pipe(reload({stream: true})) // Перезагрузим сервер
        .pipe(csso())  // Сожмем наш css
        .pipe(rename({
            suffix: '.min',
            extname: '.css'
        })) // Изменим расширение и добавим суффикс
        .pipe(gulp.dest(path.build.css)) // Выплюнем готовый минифицированный файл в build
        .pipe(reload({stream: true})); // Перезагрузим сервер
});

// Task на сборку css файла с вендорными стилями
gulp.task('vendorStyle:build', function () {
    var processors = [
        partial,
        cssnext({browsers: ['last 25 version']})
    ]; // Подготовим наши postcss плагины

    gulp.src(path.src.vendorStyle) // Найдем наш вендорный файл
        .pipe(postcss(processors)
            .on( 'error', notify.onError({
                message: "<%= error.message %>",
                title  : "PostCSS Error!"
            }))
        ) // Переберём наш файл с помощью postcss
        .pipe(csso())  // Сожмем наш css
        .pipe(rename({
            suffix: '.min',
            extname: '.css'
        })) // Изменим расширение и добавим суффикс
        .pipe(gulp.dest(path.build.css)) // Выплюнем готовый минифицированный файл в build
        .pipe(reload({stream: true})); // Перезагрузим сервер
});

// Task на сборку и обработку картинок
gulp.task('image:build', function () {
    gulp.src(path.src.img) // Выберем все наши картинки
        .pipe(imagemin({
            progressive: true,
            svgoPlugins: [{removeViewBox: false}],
            use: [pngquant()],
            interlaced: true
        })) // Сожмем их
        .pipe(gulp.dest(path.build.img)) // И бросим в build
        .pipe(reload({stream: true})); // Перезагрузим сервер
});

// Task на сборку шрифтов. Так как мы пока ни как не обрабатываем шрифты, то просто копируем их
gulp.task('fonts:build', function() {
    gulp.src(path.src.fonts) // Выберем все наши шрифты
        .pipe(gulp.dest(path.build.fonts)) // И бросим в build
        .pipe(reload({stream: true})); // Перезагрузим сервер
});

// Task на сборку картинок из вендорных библиотек. Так как я пока не ришил как собирать все остатки картинок из различных библиотек, не используя bower, просто копирую их
gulp.task('libImages:build', function() {
    gulp.src(path.src.lib) // Выберем все вендорные картинки
        .pipe(gulp.dest(path.build.lib)) // И бросим в build
        .pipe(reload({stream: true})); // Перезагрузим сервер
});

// Task на build сборку
gulp.task('build', [
    'html:build',
    'mainJs:build',
    'vendorJs:build',
    'mainStyle:build',
    'vendorStyle:build',
    'image:build',
    'fonts:build',
    'libImages:build'
]);

// Task для отслеживания изменений в файлах
gulp.task('watcher',function(){
    gulp.watch(path.watch.html, ['html:build']);
    gulp.watch(path.watch.mainStyle, ['mainStyle:build']);
    gulp.watch(path.watch.vendorStyle, ['vendorStyle:build']);
    gulp.watch(path.watch.mainJs, ['mainJs:build']);
    gulp.watch(path.watch.vendorJs, ['vendorJs:build']);
    gulp.watch(path.watch.img, ['image:build']);
    gulp.watch(path.watch.fonts, ['fonts:build']);
});

// Task на наш Browser Sync
gulp.task('webserver', function () {
    browserSync(config);
});

// Task на отчистку папки build
gulp.task('clean', function (cb) {
    rimraf(path.clean, cb);
});

// Дефолтный task
gulp.task('default', ['build', 'webserver', 'watcher']);
