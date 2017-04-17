'use strict';

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

// Пути
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
        html: 'src/*.html', //Синтаксис src/*.html говорит gulp что мы хотим взять все файлы с расширением .html
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

// Куча разных Task
gulp.task('html:build', function () {
    gulp.src(path.src.html) //Выберем файлы по нужному пути
        .pipe(rigger()) //Прогоним через rigger
        .pipe(gulp.dest(path.build.html)) //Выплюнем их в папку build
        .pipe(reload({stream: true})); //И перезагрузим наш сервер для обновлений
});

gulp.task('mainJs:build', function () {
    gulp.src(path.src.mainJs) //Найдем наш main файл
        .pipe(rigger()) //Прогоним через rigger
        .pipe(sourcemaps.init()) //Инициализируем sourcemap
        .pipe(sourcemaps.write()) //Пропишем карты
        .pipe(gulp.dest(path.build.js)) //Выплюнем готовый файл в build
        .pipe(reload({stream: true})) // Перезагрузим сервер
        .pipe(uglify()) //Сожмем наш js
        .pipe(rename({suffix: '.min'}))//Перепенуем файл в *.min.css
        .pipe(gulp.dest(path.build.js)) //Выплюнем готовый файл в build
        .pipe(reload({stream: true})); //И перезагрузим сервер
});

gulp.task('vendorJs:build', function () {
    gulp.src(path.src.vendorJs) //Найдем наш main файл
        .pipe(rigger()) //Прогоним через rigger
        .pipe(sourcemaps.init()) //Инициализируем sourcemap
        .pipe(rename({
            suffix: '.min'
        }))
        .pipe(uglify()) //Сожмем наш js
        .pipe(sourcemaps.write()) //Пропишем карты
        .pipe(gulp.dest(path.build.js)) //Выплюнем готовый файл в build
        .pipe(reload({stream: true})); //И перезагрузим сервер
});

gulp.task('mainStyle:build', function () {
    var processors = [
        nested,
        short,
        mqpacker({
            sort: true
        }),
        cssnext({browsers: ['last 25 version']})
    ];
    gulp.src(path.src.mainStyle)
        .pipe(sourcemaps.init())
        .pipe(postcss(processors)
            .on( 'error', notify.onError({
                message: "<%= error.message %>",
                title  : "PostCSS Error!"
            }))
        )
        .pipe(sourcemaps.write())
        .pipe(rename({
            extname: '.css'
        }))
        .pipe(gulp.dest(path.build.css))
        .pipe(reload({stream: true})) //Перезагрузим сервер
        .pipe(csso())
        .pipe(rename({
            suffix: '.min',
            extname: '.css'
        }))
        .pipe(gulp.dest(path.build.css))
        .pipe(reload({stream: true})); //Перезагрузим сервер
});

gulp.task('vendorStyle:build', function () {
    var processors = [
        partial,
        cssnext({browsers: ['last 25 version']})
    ];
    gulp.src(path.src.vendorStyle) //Выберем наш vendor.scss
        .pipe(postcss(processors)
            .on( 'error', notify.onError({
                message: "<%= error.message %>",
                title  : "PostCSS Error!"
            }))
        )
        .pipe(csso())
        .pipe(rename({
            suffix: '.min',
            extname: '.css'
        }))
        .pipe(gulp.dest(path.build.css)) //Выплюнем минифицированную версию нашего css
        .pipe(reload({stream: true})); //Перезагрузим сервер
});

gulp.task('image:build', function () {
    gulp.src(path.src.img) //Выберем наши картинки
        .pipe(imagemin({ //Сожмем их
            progressive: true,
            svgoPlugins: [{removeViewBox: false}],
            use: [pngquant()],
            interlaced: true
        }))
        .pipe(gulp.dest(path.build.img)) //И бросим в build
        .pipe(reload({stream: true}));
});

gulp.task('fonts:build', function() {
    gulp.src(path.src.fonts)
        .pipe(gulp.dest(path.build.fonts))
        .pipe(reload({stream: true}));
});

gulp.task('libImages:build', function() {
    gulp.src(path.src.lib)
        .pipe(gulp.dest(path.build.lib))
        .pipe(reload({stream: true}));
});

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

gulp.task('watcher',function(){
    gulp.watch(path.watch.html, ['html:build']);
    gulp.watch(path.watch.mainStyle, ['mainStyle:build']);
    gulp.watch(path.watch.vendorStyle, ['vendorStyle:build']);
    gulp.watch(path.watch.mainJs, ['mainJs:build']);
    gulp.watch(path.watch.vendorJs, ['vendorJs:build']);
    gulp.watch(path.watch.img, ['image:build']);
    gulp.watch(path.watch.fonts, ['fonts:build']);
});

gulp.task('webserver', function () {
    browserSync(config);
});

gulp.task('clean', function (cb) {
    rimraf(path.clean, cb);
});

gulp.task('default', ['build', 'webserver', 'watcher']);