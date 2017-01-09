export default {
  entry: 'dist/index.js',
  dest: 'dist/bundles/angular-http-interceptor.umd.js',
  sourceMap: false,
  format: 'umd',
  context: 'this',
  moduleName: 'angularHttpInterceptor',
  external: [
    '@angular/core',
    '@angular/http',
    '@angular/common',
    '@angular/router',
    'rxjs/add/observable/fromPromise',
    'rxjs/add/operator/do',
    'rxjs/Observable',
    'rxjs/add/operator/mergeMap',
    'rxjs/add/observable/forkJoin',
    'rxjs/add/operator/concat',
    'rxjs/add/operator/defaultIfEmpty',
    'rxjs/add/observable/of',
    'rxjs/add/operator/skip',
    'rxjs/add/operator/catch'
  ],
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