var gulp = require("gulp");
var useref = require("gulp-useref");
var gulpif = require("gulp-if");
var minifyCss = require("gulp-clean-css");
var uglify = require("gulp-uglify");

gulp.task("build", function() {
  return gulp
    .src("./index.html")
    .pipe(useref())
    .pipe(gulpif("*.css", minifyCss()))
    .pipe(gulpif("*.js", uglify()))
    .pipe(gulp.dest("./docs/"));
});
