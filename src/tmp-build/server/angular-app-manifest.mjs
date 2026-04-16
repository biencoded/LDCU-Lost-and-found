
export default {
  bootstrap: () => import('./main.server.mjs').then(m => m.default),
  inlineCriticalCss: true,
  baseHref: '/',
  locale: undefined,
  routes: [
  {
    "renderMode": 2,
    "route": "/"
  },
  {
    "renderMode": 2,
    "route": "/login"
  },
  {
    "renderMode": 2,
    "route": "/report"
  },
  {
    "renderMode": 2,
    "route": "/gallery"
  },
  {
    "renderMode": 2,
    "redirectTo": "/gallery",
    "route": "/search"
  }
],
  entryPointToBrowserMapping: undefined,
  assets: {
    'index.csr.html': {size: 744, hash: '4d422178fc344ffb57d2310a3629d9ab897d25045171465e78387afb4d03309a', text: () => import('./assets-chunks/index_csr_html.mjs').then(m => m.default)},
    'index.server.html': {size: 951, hash: '7202b700827ebd1dbcbe70f3fe158732bc9d43f4d1d74728e7be4b4c927bf2a8', text: () => import('./assets-chunks/index_server_html.mjs').then(m => m.default)},
    'gallery/index.html': {size: 309, hash: 'f96325c10da03415ff9038fc7db63507e9a54fd00bc57db77d65d35e87defdd4', text: () => import('./assets-chunks/gallery_index_html.mjs').then(m => m.default)},
    'login/index.html': {size: 15656, hash: 'dd4838bf6ed5f83cf08e0986b5286a55ececc1dba89de3c0f6f6350b7e9fdf06', text: () => import('./assets-chunks/login_index_html.mjs').then(m => m.default)},
    'index.html': {size: 288, hash: '9e9627bdb48977b3562531c36df5dc891844ec30d45d1080ce34294e27067910', text: () => import('./assets-chunks/index_html.mjs').then(m => m.default)},
    'report/index.html': {size: 306, hash: '7c8e7571d5470fd903dc00f9c664560b02d24a9d16be74d450cbdca477c04259', text: () => import('./assets-chunks/report_index_html.mjs').then(m => m.default)},
    'styles-3SFTULQO.css': {size: 1708, hash: 'l48vRnMfVGI', text: () => import('./assets-chunks/styles-3SFTULQO_css.mjs').then(m => m.default)}
  },
};
