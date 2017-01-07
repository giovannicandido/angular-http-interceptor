export default {
  entry: 'dist/index.js',
  dest: 'dist/bundles/angular-http-interceptor.umd.js',
  sourceMap: false,
  format: 'umd',
  moduleName: 'angularHttpInterceptor',
  globals: {
    '@angular/core': 'ng.core',
    '@angular/http': 'ng.http',
    'rxjs/Observable': 'Rx',
    'rxjs/add/operator/map': 'Rx.Observable.prototype',
    'rxjs/add/operator/mergeMap': 'Rx.Observable.prototype',
    'rxjs/add/operator/do': 'Rx.Observable.prototype',
    'rxjs/add/operator/concat': 'Rx.Observable.prototype',
    'rxjs/add/operator/defaultIfEmpty': 'Rx.Observable.prototype',
    'rxjs/add/operator/catch': 'Rx.Observable.prototype',
    'rxjs/add/operator/skip': 'Rx.Observable.prototype',
    'rxjs/add/observable/of': 'Rx.Observable',
    'rxjs/add/observable/forkJoin': 'Rx.Observable',
    'rxjs/add/observable/empty': 'Rx.Observable'
  }
}